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

var vidyo = {
    serviceAlias: "vidyo",
    currentView: null,
    contextData: null,
    roomAccounts: [], // vidyo accounts used in conference room computers
    users: [], // users added with search
    contextAuthor: null, // author of current content
    contextUsers: [],    // users participating in content
    frequentUsers: [],   // frequently called
    currentUser: null,
    currentUserOnline: false,
    callStateHandlingTimeout: null, // timeout id for pending step in handling a call
    statusPollTimeout: null,        // timeout id for pending call to poll user vidyo status
    appIsCalling: false, // flag to indicate we're calling and waiting for people to join
    appData: {},
    pageUnloading: false, // true after beforeunload event, and used to ignore errors during unload

    init: function() {
        this.currentView = gadgets.views.getCurrentView().getName();
        var appObj = this;

        $("#user-search-input").autocomplete({
            source: gadgets.util.makeClosure(this, this.handleAutoCompleteSource),
            select: gadgets.util.makeClosure(this, this.handleAutoCompleteSelect),
            delay: 400  // ms to wait after last keystroke until querying for results
        }).data("ui-autocomplete")._renderItem = gadgets.util.makeClosure(this, this.customRenderItem);

        $("#call-button").click(gadgets.util.makeClosure(this, this.handleCall));
        $("#user-list-link").click(gadgets.util.makeClosure(this, this.handleUserPicker));
        $("#reload-button").click(gadgets.util.makeClosure(this, this.handleReload));

        this.loadRoomAccounts();

        this.loadCurrentUser()
        .then(function() {
            return appObj.loadAppData();
        })
        .then(function() {
            return appObj.loadFrequentlyCalledUsers();
        })
        .then(function() {
            appObj.checkCurrentUserStatus();

            if (appObj.currentView == "embedded.call") {
                // define callbacks to save the content context where this action was invoked from
                gadgets.actions.updateAction({
                    id: "com.jivesoftware.it.videoCallFromDocument",
                    callback: gadgets.util.makeClosure(appObj, appObj.handleContext)
                });
                gadgets.actions.updateAction({
                    id: "com.jivesoftware.it.videoCallFromDiscussion",
                    callback: gadgets.util.makeClosure(appObj, appObj.handleContext)
                });
                gadgets.actions.updateAction({
                    id: "com.jivesoftware.it.videoCallFromQuestion",
                    callback: gadgets.util.makeClosure(appObj, appObj.handleContext)
                });
                gadgets.actions.updateAction({
                    id: "com.jivesoftware.it.videoCallFromPost",
                    callback: gadgets.util.makeClosure(appObj, appObj.handleContext)
                });
            }
            else { // canvas view
                appObj.pollStatus();
                gadgets.window.adjustHeight();
            }
        });

        // Cancel all pending timer based polling functions when navigating away
        // because they can fail and display an error message just when the page changes
        $(window).bind('beforeunload', function() {
            appObj.pageUnloading = true;
            if (appObj.statusPollTimeout) {
                clearTimeout(appObj.statusPollTimeout);
            }
            if (appObj.callStateHandlingTimeout) {
                clearTimeout(appObj.callStateHandlingTimeout);
            }
        });
    },

    /**
     * Overrides the JQuery autocomplete result list item rendering to add avatar.
     */
    customRenderItem: function(ul, item) {
        var a = $("<a>");
        a.append($("<img>", {src: item.thumbnailUrl, width: "24", height: "24"}));
        a.append(item.label);

        return $( "<li>" )
            .addClass( "ui-menu-item")
            .data( "item.autocomplete", item )
            .append( a )
            .appendTo( ul );
    },

    handleUserPicker: function() {
        var appObj = this;
        osapi.jive.corev3.people.requestPicker({
            multiple: true,
            success: function(data) {
                if (data.list) { // this is the result when many people are selected
                    $.each(data.list, function(index, person) {
                        osapi.jive.corev3.people.get({uri: person.resources.self.ref}).execute(function(resp) {
                            var u = appObj.userFromJive(resp);
                            u.selected = true;
                            appObj.addSearchUser(u);
                        });
                    });
                }
                else {
                    var u = appObj.userFromJive(data);
                    u.selected = true;
                    appObj.addSearchUser(u);
                }
            }
        });
    },

    userFromJive: function(jivePerson) {
        return {
            name: jivePerson.displayName,
            email: this.getUserPrimaryEmail(jivePerson),
            thumbnailUrl: jivePerson.thumbnailUrl,
            selected: false,
            vidyoStatus: ""
        };
    },

    resetCallControls: function() {
        $("#call-button").val("Call");
        $("#call-button").removeAttr("disabled");
    },

    handleReload: function() {
        $("#started-view").hide();
        $("#info").hide();
        $("#container").show();

        this.resetCallControls();
        this.checkCurrentUserStatus();
        this.pollStatus();
    },

    mapSelectedToParticipants: function(arr) {
        return $.map(arr, function(obj) {
            return obj.selected ? {email:obj.email} : null;
        });
    },

    /**
     *
     */
    handleCall: function() {
        // - get participants (assume user has selected them and checked their status)
        // - call the online participants
        // - start checking the status of participants, and rendering their status
        // - when at least one participant is in conference, call the current user
        // - if no-one answers, show a message to user

        var options = {
            alias: "vidyo",
            href: "/conferences",
            headers: {'Content-Type':['application/json']},
            body: {id:"myroom", participants:[]}};

        var emails = this.mapSelectedToParticipants(this.users);
        emails = emails.concat(this.mapSelectedToParticipants(this.contextUsers));
        emails = emails.concat(this.mapSelectedToParticipants(this.frequentUsers));
        if (this.contextAuthor && this.contextAuthor.selected) {
            emails.push({email:this.contextAuthor.email});
        }

        options.body.participants = [];
        $.each(emails, function(i, e) {
            // remove dups from emails array
            if ($.inArray(e, options.body.participants) === -1) options.body.participants.push(e);
        });

        $("#info").hide();
        $("#call-button").val("Calling...");
        $("#call-button").attr("disabled", "disabled");
        gadgets.window.adjustHeight();

        var appObj = this;
        this.jiveConnects("post", options, function(response) {
            appObj.appIsCalling = true;
            // Reset polltimeout to start polling once a second
            if (appObj.statusPollTimeout) {
                clearTimeout(appObj.statusPollTimeout);
                appObj.pollStatus();
            }

            // check for first participant and then call logged in user
            appObj.callStateHandlingTimeout = setTimeout(
                gadgets.util.makeClosure(appObj, appObj.waitForParticipantAndInviteCurrentUser), 4000);
        });

        // update frequently called users in app data
        this.updateCalledUsers(emails);
    },

    loadCurrentUser: function() {
        var deferred = Q.defer();
        if (this.currentUser) {
            deferred.resolve();
        }
        else {
            var appObj = this;
            osapi.jive.corev3.people.getViewer().execute(function(resp) {
                if (resp.error) {
                    deferred.reject(resp.error);
                }
                else {
                    appObj.currentUser = resp;
                    deferred.resolve();
                }
            });
        }
        return deferred.promise;
    },

    loadRoomAccounts: function() {
        var options = {
            alias: "vidyo",
            href: "/users",
            refreshInterval: 3600,  // 1hr
            params: {type: "room"}
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            appObj.roomAccounts = response.content;
        });
    },

    /**
     * This state function will check the vidyo status of each selected participant
     * and once at least one person has joined the call, it will invite current user.
     */
    waitForParticipantAndInviteCurrentUser: function() {
        // Get status info from all selected users
        var someoneJoined = false;
        var someoneRinging = false;
        var checkStatusFn = function(n, obj) {
            if (obj) {
                if (obj.selected && obj.vidyoStatus == "Joined") {
                    someoneJoined = true;
                }
                if (obj.selected && (obj.vidyoStatus == "Ringing" || obj.vidyoStatus == "RingAccepted")) {
                    someoneRinging = true;
                }
            }
        };
        $.each(this.users, checkStatusFn);
        $.each(this.contextUsers, checkStatusFn);
        $.each(this.frequentUsers, checkStatusFn);
        checkStatusFn(0, this.contextAuthor);

        // take action depending on status
        if (someoneJoined) {
            // call current Jive user
            var options = {
                alias: "vidyo",
                href: "/conferences",
                headers: {'Content-Type':['application/json']},
                body: {id:"myroom", participants: [{email: this.getUserPrimaryEmail(this.currentUser)}]}
            };
            var appObj = this;
            this.jiveConnects("post", options, function() {
                // success
                appObj.showInfo("Calling you.. Please answer the Vidyo prompt to join call.");
                appObj.callStateHandlingTimeout =
                    setTimeout(gadgets.util.makeClosure(appObj, appObj.waitForCurrentUserToJoin), 4000);
            }, function(errorResponse) {
                // error handler
                if (errorResponse.content && errorResponse.content.code == 2) {
                    // this error code means current user is offline -> reset call button and start checking for status
                    $("#call-button").val("Call");
                    appObj.checkCurrentUserStatus();
                }
                else {
                    console.error(errorResponse);
                    appObj.showFatal(errorResponse.error.message + " (error code:" + errorResponse.error.code + ")");
                }
                appObj.appIsCalling = false;
            });
            return;
        }
        else if (!someoneRinging) {
            // nobody joined and not ringing either anymore.. assume no answer
            $("#call-button").val("Call");
            $("#call-button").removeAttr("disabled");
            this.showWarning("No answer, please try again.");
            this.appIsCalling = false;
            return;
        }

        // no-one here yet.. check again in a bit
        this.callStateHandlingTimeout = setTimeout(
            gadgets.util.makeClosure(this, this.waitForParticipantAndInviteCurrentUser), 1000);
    },

    checkCurrentUserStatus: function() {
        var options = {
            alias: "vidyo",
            href: "/users",
            params: {email: this.getUserPrimaryEmail(this.currentUser)}
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            var status = response.content[0].status;
            if (status == "Offline") {
                appObj.currentUserOnline = false;
                appObj.showError("Please login to Vidyo client by <a href='https://vportal.jiveland.com' target='_blank'>clicking here</a>");
            }
            else if (status == "Busy") {
                appObj.currentUserOnline = false;
                appObj.showError("Please close the current Vidyo call you are on.");
            }
            else {
                appObj.currentUserOnline = true;
                $("#info").hide();
            }

            appObj.updateCallButtonState();

            if (!appObj.currentUserOnline) {
                appObj.callStateHandlingTimeout = setTimeout(gadgets.util.makeClosure(appObj, appObj.checkCurrentUserStatus), 1000);
            }
        });
    },

    /**
     * Check current state and enable or disable Call button
     */
    updateCallButtonState: function() {
        var anySelected = false;
        var allUsers = this.users.concat(this.contextUsers, this.frequentUsers);
        if (this.contextAuthor) {
            allUsers.push(this.contextAuthor);
        }
        $.each(allUsers, function(index, user) {
            if (user.selected) {
                anySelected = true;
                return false;
            }
        });

        if (anySelected && this.currentUserOnline) {
            $("#call-button").removeAttr("disabled");
        }
        else {
            $("#call-button").attr("disabled", "disabled");
        }
    },

    /**
     * This state function will check the vidyo status of currently logged in Jive user
     * and when they have joined their own room, it will close the app if in action view,
     * or clear the display, if in canvas view. If user does not answer, it will invite
     * the user again to the conference.
     */
    waitForCurrentUserToJoin: function() {
        var options = {
            alias: "vidyo",
            href: "/users",
            params: {email: this.getUserPrimaryEmail(this.currentUser)}
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            var status = response.content[0].status;

            if (status == "BusyInOwnRoom" || status == "Joined") {
                if (appObj.currentView == "embedded.call") {
                    osapi.jive.core.container.closeApp({message: "Call started", severity: "success"});
                }
                else {
                    // we are in canvas view -> no need to continue displaying status, clear display and stop polling
                    $("#container").hide();
                    $("#started-view").show();
                    clearTimeout(appObj.statusPollTimeout);
                }
                appObj.appIsCalling = false;
                return;
            }
            else if (status != "Ringing" && status != "RingAccepted" && status != "Busy") {
                // Assume user did not answer. Also checking for Busy status since Vidyo
                // reports a Busy status for a short time before going to BusyInOwnRoom/Joined
                appObj.waitForParticipantAndInviteCurrentUser();
                return;
            }
            appObj.callStateHandlingTimeout =
                setTimeout(gadgets.util.makeClosure(appObj, appObj.waitForCurrentUserToJoin), 1000);
        });
    },

    /**
     * Start an infinite polling loop for user status and rendering
     */
    pollStatus: function() {
        var appObj = this;
        this.renderStatus(function() {
            // poll delay 1sec when waiting for people to answer a call, so that response is quick,
            // but 10sec when sitting idle since do not need to respond to user state changes that fast
            var delay = appObj.appIsCalling ? 1000 : 10000;
            appObj.statusPollTimeout = setTimeout(gadgets.util.makeClosure(appObj, appObj.pollStatus), delay);
        });
    },

    mapToEmail: function(arr) {
        return $.map(arr, function(obj) {
            return obj.email;
        });
    },

    mapToName: function(arr) {
        return $.map(arr, function(obj) {
            return obj.name;
        });
    },

    /**
     * Get the Vidyo status of each user in display list, and update the icon
     */
    renderStatus: function(callback) {
        var options = {alias: "vidyo", href: "/users", params: {}};
        var allUsers = this.users.concat(this.contextUsers, this.frequentUsers);
        if (this.contextAuthor) {
            allUsers.push(this.contextAuthor);
        }
        var allEmails = this.mapToEmail(allUsers);
        options.params.email = allEmails;

        var appObj = this;
        if (allEmails.length > 0) {
            this.jiveConnects("get", options, function(response) {
                // save status to model objects, assuming response contains
                // the users in same order as email param
                var notFoundUsers = [];
                $.each(response.content, function(n, vidyoStatus) {
                    appObj.updateUserVidyoStatus(allUsers[n], vidyoStatus.status);
                    if (!allUsers[n].vidyoStatus) {
                        // this happens when can't find vidyo user
                        notFoundUsers.push(allUsers[n]);
                    }
                    else if (allUsers[n].vidyoStatus == "Offline" ||
                             allUsers[n].vidyoStatus == "Busy" ||
                             allUsers[n].vidyoStatus == "BusyInOwnRoom") {
                        // force deselect when user not available
                        allUsers[n].selected = false;
                        appObj.updateCallButtonState();
                    }
                });

                if (notFoundUsers.length > 0) {
                    console.log("Retrying users by name...");

                    options.params = {name: appObj.mapToName(notFoundUsers)};
                    appObj.jiveConnects("get", options, function(response) {
                        $.each(response.content, function(n, vidyoStatus) {
                            appObj.updateUserVidyoStatus(notFoundUsers[n], vidyoStatus.status);
                            if (notFoundUsers[n].vidyoStatus == "Offline" ||
                                notFoundUsers[n].vidyoStatus == "Busy" ||
                                notFoundUsers[n].vidyoStatus == "BusyInOwnRoom" ||
                                !notFoundUsers[n].vidyoStatus) {
                                // force deselect when user not available
                                notFoundUsers[n].selected = false;
                                appObj.updateCallButtonState();
                            }
                        });
                        appObj.renderAllListItems();
                        callback();
                    });
                }
                else {
                    appObj.renderAllListItems();
                    callback();
                }
            });
        }
        else {
            callback();
        }
    },

    renderAllListItems: function() {
        var appObj = this;
        $.each(this.users, function(n, userData) {
            appObj.renderUserListItem($("#user-list li").eq(n), userData);
        });

        $.each(this.contextUsers, function(n, userData) {
            appObj.renderUserListItem($("#context-user-list li").eq(n), userData);
        });

        $.each(this.frequentUsers, function(n, userData) {
            appObj.renderUserListItem($("#frequent-user-list li").eq(n), userData);
        });

        if (this.contextAuthor) {
            this.renderUserListItem($("#author-list li"), appObj.contextAuthor);
        }
    },


    updateUserVidyoStatus: function(user, newStatus) {
        if (user.vidyoStatus != newStatus) {
            // decide if should ignore this transition to Busy, since Vidyo user entity
            // state is not fully in sync with the room participant info, which leads to
            // status going from Online to Busy and then to Joined
            if (newStatus == "Busy") {
                var now = new Date().getTime();
                if (!user.stateChangeTime) {
                    user.stateChangeTime = now; // record initial state change
                }

                if ((now - user.stateChangeTime) < 3000) {
                    // Ignore this Busy state
                    console.log("Ignore transition to busy for " + user.name);
                    return;
                }
            }
            user.stateChangeTime = null;
            user.vidyoStatus = newStatus;
        }
    },

    renderUserListItem: function(item, user) {
        item.removeClass("Online Offline Joined Ringing Busy").addClass(user.vidyoStatus);
        item.find("input").prop("checked", user.selected);
        item.toggleClass("selected", user.selected);
    },

    getUserData: function(email) {
        var data = this.getUserFromArray(email, this.users);
        if (data) {
            return data;
        }
        data = this.getUserFromArray(email, this.contextUsers);
        if (data) {
            return data;
        }
        if (this.contextAuthor && this.contextAuthor.email == email) {
            return this.contextAuthor;
        }
        return this.getUserFromArray(email, this.frequentUsers);
    },

    getUserFromArray: function(email, arr) {
        var data;
        $.each(arr, function(n, obj) {
            if (obj.email == email) {
                data = obj;
                return false; // break the $.each loop
            }
        });
        return data;
    },

    getUserPrimaryEmail: function(user) {
        var primaryEmail = "";
        $.each( user.emails, function(n, email) {
            if (email.primary) {
                primaryEmail = email.value;
                return false;
            }
        });
        return primaryEmail;
    },

    addSearchUser: function(user) {
        this.addUser(user, this.users, $("#user-list ul"));

        // Reset polltimeout to check the status of added user right away
        if (this.statusPollTimeout) {
            clearTimeout(this.statusPollTimeout);
            this.pollStatus();
        }

        gadgets.window.adjustHeight();
    },

    addFrequentUser: function(user) {
        $("#frequent-user-list").show();
        this.addUser(user, this.frequentUsers, $("#frequent-user-list ul"));
    },

    addContextUser: function(user) {
        $("#context-user-list").show();
        this.addUser(user, this.contextUsers, $("#context-user-list ul"));
    },

    addContextAuthor: function(user) {
        $("#author-list").show();
        this.contextAuthor = user;
        this.addUser(user, null, $("#author-list ul"));
        gadgets.window.adjustHeight();
    },

    getUserMessageText: function(status) {
        if (status == "Offline") {
            return "Not logged into Vidyo";
        }

        if (status == "Busy" || status == "BusyInOwnRoom") {
            return "On another call";
        }

        return "Unavailable";
    },

    /**
     * Adds given user to list of users that can be called
     *
     * user = {
     *   name: "",
     *   email: "",
     *   thumbnailUrl: "",
     *   selected: true/false,
     *   vidyoStatus: "",
     * }
     */
    addUser: function(user, modelArray, listElem) {
        if (modelArray) {
            modelArray.unshift(user); // add to beginning of array
        }

        var appObj = this;
        var messageHideTimeout;
        var item = $("<li>").toggleClass("selected", user.selected).click(function() {
            if (user.vidyoStatus == "Online" || user.vidyoStatus == "Joined") {
                // toggle ui elements
                $(this).toggleClass("selected");
                $(this).find("input").prop("checked", $(this).hasClass("selected"));

                // toggle model state
                user.selected = !user.selected;
            }
            else {
                // show a message next to user list item, and auto-hide it after 5secs
                if (messageHideTimeout) {
                    clearTimeout(messageHideTimeout);
                    item.popover('destroy');
                }
                $(this).popover({
                    placement: "right",
                    trigger: "manual",
                    content: appObj.getUserMessageText(user.vidyoStatus)
                });
                $(this).popover('show');
                messageHideTimeout = setTimeout(function() {item.popover('destroy');}, 5000);
            }

            appObj.updateCallButtonState();
        });

        $("<input>", {type: "checkbox"})
            .prop("checked", user.selected)
            .appendTo(item)
            .click(function(event) {
                if (user.vidyoStatus != "Online" && user.vidyoStatus != "Joined") {
                    event.preventDefault(); // can't select unless online or in users room
                }
        });
        $("<img>", {src: user.thumbnailUrl, width: "28", height: "28"}).addClass('avatar').appendTo(item);
        $("<div>").append(user.name).addClass("name").appendTo(item);
        item.prependTo(listElem);

        $("#user-list-container").show();
    },

    handleDiscussion: function() {
        var discussion = this.contextData;
        var appObj = this;

        // collect each participating user, excluding current user, and the number of replies they made for the last 50 replies
        var start = (discussion.replyCount > 50) ? discussion.replyCount - 50 : 0;
        discussion.getReplies({fields: "author", count: 50, startIndex: start}).execute(function(resp) {
            appObj.processCommentsOrReplies(resp.list);
        });

    },

    handleDocument: function() {
        var document = this.contextData;
        var appObj = this;

        // collect each participating user, excluding current user, and the number of comments they made for the last 50
        var start = (document.replyCount > 50) ? document.replyCount - 50 : 0;
        document.getComments({fields: "author", count: 50, startIndex: start}).execute(function(resp) {
            appObj.processCommentsOrReplies(resp.list);
        });
    },

    processCommentsOrReplies: function(items) {
        var appObj = this;
        var participants = [];
        var parentContentAuthorUri = this.contextData.author.resources.self.ref;

        // add all authors and the number of comments they created
        $.each(items, function(n, item) {
            // check to see if this user has already been added to participants array
            var found = false;
            var itemAuthorUri = item.author.resources.self.ref;
            $.each(participants, function(m, user) {
                if (user.uri == itemAuthorUri) {
                    user.count++; // already added, just increment counter
                    found = true;
                }
            });

            // add new user to array, skipping logged in user and also content author
            // since she already appears in author section
            if (!found &&
                appObj.currentUser.resources.self.ref != itemAuthorUri &&
                parentContentAuthorUri != itemAuthorUri) {
                participants.push({uri: itemAuthorUri, count:1});
            }
        });

        // get Jive user objects for top three participants
        participants.sort(function(a,b) {return b.count - a.count});
        var topthree = participants.slice(0,3).reverse(); // first three, largest count last

        var promises = [];
        $.each(topthree, function(i, p) {
            promises.push(appObj.getJivePeople({uri: p.uri}));
        });

        // once all of those return, add the users
        // this guarantees the responses are in order
        return Q.allResolved(promises)
        .then(function(promises) {
            promises.forEach(function(promise) {
                if (promise.isFulfilled()) {
                    var person = promise.valueOf();
                    var u = appObj.userFromJive(person);
                    appObj.addContextUser(u);
                } else {
                    console.error("Failed to load user " + promise.valueOf())
                }
            });

            // start update here because now we've added all users
            appObj.pollStatus();
            gadgets.window.adjustHeight();

        });
    },

    /**
     * Load the content object this app was invoked from, and pre-fill fields
     * based on content. Also show applicable notifications and warnings about
     * content permissions.
     *
     * @param ctx
     */
    handleContext: function(ctx) {
        // see https://brewspace.jiveland.com/docs/DOC-94353 for this workaround
        var contentId = ctx.jive.content.id; //ex: 3031
        var contentType = ctx.jive.content.type;
        var typeId;
        var appObj = this;

        switch (contentType) {
        case "osapi.jive.core.Document":
            typeId = 102;
            break;
        case "osapi.jive.core.Discussion":
            typeId = 1;
            break;
        case "osapi.jive.core.Post":
            typeId = 38;
            break;
        default:
            typeId = 102;
            break;
        }

        var options = {entityDescriptor: typeId + "," + contentId};

        osapi.jive.corev3.contents.get(options).execute( function(response) {
            if (response.error) {
                appObj.showFatal("Error: " + response.error.message + " (" + response.error.code + ")");
            }
            else {
                appObj.contextData = response.list[0];
                // add author and participating users to user list
                osapi.jive.corev3.people.get({uri: appObj.contextData.author.resources.self.ref}).execute(function(resp) {
                    var u = appObj.userFromJive(resp);
                    appObj.addContextAuthor(u);
                    if (typeId == 1) {
                        appObj.handleDiscussion();
                    }
                    else if (typeId == 102 || typeId == 38) {
                        appObj.handleDocument();
                    }
                });
            }
        })
    },

    /**
     * Query for jive users
     * @param request
     * @param response
     */
    handleAutoCompleteSource: function( request, responseFn ) {
        var appObj = this;
        osapi.jive.corev3.people.search({
            nameonly: true,
            search: $.trim(this.escapeSearchTerm(request.term)),
            fields: "displayName,jive.username,thumbnailUrl,emails"
        }).execute(function(resp) {
            if (!resp.error) {
                var listItems = [];
                $.each(resp.list, function(index, person) {
                    var listItem = {
                        value: person.displayName,
                        email: appObj.getUserPrimaryEmail(person),
                        thumbnailUrl: person.thumbnailUrl,
                        username: person.jive.username
                    };
                    listItems.push(listItem);
                });

                // add room accounts
                $.each(appObj.roomAccounts, function(index, room) {
                    if (room.name.toUpperCase().indexOf(request.term.toUpperCase()) > -1) {
                        var listItem = {
                            value: room.name,
                            email: room.email,
                            thumbnailUrl: appObj.getAbsoluteUrl("/images/room-28.png")
                        };
                        listItems.push(listItem);
                    }
                });

                responseFn(listItems);
            }
            else {
                console.error("Error: " + resp.error.message + " (" + resp.error.code + ")");
                responseFn();
            }
        });
    },

    escapeSearchTerm: function(term) {
        // Prepend a backslash to all V3 reserved chars
        var pattern = /([,()\\])/g;
        return term.replace(pattern, "\\$1");
    },

    handleAutoCompleteSelect: function(event, ui) {
        var currentUserEmail = this.getUserPrimaryEmail(this.currentUser);
        if (ui.item.email == currentUserEmail) {
            // user is trying to add self
            this.showInfo("No need to add yourself, you will be called once someone joins.");
        }
        else if (!this.getUserData(ui.item.email)) {
            var user = {
                name: ui.item.value,
                email: ui.item.email,
                thumbnailUrl: ui.item.thumbnailUrl,
                selected: true
            };
            this.addSearchUser(user);
            this.updateCallButtonState();
        }

        $("#user-search-input").val("");
        return false; // prevents selected name from being entered into the input field
    },

    // load app data for current user
    loadAppData: function() {
        var deferred = Q.defer();
        var thisObj = this;
        osapi.appdata.get({escapeType: opensocial.EscapeType.NONE}).execute(function(response) {
            if (response.error) {
                console.error("Error retrieving appdata, " +
                        response.error.message + " (error code:" + response.error.code + ")");
            }
            else {
                // response will contain an object property keyed by current user's ID
                // which we dont have and dont want to query just for this purpose, so
                // we'll just grab the first non-function property
                for (var prop in response) {
                    if (response.hasOwnProperty(prop) && typeof(prop) !== 'function') {
                        thisObj.appData = response[prop];
                        if (thisObj.appData.calledUsers) {
                            // app data value is stored as a string, so convert back to array
                            thisObj.appData.calledUsers = $.parseJSON(thisObj.appData.calledUsers);
                        }
                    }
                }
            }

            // continue execution even in the case of errors since appdata is not critical
            deferred.resolve();
        });
        return deferred.promise;
    },

    updateCalledUsers: function(participants) {
        var appObj = this;
        if (!this.appData.calledUsers) {
            this.appData.calledUsers = [];
        }

        // increase the counter for users and then save to appdata
        $.each(participants, function(index, participant) {
            var found = false;
            $.each(appObj.appData.calledUsers, function(index, obj) {
                if (obj.email == participant.email) {
                    obj.count++;
                    found = true;
                }
            });
            if (!found) {
                appObj.appData.calledUsers.push({email:participant.email, count:1});
            }
        });

        osapi.appdata.update({
            data: this.appData,
            escapeType: opensocial.EscapeType.NONE  // this is needed to save a json object
        }).execute(function(response) {
            if (response.error) {
                console.log(response.error.message + " (error code:" + response.error.code + ")");
            }
        });
    },

    loadFrequentlyCalledUsers: function() {
        if (!this.appData.calledUsers) {
            return;
        }
        this.appData.calledUsers.sort(function(a,b) {return b.count - a.count});
        var topthree = this.appData.calledUsers.slice(0,3).reverse(); // first three, largest count last

        // Start three async calls to load Jive person objects
        var promises = [];
        var appObj = this;
        $.each(topthree, function(index, user) {
            promises.push(appObj.getJivePeople({email: user.email}));
        });

        // once all of those return, add the users
        // this guarantees the responses are in order
        return Q.allResolved(promises)
        .then(function(promises) {
            promises.forEach(function(promise) {
                if (promise.isFulfilled()) {
                    var person = promise.valueOf();
                    var u = appObj.userFromJive(person);
                    appObj.addFrequentUser(u);
                } else {
                    console.error("Failed to load user " + promise.valueOf())
                }
            });

            // this is done after handling context users to make startup display smoother
            //gadgets.window.adjustHeight();
        })
    },

    getJivePeople: function(params) {
        var deferred = Q.defer();
        osapi.jive.corev3.people.get(params).execute(function(resp) {
            if (resp.error) {
                deferred.reject(resp.error);
            }
            else {
                deferred.resolve(resp);
            }
        });
        return deferred.promise;
    },

    /**
     * Make a Jive Connects get request with given options and handle error response, including
     * service reconfiguration in the case of authentication errors.
     *
     * @param options Params to osapi.jive.connects.get()
     * @param responseHandler Function to handle a successful response
     * @param errorCallback Function to handle errors, receives the error response as param
     */
    jiveConnects: function(method, options, responseHandler, errorCallback) {
        var appObj = this;
        var request;
        if (method == "get") {
            request = osapi.jive.connects.get(options);
        }
        else if (method == "post") {
            request = osapi.jive.connects.post(options);
        }
        else if (method == "put") {
            request = osapi.jive.connects.put(options);
        }
        else if (method == "delete") {
            request = osapi.jive.connects.delete(options);
        }
        else {
            console.error("Unrecognized method param: " + method);
            return;
        }

        request.execute(function (response) {
            if (response.error) {
                if (response.error.code == 401) { // authentication failed, prompt for credentials
                    osapi.jive.connects.reconfigure(appObj.serviceAlias, response, function(feedback) {
                        if (!feedback.error) {
                            // call this method again with same params
                            appObj.jiveConnects(method, options, responseHandler, errorCallback);
                        }
                        else {
                            // some error occurred during credential config, not much we can do
                            if (errorCallback) {
                                errorCallback(feedback);
                            }
                            else {
                                console.error(feedback);
                                appObj.showFatal(feedback.error.message + " (error code:" + feedback.error.code + ")");
                            }
                        }
                    });
                }
                else {
                    if (errorCallback) {
                        errorCallback(response);
                    }
                    else {
                        console.error(response);
                        appObj.showFatal(response.error.message + " (error code:" + response.error.code + ")");
                    }
                }
            }
            else if (response.content == undefined) {
                // The response is not what the API defines, must be a server error
                if (errorCallback) {
                    errorCallback(response);
                }
                else {
                    console.error(response);
                    appObj.showFatal("Sorry, an error occurred during search. This is most likely due to a " +
                                   "known Apps authentication timeout issue. Please try to reload your browser.");
                }
            }
            else {
                if (responseHandler) {
                    responseHandler(response);
                }
            }
        });
    },

    showInfo: function(str) {
        $("#info").html(str);
        $("#info").removeClass("warning error").show();
        gadgets.window.adjustHeight();
    },

    showError: function(str) {
        $("#info").html(str);
        $("#info").addClass("error").removeClass("warning").show();
        gadgets.window.adjustHeight();
    },

    showWarning: function(str) {
        $("#info").html(str);
        $("#info").addClass("warning").removeClass("error").show();
        gadgets.window.adjustHeight();
    },

    /**
     * Show unrecoverable error and hide all app functionality
     */
    showFatal: function(str) {
        if (this.pageUnloading) {
            return;
        }
        $("#container").hide();
        $("img.activity-indicator").hide();
        $("#errors").html(str).show();
        gadgets.window.adjustHeight();
    },

    getAbsoluteUrl: function(path) {
        return gadgets.util.getUrlParameters()['url'].replace(/(\/app.xml)|(\/gadget.xml)/, path);
    }
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(vidyo, vidyo.init));
