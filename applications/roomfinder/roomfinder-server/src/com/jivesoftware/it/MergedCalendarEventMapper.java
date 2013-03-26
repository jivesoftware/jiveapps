package com.jivesoftware.it;

import microsoft.exchange.webservices.data.CalendarEvent;
import org.apache.log4j.Logger;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * This class knows how to map EWS calendar event instances into a merged and ordered
 * list of MergedCalendarEvent instances.
 */
public class MergedCalendarEventMapper {
    private static final Logger logger = Logger.getLogger(MergedCalendarEventMapper.class);

    /**
     * Merge a collection of CalendarEvent instances into a sorted list of merged events
     * @param calendarEvents
     */
    public List<MergedCalendarEvent> map(Collection<CalendarEvent> calendarEvents) throws ParseException {
        List<MergedCalendarEvent> sortedEvents = new ArrayList<MergedCalendarEvent>();
        List<MergedCalendarEvent> mergedEvents = new ArrayList<MergedCalendarEvent>();
        // change all into a list of MergedCalendarEvent and fix times
        for (CalendarEvent calendarEvent : calendarEvents) {
            sortedEvents.add(new MergedCalendarEvent(calendarEvent.getStartTime(), calendarEvent.getEndTime()));
        }
        // sort based on start date
        Collections.sort(sortedEvents, new Comparator<MergedCalendarEvent>() {
            public int compare(MergedCalendarEvent event1, MergedCalendarEvent event2) {
                return event1.getStart().compareTo(event2.getStart());
            }
        });
        // merge into a separate list
        for (MergedCalendarEvent event : sortedEvents) {
            if (mergedEvents.size() == 0 ||
                mergedEvents.get(mergedEvents.size()-1).getEnd().before(event.getStart())) {
                // add new
                mergedEvents.add(event);
            }
            else {
                // merge
                logger.info("Merging event ending " + mergedEvents.get(mergedEvents.size()-1).getEnd() + " into next one ending " + event.getEnd());
                mergedEvents.get(mergedEvents.size()-1).setEnd(event.getEnd());
            }
        }
        return mergedEvents;
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