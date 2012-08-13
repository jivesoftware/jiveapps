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
    private int minMeetingTime = 10; // default 10 minutes
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
            minMeetingTime = Integer.parseInt(prop.getProperty("min.meeting.time"));
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
     * end = end of availability request as epoch msec
     *
     * For example localhost:8082/room-finder?location=portland&start=1326815440616&end=1326817240616
     *
     * Returns a json array of AvailabilityInfo instances, one for each room that is available.
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<AvailabilityInfo> availability = new ArrayList<AvailabilityInfo>();
        MergedCalendarEventMapper eventMapper = new MergedCalendarEventMapper();

        try {
            // Validate request parameters. The app client code decides on start and end time, so it is possible
            // validation will fail due to system clock difference between client and server.
            String location = getStringRequestParameter(req, "location");
            Date reqStart = getDateRequestParameter(req, "start");
            Date reqEnd = getDateRequestParameter(req, "end");
            validateRequestTimewindow(reqStart, reqEnd);
            validateLocation(location);

            // EWS requires that availability info is requested for a minimum of 24 hours. It seems that EWS returns
            // data for the full day when request time window starts, and any following full day included in the
            // time window. This means we need to make the time window end 48 hours later to make sure we get availability
            // data for today and tomorrow.
            Date apiWindowEnd = new Date(reqStart.getTime() + 1000*60*60*48);

            // Request availability for all rooms in a location, and then process data to find the rooms available
            // for requested time window.
            ExchangeService service = createExchangeService(req.getHeader("Authorization"));
            List<AttendeeInfo> attendees = populateAttendees(location);
            GetUserAvailabilityResults results = service.getUserAvailability(attendees, new TimeWindow(reqStart, apiWindowEnd), AvailabilityData.FreeBusy);

            logger.info("Request for " + location + " rooms, start:" + reqStart + " (" + req.getParameter("start") +
                    "), end:" + reqEnd + " (" + req.getParameter("end") + ")");

            int attendeeIndex = 0; // must rely on index to map availability to room
            for (AttendeeAvailability attendeeAvailability : results.getAttendeesAvailability()) {
                ConferenceRoom room = getRoomByEmail(attendees.get(attendeeIndex).getSmtpAddress());
                if (attendeeAvailability.getErrorCode() == ServiceError.NoError) {
                    logger.info("Processing availability for " + room.getName());

                    // First merge consecutive events to simplify availability logic and then check if this room is available
                    List<MergedCalendarEvent> mergedEvents = eventMapper.map(attendeeAvailability.getCalendarEvents());
                    AvailabilityInfo info = getAvailability(reqStart, reqEnd, mergedEvents);

                    if (info != null) { // this room is available, add it into the list
                        info.setRoom(room);
                        availability.add(info);

                        String availableFrom = (info.getAvailableFrom() == null) ? "start" : info.getAvailableFrom().toString();
                        String availableTo = (info.getAvailableTo() == null) ? "end" : info.getAvailableTo().toString();
                        logger.info(room.getName() + " is available " + availableFrom + " to " + availableTo);
                    }
                    else {
                        logger.info(room.getName() + " is not available");
                    }
                }
                else {
                    logger.warn("Error for " + room.getName() + ": " + attendeeAvailability.getErrorCode().name() + " " +
                            attendeeAvailability.getErrorMessage());
                }
                attendeeIndex++;
            }

            // Write response object in json
            ObjectMapper mapper = new ObjectMapper();
            resp.setContentType("application/json");
            resp.setStatus(HttpServletResponse.SC_OK);
            mapper.writeValue(resp.getWriter(), availability);
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
     * @param location
     */
    private void validateLocation(String location) throws RequestParameterException {
        if (!location.equals("portland") &&
            !location.equals("paloalto") &&
            !location.equals("boulder")) {
            logger.warn("Unknown location: " + location);
            throw new RequestParameterException("Unknown location.");
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
     * Return availability for given timeframe based on existing calendar events. Return null
     * if there is no availability.
     *
     * @param start
     * @param end
     * @return
     */
    private AvailabilityInfo getAvailability(Date start, Date end, List<MergedCalendarEvent> mergedEvents) {
        AvailabilityInfo info = new AvailabilityInfo();

        // Check existing events and if any of them overlaps with the requested time
        // window, define constraints in returned AvailabilityInfo or return null.
        // If none of the existing events conflict with the request, return a blank info instance.

        for (MergedCalendarEvent calendarEvent : mergedEvents) {
            Date eventStart = calendarEvent.getStart();
            Date eventEnd = calendarEvent.getEnd();

            if (eventStart.after(start) && eventStart.before(end)) {
                // existing event start is within the requested window, save the earliest one
                if (info.getAvailableTo() == null || info.getAvailableTo().after(eventStart)) {
                    info.setAvailableTo(eventStart);
                }
            }

            if (eventEnd.after(start) && eventEnd.before(end)) {
                // existing event end is within the requested window, save the latest one that is also
                // before the earliest endpoint
                if ((info.getAvailableFrom() == null || info.getAvailableFrom().before(eventEnd)) &&
                    (info.getAvailableTo() == null || info.getAvailableTo().after(eventEnd))) {
                    info.setAvailableFrom(eventEnd);
                }
            }

            if ((eventStart.before(start) || eventStart.equals(start)) &&
                (eventEnd.after(end) || eventEnd.equals(end))) {
                // existing event overlaps requested window completely -> no availability
                return null;
            }
        }

        // after processing existing calendar events, check minimum length of availability
        if (info.getAvailableTo() != null || info.getAvailableFrom() != null) {
            long startMsec = info.getAvailableFrom() == null ? start.getTime() : info.getAvailableFrom().getTime();
            long endMsec = info.getAvailableTo() == null ? end.getTime() : info.getAvailableTo().getTime();
            if (endMsec - startMsec < 1000*60*minMeetingTime) {
                logger.info("Ignoring a short availability for " + (endMsec - startMsec)/1000 + " secs");
                return null;
            }
        }

        return info;
    }

    /**
     * Handle POST request to perform an action. Expected request params:
     * action = book  (only action supported currently)
     * room = email address of the room
     * start = meeting start as epoch msec
     * end = meeting end as epoch msec
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
            String roomEmail = getStringRequestParameter(req, "room");
            Date meetingStart = getDateRequestParameter(req, "start");
            Date meetingEnd = getDateRequestParameter(req, "end");
            validateRequestTimewindow(meetingStart, meetingEnd);

            // Check for availability for this specific room before creating appointment
            ExchangeService service = createExchangeService(req.getHeader("Authorization"));
            Date apiWindowEnd = new Date(meetingStart.getTime() + 1000*60*60*24); // 24hrs required by EWS
            GetUserAvailabilityResults results = service.getUserAvailability(
                    Arrays.asList(new AttendeeInfo(roomEmail)),
                    new TimeWindow(meetingStart, apiWindowEnd),
                    AvailabilityData.FreeBusy);
            AttendeeAvailability availability = results.getAttendeesAvailability().getResponseAtIndex(0);
            if (availability.getErrorCode() == ServiceError.NoError) {
                MergedCalendarEventMapper eventMapper = new MergedCalendarEventMapper();
                List<MergedCalendarEvent> mergedEvents = eventMapper.map(availability.getCalendarEvents());
                AvailabilityInfo info = getAvailability(meetingStart, meetingEnd, mergedEvents);
                if (info == null || info.getAvailableFrom() != null || info.getAvailableTo() != null) {
                    // room is not available or only partially available, someone must have booked it
                    logger.info("Booking request for " + roomEmail + " failed because room no longer available");
                    resp.sendError(HttpServletResponse.SC_CONFLICT, "Room is no longer available for the requested time");
                    return;
                }
            }

            // Create a new meeting as the requesting user and add the room as an attendee
            Appointment appointment = new Appointment(service);
            appointment.setSubject("My meeting");
            String body = "Created from <a href='" + appUrl + "'>Room Finder</a>";
            appointment.setBody(MessageBody.getMessageBodyFromText(body));
            appointment.setStart(meetingStart);
            appointment.setEnd(meetingEnd);
            appointment.getRequiredAttendees().add(roomEmail);
            appointment.save();

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
    private ExchangeService createExchangeService(String authHeader) throws URISyntaxException, CredentialsMissingException {
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

        logger.info("Initializing EWS service for " + username);

        ExchangeService service = new ExchangeService();
        ExchangeCredentials credentials = new WebCredentials(username, password);
        service.setCredentials(credentials);
        service.setUrl(ewsUrl);
        service.setTraceEnabled(ewsTrace);
        return service;
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