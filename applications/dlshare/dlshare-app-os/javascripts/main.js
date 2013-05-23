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

var dlshare = {
    serviceAlias: "dlservice",
    recipientLists: [],      // DLs
    contextData: null,
    popoverVisible: false,

    init: function() {
        var currentView = gadgets.views.getCurrentView().getName();

        if (currentView == "embedded.share") {
            $("#embedded-search").autocomplete({
                source: gadgets.util.makeClosure(this, this.handleAutoCompleteSource),
                select: gadgets.util.makeClosure(this, this.handleAutoCompleteSelect),
                delay: 400  // ms to wait after last keystroke until querying for results
            });

            $("#cancel-button").click( function() {osapi.jive.core.container.closeApp();} );
            $("#share-button").click( gadgets.util.makeClosure(this, this.handleShare) );
            $("#preview-button").click( gadgets.util.makeClosure(this, this.handlePreview) );

            // define callbacks to save the content context where this action was invoked from
            gadgets.actions.updateAction({
                id: "com.jivesoftware.it.shareDocumentWithDL",
                callback: gadgets.util.makeClosure(this, this.handleContext)
            });
            gadgets.actions.updateAction({
                id: "com.jivesoftware.it.shareDiscussionWithDL",
                callback: gadgets.util.makeClosure(this, this.handleContext)
            });
            gadgets.actions.updateAction({
                id: "com.jivesoftware.it.shareQuestionWithDL",
                callback: gadgets.util.makeClosure(this, this.handleContext)
            });
            gadgets.actions.updateAction({
                id: "com.jivesoftware.it.sharePostWithDL",
                callback: gadgets.util.makeClosure(this, this.handleContext)
            });

            $("#embedded-search").focus();
            gadgets.window.adjustHeight();
        }
    },

    handlePreview: function() {
        var appObj = this;

        if (this.popoverVisible) {
            // already visible, just remove the popover
            $("#preview-button").popover("destroy");
            this.popoverVisible = false;
        }
        else {
            // disable button to prevent multiple clicks and show an activity indicator
            $("#preview-button").attr('disabled', 'disabled');
            $("#preview-activity").show();

            // load jive users for all recipients and build popover
            this.loadJiveUsers(0, function() {
                var nameArray = [];
                $.each(appObj.recipientLists, function(index, list) {
                    nameArray = nameArray.concat($.map(list.memberJiveUsers, function(u) {return u.name.formatted;}));
                });
                var uniqueNames = appObj.getUniqueElements(nameArray);

                var content = uniqueNames.join("<br>");
                if (uniqueNames.length == 0) {
                    content = "Please select an email distribution list to preview recipients."
                }

                $("#preview-button").popover({
                    placement: "top",
                    trigger: "manual",
                    html: true,
                    content: content
                });

                $("#preview-button").popover('show');
                appObj.popoverVisible = true;

                $("#preview-button").removeAttr('disabled');
                $("#preview-activity").hide();
            });
        }
    },

    /**
     * Load the content object this app was invoked from, and pre-fill fields
     * based on content. Also show applicable notifications and warnings about
     * content permissions.
     *
     * @param ctx
     */
    handleContext: function(ctx) {
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
                appObj.showError("Error loading DL: " + response.error.message + " (" + response.error.code + ")");
            }
            else {
                // save the content object to be able to pull the share URI later
                appObj.contextData = response.list[0];

                // Pre-fill the message
                $("#message-field").val("Hi, check out '" + appObj.contextData.subject + "' in Brewspace.");

                /* todo how to check for blog post permissions
                if (appObj.contextData.type == "post") {
                    osapi.jive.corev3.places.get({uri: appObj.contextData.parent}).execute( function(response) {
                        ...
                    });
                }
                */

                // Create message to user about content permissions
                if (appObj.contextData.visibility == "hidden") {
                    appObj.showInfo("This content is currently private to you. Once you share it, all recipients will be granted access.");
                }
                else if (appObj.contextData.visibility == "people") {
                    appObj.showInfo("This content is currently private to a list of users. Once you share it, all recipients will be granted access.");
                }
                else if (appObj.contextData.visibility == "place") {
                    appObj.showInfo("Please note that access to this content is controlled by place permissions.");
                }
            }
        })
    },

    /**
     * Query for distribution lists
     * @param request
     * @param response
     */
    handleAutoCompleteSource: function( request, responseFn ) {
        // hide the preview popup to make room for list
        $("#preview-button").popover("destroy");
        this.popoverVisible = false;

        var options = {
            alias: "dlservice",
            href: "/distribution-lists",
            params: {"query": request.term}
        };
        this.jiveConnects("get", options, function(response) {
            var listItems = [];
            $.each(response.content, function(index, list) {
                var listItem = {
                    value: list.name,
                    email: list.email,
                    dn: list.dn
                };
                listItems.push(listItem);
            });
            responseFn(listItems);
        }, function() {
            responseFn();
        })

    },

    handleAutoCompleteSelect: function(event, ui) {
        // do not allow adding the same list twice
        var exists = false;
        $.each(this.recipientLists, function(index, list) {
            if (list.dn == ui.item.dn) exists = true;
        })
        if (exists) {
            $("#embedded-search").val("");
            return false;
        }

        var list = {name: ui.item.value, email: ui.item.email, dn: ui.item.dn};
        this.recipientLists.push(list);
        this.renderRecipients();
        $("#embedded-search").val("");
        return false; // prevents selected name from being entered into the input field
    },

    renderRecipients: function() {
        $("#share-list ul").empty();
        var appObj = this;

        $.each(this.recipientLists, function( index, list) {
            var removeIcon = $("<a>").addClass("remove").click( function() {
                appObj.recipientLists.splice(index,1);
                $(this).parent().remove();
                gadgets.window.adjustHeight();
            })

            var count = $("<span>").addClass("member-count");
            if (list.memberEmails) {
                count.append(" (" + list.memberEmails.length + ")");
            }
            else {
                // query server for details on this DL
                var options = {
                    alias: "dlservice",
                    href: "/distribution-lists",
                    params: {"dn": list.dn}
                };
                appObj.jiveConnects("get", options, function(response) {
                    if (response.error) {
                        appObj.showError("Error loading DL: " + response.error.message + " (" + response.error.code + ")");
                    }
                    else {
                        list.memberEmails = response.content[0].memberEmails;
                        count.append(" (" + list.memberEmails.length + ")");
                    }
                });
            }

            $("<li>").append(list.name).append(count).append(removeIcon).appendTo($("#share-list ul"));
        });

        gadgets.window.adjustHeight();
    },

    handleShare: function() {
        var appObj = this;

        // disable button to prevent multiple clicks and show an activity indicator
        // if share is successful the app window is closed so no need to enable button and hide indicator
        $("#share-button").attr('disabled', 'disabled');
        $("#share-activity").show();

        // get jive users matching emails, adjust permissions and then send share
        appObj.loadJiveUsers(0, function() {
            appObj.checkPermissions( function() {
                appObj.createShares();
            });
        });
    },

    checkPermissions: function(callbackFn) {
        var content = this.contextData;
        var updateNeeded = false;
        var appObj = this;

        if (content.visibility == "hidden" || content.visibility == "people") {
            // Only hidden or user specific permissions need to be checked and
            // updated for the share to reach people. If using place permissions,
            // we only warn that share might not be visible to all recipients

            if (content.visibility == "hidden") {
                // must change from hidden to people to be able to share
                content.visibility = "people";
                updateNeeded = true;
            }

            if (!content.users) { // create permitted users array if doesn't exist
                content.users = [];
            }

            // add all recipients to the users permitted to view this content
            $.each(this.recipientLists, function(listIndex, list) {
                $.each(list.memberJiveUsers, function(index, recp) {
                    var addRecp = true;
                    $.each(content.users, function(index, allowed) {
                        if (recp.id == allowed.id) {
                            // this user is already on the list of people allowed to view content
                            addRecp = false;
                            return false;
                        }
                    })
                    if (addRecp) {
                        content.users.push(recp);
                        updateNeeded = true;
                    }
                });
            })

            if (updateNeeded) {
                content.update(content).execute( function(response) {
                    if (response.error) {
                        appObj.showError("Error updating permissions: " + response.error.message + " (" + response.error.code + ")");
                    }
                    else {
                        callbackFn();
                    }
                });
            }
            else {
                callbackFn();
            }
        }
        else {
            callbackFn();
        }
    },

    createShares: function() {
        var appObj = this;

        var share = {
            content: {
                type: "text/html",
                text: $("#message-field").val()
            },
            shared: this.contextData.toURI()
        };

        // create one array of recipient jive user URIs and then remove duplicates
        var jiveUserURIs = [];
        $.each(this.recipientLists, function(index, list) {
            jiveUserURIs = jiveUserURIs.concat(
                $.map(list.memberJiveUsers, function(u) {return u.toURI();})
            );
        });
        share.participants = this.getUniqueElements(jiveUserURIs);

        osapi.jive.corev3.shares.create(share).execute(function(response) {
            if (response.error) {
                appObj.showError("Error creating share: " + response.error.message + " (" + response.error.code + ")");
            }
            else {
                osapi.jive.core.container.closeApp({message: "Share successful", severity: "success"});
            }
        });
    },

    loadJiveUsers: function(index, finalFn) {
        var appObj = this;
        if (index < this.recipientLists.length) {
            var list = this.recipientLists[index];

            if (list.memberJiveUsers) {
                // users have been loaded
                appObj.loadJiveUsers(index+1, finalFn);
            }
            else {
                list.memberJiveUsers = [];
                this.loadJiveUsersForList(list, 0, function() {
                    appObj.loadJiveUsers(index+1, finalFn);
                })
            }
        }
        else {
            finalFn();
        }
    },

    loadJiveUsersForList: function(list, index, finalFn) {
        var appObj = this;

        if (index < list.memberEmails.length) {
            var email = list.memberEmails[index];

            // Start an asynchronous call and once it returns, call this function again recursively
            osapi.jive.corev3.people.get({email: email}).execute(function(response) {
                if (response.error) {
                    if (response.error.code == 404) {
                        // system could not find this user based on email, assume they dont have a jive account
                        // todo ignore these users for now, later on add a warning note to user
                        console.log("Could not find this Jive user: " + email);
                    }
                    else {
                        appObj.showError("Error loading recipient: " + email + ", " + response.error.message + " (" + response.error.code + ")");
                        return;
                    }
                }
                else {
                    list.memberJiveUsers.push(response);
                }

                // add delay to avoid server busy errors
                setTimeout(gadgets.util.makeClosure(appObj, appObj.loadJiveUsersForList, list, index+1, finalFn), 50);
            });
        }
        else {
            // Done iterating over the recipients array, call the final callback function
            finalFn();
        }
    },


    /**
     * Make a Jive Connects get request with given options and handle error response, including
     * service reconfiguration in the case of authentication errors.
     *
     * @param options Params to osapi.jive.connects.get()
     * @param responseHandler Function to handle a successful response
     * @param errorCallback Function called after an error occurred
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
        else {
            console.error("Unrecognized method param: " + method);
            return;
        }

        request.execute(function (response) {
            if (response.error) {
                if (response.error.code == 401) { // authentication failed, prompt for credentials
                    osapi.jive.connects.reconfigure(appObj.serviceAlias, response, function(feedback) {
                        if (!feedback.error) {
                            appObj.jiveConnects(method, options, responseHandler, errorCallback);
                        }
                        else {
                            // some error occurred during credential config, not much we can do
                            console.error(feedback);
                            appObj.showError(feedback.error.message + " (error code:" + feedback.error.code + ")");
                            errorCallback();
                        }
                    });
                }
                else {
                    console.error(response);
                    appObj.showError(response.error.message + " (error code:" + response.error.code + ")");
                    errorCallback();
                }
            }
            else if (response.content == undefined) {
                // The response is not what the API defines, must be a server error
                console.error(response);
                appObj.showError("Sorry, an error occurred during search. This is most likely due to a " +
                               "known Apps authentication timeout issue. Please try to reload your browser.");
                errorCallback();
            }
            else {
                responseHandler(response);
            }
        });
    },

    showInfo: function(str) {
        $("#info span").html(str);
        $("#info").show();
        gadgets.window.adjustHeight();
    },

    /**
     * Show unrecoverable error and hide all app functionality
     */
    showError: function(str) {
        $("#container").hide();
        $("img.activity-indicator").hide();
        $("#errors").html(str).show();
        gadgets.window.adjustHeight();
    },

    /**
     * Return an array with only unique elements from src array
     */
    getUniqueElements: function(src) {
        var unique = [];
        $.each(src, function(index, item) {
            if ($.inArray(item, unique) == -1) {
                unique.push(item);
            }
        });
        return unique;
    }
}

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(dlshare, dlshare.init));
