package com.jivesoftware.it.vidyo;

import com.vidyo.admin.Member;
import com.vidyo.user.Entity;
import org.apache.log4j.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

/**
 * JAX-RS resource endpoint class for user information
 *
 * Search by email, name or type: GET /users?email=foo@bar.com,  /users?name=Kevin%20Williams,  /users?type=room
 */
@Path("users")
public class UserResource {
    private static final Logger logger = Logger.getLogger(UserResource.class);

    private static final String TYPE_ROOM = "room";

    /**
     * Return a list of User instances in JSON.
     */
    @GET
    @Produces("application/json")
    public List<User> getUsers(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
                               @QueryParam("email") List<String> emails,
                               @QueryParam("name") List<String> names,
                               @QueryParam("type") String type) throws InvalidCredentialsException {
        AuthContext auth = AuthContext.createFromHeader(authHeader);
        List<User> users = new ArrayList<User>();

        if (TYPE_ROOM.equals(type)) {
            // if type param is defined, only return the room users
            List<Member> roomMembers = VidyoService.INSTANCE.getRoomMembers();
            for (Member m: roomMembers) {
                users.add(userFromMember(m));
            }
            return users;
        }

        Entity caller = VidyoService.INSTANCE.getEntityByUsername(auth, auth.getUsername());

        // Get caller's room participants to be able to detect Joined status
        List<Entity> callerRoomParticipants = VidyoService.INSTANCE.getParticipants(auth, caller.getEntityID());

        for (String name : names) {
            Entity userEntity = VidyoService.INSTANCE.getEntityByName(auth, name);
            User u = new User();
            if (userEntity != null) {
                u = userFromEntity(userEntity);
            }
            else {
                logger.debug("Could not find user by name: " + name);
            }
            users.add(u);
        }

        for (String email : emails) {
            Entity userEntity = VidyoService.INSTANCE.getEntityByEmail(auth, email);
            User u = new User();
            if (userEntity != null) {
                u = userFromEntity(userEntity);
            }
            else {
                logger.debug("Could not find user by email: " + email);
            }
            users.add(u);
        }

        // Update for Joined status
        for (User u : users) {
            String statusMessage = u.getStatus();
            boolean inConference = VidyoService.STATUS_BUSY.equals(statusMessage) ||
                                   VidyoService.STATUS_BUSY_IN_OWN_ROOM.equals(statusMessage) ||
                                   VidyoService.STATUS_RING_ACCEPTED.equals(statusMessage);
            if (inConference && VidyoService.listContainsEntityId(callerRoomParticipants, u.getId())) {
                // User is on a call in caller's room -> change status to Joined
                u.setStatus("Joined");
            }
        }
        return users;
    }

    private User userFromMember(Member m) {
        User u = new User();
        u.setEmail(m.getEmailAddress());
        u.setId(m.getMemberID().toString());
        u.setName(m.getDisplayName());
        return u;
    }

    private User userFromEntity(Entity e) {
        User u = new User();
        u.setName(e.getDisplayName());
        u.setId(e.getEntityID());
        u.setEmail(e.getEmailAddress().getValue());
        u.setStatus(e.getMemberStatus());
        return u;
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