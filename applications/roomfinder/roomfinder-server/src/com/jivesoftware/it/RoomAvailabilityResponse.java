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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class RoomAvailabilityResponse {
    private Date start;
    private Date end;
    List<LocationAvailability> locations = new ArrayList<LocationAvailability>();

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }

    public List<LocationAvailability> getLocations() {
        return locations;
    }

    public void setLocations(List<LocationAvailability> locations) {
        this.locations = locations;
    }

    public void addRoomAvailability(ConferenceRoom room) {
        for (LocationAvailability loc : locations) {
            if (loc.getLocation().equals(room.getLocation())) {
                loc.getRooms().add(room);
                return;
            }
        }

        // did not find this location, add a new one
        LocationAvailability loc = new LocationAvailability();
        loc.setLocation(room.getLocation());
        loc.getRooms().add(room);
        locations.add(loc);
    }
}
