/*
 * Copyright 2012, Jive Software Inc.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

var roomFinder = {
    reqStartDate: null,       // requested meeting start time
    reqEndDate: null,         // requested meeting end time
    reqLocation: null,        // requested room location
    reqEndExtension: 0,       // increased when user clicks add time
    currentJiveUser: null,    // holds logged in Jive user
    appdata: {},              // holds app data for current user
    resetTimer: null,         // used to clear out search results if start time reached
    minimsg: null,            // message shows to user when results are cleared

    availableRooms: null,     // room availability info from server
    locations: null,          // room locations info from server

    // startup function, defines event handlers and loads user and location data
    init: function() {
        var currentView = gadgets.views.getCurrentView().getName();
        if (currentView != "home") {
            $("#container").addClass("canvasview");
            $("#results").addClass("canvasview");
        }
        $("#add-time").click(gadgets.util.makeClosure(this, this.handleAddTimeClick));
        this.minimsg = new gadgets.MiniMessage("", document.getElementById("minimessage"));

        // First need to load the current user, then app data, and then available rooms for
        // the location selected last time. If this is the first time, show an instruction text
        var thisObj = this;
        this.loadCurrentUser( function() {
            thisObj.loadAppData( function() {
                if (currentView == "canvas" && thisObj.appdata.defaultLocation) {
                    thisObj.getAvailability(thisObj.appdata.defaultLocation);
                }
                else {
                    $("#instruction").show();
                }
            })
        });

        // While we are loading current user and app data, we can request the location metadata
        this.loadLocations();
    },

    // load Jive user object into this.currentUser and then invoke the callback
    loadCurrentUser: function( callbackFn ) {
        if (this.currentJiveUser) {
            callbackFn(); // user is already set
        }
        else {
            var thisObj = this;
            osapi.jive.core.users.get({id: '@viewer'}).execute(function(userResponse) {
                if (!userResponse.error) {
                    thisObj.currentJiveUser = userResponse.data;
                    callbackFn();
                }
                else {
                    thisObj.showError(userResponse.error.message + " (error code:" + userResponse.error.code + ")");
                }
            });
        }
    },

    // load app data for current user
    loadAppData: function( callbackFn ) {
        var thisObj = this;
        osapi.appdata.get().execute(function(response) {
            if (response.error) {
                console.error("Error retrieving appdata, " +
                        response.error.message + " (error code:" + response.error.code + ")");
            }
            else {
                thisObj.appdata = response[thisObj.currentJiveUser.id];
                callbackFn();
            }
        });
    },

    // load available room locations from server
    loadLocations: function() {
        var options = {
            alias: "roomfinder",
            headers: {"Accept": ["application/json"]},
            href: "/locations",
            refreshInterval: 3600 // cache 1hr
        };

        var callback = gadgets.util.makeClosure(this, this.handleLocationResponse);
        osapi.jive.connects.get(options).execute(callback);
    },

    // handle button click to add more time to the meeting end
    handleAddTimeClick: function() {
        // extend meeting end time out another 30mins when user clicks on add time
        // and repeat the search for same location
        this.reqEndExtension++;
        if (this.reqEndExtension > 2) {
            $("#add-time").attr('disabled', 'disabled');
        }
        this.getAvailability(this.reqLocation);
    },

    // handle button click to search for available rooms for a location
    handleLocationClick: function(location) {
        // save previously selected location
        osapi.appdata.update({data: {defaultLocation: location}}).execute(function(resp) {
            if (resp.error) {
                console.error(resp.error.message + " (error code:" + resp.error.code + ")");
            }
        });

        // reset meeting end time to default 30mins out when user clicks on a location
        this.reqEndExtension = 0;
        $("#add-time").removeAttr('disabled');
        this.getAvailability(location);
    },

    // query server for room availability for a location
    getAvailability: function(location) {
        $("#results").hide();
        $("#timewindow").hide();

        $("img.activity-indicator").show();

        // figure out requested time window based on current time
        var helperDate = new Date();
        helperDate.setSeconds(0, 0);
        var delayMsec = 1000*60*3; // add 3min because start must be in the future
        var reqStartMsec = helperDate.getTime() + delayMsec;
        helperDate.setMinutes(0, 0, 0);
        var reqEndMsec = helperDate.getTime();  // add 30min until at least extX30min + 20min past start
        var minDuration = 1000*60*(20 + 30*this.reqEndExtension);
        while (reqEndMsec < reqStartMsec + minDuration) {
            reqEndMsec += 1000*60*30;
        }

        // start timer that will automatically reset the view 10sec before start time
        if (this.resetTimer != null) {
            clearTimeout(this.resetTimer);
        }
        this.resetTimer = setTimeout(gadgets.util.makeClosure(this, this.showInitialView), delayMsec - 10000);

        // save request params for later display
        this.reqStartDate = new Date(reqStartMsec);
        this.reqEndDate = new Date(reqEndMsec);
        this.reqLocation = location;

        var options = {
            alias: "roomfinder",
            headers: {"Accept": ["application/json"]},
            href: "/room-finder",
            params: {"location": [location], "start": [reqStartMsec], "end": [reqEndMsec]}
        };

        // define a function to handle server response
        var callback = gadgets.util.makeClosure(this, this.handleAvailabilityResponse, location);
        osapi.jive.connects.get(options).execute(callback);
    },

    // handle server response to a room availability request
    handleAvailabilityResponse: function(location, response) {
        if (response.error) {
            // define a callback function for retry operation if need to re-enter credentials
            var retryFunc = gadgets.util.makeClosure(this, this.getAvailability, location);
            this.handleJiveConnectsError(response, retryFunc);
        }
        else if (response.content == undefined) {
            // The response is not what the API defines, must be a server error
            console.error(response);
            this.showError("Sorry, an error occurred during search. This is most likely due to a " +
                           "known Apps authentication timeout issue. Please try to reload your browser.");
        }
        else {
            this.availableRooms = response.content;
            this.showResults();
        }
    },

    // handle server response to a location metadata request
    handleLocationResponse: function(response) {
        if (response.error) {
            // define a callback function for retry operation if need to re-enter credentials
            var retryFunc = gadgets.util.makeClosure(this, this.loadLocations);
            this.handleJiveConnectsError(response, retryFunc);
        }
        else if (response.content == undefined) {
            // The response is not what the API defines, must be a server error
            console.error(response);
            this.showError("Sorry, an error occurred during search. This is most likely due to a " +
                           "known Apps authentication timeout issue. Please try to reload your browser.");
        }
        else {
            this.locations = response.content;
            this.showLocations();
        }
    },

    // render location buttons based on server response
    showLocations: function() {
        if (this.locations.length == 0) {
            this.showError("No locations configured on server.");
            return;
        }

        var thisObj = this;
        $.each(this.locations, function(index, loc) {
            var btn = $("<input>", {type: "button", class: "appbutton", value: loc.label})
                    .click(gadgets.util.makeClosure(thisObj, thisObj.handleLocationClick, loc.name));
            $("#controls").append(btn);
        });

        $("#controls").show();
    },

    // render room divs to home view from search results
    showResults: function() {
        $("img.activity-indicator").hide();
        $("#instruction").slideUp("fast");
        $("#results").empty();

        var locationName = this.getLocationDisplayName(this.reqLocation);
        var timespan = this.formatTimeString(this.reqStartDate) + " - " + this.formatTimeString(this.reqEndDate);

        if (this.availableRooms.length == 0) {
            $("#timewindow-text").html("No rooms available in " + locationName + " " + timespan);
            $("#timewindow").show();
            return;
        }

        $("#timewindow-text").html("Available in " + locationName + " " + timespan);
        $("#timewindow").show();

        // Create a div for each available room with name, timeslot and book link
        var thisObj = this;
        var floorSections = [];
        $.each(this.availableRooms, function(n, info) {
            /*
                <div class="floor">
                    <div class="floorname">3rd floor</div>
                    <div class="roomlist">
                        <div class="room">
                            <span class="roomname">Trapezoid</span>
                            <span class="roomtime">(from 2:30pm to 2:45pm)</span>
                            <div class="roombook">
                                <a href="#">book</a>
                            </div>
                        </div>
                    </div>
                </div>
             */

            var roomdiv = $("<div>").addClass("room");
            var roomname = $("<span>").addClass("roomname").html(info.room.name);
            roomdiv.append(roomname);
            var timewindow = thisObj.formatAvailabilityTimewindow(info);
            if (timewindow) {
                roomdiv.append($("<span>").addClass("roomtime").html(timewindow));
            }

            // create a link to book this room
            var meetingStartMsec = info.availableFrom ?  info.availableFrom : thisObj.reqStartDate.getTime();
            var meetingEndMsec = info.availableTo ?  info.availableTo : thisObj.reqEndDate.getTime();
            var book = $("<a>", {href: "#"}).html("book").click(
                    gadgets.util.makeClosure(thisObj, thisObj.bookRoom, meetingStartMsec, meetingEndMsec, info.room)
            );
            var bookdiv = $("<div>").addClass("roombook").append(book);
            roomdiv.append(bookdiv);

            // find a roomlist div for this floor and create one if not found
            var roomlist;
            for (i=0; i<floorSections.length; i++) {
                if (floorSections[i].floor == info.room.floor) {
                    roomlist = floorSections[i].roomlist;
                    break;
                }
            }
            if (!roomlist) { // does not exist yet, create new
                var floordiv = $("<div>").addClass("floor");
                var icon = $("<span>").addClass("indicator");
                var floorname = $("<div>").addClass("floorname expanded").append(icon).append("Floor " + info.room.floor);
                var propKey = thisObj.getPropertyKey(thisObj.reqLocation, info.room.floor);
                // Show/hide room list when floor header is clicked and persist to appdata
                floorname.click( function() {
                    var value = $(this).hasClass("expanded") ? 0 : 1;
                    var data = {};
                    data[propKey] = value;
                    osapi.appdata.update({data: data}).execute(function(resp) {
                        if (resp.error) {
                            console.error(resp.error.message + " (error code:" + resp.error.code + ")");
                        }
                        else { // also update the in-memory value
                            thisObj.appdata[propKey] = value;
                        }
                    });
                    $(this).toggleClass("expanded");
                    $(this).next().slideToggle("fast");
                    return false;
                });

                roomlist = $("<div>").addClass("roomlist");

                floordiv.append(floorname).append(roomlist);
                $("#results").append(floordiv);
                floorSections.push({floor: info.room.floor, roomlist:roomlist});

                if (thisObj.appdata[propKey] == "0") {
                    // this floor section has been hidden before -> hide it by default
                    floorname.removeClass("expanded");
                    roomlist.hide();
                }
            }
            roomlist.append(roomdiv);
        });

        $("#results").show();
    },

    // Return the object property key used to save appdata settings
    getPropertyKey: function(location, floor) {
        return location + "_" + floor;
    },

    // format display string for room availability time, return null if no display needed
    formatAvailabilityTimewindow: function(availabilityInfo) {
        var fromTime, toTime;
        if (availabilityInfo.availableFrom) {
            fromTime = this.formatTimeString(new Date(availabilityInfo.availableFrom));
        }
        if (availabilityInfo.availableTo) {
            toTime = this.formatTimeString(new Date(availabilityInfo.availableTo));
        }

        if (fromTime && toTime) {
            return "available " + fromTime + " - " + toTime;
        }
        else if (fromTime) {
            return "available at " + fromTime;
        }
        else if (toTime) {
            return "available until " + toTime;
        }
        else {
            return null;
        }
    },

    // send a request to server to book a room
    bookRoom: function(start, end, room) {
        $("#timewindow").hide();
        $("#results").empty();
        $("img.activity-indicator").show();

        var options = {
            alias: "roomfinder",
            href: "/room-finder",
            params: {"action": ["book"], "start": [start], "end": [end], "room":[room.email]}
        };

        var callback = gadgets.util.makeClosure(this, this.handleBookResponse, start, end, room);
        osapi.jive.connects.post(options).execute(callback);
    },

    // handle server response from booking request
    handleBookResponse: function(start, end, room, response) {
        $("img.activity-indicator").hide();
        if (response.error) {
            if (response.error.code == 409) {
                // Room is no longer available,
                this.showError("Sorry, " + room.name + " was just booked. Please click on a location to try again.");
            }
            else {
                // define a callback function for retry operation if need to re-enter credentials
                var retryFunc = gadgets.util.makeClosure(this, this.handleBookResponse, start, end, room);
                this.handleJiveConnectsError(response, retryFunc);
            }
        }
        else if (response.content == undefined) {
            // The response is not what the API defines, must be a server error
            console.error(response);
            this.showError("Sorry, an error occurred during search. This is most likely due to a " +
                           "known Apps authentication timeout issue. Please try to reload your browser.");
        }
        else {
            var startDisplay = this.formatTimeString(new Date(start));
            var endDisplay = this.formatTimeString(new Date(end));
            var str = room.name + " booked from " + startDisplay + " to " + endDisplay + "!";
            var message = $("<div>").addClass("booked-message").html(str);

            var cancellation = $("<p>").addClass("booked-cancel").html(
                    "If you didn't intend to book, please cancel the meeting from Outlook.");

            $("#results").append(message).append(cancellation);
        }
    },

    // find the display label for a location name
    getLocationDisplayName: function(location) {
        var label = "Unknown";
        $.each(this.locations, function(index, loc) {
            if (loc.name == location) {
                label = loc.label;
                return false; // breaks the each loop
            }
        })
        return label;
    },

    // error handler that detects when authentication failed and triggers a reconfiguration of
    // the Jive Connects service for this user
    handleJiveConnectsError: function(response, retryFunc) {
        if (response.error.code == 401) {
            // Server requests authentication. Ask Jive to configure credentials for this connection
            osapi.jive.connects.reconfigure("roomfinder", response, function(feedback) {
                if (!feedback.error) {
                    // configuration was successful, call the supplied function to continue
                    retryFunc();
                }
                else {
                    // configuration failed, or user decided not to provide credentials
                    roomFinder.showError(feedback.error.message + " (error code:" + feedback.error.code + ")");
                }
            });
        }
        else if (response.error.code == 400) {
        	// Server noticed a problem with request parameters
            roomFinder.showError("Error: " + response.content.content);        
        }
        else {
        	// Some other error, usually internal error 500
            roomFinder.showError(response.error.message + " (error code:" + response.error.code + ")");
        }
    },

    // show an error message
    showError: function(msg) {
        $("#timewindow").hide();
        $("img.activity-indicator").hide();
        $("#results").empty();
        $("<div>").addClass("error").html(msg).appendTo($("#results"));
        $("#results").show();
    },

    // reset view to instruction message and location buttons
    showInitialView: function() {
        $("#results").hide();
        $("#timewindow").hide();
        $("#instruction").show();

        this.minimsg.createTimerMessage("Room results were cleared because the start time " +
                this.formatTimeString(this.reqStartDate) +
                " has passed. Please click on a location again to get new results.", 30);
    },

    // return US formatted time string hh:mm am/pm
    formatTimeString: function(d) {
        var curr_hour = d.getHours();
        var ampm = "pm";
        if (curr_hour < 12) {
           ampm = "am";
        }

        if (curr_hour == 0) {
           curr_hour = 12;
        }
        if (curr_hour > 12) {
           curr_hour = curr_hour - 12;
        }

        // ensure two digit display for minutes
        var curr_minutes = d.getMinutes().toString();
        if (d.getMinutes() < 10) {
            curr_minutes = "0" + curr_minutes;
        }

        if (d.getMinutes() == 0) {
            return curr_hour + ampm;
        }
        else {
            return curr_hour + ":" + curr_minutes + ampm;
        }
    }
}

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(roomFinder, roomFinder.init));
