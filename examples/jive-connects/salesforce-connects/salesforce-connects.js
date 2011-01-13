/*
 * Copyright 2011 Jive Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Symbolic constant for our connection alias
var ALIAS = "salesforce";

// Currently selected account
var account;

// Accounts that we loaded
var accounts = [ ];

// Currently selected contact
var contact;

// Contacts for the currently selected account
var contacts = [ ];

// Opportunities for the currently selected account
var opportunities = [ ];

// Currently selected opportunity
var opportunity;

// Path prefix (to be looked up on the initial call)
var prefix = "";

// Hash of resource URL partial paths, keyed by resource name
var resources = { };

// The currently logged in user
var user;

// On-view-load initialization
function init() {
    registerHandlers();
    loadUser();
}

// Load and cache the results of a query to retrieve information about acocunts
function loadAccounts() {
    console.log("loadAccounts() started");
    showMessage("Loading current accounts ...");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : resources.query,
        params : { q : 'SELECT Id, Name, Type, BillingCity, BillingState FROM Account ORDER BY Name' }
    }).execute(function (response) {
        console.log("loadAccounts() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadAccounts();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            accounts = response.content.records;
            var html = "";
            $.each(accounts, function(index, account) {
                html += '<hr /><p><strong>' + account["Name"] + '</strong></p>';
                html += '<p>Location: ' + account["BillingCity"] + ', ' + account["BillingState"] + '</p>';
                html += '<p>Type: ' + account["Type"] + '</p>';
                html += '<p>Links:';
                html += ' <a class="contacts-link" href="#" data-index="' + index + '">Contacts</a>';
                html += ' <a class="opportunities-link" href="#" data-index="' + index + '">Opportunities</a>';
                html += '</p>';
            });
            $("#accounts-list").html("").html(html);
            $(".contacts-link").click(function() {
                var index = $(this).attr("data-index");
                account = accounts[index];
                $(".account-name").html("").html(account["Name"]);
                loadContacts();
            });
            $(".opportunities-link").click(function() {
                var index = $(this).attr("data-index");
                account = accounts[index];
                $(".account-name").html("").html(account["Name"]);
                loadOpportunities();
            });
            showOnly("accounts-div");
            gadgets.window.adjustHeight();
        }
    });
}

// Load contacts for the currently selected account
function loadContacts() {
    console.log("loadContacts() started");
    showMessage("Loading contacts for selected account ...");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : resources.query,
        params : { q : "SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE AccountId='" +
                       account["Id"] + "' ORDER BY LastName, FirstName" }
    }).execute(function (response) {
        console.log("loadContacts() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadContacts();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            contacts = response.content.records;
            var html = "";
            $.each(contacts, function(index, contact) {
                html += '<hr />';
                html += '<p><strong>' + contact["LastName"] + ', ' + contact["FirstName"] + '</strong></p>';
                html += '<p>Email: ' + contact["Email"] + '</p>';
                html += '<p>Phone: ' + contact["Phone"] + '</p>';
                html += '<p>Links:';
                html += ' <a class="call-link" href="#" data-index="' + index + '">Make The Call!</a>';
                html += '</p>';
            });
            $("#contacts-list").html("").html(html);
            $(".call-link").click(function() {
                var index = $(this).attr("data-index");
                contact = contacts[index];
                var entry = {
                    activity : {
                        body : '{@actor} needs to contact <b>' + contact["FirstName"] + ' ' + contact["LastName"]
                               + '</b> by phone at ' + contact["Phone"]
                               + ' or by email at ' + contact["Email"]
                               + ' related to account ' + account["Name"] + '.',
                        object : {
                            actionLinks : [
                                { title : 'Done' }
                            ],
                            summary : 'This is the <b>summary</b> <i>part</i>.'
                        },
                        title : 'Make The Call!'
                    },
                    deliverTo : [ user.id ]
                };
                console.log("Creating action = " + JSON.stringify(entry));
                osapi.activities.create(entry).execute(function(response) {
                    console.log("creating action response = " + JSON.stringify(response));
                    alert("Created action");
                });
            });
            showOnly("contacts-div");
            gadgets.window.adjustHeight();
        }
    });
}

// Load opportunities for the currently selected account
function loadOpportunities() {
    console.log("loadOpportunities() started");
    showMessage("Loading opportunities for selected account ...");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : resources.query,
        params : { q : "SELECT Id, Name, StageName, Amount FROM Opportunity WHERE AccountId='" +
                       account["Id"] + "' ORDER BY Name" }
    }).execute(function (response) {
        console.log("loadOpportunities() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadOpportunities();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            opportunities = response.content.records;
            var html = "";
            $.each(opportunities, function(index, opportunity) {
                html += '<hr />';
                html += '<p><strong>' + opportunity["Name"] + '</strong></p>';
                html += '<p>Stage: ' + opportunity["StageName"] + '</p>';
                html += '<p>Amount: ' + opportunity["Amount"] + '</p>';
                html += '<p>Links:';
                html += ' <a class="reviewed-link" href="#" data-index="' + index + '" data-verb="Accepted">Mark as Accepted</a>';
                html += '&nbsp;';
                html += ' <a class="reviewed-link" href="#" data-index="' + index + '" data-verb="Rejected">Mark as Rejected</a>';
                html += '</p>';
            });
            $("#opportunities-list").html("").html(html);
            $(".reviewed-link").click(function() {
                var index = $(this).attr("data-index");
                var verb = $(this).attr("data-verb");
                opportunity = opportunities[index];
                var entry = {
                    activity : {
                        body : '{@actor} reviewed an opportunity',
                        object : {
                            summary : 'The reviewed opportunity was <b>' + opportunity["Name"]
                                    + '</b> for account <i>' + account["Name"] + '</i>.  '
                        },
                        title : verb + ' An Opportunity Review',
                        verb : verb
                    }
                };
                console.log("Creating activity stream entry = " + JSON.stringify(entry));
                osapi.activities.create(entry).execute(function(response) {
                    console.log("creating activity stream entry response = " + JSON.stringify(response));
                    alert("Created an activity stream entry");
                });
            });
            showOnly("opportunities-div");
            gadgets.window.adjustHeight();
        }
    });
}

// Load and cache the path prefix
function loadPrefix() {
    console.log("loadPrefix() started");
    showMessage("Loading SalesForce.Com version information ...");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : '/services/data'
    }).execute(function (response) {
        console.log("loadPrefix() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadPrefix();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            // Use the first returned API version by default
            console.log("loadPrefix() setting prefix to '" + response.content[0].url + "'");
            prefix = response.content[0].url;
            loadResources();
        }
    });
}

// Load the currently logged in user
function loadUser() {
    console.log("loadUser() started");
    showMessage("Loading the currently logged in user ...");
    osapi.people.get({
        userId : '@me'
    }).execute(function(response) {
        console.log("loadUser() response = " + JSON.stringify(response));
        if (response.error) {
            alert("Error " + response.error.code + " getting current user: " + response.error.message);
        }
        else {
            if (response instanceof Array) {
                user = response[0];
            }
            else {
                user = response;
            }
            loadPrefix();
        }
    })
}

// Load the available resource URLs that we can access
function loadResources() {
    console.log("loadResources() started");
    showMessage("Loading SalesForce.Com resource links ...");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : prefix
    }).execute(function (response) {
        console.log("loadResources() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadResources();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            resources = response.content;
            loadAccounts();
        }

    });
}

// Register UI event handlers
function registerHandlers() {
    $(".back-to-accounts").click(function() {
        loadAccounts();
    });
}

// Show the specified status message
function showMessage(message) {
    $("#status-message").html("").html(message);
    showOnly("status-div");
}

// Show only the specified top level div
function showOnly(id) {
    $(".top-level-div").hide();
    $("#" + id).show();
    gadgets.window.adjustHeight();
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);
