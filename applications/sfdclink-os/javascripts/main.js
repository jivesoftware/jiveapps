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

var sfdcSearch = {
    serviceAlias: "sfdc",      // jive connects service alias from app.xml
    version: null,             // salesforce versioned service endpoint
    resources: null,           // salesforce resource endpoints
    organizationId: null,      // salesforce organization id for the current user
    userId: null,              // salesforce user id for the current user
    searchResults: null,       // resulting objects and category counts from search
    requestRetries: 0,         // record number of retries of api requests
    options: null,             // search options saved in appdata
    lazyTimers: [],            // array of timers used to control lazy loading of result details
    embeddedObject: null,      // salesforce object loaded for embedded view
    jiveContextObject: null,   // jive content where app artifact is placed
    minimsg: null,             // mini message support
    maxResultObjects: 25,      // upper limit of each object type returned from search
    searchResultCategories: 0, // number of salesforce object type categories found in latest search

    /**
     * Startup function
     */
    init: function() {
        var currentView = gadgets.views.getCurrentView().getName();
        var appObj = this;
        var embeddedViewHandler = null;
        var indicator = null;

        // Set default search options
        this.options = {
            objects: {
                account: true,
                opportunity: true,
                contact: true,
                lead: true
            }
        };

        // Search page init
        if (currentView == "embedded.search") {
            $("#embedded-search").autocomplete({
                source: gadgets.util.makeClosure(this, this.handleAutoCompleteSource),
                select: gadgets.util.makeClosure(this, this.handleAutoCompleteSelect),
                focus: gadgets.util.makeClosure(this, this.handleAutoCompleteFocus),
                delay: 400  // ms to wait after last keystroke until querying for results
            }).data("autocomplete")._renderMenu = gadgets.util.makeClosure(this, this.customRenderMenu);

            $(".expand-header").click(this.handleExpandHeaderClick);

            // When options for search object types are clicked, save options in memory and appdata
            $("input.search-object-type").change( function(event) {
                appObj.updateTypeCheckboxDisabledState();
                appObj.options.objects[this.name] = $(this).is(':checked');
                osapi.appdata.update({
                    data: {options: appObj.options},
                    escapeType: opensocial.EscapeType.NONE  // this is needed to save a json object
                }).execute(function(response) {
                    if (response.error) {
                        console.log(response.error.message + " (error code:" + response.error.code + ")");
                    }
                });
            })

            indicator = this.insertActivityIndicator($("#embedded-search"));
        }

        // these views are used when an embedded artifact is clicked within jive content
        else if (currentView == "embedded.account" ||
                 currentView == "embedded.opportunity" ||
                 currentView == "embedded.contact" ||
                 currentView == "embedded.lead") {
            // this function will load data and render the view
            embeddedViewHandler = gadgets.util.makeClosure(this, this.handleEmbeddedObjectView);

            $("#search-jive-button").click( gadgets.util.makeClosure(this, this.handleContentSearch));
            $("#add-link-note").click( gadgets.util.makeClosure(this, this.handleCreateLink));
            $("#close-button").click( function() {osapi.jive.core.container.closeApp();} );
            this.minimsg = new gadgets.MiniMessage("", document.getElementById("minimessage"));
        }

        // Common init to all pages loads salesforce service metadata and resource endpoints, and after that
        // register a view handler
        this.loadVersions(
                gadgets.util.makeClosure(this, this.loadResources, function() {
                    // register embedded object rendering function, if it was defined in init code above
                    if (embeddedViewHandler) {
                        appObj.setEmbeddedViewHandler(embeddedViewHandler);
                    }

                    appObj.loadRecent();

                    // show search box and auto focus the input field
                    if (currentView == "embedded.search") {
                        indicator.remove();
                        $("#embedded-search").removeAttr('disabled').focus();
                    }
                })
        );

        // load search options from appdata
        osapi.appdata.get({
            escapeType: opensocial.EscapeType.NONE
        }).execute(gadgets.util.makeClosure(this, this.handleAppDataResponse));
    },

    /**
     * Handle click event for header div to show/hide contents
     */
    handleExpandHeaderClick: function() {
        $(this).toggleClass("expanded");
        $(this).next().slideToggle("fast");
        return false;
    },

    /**
     * Handle button click to create a link from Salesforce back to Jive content
     */
    handleCreateLink: function() {
        $("#add-link-note").attr('disabled', 'disabled');

        var title = this.jiveContextObject.subject ? this.jiveContextObject.subject : this.jiveContextObject.contentSummary;
        var note = {
            ParentId: this.embeddedObject.Id,    // sfdc id
            Title: "Jive: " + title,
            Body: this.jiveContextObject.resources.html.ref // jive content url
        };

        var appObj = this;
        this.createObject("Note", note, function(response) {
            // this is invoked after a successfull creation, so only then
            // hide the link and show a linked message
            $("#add-link-note").hide();

            appObj.minimsg.createTimerMessage("A note with a link to this Jive content was created in Salesforce.", 10);
        });
    },

    /**
     * Disable type select checkbox if only one is checked so that
     * use cannot uncheck all of them
     */
    updateTypeCheckboxDisabledState: function() {
        if ($("input.search-object-type:checked").length < 2) {
            $("input.search-object-type:checked").attr("disabled", "disabled");
        }
        else {
            $("input.search-object-type").removeAttr("disabled")
        }
    },

    /**
     * Overrides the JQuery autocomplete list rendering to add category headers, show more link
     * and metadata about each item. Also defines a lazy load element to receive additional
     * details on hover.
     */
    customRenderMenu: function(ul, items) {
        var appObj = this;
        var moreCounter = 0;
        var displayLimit = this.getTypeDisplayLimit();

        $.each(items, function(index, item) {
            if (item.isHeader) {
                var itemElement = $("<li>").addClass("ui-autocomplete-category ui-menu-item");
                itemElement.addClass(item.category).append(item.category).appendTo(ul);
                moreCounter = 0;
            }
            else if (item.isMore) {
                var moreSelector = "li." + item.category + ".list-more";
                var moreIcon = $("<img>").attr("src", appObj.getAbsoluteUrl("/images/triangle-down-blue.png"));
                var moreText = $("<span>").html("show more");
                var moreElement = $("<span>").append(moreText).append(moreIcon).click(function(event) {
                    event.preventDefault();
                    if (moreText.html() == "show more") {
                        moreText.html("show less");
                        moreIcon.attr("src", appObj.getAbsoluteUrl("/images/triangle-up-blue.png"));
                    }
                    else {
                        moreText.html("show more");
                        moreIcon.attr("src", appObj.getAbsoluteUrl("/images/triangle-down-blue.png"));
                    }
                    $(moreSelector).slideToggle(); // show more of this category
                });
                $("<li>").addClass("ui-menu-item more-toggle").append(moreElement).appendTo(ul);
            }
            else {
                var linkElement = $("<a>");
                $("<div>").addClass("custom-item-label").append(item.value).appendTo(linkElement);

                var metadata = appObj.renderItemMetadata(item);
                var lazyload = $("<span>").html("&nbsp;"); // space required for proper rendering
                $("<div>").addClass("custom-item-metadata").append(metadata).append(lazyload).appendTo(linkElement);

                item.lazyload = lazyload; // used to load details on hover

                moreCounter++;
                var itemElement = $("<li>").data("item.autocomplete", item);
                if (moreCounter > displayLimit) {
                    itemElement.addClass(item.category + " list-more").hide();
                }
                else {
                    itemElement.addClass(item.category)
                }
                itemElement.append(linkElement).appendTo(ul);
            }
        });
    },

    /**
     *
     * @param item
     */
    renderItemMetadata: function(item) {
        var metadata = "";
        if (item.category == "contact") {
            if (item.title) {
                metadata = item.title + ", ";
            }
            metadata += this.renderItemLocation(item);
        }
        else if (item.category == "lead") {
            if (item.title) {
                metadata = item.title + ", ";
            }
            if (item.company) {
                metadata += item.company + ", ";
            }
            metadata += this.renderItemLocation(item);
        }
        else if (item.category == "account") {
            if (item.type) {
                metadata = item.type + ", ";
            }
            metadata += this.renderItemLocation(item);
        }
        else if (item.category == "opportunity") {
            if (item.type) {
                metadata = item.type + ", ";
            }
            metadata += this.formatDollarAmount(item.amount);
        }

        return metadata;
    },

    /**
     * Format a string with city and either state or country.
     * Returns an empty string if none of those are defined.
     * @param item
     */
    renderItemLocation: function(item) {
        var country = item.country ? item.country : "";
        var state = item.state ? item.state : country;
        var city = item.city ? item.city : "";
        return city + " " + state;
    },


    /**
     * Search Jive for content based on the current embedded object name, for example
     * the name of a contact or lead. Append results to a list with links to content.
     * Hide search button since this is done in a temporary popup window, and there is
     * no need to repeat the search.
     */
    handleContentSearch: function() {
        var indicator = this.insertActivityIndicator($("#search-jive-button"));
        var name = this.embeddedObject.Name;
        var limit = 50;
        var appObj = this;
        osapi.jive.core.searches.searchContent({query: name, limit: limit, sort: "date"}).execute(function(response) {
            $("#search-results ul").empty();
            indicator.remove();

            if (response.error) {
                appObj.showError(response.error.message + " (error code:" + response.error.code + ")");
            }
            else {
                if (response.data.length == 0) {
                    var msg = $("<span>").addClass("no-content-message").append("No content found.");
                    $("#search-results ul").append($("<li>").append(msg));
                }
                else {
                    if (response.data.length == limit) {
                        $("#limited-message").show();
                    }

                    $.each(response.data, function(i, obj) {
                        var result = $("<li>");
                        var icon = $("<img>", {width:"12", height:"12"}).addClass('result-icon');
                        var link = $("<a>", {href:obj.resources.html.ref, target:"_blank"});
                        var metadata = $("<div>").addClass('metadata');

                        var authorName = obj.author ? obj.author.name : ""; // some skipped objects dont have an author
                        metadata.append($("<span>").addClass("metadata-label").append("by ")).append(authorName);
                        metadata.append($("<span>").addClass("metadata-label").append(", posted ")).append(obj.creationDate.substr(0,10));

                        result.append(icon).append(link).append(metadata);

                        // Using instanceof since obj.type is wrong
                        if (obj instanceof osapi.jive.core.Document) {
                            icon.attr('src', appObj.getAbsoluteUrl("/images/jive-icon-document-sml.png"));
                            link.append(obj.subject);
                        }
                        else if (obj instanceof osapi.jive.core.Discussion) {
                            icon.attr('src', appObj.getAbsoluteUrl("/images/jive-icon-discussion-sml.png"));
                            link.append(obj.subject);
                        }
                        else if (obj instanceof osapi.jive.core.Post) {
                            icon.attr('src', appObj.getAbsoluteUrl("/images/jive-icon-post-sml.png"));
                            link.append(obj.subject);
                        }
                        else if (obj instanceof osapi.jive.core.Update) {
                            icon.attr('src', appObj.getAbsoluteUrl("/images/jive-icon-update-sml.png"));
                            link.append(obj.contentSummary);
                        }
                        else if (obj instanceof osapi.jive.core.Comment) {
                            // todo check icon
                            icon.attr('src', appObj.getAbsoluteUrl("/images/jive-icon-discussion-sml.png"));
                            link.append(obj.contentSummary);
                        }
                        else {
                            console.log("Skipped this search result object:");
                            console.log(obj);
                            return;
                        }

                        $("#search-results ul").append(result);
                    });
                }
                $("#search-jive-button").hide();
            }
        });

    },

    /**
     * App data contains options for search types.
     *
     * @param response
     */
    handleAppDataResponse: function(response) {
        var appObj = this;
        if (response.error) {
            console.error(response.error.message + " (error code:" + response.error.code + ")");
        }
        else {
            // response will contain an object property keyed by current user's ID
            // which we dont have and dont want to query just for this purpose, so
            // we'll just grab the first non-function property
            for (var prop in response) {
                if (response.hasOwnProperty(prop) && typeof(prop) !== 'function') {
                    var data = response[prop];
                    if (data.options) {
                        appObj.options = $.parseJSON(data.options);
                    }
                    break;
                }
            }
        }

        // update checkbox state even if no app data was found, default values were
        // defined in the init function
        $("#account-checkbox").attr('checked', appObj.options.objects.account);
        $("#opportunity-checkbox").attr('checked', appObj.options.objects.opportunity);
        $("#contact-checkbox").attr('checked', appObj.options.objects.contact);
        $("#lead-checkbox").attr('checked', appObj.options.objects.lead);
        this.updateTypeCheckboxDisabledState();
    },

    /**
     * Close app and create an artifact to be entered into editor content.
     * Artifact only contains the item type and id, and data will be loaded
     * again from Salesforce when item is clicked.
     *
     * @param obj
     */
    createArtifact: function(obj) {
        osapi.jive.core.container.closeApp({
            data: {
                display: {
                    type: "text",
                    icon: "images/link-16.png",
                    label: obj.value
                },
                target: {
                    type: "embed",
                    view: "embedded." + obj.category,

                    context: {
                        sfid: obj.sfid,               // ID of the salesforce object
                        orgid: this.organizationId,   // ID of salesforce organization
                        createdby: this.userId,       // ID of user who created this artifact (for future use)
                        type: obj.category,           // category name
                        version: 1                    // artifact version for backward compatibility handling
                    }
                }
            }
        });
    },

    /**
     * Registers the given function to be called with embedded artifact context.
     *
     * @param handler Function that takes Jive data context as parameter and handles view display
     */
    setEmbeddedViewHandler: function(handler) {
        opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function(key) {
            var data = opensocial.data.getDataContext().getDataSet(key);
            handler(data);
        });
    },

    /**
     * Load the salesforce object associated with the view and render data
     */
    handleEmbeddedObjectView: function(context) {
        if (this.organizationId && context.target.context.orgid) {
            if (this.organizationId != context.target.context.orgid) {
                // Artifact was inserted by a user logged into a different salesforce
                // organization than the current user. We would most likely get a 404
                // not found when trying to access this object, so its better to show an error instead.
                this.showMessage("Sorry, this link was created for a different Salesforce organization than what you're currently logged into. Please contact the author to find out which Salesforce login to use.");
                return;
            }
        }

        // Load jive content object to get the full URL, then search Salesforce Notes
        // for a link note for this object
        var request = this.createRequestToLoadJiveContent(context.jive.content);
        var appObj = this;
        if (request != null) {
            request.execute( function(response) {
                if (!response.error) {
                    appObj.jiveContextObject = response.data; // save object to be used when creating note in sfdc
                    appObj.noteExists(context.target.context.sfid, appObj.jiveContextObject.resources.html.ref, function(exists) {
                        if (!exists) {
                            $("#add-link-note").show();
                        }
                    });
                } else {
                    console.log(response.error.message + " (error code:" + response.error.code + ")");
                }
            });
        }

        // Load salesforce object and fill view fields. Context also contains a version field
        // that can be used for backward compatibility in future releases
        this.loadObject(context.target.context.type, context.target.context.sfid, function(object) {
            appObj.embeddedObject = object;

            // populate each element in the page whose id matches an object property
            $('.sobject-field').each(function() {
                if (this.id == 'Email') {
                    // update anchor element to objects email address
                    $(this).attr('href', 'mailto:' + object[this.id]);
                }

                // choose field formatting based on element class
                if ($(this).hasClass('currency-field')) {
                    $(this).html( appObj.formatDollarAmount(object[this.id]) );
                }
                else {
                    $(this).html( object[this.id] );
                }
            });

            // populate object type name field with capitalized first letter
            var typeName = context.target.context.type;
            var capTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
            $("#category-name").html(capTypeName);

            // don't use a specific sfdc host here, to keep things generic
            $("#sfdc-view").attr("href", "https://login.salesforce.com/" + object.Id);

            $("img.activity-load").hide();
            $("#container").show();

            // Load account owner from Salesforce and populate name field
            if (context.target.context.type == "account") {
                appObj.loadObject("User", object.OwnerId, function(user) {
                    $("#account-owner").html(user.Name);
                    // Attempt to find owner from Jive based on email and populate avatar image
                    osapi.jive.core.users.get({emailAddress: user.Email}).execute(function(userResponse) {
                        if (!userResponse.error) {
                            // todo this is a temp workaround to an api bug, remove before market deployment
                            var urlStart = userResponse.data.avatarURL.lastIndexOf("https://");
                            var url = (urlStart < 0) ? userResponse.data.avatarURL : userResponse.data.avatarURL.substr(urlStart);
                            $("#owner-avatar").attr("src", url);
                        }
                    });
                });

                // Load account opportunities and render table
                appObj.loadOpportunities(object.Id, gadgets.util.makeClosure(appObj, appObj.renderAccountOpportunities));
            }
            // Load opportunity owner and account
            else if (context.target.context.type == "opportunity") {
                appObj.loadObject("User", object.OwnerId, function(user) {
                    $("#opportunity-owner").html(user.Name);
                    // Attempt to find owner from Jive based on email and populate avatar image
                    osapi.jive.core.users.get({emailAddress: user.Email}).execute(function(userResponse) {
                        if (!userResponse.error) {
                            // todo this is a temp workaround to an api bug, remove before market deployment
                            var urlStart = userResponse.data.avatarURL.lastIndexOf("https://");
                            var url = (urlStart < 0) ? userResponse.data.avatarURL : userResponse.data.avatarURL.substr(urlStart);
                            $("#owner-avatar").attr("src", url);
                        }
                    });
                });
                appObj.loadObject("Account", object.AccountId, function(account) {
                    $("#opportunity-account").html(account.Name);
                });
            }
            // Load contact's parent account
            else if (context.target.context.type == "contact") {
                appObj.loadObject("Account", object.AccountId, function(account) {
                    $("#parent-account").html(account.Name);
                });
            }
        });

    },

    /**
     * Render table of account opportunities
     */
    renderAccountOpportunities: function(opps) {
        var appObj = this;
        if (opps.length == 0) {
            $("#no-opps-message").show();
        }
        else {
            $.each(opps, function(n, opp) {
                var row = $("<tr>");
                row.append($("<td>").html(opp.Name));
                row.append($("<td>").html(appObj.formatDollarAmount(opp.Amount)));
                row.append($("<td>").html(appObj.formatStage(opp)));
                row.append($("<td>").html(opp.CreatedDate.substr(0,4))); // assume ISO8601
                $("#opportunities tbody").append(row);
            });
            $("#opportunities tr:odd").addClass("odd");
            $("#opportunities").show();

            var baseurl = "https://chart.googleapis.com/chart?";
            var params = appObj.createPiechartDataParams(opps);
            $("#chartdiv img").attr("src", baseurl + "cht=p3&chs=570x70&chds=a" + params);
            $("#chartdiv").show();
        }
    },

    /**
     * Return a Jive request to load a content object depending on its type
     */
    createRequestToLoadJiveContent: function(content) {
        var request = null;
        if (content.type == 'osapi.jive.core.Document') {
            request = osapi.jive.core.documents.get({id: content.id});
        }
        else if (content.type == 'osapi.jive.core.Discussion') {
            request = osapi.jive.core.discussions.get({id: content.id});
        }
        /*
        else if (context.jive.content.type == 'osapi.jive.core.Post') {
            .. how to get post by id?
        }
        */
        else {
            console.log("Unexpected content type: " + content.type);
        }
        return request;
    },

    /**
     * return the chart data and label parameters for google charts url
     */
    createPiechartDataParams: function(opps) {
        var appObj = this;
        // add up the total amount for opportunities in different types
        var dataArray = [];
        if (opps) {
            $.each(opps, function(n, opp) {
                var createNew = true;
                $.each(dataArray, function (i, data) {
                    if (data.type == opp.Type) {
                        data.amount += opp.Amount;
                        createNew = false;
                        return false;
                    }
                });
                if (createNew) {
                    dataArray.push({type:opp.Type, amount:opp.Amount});
                }
            });
        }

        // create parameter strings for values, labels and colors
        var valueParam = "";
        var labelParam = "";
        $.each(dataArray, function(n, data) {
            if (data.amount > 0) {
                if (valueParam != "") { // add delimiters
                    valueParam += ",";
                    labelParam += "|";
                }
                valueParam += data.amount;
                labelParam += data.type + " - " + appObj.formatDollarAmount(data.amount);
            }
        });

        var params = "&chd=t:" + valueParam + "&chl=" + labelParam;
        return params;
    },

    /**
     * Return display label for opportunity stage
     */
    formatStage: function(opp) {
        if (opp.IsClosed && opp.IsWon) {
            return "Won";
        }
        else if (opp.IsClosed && !opp.IsWon) {
            return "Lost";
        }
        else {
            return "Open";
        }
    },

    /**
     * Return a compactly formatted dollar amount
     */
    formatDollarAmount: function(amount) {
        if (amount > 1000000) {
            return accounting.formatMoney(amount/1000000, "$", 1) + "M";
        }
        else if (amount > 1000) {
            return accounting.formatMoney(amount/1000, "$", 0) + "k";
        }
        else {
            return accounting.formatMoney(amount, "$", 0);
        }
    },

    /**
     * Query for salesforce object results
     * @param request
     * @param response
     */
    handleAutoCompleteSource: function( request, response ) {
        // todo Ampersand would cause the sosl query to return a 400 error since Jive does not escape it
        // removing ampersand as a short-term workaround
        var trimmedTerm = $.trim(request.term.replace("&", " "));

        // salesforce search requires at least two chars
        if (trimmedTerm.length < 2) {
            response();
            return;
        }

        $("#recent div.expand-header").removeClass("expanded");
        $("#recent div.expand-header").next().slideUp("fast");

        var appObj = this;
        var indicator = this.insertActivityIndicator($("#embedded-search"));
        $("#messages").hide();

        this.searchObjects(trimmedTerm, function() {
            indicator.remove();
            if (appObj.searchResults) {
                // map search results into an array of data items for list rendering

                if (appObj.searchResults.length == 0) {
                    appObj.showMessage("No results found");
                }

                var displayLimit = appObj.getTypeDisplayLimit();
                var listItems = [];
                $.each(appObj.searchResults, function(index, result) {
                    // add category header
                    listItems.push({value: result.category, category: result.category, isHeader: true});

                    // add selectable items for this category
                    listItems = listItems.concat($.map(result.items, appObj.sObjectToListItem));

                    // add category more/less item
                    if (result.items.length > displayLimit) {
                        listItems.push({value: "show more", category: result.category, isMore: true});
                    }
                });
                response(listItems);
            }
            else {
                response();
            }
        });
    },

    /**
     * Get the upper display limit for each object type results
     */
    getTypeDisplayLimit: function() {
        // decide on individual object result limit based on how many types were found
        // this is needed to keep the display height constant

        if (this.searchResultCategories == 0) {
            return 12; // should never be zero, but make sure we dont get an error
        }
        else if (this.searchResultCategories == 1) {
            return 16;
        }
        else if (this.searchResultCategories == 2) {
            return 7;
        }
        else {
            return Math.floor(12 / this.searchResultCategories);
        }
    },

    /**
     * Handle event for focusing on a search result list item, either by keyboard or mouse.
     * Loads additional details about the item after a 2sec delay, so that just scrolling or
     * quickly hovering over an item does not actually load anything. User needs to keep
     * focus on the item for 2secs for the load to request to be made.
     */
    handleAutoCompleteFocus: function(event, ui) {
        // cancel any pending lazy load items for previously selected item
        if (this.lazyTimers.length > 0) {
            // Clear out pending "loading..." messages from the lazyload elements
            $(".load-message").html("&nbsp;"); // space required for proper rendering
            $.each(this.lazyTimers, function(index, timer) {
                clearTimeout(timer);
            });
            this.lazyTimers = [];
        }

        var appObj = this;
        var selected = ui.item;
        if (!selected) {
            // this is a category header element, so no need to load any details
            return false; // prevent jquery from setting the value of input box
        }

        // depending on selected item type, load details and populate the lazyload element
        // which is a span created in customRenderMenu function
        if (selected.category == "contact") {
            if (selected.accountId) {
                if (selected.accountName) {
                    selected.lazyload.html(", " + selected.accountName);
                }
                else {
                    // lazy load parent account to be able to display account name
                    selected.lazyload.addClass("load-message").html(", loading account...");
                    this.lazyTimers.push( setTimeout(function() {
                        appObj.loadObject("Account", selected.accountId, function(object) {
                            // save name into list item element and render it
                            selected.accountName = object.Name;
                            selected.lazyload.removeClass("load-message").html(", " + selected.accountName);
                        });
                    }, 2000));
                }
            }
        }

        else if (selected.category == "account") {
            if (selected.ownerId) {
                if (selected.ownerName) {
                    selected.lazyload.html(", " + selected.ownerName);
                }
                else {
                    selected.lazyload.addClass("load-message").html(", loading owner...");
                    this.lazyTimers.push( setTimeout(function() {
                        appObj.loadObject("User", selected.ownerId, function(object) {
                            selected.ownerName = object.Name;
                            selected.lazyload.removeClass("load-message").html(", " + object.Name);
                        });
                    }, 2000));
                }
            }
        }

        else if (selected.category == "opportunity") {
            if (selected.ownerId) {
                if (selected.ownerName) {
                    selected.lazyload.html(", " + selected.ownerName + ", " + selected.accountName);
                }
                else {
                    selected.lazyload.addClass("load-message").html(", loading owner and account...");
                    this.lazyTimers.push( setTimeout(function() {
                        appObj.loadObject("User", selected.ownerId, function(object) {
                            selected.ownerName = object.Name; // cache in memory
                            selected.lazyload.html(", " + object.Name);
                            // load further details immediately
                            appObj.loadObject("Account", selected.accountId, function(object) {
                                selected.accountName = object.Name;
                                selected.lazyload.removeClass("load-message").html(", " + selected.ownerName + ", " + selected.accountName);
                            });
                        });
                    }, 2000));
                }
            }
        }
    },

    /**
     * Handle the event when user clicks on an item in the autocomplete result list.
     * Creates an artifact to insert into content.
     */
    handleAutoCompleteSelect: function(event, ui) {
        var selected = {value: ui.item.value, category: ui.item.category, sfid: ui.item.sfid};

        // Load object only to put it into the recently selected items list in salesforce
        this.loadObject(selected.category, selected.sfid);

        // Close app and insert link object
        this.createArtifact(selected);
    },

    /**
     * Create an element with activity indicator
     */
    insertActivityIndicator: function(element) {
        var activityIndicator = $("<img>", {src: this.getAbsoluteUrl("/images/activity-16.gif"), width:"16", height:"16"});
        activityIndicator.addClass("activity-action").insertAfter(element);
        return activityIndicator;
    },

    /**
     * Create an item for the autocomplete result list based on a Salesforce object.
     * The list object is rendered in customRenderMenu
     */
    sObjectToListItem: function(result, cat) {
        var type = result.attributes.type.toLowerCase();
        var listItem = {
            sfid: result.Id,
            category: type,
            value: result.Name
        };

        if (type == "account") {
            listItem.type = result.Type;
            listItem.ownerId = result.OwnerId;
            if (result.BillingCity) {
                listItem.city = result.BillingCity;
            }
            if (result.BillingState) {
                listItem.state = result.BillingState;
            }
            if (result.BillingCountry) {
                listItem.country = result.BillingCountry;
            }
        }
        else if (type == "opportunity") {
            listItem.type = result.Type;
            listItem.ownerId = result.OwnerId;
            listItem.accountId = result.AccountId;
            listItem.amount = result.Amount;
            listItem.closeDate = result.CloseDate;
        }
        else if (type == "contact") {
            listItem.title = result.Title;
            if (result.MailingCity) {
                listItem.city = result.MailingCity;
            }
            if (result.MailingState) {
                listItem.state = result.MailingState;
            }
            if (result.MailingCountry) {
                listItem.country = result.MailingCountry;
            }

            listItem.title = result.Title;
            listItem.accountId = result.AccountId;
        }
        else if (type == "lead") {
            listItem.title = result.Title;
            listItem.company = result.Company;
            if (result.City) {
                listItem.city = result.City;
            }
            if (result.State) {
                listItem.state = result.State;
            }
            if (result.Country) {
                listItem.country = result.Country;
            }
        }
        else {
            return null;
        }

        return listItem;
    },

    /**
     * Custom autocomplete widget to add category display
     */
    defineCustomAutocomplete: function() {
        var appObj = this;
        $.widget("custom.catcomplete", $.ui.autocomplete, {
            _renderMenu: function(ul, items) {
                var self = this, currentCategory = "";

                // loop through list items and add an extra category item when detect
                // a change in category
                $.each(items, function(index, item) {
                    if (item.category != currentCategory) {
                        var itemElement = $("<li>").addClass("ui-menu-item ui-autocomplete-category");

                        itemElement.append(item.category);
                        ul.append(itemElement);

                        currentCategory = item.category;
                    }
                    self._renderItem(ul, item);
                });
            }
        });
    },

    /**
     * Load objects whose name fields match the given search term.
     * Results saved into app objects property.
     *
     * [{
     *    "attributes" :
     *    {
     *      "type" : "Account",
     *      "url" : "/services/data/v20.0/sobjects/Account/001D000000IqhSLIAZ"
     *    },
     *    "Id" : "001D000000IqhSLIAZ"
     *  },
     *  {
     *    "attributes" :
     *    {
     *      "type" : "Account",
     *      "url" : "/services/data/v20.0/sobjects/Account/001D000000IomazIAB"
     *    },
     *    "Id" : "001D000000IomazIAB"
     * }]
     *
     * @param term
     * @param callback
     */
    searchObjects: function(term, callback) {
        // check for # character since it causes a 400 error from sfdc
        if (term.indexOf("#") > -1) {
            this.showError("Sorry, cannot search for a name with '#' characters.");
            this.searchResults = null;
            callback();
            return;
        }

        // format search query
        var orderByAndLimit = "order by CreatedDate desc limit " + this.maxResultObjects;
        var objects = [];
        if (this.options.objects.account) {
            objects.push("Account(Id, OwnerId, Name, Type, BillingCity, BillingState, BillingCountry " + orderByAndLimit + ")");
        }
        if (this.options.objects.opportunity) {
            objects.push("Opportunity(Id, OwnerId, AccountId, Name, Amount, Type, CloseDate, StageName " + orderByAndLimit + ")");
        }
        if (this.options.objects.contact) {
            objects.push("Contact(Id, AccountId, Name, Title, MailingCity, MailingState, MailingCountry " + orderByAndLimit + ")");
        }
        if (this.options.objects.lead) {
            objects.push("Lead(Id, Name, Title, Company, City, State, Country " + orderByAndLimit + ")");
        }
        var escapedTerm = this.escapeSearchTerm(term);
        var sosl = "find {" + escapedTerm + "*} in name fields returning " + objects.join();

        var options = {
            alias: this.serviceAlias,
            href: this.resources.search,
            params: {"q": sosl}
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            // clear previous results and then look for new result categories and
            // save additional metadata about each
            appObj.searchResults = [];
            appObj.searchResultCategories = 0;
            $.each(response.content, function(index, sobj) {
                var category = sobj.attributes.type.toLowerCase();

                var resultObject = null;
                $.each(appObj.searchResults, function(index, result) {
                    if (result.category == category) {
                        resultObject = result; // found an existing category to add this object to
                    }
                });
                if (resultObject == null) {
                    // did not find an existing one, so create a new one
                    resultObject = {category: category, items:[]};
                    appObj.searchResults.push(resultObject);
                    appObj.searchResultCategories++;
                }
                resultObject.items.push(sobj);
            });
            callback();
        }, function() {// error callback
            appObj.searchResults = null;
            callback();
        })
    },

    escapeSearchTerm: function(term) {
        // Prepend a backslash to all SOSL reserved chars
        var pattern = /([?&|!{}\[\]()^~*:\\"'+-])/g;
        return term.replace(pattern, "\\$1");
    },

    /**
     * Load opportunities for the given account
     */
    loadOpportunities: function(accountId, callback) {
        var prefs = new gadgets.Prefs();
        var whereCriteria = "";
        if (!prefs.getBool("show-all-opps")) {
            whereCriteria = " IsClosed = true and ";
        }

        var soql = "select Name, Amount, Type, IsClosed, IsWon, CreatedDate from Opportunity" +
                  " where " + whereCriteria + "AccountId = '" + accountId + "' order by CreatedDate desc";

        var options = {
            alias: this.serviceAlias,
            href: this.resources.query,
            params: {"q": [soql]}
        };

        this.jiveConnects("get", options, function(response) {
            // todo handle partial results with a nextRecordsUrl
            if (callback) {
                callback(response.content.records);
            }
        })
    },

    /**
     * Find note for the given parent and jive content URL.
     * Callback invoked with boolean value indicating if note exists.
     */
    noteExists: function(parentId, jiveContentUrl, callback) {
        //var soql = "select Id from Note" +
        //          " where ParentId = '" + parentId + "' and Body like '%" + jiveContentUrl + "%'";
        // Can't use this SOQL because cant filter on Body

        // This query returns all notes linked to jive content where
        // the embedded artifact is. Then we filter the results based on sfdc ID.
        var escapedTerm = this.escapeSearchTerm(jiveContentUrl);
        var sosl = "find {" + escapedTerm + "*} returning Note(ParentId)";

        var options = {
            alias: this.serviceAlias,
            href: this.resources.search,
            params: {"q": [sosl]}
        };

        this.jiveConnects("get", options, function(response) {
            var found = false;
            $.each(response.content, function(index, note) {
                if (note.ParentId == parentId) {
                    found = true;
                    return false;
                }
            })

            if (callback) {
                callback(found);
            }
        })
    },

    /**
     * Load versioned service endpoints and pick the latest one.
     * Result saved into app version property:
     * {
     *   "version":"20.0",
     *   "url":"/services/data/v20.0",
     *   "label":"Winter '11"
     * }
     *
     * @param callback
     */
    loadVersions: function(callback) {
        var options = {
            alias: this.serviceAlias,
            href: "/services/data"
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            var last = response.content.length - 1;  // assuming the last one is latest
            var version = response.content[last];
            appObj.version = version;
            console.log("Using Salesforce API " + version.label + ", version " + version.version);
            if (callback) {
                callback();
            }
        })
    },

    /**
     * Load available resource endpoints. Results will be saved in app resources property and will look like this
     * {
     *   ...
     *   search: "/services/data/v24.0/search",
     *   sobjects: "/services/data/v24.0/sobjects"
     * }
     *
     * @param callback
     */
    loadResources: function(callback) {
        var options = {
            alias: this.serviceAlias,
            href: this.version.url
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            appObj.resources = response.content;

            // parse the organization ID from identity request URL
            // expecting format https://(login|test).salesforce.com/id/orgID/userID
            var tokens = appObj.resources.identity.split('/');
            if (tokens.length > 1) {
                if (tokens[tokens.length-2].length == 18) {
                    appObj.organizationId = tokens[tokens.length-2];
                }
                else {
                    console.error("Unexpected length for orgID: " + tokens[tokens.length-2]);
                }

                if (tokens[tokens.length-1].length == 18) {
                    appObj.userId = tokens[tokens.length-1];
                }
                else {
                    console.error("Unexpected length for userID: " + tokens[tokens.length-1]);
                }
            }
            else {
                console.error("Could not parse identity URL: " + appObj.resources.identity);
            }

            if (callback) {
                callback();
            }
        })
    },

    /**
     * Load recently used objects and populate ui
     * @param callback
     */
    loadRecent: function(callback) {
        var options = {
            alias: this.serviceAlias,
            href: this.resources.recent
        };
        var appObj = this;
        this.jiveConnects("get", options, function(response) {
            $("#recent ul").empty();
            $.each(response.content, function(index, sobj) {
                // convert salesforce object to a list item, ignoring the ones this app does not handle
                var item = appObj.sObjectToListItem(sobj);
                if (item != null) {
                    // create a link that will insert the same object into the editor
                    var el = $("<a>", {href: "#"}).html(item.value).click(function() {
                        appObj.createArtifact(item);
                    });
                    $("#recent ul").append($("<li>").append(el));
                }
            });
        })
    },

    /**
     * Load a salesforce SObject based on type and id
     *
     * @param type
     * @param id
     * @param callback function to be invoked with the object data as parameter
     */
    loadObject: function(type, id, callback) {
        var options = {
            alias: this.serviceAlias,
            href: this.resources.sobjects + "/" + type + "/" + id
        };
        this.jiveConnects("get", options, function(response) {
            if (callback) {
                callback(response.content);
            }
        })
    },

    /**
     * Load a salesforce SObject based on type and id
     *
     * @param type
     * @param object
     * @param callback function to be invoked with the object data as parameter
     */
    createObject: function(type, object, callback) {
        var options = {
            alias: this.serviceAlias,
            headers: { 'Content-Type': 'application/json' },
            href: this.resources.sobjects + "/" + type + "/",
            body: object
        };
        this.jiveConnects("post", options, function(response) {
            if (callback) {
                callback(response.content);
            }
        })
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
                            if (errorCallback) {
                                errorCallback();
                            }
                        }
                    });
                }
                else if (response.error.code == 1014 || response.error.code == 1016) { // IO exception or timeout, try again
                    console.log("Retrying after salesforce error: " + response.error.code);

                    appObj.requestRetries = appObj.requestRetries + 1;
                    if (appObj.requestRetries < 3) {
                        setTimeout(function() {
                            appObj.jiveConnects(method, options, responseHandler, errorCallback);
                        }, 2000);
                    }
                    else {
                        appObj.showError(response.error.message + " (error code:" + response.error.code + ")");
                        if (errorCallback) {
                            errorCallback();
                        }
                    }
                }
                else {
                    console.error(response);
                    appObj.showError(response.error.message + " (error code:" + response.error.code + ")");
                    if (errorCallback) {
                        errorCallback();
                    }
                }
            }
            else if (response.content == undefined) {
                // The response is not what the API defines, must be a server error
                console.error(response);
                appObj.showError("Sorry, an error occurred during search. This is most likely due to a " +
                               "known Apps authentication timeout issue. Please try to reload your browser.");
                if (errorCallback) {
                    errorCallback();
                }
            }
            else {
                requestRetries = 0;
                responseHandler(response);
            }
        });
    },

    showMessage: function(str) {
        $("img.activity-load").hide();
        $("#messages").removeClass("error").html(str).show();
    },

    showError: function(str) {
        $("img.activity-load").hide();
        $("img.activity-action").remove();
        $("#messages").addClass("error").html(str).show();
    },

    getAbsoluteUrl: function(path) {
        return gadgets.util.getUrlParameters()['url'].replace(/(\/app.xml)|(\/gadget.xml)/, path);
    }
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(sfdcSearch, sfdcSearch.init));
