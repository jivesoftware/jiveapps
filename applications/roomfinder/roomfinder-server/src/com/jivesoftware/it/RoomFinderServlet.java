package com.jivesoftware.it;

import microsoft.exchange.webservices.data.*;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

/**
 * Servlet class to handle room availability requests and bookings
 */
public class RoomFinderServlet extends HttpServlet {
    private List<ConferenceRoom> allRooms = new ArrayList<ConferenceRoom>();
    private URI ewsUrl;
    private boolean ewsTrace;
    private String appUrl;
    private static final Logger logger = Logger.getLogger(RoomFinderServlet.class);

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        loadProperties();
        loadRoomMetadata();
    }

    /**
     * Load properties file and set private variables
     * @throws IOException
     * @throws URISyntaxException
     */
    private void loadProperties() throws ServletException {
        InputStream is = null;
        try {
            is = this.getClass().getClassLoader().getResourceAsStream("application.properties");
            if (is == null) {
                throw new RuntimeException("Could not find application.properties file.");
            }
            Properties prop = new Properties();
            prop.load(is);
            ewsUrl = new URI(prop.getProperty("ews.url"));
            ewsTrace = Boolean.parseBoolean(prop.getProperty("ews.trace"));
            appUrl = prop.getProperty("app.url");
        }
        catch (Exception e) {
            logger.error("Failed to load properties", e);
            throw new ServletException("Error when loading app properties.");
        }
        finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    logger.error("Failed to close stream", e);
                }
            }
        }
    }

    /**
     * Load room metadata file and populate allRooms list
     * @throws IOException
     */
    private void loadRoomMetadata() throws ServletException {
        // todo This info could be read from Exchange room lists
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = null;
        try {
            is = this.getClass().getClassLoader().getResourceAsStream("rooms.json");
            if (is == null) {
                throw new RuntimeException("Could not find rooms.json file.");
            }
            ArrayNode rootNode = mapper.readValue(is, ArrayNode.class);
            int i = 0;
            while (true) {
                JsonNode roomNode = rootNode.get(i);
                if (roomNode == null) break;

                ConferenceRoom room = new ConferenceRoom();
                room.setName(roomNode.get("name").getValueAsText());
                room.setEmail(roomNode.get("email").getValueAsText());
                room.setLocation(roomNode.get("location").getValueAsText());
                room.setFloor(roomNode.get("floor").getIntValue());
                allRooms.add(room);

                i++;
            }
        }
        catch (Exception e) {
            logger.error("Failed to load room metadata", e);
            throw new ServletException("Error when loading room metadata.");
        }
        finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    logger.error("Failed to close stream", e);
                }
            }
        }
    }

    /**
     * Handle GET request for available conference rooms. Expected request params:
     * location = portland/paloalto/boulder
     * start = start of availability request as epoch msec
     * length = meeting length in minutes
     * person = email address of a required attendee
     *
     * For example localhost:8082/room-finder?location=portland&start=1326815440616&length=30
     *
     * Returns a json array of RoomAvailabilityDetails instances, one for each room that is available.
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        RoomAvailabilityResponse response;
        try {
            // Parse and validate request parameters
            List<String> locations = getStringRequestParameterValues(req, "location");
            List<String> emails = null;
            if (req.getParameter("person") != null) {
                emails = getStringRequestParameterValues(req, "person");
            }

            Date reqStart;
            if (req.getParameter("start") != null) {
                reqStart = getDateRequestParameter(req, "start");
            }
            else {
                // default to five minutes after now to leave time for the client to make a booking
                // because exchange does not allow meeting to start in the past
                Calendar cal = new GregorianCalendar();
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                cal.add(Calendar.MINUTE, 5);
                reqStart = cal.getTime();
            }

            int length = 30;
            if (req.getParameter("length") != null) {
                length = getIntRequestParameter(req, "length");
            }

            validateLocations(locations);

            // create an exchange web service class and authenticate user
            AvailabilityService service = createAvailabilityService(req.getHeader("Authorization"));

            // find the first available room suggestion
            response = service.getFirstAvailableRoom(reqStart, length, locations, emails);

            // Write response object in json
            ObjectMapper mapper = new ObjectMapper();
            resp.setContentType("application/json");
            resp.setCharacterEncoding("utf-8");
            resp.setStatus(HttpServletResponse.SC_OK);
            mapper.writeValue(resp.getWriter(), response);
        }
        catch (RequestParameterException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print(e.getMessage());
            resp.setContentType("text/plain");
        }
        catch (HttpErrorException e) {
            if (e.getHttpErrorCode() == 401) {
                resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            }
            else {
                logger.error("Failed to get room availability", e);
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal error");
            }
        }
        catch (CredentialsMissingException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
        }
        catch (Exception e) {
            logger.error("Failed to get room availability", e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal error");
        }
    }

    /**
     * Validate location parameter and throw exception if invalid
     * @param locations
     */
    private void validateLocations(List<String> locations) throws RequestParameterException {
        for (String location : locations) {
            boolean found = false;
            for (ConferenceRoom room : allRooms) {
                if (room.getLocation().equals(location)) {
                    found = true;
                }
            }
            if (!found) {
                logger.warn("Unknown location: " + location);
                throw new RequestParameterException("Unknown location.");
            }
        }
    }

    /**
     * Validate time window parameters and throw exception if invalid
     * @param start
     * @param end
     */
    private void validateRequestTimewindow(Date start, Date end) throws RequestParameterException {
        if (start.after(end) || start.equals(end)) {
            logger.warn("Request with invalid timewindow, start:" + start + ", end:" + end);
            throw new RequestParameterException("Meeting start time must be before end time.");
        }
        if (start.before(new Date())) {
            // this can happen if local system time is off
            logger.warn("Request starting in the past, start:" + start + ", end:" + end);
            throw new RequestParameterException("Meeting start time is in the past, please check your local system time.");
        }
    }

    /**
     * Get a parameter value from request and throw appropriate exception if its missing
     * @param req
     * @param name
     */
    private String getStringRequestParameter(HttpServletRequest req, String name) throws RequestParameterException {
        String val = req.getParameter(name);
        if (val == null) {
            logger.warn("Missing request param: " + name);
            throw new RequestParameterException("Parameter '" + name + "' is missing.");
        }
        return val;
    }

    /**
     * Get a parameter value from request and throw appropriate exception if its missing
     * @param req
     * @param name
     */
    private List<String> getStringRequestParameterValues(HttpServletRequest req, String name) throws RequestParameterException {
        String[] val = req.getParameterValues(name);
        if (val == null) {
            logger.warn("Missing request param: " + name);
            throw new RequestParameterException("Parameter '" + name + "' is missing.");
        }
        return Arrays.asList(val);
    }

    /**
     * Get a date parameter value from request and throw appropriate exception if its missing or invalid
     * @param req
     * @param name
     */
    private Date getDateRequestParameter(HttpServletRequest req, String name) throws RequestParameterException {
        String val = getStringRequestParameter(req, name);
        Date d;
        try {
            d = new Date(Long.parseLong(val));
        }
        catch (NumberFormatException e) {
            logger.warn("Invalid request param: " + name);
            throw new RequestParameterException("Parameter value for '" + name + "' is invalid.");
        }
        return d;
    }

    /**
     * Get int parameter value from request and throw appropriate exception if its missing or invalid
     * @param req
     * @param name
     */
    private int getIntRequestParameter(HttpServletRequest req, String name) throws RequestParameterException {
        String val = getStringRequestParameter(req, name);
        try {
            return Integer.parseInt(val);
        }
        catch (NumberFormatException e) {
            logger.warn("Invalid request param: " + name);
            throw new RequestParameterException("Parameter value for '" + name + "' is invalid.");
        }
    }

    /**
     * Handle POST request to perform an action. Expected request params:
     * action = book  (only action supported currently)
     * start = meeting start as epoch msec
     * end = meeting end as epoch msec
     * room = email address of a required room
     * person = email address of a required attendee
     * subject = meeting subject
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            // Validate request parameters
            String action = getStringRequestParameter(req, "action");
            if (!action.equals("book")) {
                logger.warn("Request with invalid action:" + action);
                throw new RequestParameterException("Unsupported action parameter.");
            }

            List<String> rooms = getStringRequestParameterValues(req, "room");
            List<String> people = new ArrayList<String>();
            if (req.getParameter("person") != null) {
                people = getStringRequestParameterValues(req, "person");
            }

            Date meetingStart = getDateRequestParameter(req, "start");
            Date meetingEnd = getDateRequestParameter(req, "end");
            String meetingSubject = getStringRequestParameter(req, "subject");
            validateRequestTimewindow(meetingStart, meetingEnd);

            // Check for availability for participants before creating appointment
            AvailabilityService service = createAvailabilityService(req.getHeader("Authorization"));
            List<String> allEmails = new ArrayList<String>();
            allEmails.addAll(rooms);
            allEmails.addAll(people);
            if (!service.allAttendeesAvailable(meetingStart, meetingEnd, allEmails)) {
                // room is not available or only partially available, someone must have booked it
                logger.info("Requested attendees are no longer available");
                resp.sendError(HttpServletResponse.SC_CONFLICT, "All required attendees are no longer available");
                return;
            }

            // Create a new meeting as the requesting user and add the room as an attendee
            Appointment appointment = new Appointment(service.getExchangeService());
            appointment.setSubject(meetingSubject);
            String body = "Created by <a href='" + appUrl + "'>Room Finder</a>";
            appointment.setBody(MessageBody.getMessageBodyFromText(body));
            appointment.setStart(meetingStart);
            appointment.setEnd(meetingEnd);

            String loc = "";
            for (String email : rooms) {
                appointment.getResources().add(email);
                ConferenceRoom room = getRoomByEmail(email);
                if (room != null) {
                    loc += room.getName() + ",";
                }
            }
            // remove the last comma from room list
            appointment.setLocation(loc.substring(0, loc.length() - 1));

            for (String person : people) {
                appointment.getRequiredAttendees().add(person);
            }

            appointment.save(); // send web service request
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }
        catch (RequestParameterException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print(e.getMessage());
            resp.setContentType("text/plain");
        }
        catch (HttpErrorException e) {
            if (e.getHttpErrorCode() == 401) {
                resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            }
            else {
                logger.error("Failed to book room", e);
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
            }
        }
        catch (CredentialsMissingException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
        }
        catch (Exception e) {
            logger.error("Failed to book room", e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Create an instance of EWS client stub with basic auth user credentials
     * @return
     * @throws URISyntaxException
     */
    private AvailabilityService createAvailabilityService(String authHeader) throws URISyntaxException, CredentialsMissingException {
        String username = null, password = null;
        int prefixCount = "Basic ".length();
        if (authHeader != null && authHeader.length() > prefixCount) {
            authHeader = authHeader.substring(prefixCount);

            String decodedAuth = new String(org.apache.commons.codec.binary.Base64.decodeBase64(authHeader));
            int firstColon = decodedAuth.indexOf(':');
            if (firstColon < 0 || decodedAuth.length() <= firstColon+1) {
                // header did not match the expected format of username:password
                logger.error("Could not parse username and password from basic auth header");
            }
            else {
                username = decodedAuth.substring(0, firstColon);
                password = decodedAuth.substring(firstColon+1);
            }
        }
        if (username == null || password == null) {
            throw new CredentialsMissingException("Credentials missing");
        }

        AvailabilityService svc = new AvailabilityService(username, password, ewsUrl, ewsTrace);
        svc.setAllRooms(allRooms);
        return svc;
    }

    private List<AttendeeInfo> populateAttendees(String location) {
        List<AttendeeInfo> attendees = new ArrayList<AttendeeInfo>();

        for (ConferenceRoom room : allRooms) {
            if (room.getLocation().equals(location)) {
                attendees.add(new AttendeeInfo(room.getEmail()));
            }
        }

        return attendees;
    }

    private ConferenceRoom getRoomByEmail(String email) {
        for (ConferenceRoom room : allRooms) {
            if (room.getEmail().equals(email)) {
                return room;
            }
        }
        return null;
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