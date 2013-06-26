package com.jivesoftware.it.vidyo;

import com.vidyo.admin.*;
import com.vidyo.user.*;
import com.vidyo.user.Entity;
import com.vidyo.user.Filter;
import com.vidyo.user.GetParticipantsRequest;
import com.vidyo.user.GetParticipantsResponse;
import com.vidyo.user.InviteToConferenceRequest;
import com.vidyo.user.InviteToConferenceResponse;
import com.vidyo.user.LeaveConferenceRequest;
import com.vidyo.user.LeaveConferenceResponse;
import com.vidyo.user.ObjectFactory;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import javax.xml.namespace.QName;
import javax.xml.ws.BindingProvider;
import javax.xml.ws.Service;
import javax.xml.ws.handler.MessageContext;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Thread-safe singleton class that provides methods to call vidyo APIs, creates a
 * JAX-WS client stub instance internally and synchronizes access to it.
 *
 * Trace SOAP XML with -Dcom.sun.xml.internal.ws.transport.http.client.HttpTransportPipe.dump=true
 */
public class VidyoService {
    public final static VidyoService INSTANCE = new VidyoService();
    public static final String STATUS_ONLINE = "Online";
    public static final String STATUS_BUSY = "Busy";
    public static final String STATUS_BUSY_IN_OWN_ROOM = "BusyInOwnRoom";
    public static final String STATUS_RING_ACCEPTED = "RingAccepted";

    private static final Logger logger = Logger.getLogger(VidyoService.class);

    private VidyoPortalUserServicePortType userPort;
    private VidyoPortalAdminServicePortType adminPort;

    private VidyoService() {
        String userNamespace = "http://portal.vidyo.com/user/v1_1";
        String adminNamespace = "http://portal.vidyo.com/admin/v1_1";

        // construct the service instance directly with Service class methods instead of
        // the generated stub class, to avoid specifying and loading wsdl from server
        // it's a bit faster this time.. but still takes over a second
        QName userServiceName = new QName(userNamespace, "VidyoPortalUserService");
        URL userWsdlURL = this.getClass().getResource("/com/vidyo/user/VidyoPortalUserService.wsdl");
        Service userService = Service.create(userWsdlURL, userServiceName);

        QName userPortName = new QName(userNamespace, "VidyoPortalUserServicePort");
        userPort = userService.getPort(userPortName, VidyoPortalUserServicePortType.class);

        BindingProvider bindingProvider = (BindingProvider)userPort;
        Map<String, Object> requestContext = bindingProvider.getRequestContext();
        requestContext.put(BindingProvider.ENDPOINT_ADDRESS_PROPERTY, ApplicationProperties.INSTANCE.getUserApiUrl());

        // create stub for Admin API
        QName adminServiceName = new QName(adminNamespace, "VidyoPortalAdminService");
        URL adminWsdlURL = this.getClass().getResource("/com/vidyo/admin/VidyoPortalAdminService.wsdl");
        Service adminService = Service.create(adminWsdlURL, adminServiceName);

        QName adminPortName = new QName(adminNamespace, "VidyoPortalAdminServicePort");
        adminPort = adminService.getPort(adminPortName, VidyoPortalAdminServicePortType.class);

        bindingProvider = (BindingProvider)adminPort;
        requestContext = bindingProvider.getRequestContext();
        requestContext.put(BindingProvider.ENDPOINT_ADDRESS_PROPERTY, ApplicationProperties.INSTANCE.getAdminApiUrl());
    }

    public List<Member> getRoomMembers() {
        // Get all vidyo users, and then return the ones that are members of conf room group
        GetMembersRequest req = new GetMembersRequest();
        com.vidyo.admin.Filter filter = new com.vidyo.admin.Filter();
        com.vidyo.admin.ObjectFactory of = new com.vidyo.admin.ObjectFactory();
        filter.setLimit(of.createFilterLimit(999999)); // default limit is 25
        req.setFilter(filter);

        PortInvoker<GetMembersResponse, GetMembersRequest, VidyoPortalAdminServicePortType> invoker =
                new PortInvoker<GetMembersResponse, GetMembersRequest, VidyoPortalAdminServicePortType>(adminPort) {
                    @Override
                    public GetMembersResponse callMethod(GetMembersRequest getMembersRequest) throws Exception {
                        return port.getMembers(getMembersRequest);
                    }
                };

        AuthContext auth = new AuthContext(
                ApplicationProperties.INSTANCE.getAdminUsername(),
                ApplicationProperties.INSTANCE.getAdminPassword());

        GetMembersResponse resp;
        try {
            resp = invoker.invoke(auth, req);
        }
        catch (InvalidCredentialsException e) {
            logger.error("Admin user login failed, check credentials in application.properties");
            throw new RuntimeException("Admin user login failed");
        }

        List<Member> rooms = new ArrayList<Member>();
        for (Member m : resp.getMember()) {
            if (ApplicationProperties.INSTANCE.getRoomGroup().equals(m.getGroupName())) {
                rooms.add(m);
            }
        }

        return rooms;
    }

    public Entity getEntityByEmail(AuthContext auth, String email) throws InvalidCredentialsException {
        SearchByEmailRequest req = new SearchByEmailRequest();
        req.setEmailAddress(email);
        req.setFilter(new Filter()); // get 500 error without this

        PortInvoker<SearchByEmailResponse, SearchByEmailRequest, VidyoPortalUserServicePortType> invoker =
                new PortInvoker<SearchByEmailResponse, SearchByEmailRequest, VidyoPortalUserServicePortType>(userPort) {
                    @Override
                    public SearchByEmailResponse callMethod(SearchByEmailRequest searchByEmailRequest) throws Exception {
                        return port.searchByEmail(searchByEmailRequest);
                    }
                };
        SearchByEmailResponse resp = invoker.invoke(auth, req);

        List<Entity> list = resp.getEntity();
        if (list == null || list.size() == 0) {
            return null;
        }
        else if (list.size() > 1) {
            String str = "";
            for (Entity e : list) {
                str += e.getDisplayName() + ", ";
            }

            logger.warn("Found " + list.size() + " entities for email " + email + ": " + str);
        }

        return list.get(0);
    }

    public Entity getEntityByUsername(AuthContext auth, String username) throws InvalidCredentialsException {
        SearchRequest req = new SearchRequest();
        Filter filter = new Filter();
        ObjectFactory of = new ObjectFactory();
        filter.setQuery(of.createFilterQuery(username));
        req.setFilter(filter);

        PortInvoker<SearchResponse, SearchRequest, VidyoPortalUserServicePortType> invoker =
                new PortInvoker<SearchResponse, SearchRequest, VidyoPortalUserServicePortType>(userPort) {
                    @Override
                    public SearchResponse callMethod(SearchRequest searchRequest) throws Exception {
                        return port.search(searchRequest);
                    }
                };
        SearchResponse resp = invoker.invoke(auth, req);

        // could get multiple results since vidyo seems to search all entity fields
        // with the given string -> we'll return the first one where email matches
        if (resp.getEntity().size() == 1) {
            return resp.getEntity().get(0);
        }
        else if (resp.getEntity().size() > 1) {
            logger.warn("Found multiple entities for username: " + username);
            for (Entity e : resp.getEntity()) {
                if (e.getEmailAddress().getValue().contains(username)) {
                    return e;
                }
            }
        }
        return null;
    }

    public Entity getEntityByName(AuthContext auth, String name) throws InvalidCredentialsException {
        SearchRequest req = new SearchRequest();
        Filter filter = new Filter();
        ObjectFactory of = new ObjectFactory();
        filter.setQuery(of.createFilterQuery(name));
        req.setFilter(filter);

        PortInvoker<SearchResponse, SearchRequest, VidyoPortalUserServicePortType> invoker =
                new PortInvoker<SearchResponse, SearchRequest, VidyoPortalUserServicePortType>(userPort) {
                    @Override
                    public SearchResponse callMethod(SearchRequest searchRequest) throws Exception {
                        return port.search(searchRequest);
                    }
                };
        SearchResponse resp = invoker.invoke(auth, req);

        // could get multiple results since vidyo seems to search all entity fields
        // with the given string -> we'll just return the first one
        List<Entity> list = resp.getEntity();
        if (list == null || list.size() == 0) {
            return null;
        }
        else if (list.size() > 1) {
            logger.warn("Found " + list.size() + " entities for name " + name);
        }

        return list.get(0);
    }

    public void inviteToRoom(AuthContext auth, String roomId, String participantId) throws InvalidCredentialsException {
        InviteToConferenceRequest req = new InviteToConferenceRequest();
        req.setConferenceID(roomId);
        req.setEntityID(participantId);

        PortInvoker<InviteToConferenceResponse, InviteToConferenceRequest, VidyoPortalUserServicePortType> invoker =
                new PortInvoker<InviteToConferenceResponse, InviteToConferenceRequest, VidyoPortalUserServicePortType>(userPort) {
                    @Override
                    public InviteToConferenceResponse callMethod(InviteToConferenceRequest inviteToConferenceRequest) throws Exception {
                        return port.inviteToConference(inviteToConferenceRequest);
                    }
                };
        InviteToConferenceResponse resp = invoker.invoke(auth, req);

        if ("ok".compareToIgnoreCase(resp.getOK()) != 0) {
            throw new RuntimeException("Failed to invite to conference: " + participantId + ", " + resp.getOK());
        }
    }

    public List<Entity> getParticipants(AuthContext auth, String roomId) throws InvalidCredentialsException {
        GetParticipantsRequest req = new GetParticipantsRequest();
        req.setConferenceID(roomId);
        PortInvoker<GetParticipantsResponse, GetParticipantsRequest, VidyoPortalUserServicePortType> invoker =
                new PortInvoker<GetParticipantsResponse, GetParticipantsRequest, VidyoPortalUserServicePortType>(userPort) {
                    @Override
                    public GetParticipantsResponse callMethod(GetParticipantsRequest getParticipantsRequest) throws Exception {
                        return port.getParticipants(getParticipantsRequest);
                    }
                };
        GetParticipantsResponse resp = invoker.invoke(auth, req);
        return resp.getEntity();
    }

    public void removeParticipant(AuthContext auth, String roomId, String participantId) throws InvalidCredentialsException {
        LeaveConferenceRequest req = new LeaveConferenceRequest();
        req.setConferenceID(roomId);
        req.setParticipantID(participantId);
        PortInvoker<LeaveConferenceResponse, LeaveConferenceRequest, VidyoPortalUserServicePortType> invoker =
                new PortInvoker<LeaveConferenceResponse, LeaveConferenceRequest, VidyoPortalUserServicePortType>(userPort) {
                    @Override
                    public LeaveConferenceResponse callMethod(LeaveConferenceRequest leaveConferenceRequest) throws Exception {
                        return port.leaveConference(leaveConferenceRequest);
                    }
                };
        LeaveConferenceResponse resp = invoker.invoke(auth, req);
    }

    public static boolean listContainsEntityId(List<Entity> list, String id) {
        for (Entity e : list) {
            if (e.getEntityID().equals(id)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Abstract template class to handle synchronization, request authentication context
     * and exception handling for auth failure
     *
     * @param <T> Response type
     * @param <S> Request type
     * @param <U> VidyoPortalUserServicePortType or VidyoPortalAdminServicePortType
     */
    private abstract class PortInvoker<T, S, U> {
        protected U port;
        private final Logger logger = Logger.getLogger(PortInvoker.class);

        public PortInvoker(U port) {
            this.port = port;
        }

        public T invoke(AuthContext auth, S s) throws InvalidCredentialsException {
            T t;

            // Synchronize all access to the service port object since it is not thread-safe
            // and we need to set authentication in request context
            synchronized (port) {
                try {
                    // replace username and password in request context
                    Map<String, Object> requestContext = ((BindingProvider)port).getRequestContext();
                    requestContext.put(BindingProvider.USERNAME_PROPERTY, auth.getUsername());
                    requestContext.put(BindingProvider.PASSWORD_PROPERTY, auth.getPassword());

                    long start = System.currentTimeMillis();
                    t = callMethod(s);
                    logger.debug(s.getClass().getSimpleName() + ", " + auth.getUsername() + ", " +
                            (System.currentTimeMillis() - start) + "ms" );
                }
                catch (Exception e) {
                    // Check for response code to be able to map to InvalidCredentialsException.
                    Map<String, Object> responseContext = ((BindingProvider)port).getResponseContext();
                    Integer responseCode = null;
                    if (responseContext != null) { // could be null if exception occurred prior to making call
                        responseCode = (Integer) responseContext.get(MessageContext.HTTP_RESPONSE_CODE);
                    }

                    if (responseCode != null && responseCode == HttpServletResponse.SC_UNAUTHORIZED) {
                        logger.debug("Mapping Exception to InvalidCredentialsException, original exception: " + e.getMessage());
                        // using a checked exception here instead of WebApplicationException because the getRoomMembers
                        // method needs to be able to catch auth failures for admin service account
                        throw new InvalidCredentialsException();
                    }
                    else {
                        String username = (auth != null) ? auth.getUsername() : null;
                        logger.error(s.getClass().getSimpleName() + " failed for " + username, e);
                        throw new RuntimeException("Failed to make API call");
                    }
                }
            }
            return t;
        }

        public abstract T callMethod(S s) throws Exception;
    }
}

/*
 Copyright 2012 Jive Software
 
 Licensed under the Apache License, Version 2.0 (the "License");
 You may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
