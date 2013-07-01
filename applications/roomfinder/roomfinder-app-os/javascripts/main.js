/*
 * Copyright 2013, Jive Software Inc.
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
    reqStartDate: null,       // requested meeting start date
    reqStartHour: null,       // requested meeting start hour
    reqStartMinute: null,     // requested meeting start minute
    reqLength: null,          // requested meeting length
    reqLocation: [],          // requested room locations
    reqPeople: [],            // user objects of requested people
    selectedRooms: [],        // room objects of selected rooms
    peopleListChanged: false, // flag to detect edits to people list
    currentJiveUser: null,    // holds logged in Jive user
    appdata: {},              // holds app data for current user
    resetTimer: null,         // used to clear out search results if start time reached

    availabilityResponse: [], // room availability responses from server
    availabilityIndex: -1,    // index of currently shown availability response
    locations: null,          // room locations info from server

    // startup function, defines event handlers and loads user and location data
    init: function() {
        var thisObj = this;

        // While we are loading current user and app data, we can request the location metadata
        this.loadAppData(function() {
            thisObj.loadLocations( function() {
                thisObj.getAvailability();
            })
        });

        $("#length-select").dropkick({
            change: function() {
                thisObj.clearResults(false);
            }
        });

        $("#start-input-date").datepicker({
            showOn: "button",
            buttonText: "Today",
            beforeShowDay: $.datepicker.noWeekends,
            minDate: 0,
            maxDate: 364,
            onSelect: gadgets.util.makeClosure(this, this.handleDatepickerSelect)
        });
        $("button.ui-datepicker-trigger").button();

        $("#start-input-time").timepicker({
            showOn: "button",
            button: $("#timepicker-trigger"),
            hours: {starts: 6, ends: 19},
            minutes: {interval: 30},
            defaultTime: '',
            rows: 3,
            showPeriod: true, // use 12-hour format
            periodSeparator: '',
            showLeadingZero: false,
            showMinutesLeadingZero: false,
            amPmText: ['am', 'pm'],
            showCloseButton: true,
            showDeselectButton: true,
            deselectButtonText: "Clear",
            onHourShow: gadgets.util.makeClosure(this, this.handleTimepickerHourShow),
            onMinuteShow: gadgets.util.makeClosure(this, this.handleTimepickerMinuteShow),
            onSelect: gadgets.util.makeClosure(this, this.handleTimepickerSelect)
        });
        $("#timepicker-trigger").button();

        $("#search-button").button().click(function() {
            thisObj.getAvailability(); // need a function here to make a parameterless call to getAvailability
        });

        $("#people-button").button().click(gadgets.util.makeClosure(this, this.handlePeopleButtonClick));
        $("#book-button").button().click(gadgets.util.makeClosure(this, this.bookMeeting)).attr('disabled', 'disabled');
        $("#next-link").click(gadgets.util.makeClosure(this, this.nextAvailability));
        $("#prev-link").click(gadgets.util.makeClosure(this, this.prevAvailability));
    },

    updatePeopleButton: function() {
        if (this.reqPeople.length == 0) {
            $("#people-button").button( "option", "label", "people...");
        }
        else {
            $("#people-button").button( "option", "label", this.formatPeopleLabel());
        }
    },

    handleTimepickerHourShow: function(hour) {
        if (this.reqStartDate == null) {
            // a future start date has not been selected, so we need to restrict time to later than now
            var now = new Date();
            if (hour < now.getHours()) {
                return false;
            }
            else if (hour == now.getHours() && now.getMinutes() > 30) {
                return false;
            }
        }
        return true;
    },

    handleTimepickerMinuteShow: function(hour, minute) {
        if (this.reqStartDate == null) {
            // a future start date has not been selected, so we need to restrict time to later than now
            var now = new Date();
            if (hour == now.getHours() && minute <= now.getMinutes()) {
                return false;
            }
        }
        return true;
    },

    handleTimepickerSelect: function(time, inst) {
        var buttonText;
        if (inst.hours >= 0) {
            // user clicked on hours or minutes, set the request time and button text
            this.reqStartHour = inst.hours;
            this.reqStartMinute = (inst.minutes >= 0) ? inst.minutes : 0;
            var d = new Date();
            d.setHours(this.reqStartHour, this.reqStartMinute);
            buttonText = this.formatTimeString(d);
        }
        else if (inst.hours == -1 && inst.minutes == -1) {
            // clear start time
            this.reqStartHour = null;
            this.reqStartMinute = null;
            buttonText = "time...";
        }
        else {
            console.log("ignoring click on minutes");
            return;
        }
        $("#timepicker-trigger").button( "option", "label", buttonText);
        this.clearResults();
    },

    handleDatepickerSelect: function(datetimeText, inst) {
        this.reqStartDate = new Date(datetimeText);
        var today = new Date();
        var buttonText;
        if (this.isSameDay(today, this.reqStartDate)) {
            this.reqStartDate = null;
            buttonText = "Today";
        }
        else {
            buttonText = this.formatDateLabel(this.reqStartDate);
        }

        $("button.ui-datepicker-trigger").button( "option", "label", buttonText);
        this.clearResults();
    },

    formatDateLabel: function(d) {
        var today = new Date();
        if ((d.getTime() - today.getTime()) < 1000*60*60*24*6) {
            // date is within a week -> show weekday name
            return $.datepicker.formatDate("D", d);  // Tue
        }
        return $.datepicker.formatDate("M d", d);   // Mar 6
    },

    formatPeopleLabel: function() {
        if (this.reqPeople.length == 1) {
            return "1 person";
        }
        return this.reqPeople.length + " people";
    },

    handlePeopleButtonClick: function() {
        var thisObj = this;
        this.peopleListChanged = false;
        this.renderPeopleList();
        $("#people-dialog").dialog({
            modal: true,
            height: 250,
            buttons: {
                Add: function() {
                    thisObj.addPeople(gadgets.util.makeClosure(thisObj, thisObj.renderPeopleList));
                },
                Done: function() {
                    $(this).dialog("close");
                }
            },
            open: function(event, ui) {
                if (thisObj.reqPeople.length == 0) {
                    // No people have been selected yet, show the people picker right away
                    thisObj.addPeople(gadgets.util.makeClosure(thisObj, thisObj.renderPeopleList));
                }
            },
            close: function(event, ui) {
                thisObj.updatePeopleButton();
                if (thisObj.peopleListChanged) {
                    thisObj.clearResults();
                }
            }
        })

    },

    renderPeopleList: function() {
        $("#people-list").empty();
        var appObj = this;

        $.each(this.reqPeople, function(index, user) {
            var removeIcon = $("<a>").addClass("remove").click( function() {
                appObj.reqPeople.splice(index,1);
                appObj.peopleListChanged = true;
                $(this).parent().remove();
            })

            $("<li>").append(user.name).append(removeIcon).appendTo($("#people-list"));
        });

    },

    addPeople: function(callback) {
        var appObj = this;
        osapi.jive.core.users.requestPicker({
            multiple: true,
            success: function(response) {
                var users = [];
                if (response.data instanceof osapi.jive.core.User) {
                    users.push(response.data);
                }
                else if (response.data instanceof Array) {
                    users = response.data;
                }

                // response.data will be an array of osapi.jive.core.User objects
                $.each(users, function(n, user) {
                    if (!appObj.userArrayHasEmail(appObj.reqPeople, user.email)) {
                        appObj.reqPeople.push(user);
                        appObj.peopleListChanged = true;
                    }
                });

                if (callback) {
                    callback();
                }
            },
            error: function(error) {
                // handle error, retry, console.log(error), etc.
                console.log(error);
            }
        });
    },

    userArrayHasEmail: function(users, email) {
        var found = false;
        $.each(users, function(n, user) {
            if (user.email == email) {
                found = true;
                return false; // stop $.each loop
            }
        });
        return found;
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
                //thisObj.appdata = response[thisObj.currentJiveUser.id];

                // response will contain an object property keyed by current user's ID
                // which we dont have and dont want to query just for this purpose, so
                // we'll just grab the first non-function property
                for (var prop in response) {
                    if (response.hasOwnProperty(prop) && typeof(prop) !== 'function') {
                        thisObj.appdata = response[prop];
                    }
                }
            }

            // continue execution even in the case of errors since appdata is not critical
            callbackFn();
        });
    },

    // load available room locations from server
    loadLocations: function(callback) {
        var options = {
            alias: "roomfinder",
            headers: {"Accept": ["application/json"]},
            href: "/locations",
            refreshInterval: 3600 // cache 1hr
        };

        var handler = gadgets.util.makeClosure(this, this.handleLocationResponse, callback);
        osapi.jive.connects.get(options).execute(handler);
    },

    clearResults: function(showSearchMessage) {
        $("#results").hide();

        // empty all response data
        this.availabilityIndex = -1;
        this.availabilityResponse = [];

        if ($("#location-controls input:checked").length > 0) {
            $("#messages").hide();
            $("#search-button").show();
            if (showSearchMessage) {
                $("#search-message").show();
            }
            else {
                $("#search-message").hide();
            }
        }
        else {
            // no locations are selected, show a message to help with that
            $("#search-button").hide();
            this.showMessage("Please select a location");
        }
    },

    currentAvailability: function() {
        if (this.availabilityIndex < 0) {
            return null;
        }
        return this.availabilityResponse[this.availabilityIndex];
    },

    /**
     * Find prev available meeting time without changing criteria
     */
    prevAvailability: function() {
        if (this.availabilityIndex > 0) {
            this.availabilityIndex--;
            this.showResults();
        }
    },

    /**
     * Find next available meeting time without changing criteria
     */
    nextAvailability: function() {
        if (this.availabilityIndex < this.availabilityResponse.length-1) {
            // there is a previously loaded availability following the current one, so just move to it
            this.availabilityIndex++;
            this.showResults();
        }
        else {
            // figure out new start time by moving end time forward by 30mins regardless of
            // meeting length and subtracting desired meeting length
            var newEnd = new Date(this.currentAvailability().endDate.getTime() + 1000*60*30);
            if (newEnd.getHours() == 0 && newEnd.getMinutes() > 0) {
                // must have rolled into next day.. dont allow that
                return;
            }
            var newStart = new Date(newEnd.getTime() - 1000*60*this.reqLength);

            // todo when searching for people availability, and next brings up a
            // slot on the next day, the following next click does not work

            this.getAvailability(newStart);
        }
    },

    // query server for room availability using filters saved in properties
    getAvailability: function(startDate) {
        $("#search-button").hide();
        $("#search-message").hide();
        $("#messages").hide();
        $("#results").hide();

        $("img.activity-indicator").show();

        this.reqLocation = $("#location-controls input:checked").map(function() {
            return $(this).prop("id");
        }).get();
        this.reqLength = $("#length-select").val();

        // Save latest selected locations as defaults for this user
        osapi.appdata.update({
            data: {defaultLocations: this.reqLocation}
        }).execute(function(response) {
            if (response.error) {
                console.log(response.error.message + " (error code:" + response.error.code + ")");
            }
        });

        var options = {
            alias: "roomfinder",
            headers: {"Accept": ["application/json"]},
            href: "/room-finder",
            params: {"location": this.reqLocation, "length": [this.reqLength]}
        };

        if (this.reqPeople.length > 0) {
            options.params.person = $.map(this.reqPeople, function(user) {
                return user.email;
            })
        }

        if (this.reqStartDate || this.reqStartHour || startDate) {
            if (!startDate) {
                // combine the selected start date and time, defaulting to today if no start date is selected
                // and 8am if no time is selected
                startDate = (this.reqStartDate == null) ? new Date() : this.reqStartDate;
                var startHour = (this.reqStartHour == null) ? 8 : this.reqStartHour;
                var startMinute = (this.reqStartMinute == null) ? 0 : this.reqStartMinute;
                startDate.setHours(startHour, startMinute, 0, 0);
            }
            options.params.start = [startDate.getTime()];
            console.log("Requesting availability starting " + startDate);
        }

        // define a function to handle server response
        var callback = gadgets.util.makeClosure(this, this.handleAvailabilityResponse);
        osapi.jive.connects.get(options).execute(callback);
    },

    // handle server response to a room availability request
    handleAvailabilityResponse: function(response) {
        var thisObj = this;
        if (response.error) {
            // define a callback function for retry operation if need to re-enter credentials
            //var retryFunc = gadgets.util.makeClosure(this, this.getAvailability);
            this.handleJiveConnectsError(response, function() {
                thisObj.getAvailability();
            });
        }
        else if (response.content == undefined) {
            // The response is not what the API defines, must be a server error
            console.error(response);
            this.showError("Sorry, an error occurred during search. This is most likely due to a " +
                           "known Apps authentication timeout issue. Please try to reload your browser.");
        }
        else {
            // availability is queried only as an initial search when response array is empty
            // or when user clicks next to find next availability, so we can just append to the array here
            if (response.content.locations) {
                this.availabilityResponse.push(response.content);
                this.availabilityIndex++;

                var avail = this.currentAvailability();
                avail.startDate = new Date(avail.start);
                avail.endDate = new Date(avail.end);

                // create a timer to clear data before meeting start time passes, do this only
                // for the first meeting time slot, and not following ones
                if (this.availabilityIndex == 0) {
                    if (this.resetTimer != null) {
                        clearTimeout(this.resetTimer);
                    }
                    var now = new Date();
                    var delayMsec = avail.start - now.getTime();
                    if (delayMsec < 1000*60*60*24) { // if start is more than 24hrs out, assume browser wont be up that long
                        this.resetTimer = setTimeout(gadgets.util.makeClosure(this, this.clearResults, true), delayMsec);
                    }
                }
            }
            else {
                this.availabilityResponse.push(null);
                this.availabilityIndex++;
            }
            this.showResults();
        }
    },

    // handle server response to a location metadata request
    handleLocationResponse: function(callback, response) {
        if (response.error) {
            // define a callback function for retry operation if need to re-enter credentials
            var retryFunc = gadgets.util.makeClosure(this, this.loadLocations, callback);
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
            this.showLocations(callback);
        }
    },

    // render location buttons based on server response
    showLocations: function(callback) {
        if (this.locations.length == 0) {
            this.showError("No locations configured on server.");
            return;
        }

        // create dom elements and a jquery button for each location
        var appObj = this;
        $.each(this.locations, function(index, loc) {
            var label = $("<label>", {"for": loc.name}).addClass("location").text(loc.label);
            var check = $("<input>", {type: "checkbox", id: loc.name}).click(
                gadgets.util.makeClosure(appObj, appObj.clearResults, false));

            $("#location-controls").append(check).append(label);

            // automatically select previously selected location
            if (appObj.appdata && appObj.appdata.defaultLocations) {
                if (appObj.appdata.defaultLocations.indexOf(loc.name) > -1) {
                    check.prop('checked', true);
                }
            }
        });
        if ($("#location-controls input:checked").length == 0) {
            $("#portland").prop('checked', true); // initial default
        }
        $("#location-controls input").button();
        $("#controls").show();

        if (callback) {
            callback();
        }
    },

    showResults: function() {
        $("img.activity-indicator").hide();
        $("#locations").empty();
        var thisObj = this;

        if (this.currentAvailability() == null) {
            this.showMessage("Sorry, no rooms are available.");
            return;
        }

        // Create a div for each location with available rooms
        $.each(this.currentAvailability().locations, function(n, loc) {
            var locdiv = $("<div>").addClass("location");
            var locationName = thisObj.getLocationDisplayName(loc.location);
            $("<div>").addClass("locname").html(locationName).appendTo(locdiv);
            $("#locations").append(locdiv);
            var floorSections = [];

            $.each(loc.rooms, function(m, room) {
                var roomdiv = $("<div>").addClass("room").click( function() {
                    $(this).toggleClass("highlight");
                    room.selected = !room.selected ? true : false;
                    thisObj.updateBookMessage();
                });

                if (room.selected) {
                    roomdiv.addClass("highlight");
                }

                var roomname = $("<span>").addClass("roomname").html(room.name);
                roomdiv.append(roomname);

                // find a roomlist div for this floor and create one if not found
                var roomlist;
                for (i=0; i<floorSections.length; i++) {
                    if (floorSections[i].floor == room.floor) {
                        roomlist = floorSections[i].roomlist;
                        break;
                    }
                }
                if (!roomlist) { // does not exist yet, create new
                    var floordiv = $("<div>").addClass("floor");
                    var icon = $("<span>").addClass("indicator");
                    var floorname = $("<div>").addClass("floorname expanded").append(icon).append("Floor " + room.floor);

                    // Show/hide room list when floor header is clicked
                    floorname.click( function() {
                        $(this).toggleClass("expanded");
                        $(this).next().slideToggle("fast");
                        return false;
                    });

                    roomlist = $("<div>").addClass("roomlist");
                    floordiv.append(floorname).append(roomlist);
                    locdiv.append(floordiv);
                    floorSections.push({floor: room.floor, roomlist:roomlist});
                }
                roomlist.append(roomdiv);
            });
        });

        // moving to previous only makes sense when not on the first cached availability data
        $("#prev-link").toggle(this.availabilityIndex > 0);

        this.updateBookMessage();
        $("#results").show();
        gadgets.window.adjustHeight();
    },

    updateBookMessage: function() {
        var roomnames = [];
        $.each( this.currentAvailability().locations, function(n, loc) {
            $.each( loc.rooms, function(m, room) {
                if (room.selected) {
                    roomnames.push(room.name);
                }
            });
        });

        var startTime = this.formatTimeString(this.currentAvailability().startDate);
        var endTime = this.formatTimeString(this.currentAvailability().endDate);
        var meetingDate = "";
        if (!this.isSameDay(new Date(), this.currentAvailability().startDate)) {
            // meeting starting tomorrow or later
            meetingDate = this.formatDateLabel(this.currentAvailability().startDate) + " ";
        }
        $("#book-time").html(meetingDate + startTime + " - " + endTime);

        if (roomnames.length == 0) {
            $("#book-rooms").addClass("disabled").html("Select rooms to book");
            $("#subject-field").hide();
            $("#book-button").attr('disabled', 'disabled');
            return;
        }

        // format the elements for room list message
        var roomlist = this.formatList(roomnames);

        var peopleList = "";
        if (this.reqPeople.length > 0) {
            peopleList = " with " + this.formatPeopleLabel();
        }

        $("#book-rooms").removeClass("disabled").html(roomlist + " " + peopleList);
        $("#subject-field").show();
        $("#book-button").removeAttr('disabled');
    },

    /**
     * Return a string where given array items are listed comma separated
     * and the last two are separated with 'and'
     * @param arr
     * @return {String}
     */
    formatList: function(arr) {
        var last = arr.pop();
        var comma_list = "";
        if (arr.length > 0) {
            comma_list = arr.join(", ") + " and ";
        }
        return comma_list + last;
    },

    isSameDay: function(a, b) {
        return a.getFullYear() == b.getFullYear() &&
            a.getMonth() == b.getMonth() &&
            a.getDate() == b.getDate();
    },

    // send a request to server to book a room
    bookMeeting: function() {
        $("#results").hide();
        $("img.activity-indicator").show();

        var thisObj = this;
        var start = this.currentAvailability().startDate;
        var end = this.currentAvailability().endDate;

        var subject = $("#meeting-subject-input").val();
        var options = {
            alias: "roomfinder",
            href: "/room-finder",
            params: {"action": ["book"], "start": [start.getTime()], "end": [end.getTime()], "subject": subject, "room": []}
        };

        // Add required users to booking request
        if (this.reqPeople.length > 0) {
            options.params.person = $.map(this.reqPeople, function(user) {
                return user.email;
            })
        }

        // Then add selected rooms
        this.selectedRooms = [];
        $.each( this.currentAvailability().locations, function(n, loc) {
            $.each( loc.rooms, function(m, room) {
                if (room.selected) {
                    thisObj.selectedRooms.push(room);
                    options.params.room.push(room.email);
                }
            });
        });

        var callback = gadgets.util.makeClosure(this, this.handleBookResponse, start, end);
        osapi.jive.connects.post(options).execute(callback);
    },

    // handle server response from booking request
    handleBookResponse: function(start, end, response) {
        $("img.activity-indicator").hide();
        if (response.error) {
            if (response.error.code == 409) {
                // Room or participant is no longer available,
                this.showError("Sorry, room availability has just changed. Please click Search to try again.");
                $("#search-button").show();
            }
            else {
                // define a callback function for retry operation if need to re-enter credentials
                var retryFunc = gadgets.util.makeClosure(this, this.handleBookResponse, start, end);
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
            var startDisplay = this.formatTimeString(start);
            var endDisplay = this.formatTimeString(end);

            var roomNames = $.map(this.selectedRooms, function(room) {
                return room.name;
            })
            var roomList = this.formatList(roomNames);
            var str = roomList + " booked from " + startDisplay + " to " + endDisplay + "!";

            this.showBookedMessage(str);
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

    showError: function(msg) {
        $("img.activity-indicator").hide();
        $("#messages").html(msg).removeClass("booked").addClass("error").show();
    },

    showMessage: function(msg) {
        $("img.activity-indicator").hide();
        $("#messages").html(msg).removeClass("error booked").show();
    },

    showBookedMessage: function(msg) {
        $("img.activity-indicator").hide();
        $("#messages").html(msg).removeClass("error").addClass("booked").show();
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
