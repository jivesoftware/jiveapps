/*
Copyright 2013 Jive Software

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

package com.jivesoftware.it;

import microsoft.exchange.webservices.data.*;
import org.apache.log4j.Logger;

import java.net.URI;
import java.util.*;
import java.util.List;

/**
 * Methoeds and logic to handle exchange room availability and booking
 */
public class AvailabilityService {
    private ExchangeService exchangeService;
    private List<ConferenceRoom> allRooms;
    private static final Logger logger = Logger.getLogger(AvailabilityService.class);

    public AvailabilityService(String username, String password, URI ewsUrl, boolean trace) {
        ExchangeCredentials credentials = new WebCredentials(username, password);
        exchangeService = new ExchangeService();
        exchangeService.setCredentials(credentials);
        exchangeService.setUrl(ewsUrl);
        exchangeService.setTraceEnabled(trace);
    }

    public ExchangeService getExchangeService() {
        return exchangeService;
    }

    public void setExchangeService(ExchangeService exchangeService) {
        this.exchangeService = exchangeService;
    }

    public List<ConferenceRoom> getAllRooms() {
        return allRooms;
    }

    public void setAllRooms(List<ConferenceRoom> allRooms) {
        this.allRooms = allRooms;
    }

    /**
     * Return true if given time is available for all given attendees
     * @param start
     * @param end
     * @param emails Emails of all attendees
     */
    public boolean allAttendeesAvailable(Date start, Date end, List<String> emails) throws Exception {
        List<AttendeeInfo> attendees = new ArrayList<AttendeeInfo>();
        for (String email : emails) {
            attendees.add(new AttendeeInfo(email));
        }
        GetUserAvailabilityResults results = getRoomAvailability(start, attendees);
        for (AttendeeAvailability attendeeAvailability : results.getAttendeesAvailability()) {
            if (attendeeAvailability.getErrorCode() == ServiceError.NoError) {
                if (!isTimeAvailable(start, end, attendeeAvailability.getCalendarEvents())) {
                    return false; // this attendee is not available
                }
            }
        }
        return true;
    }

    /**
     *
     */
    public RoomAvailabilityResponse getFirstAvailableRoom(Date start, int length, List<String> locations, List<String> emails) throws Exception {
        if (emails == null) {
            return getFirstAvailableRoomWithoutAttendees(start, length, locations);
        }

        // First get suggested times that are free for all required participants
        List<Date> times = getSuggestionsForPeople(emails, length, start);
        List<AttendeeInfo> rooms = getRoomAttendees(locations);

        // get free-busy info for all rooms for the day of the request and following day
        GetUserAvailabilityResults roomAvailability = getRoomAvailability(start, rooms);

        // Then check each time and return the first one that has rooms available for all locations
        for (Date t : times) {
            Date end = new Date(t.getTime() + 1000*60*length); // length is in minutes
            RoomAvailabilityResponse suggestions = getRoomsForTime(t, end, rooms, roomAvailability, locations);
            if (suggestions != null) {
                return suggestions;
            }
        }
        return null;
    }

    /**
     *
     */
    private RoomAvailabilityResponse getFirstAvailableRoomWithoutAttendees(Date start, int length, List<String> locations) throws Exception {
        List<AttendeeInfo> rooms = getRoomAttendees(locations);

        // get free-busy info for all rooms for the day of the request and following day
        GetUserAvailabilityResults roomAvailability = getRoomAvailability(start, rooms);

        // adjust start time to the next full 30-min slot, if closer than 15mins
        Calendar startCal = new GregorianCalendar();
        startCal.setTime(start);
        startCal.set(Calendar.SECOND, 0);
        startCal.set(Calendar.MILLISECOND, 0);
        int startMinute = startCal.get(Calendar.MINUTE);
        int startDay = startCal.get(Calendar.DATE);

        // figure out an offset to add to meeting end to make it hit a full half hour
        // after meeting length (30,60 or 90mins) is added to it
        int endOffset = 0;
        if (startMinute < 15) {
            endOffset = -1*startMinute;
        }
        else if (startMinute >= 15 && startMinute < 45) {
            endOffset = 30 - startMinute;
        }
        else if (startMinute >= 45) {
            endOffset = 60 - startMinute;
        }

        Calendar endCal = new GregorianCalendar();
        endCal.setTime(startCal.getTime());
        endCal.add(Calendar.MINUTE, length+endOffset);

        RoomAvailabilityResponse suggestions = null;
        while (true) {
            logger.debug("Looking for rooms from " + startCal.getTime() + " to " + endCal.getTime());
            suggestions = getRoomsForTime(startCal.getTime(), endCal.getTime(), rooms, roomAvailability, locations);
            if (suggestions != null) {
                break;
            }

            // roll meeting end forward 30mins
            endCal.add(Calendar.MINUTE, 30);

            // figure next start time by subtracting meeting length in minutes
            // this way the initial start time will get bumped to even 30-minute slot
            startCal.setTimeInMillis(endCal.getTimeInMillis());
            startCal.add(Calendar.MINUTE, -1*length);

            if (endCal.get(Calendar.DATE) > startDay) {
                // search time slot rolled into next day, need to give up
                logger.debug("Reached the end of the day while searching for availability");
                break;
            }
        }

        return suggestions;
    }

    /**
     *
     */
    private boolean allLocationsAvailable(List<String> locations, List<ConferenceRoom> rooms) {
        for (String loc : locations) {
            boolean found = false;
            for (ConferenceRoom room : rooms) {
                if (room.getLocation().equals(loc)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }

    public GetUserAvailabilityResults getRoomAvailability(Date reqStart, List<AttendeeInfo> attendees) throws Exception {
        // EWS requires that availability info is requested for a minimum of 24 hours. It seems that EWS returns
        // data for the full day when request time window starts, and any following full day included in the
        // time window. This means we need to make the time window end 48 hours later to make sure we get availability
        // data for today and tomorrow.
        Date apiWindowEnd = new Date(reqStart.getTime() + 1000*60*60*48);

        // Request availability for all rooms in a location, and then process data to find the rooms available
        // for requested time window.
        return exchangeService.getUserAvailability(attendees, new TimeWindow(reqStart, apiWindowEnd), AvailabilityData.FreeBusy);
    }

    /**
     */
    public RoomAvailabilityResponse getRoomsForTime(Date reqStart, Date reqEnd, List<AttendeeInfo> attendees, GetUserAvailabilityResults results, List<String> locations) throws Exception {
        RoomAvailabilityResponse suggestions = new RoomAvailabilityResponse();
        List<ConferenceRoom> availableRooms = new ArrayList<ConferenceRoom>();

        int attendeeIndex = 0; // must rely on index to map availability to room
        for (AttendeeAvailability attendeeAvailability : results.getAttendeesAvailability()) {
            ConferenceRoom room = getRoomByEmail(attendees.get(attendeeIndex).getSmtpAddress());
            if (attendeeAvailability.getErrorCode() == ServiceError.NoError) {
                logger.debug("Processing availability for " + room.getName());

                // todo could cache mergedEvents for each attendee when repeating search for a
                // different timeslot when there is no availability for the first one

                if (isTimeAvailable(reqStart, reqEnd, attendeeAvailability.getCalendarEvents())) {
                    availableRooms.add(room);
                }
                else {
                    logger.info(room.getName() + " is not available");
                }
            }
            else {
                WebCredentials creds = (WebCredentials)exchangeService.getCredentials();
                logger.error(room.getName() + ", " + creds.getUser() + ", " + attendeeAvailability.getErrorCode().name() + ", " +
                        attendeeAvailability.getErrorMessage());
            }
            attendeeIndex++;
        }

        if (locations.size() > 1) {
            if (!allLocationsAvailable(locations, availableRooms)) {
                return null; // need to have at least one room in each location
            }
        }

        if (availableRooms.size() == 0) {
            return null;
        }

        logger.debug("Returning rooms for " + reqStart);
        for (ConferenceRoom room : availableRooms) {
            suggestions.addRoomAvailability(room);
        }
        suggestions.setStart(reqStart);
        suggestions.setEnd(reqEnd);
        return suggestions;
    }

    /**
     *
     * @param emails
     * @param length
     * @param startTime
     */
    public List<Date> getSuggestionsForPeople(List<String> emails, int length, Date startTime) throws Exception {
        List<AttendeeInfo> attendees = new ArrayList<AttendeeInfo>();
        for (String email : emails) {
            attendees.add(new AttendeeInfo(email));
        }

        // getUserAvailability only supports time periods that are a minimum of 24 hours long and that begin and end at 12am
        // http://msdn.microsoft.com/en-us/library/ee344039(v=exchg.80).aspx
        // start time is set to the 12am of the day of requested time, and end is set 48hrs later because the timewindow
        // seems to be interpreted in UTC, so 24hrs does not cover the full day in local timezone

        if (startTime == null) {
            startTime = new Date();
        }
        Calendar cal = new GregorianCalendar();
        cal.setTime(startTime);
        cal.set(Calendar.HOUR, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);

        Date windowEnd = new Date(startTime.getTime() + 1000*60*60*48);

        AvailabilityOptions options = new AvailabilityOptions();
        options.setMeetingDuration(length);
        options.setMaximumSuggestionsPerDay(24);
        options.setMaximumNonWorkHoursSuggestionsPerDay(0);
        options.setMinimumSuggestionQuality(SuggestionQuality.Excellent); // require all attendees to be available

        GetUserAvailabilityResults results = exchangeService.getUserAvailability(attendees, new TimeWindow(cal.getTime(), windowEnd), AvailabilityData.Suggestions, options);

        // todo filter non-work hours? it seems that ews returns them even if disabled in options

        List<Date> times = new ArrayList<Date>();
        for (Suggestion suggestion : results.getSuggestions()) {
            for (TimeSuggestion timeSuggestion : suggestion.getTimeSuggestions()) {
                if (timeSuggestion.getMeetingTime().before(startTime)) {
                    // filter out suggestions before start time
                    continue;
                }
                logger.info(timeSuggestion.getMeetingTime());
                times.add(timeSuggestion.getMeetingTime());
            }
        }

        Collections.sort(times);
        return times;
    }

    private boolean isTimeAvailable(Date start, Date end, Collection<CalendarEvent> calendarEvents) {
        for (CalendarEvent event : calendarEvents) {
             Date eventStart = event.getStartTime();
             Date eventEnd = event.getEndTime();

             if ((eventStart.before(start) || eventStart.equals(start)) &&
                 (eventEnd.after(end) || eventEnd.equals(end))) {
                 // existing event fully overlaps requested time
                 logger.debug("Fully overlapping existing event from " + eventStart + " to " + eventEnd);
                 return false;
             }

             if ((eventStart.after(start) && eventStart.before(end)) ||
                 (eventEnd.after(start) && eventEnd.before(end))) {
                 // existing event is partially within the requested time
                 logger.debug("Partially overlapping existing event from " + eventStart + " to " + eventEnd);
                 return false;
             }
        }
        return true;
    }


    private List<AttendeeInfo> getRoomAttendees(List<String> locations) {
        List<AttendeeInfo> attendees = new ArrayList<AttendeeInfo>();

        for (ConferenceRoom room : allRooms) {
            if (locations.contains(room.getLocation())) {
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
