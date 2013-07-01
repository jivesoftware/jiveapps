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
import java.util.List;

public class LocationAvailability {
    private String location;
    List<ConferenceRoom> rooms = new ArrayList<ConferenceRoom>();

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<ConferenceRoom> getRooms() {
        return rooms;
    }

    public void setRooms(List<ConferenceRoom> rooms) {
        this.rooms = rooms;
    }
}
