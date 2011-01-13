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

// Selected object instance
var object = { };

// Array of metadata about available objects
var objects = [ ];

// Hash of resource URL partial paths, keyed by resource name
var resources = { };

// Selected version instance, with "label", "url", and "version" properties
var version = { };

// Array of version objects available in this SalesForce instance
var versions = [ ];

// On-view-load initialization
function init() {
    registerHandlers();
    loadVersions();
}

// Load descriptive information about the fields for the selected object
function loadObject() {
    showMessage("Loading field information for the selected system object ...");
    console.log("loadObject() started");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : object.urls.describe
    }).execute(function (response) {
        console.log("loadObject() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadDescribe();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            $(".object-title").html("").html(object.name);
            var fields = response.content.fields;
            var html = "";
            $.each(fields, function(index, f) {
                if (!f.deprecatedAndHidden) {
                    html += '<tr>';
                    html += '<td>' + f.name + '</td>';
                    html += '<td>' + f.label + '</td>';
                    html += '<td>' + f.type + '</td>';
                    html += '<td>' + f.length + '</td>';
                    html += '<td>' + f.digits + '</td>';
                    html += '<td>' + f.caseSensitive + '</td>';
                    html += '<td>' + f.filterable + '</td>';
                    html += '<td>' + f.nillable + '</td>';
                    html += '<td>' + f.sortable + '</td>';
                    html += '<td>' + f.updateable + '</td>';
                    html += '</tr>';
                }
            });
            $("#object-table-body").html("").html(html);
            var relationships = response.content.childRelationships;
            html = "";
            $.each(relationships, function(index, r) {
                if (!r.deprecatedAndHidden) {
                    html += '<tr>';
                    html += '<td>' + r.childSObject + '</td>';
                    html += '<td>' + r.field + '</td>';
                    html += '<td>' + r.cascadeDelete + '</td>';
                    html += '<td>' + (r.relationshipName ? r.relationshipName : '&nbsp;') + '</td>';
                    html += '</tr>';
                }
            });
            $("#relationship-table-body").html("").html(html);
            showOnly("object-div");
        }
    });
}

// Load the available object URLs that we can access
function loadObjects() {
    showMessage("Loading available system objects for this API version ...");
    console.log("loadObjects() started");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : resources.sobjects
    }).execute(function (response) {
        console.log("loadObjects() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadObjects();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            objects = response.content.sobjects;
            var html = "";
            $.each(objects, function(index, o) {
                if (!o.deprecatedAndHidden) {
                    html += '<tr>';
                    html += '<td><a class="object-link" href="#" data-index="' + index + '">' + o.name + '</a></td>';
                    html += '<td>' + o.label + '</td>';
                    html += '<td>' + o.createable + '</td>';
                    html += '<td>' + o.deletable + '</td>';
                    html += '<td>' + o.queryable + '</td>';
                    html += '<td>' + o.retrieveable + '</td>';
                    html += '<td>' + o.updateable + '</td>';
                    html += '</tr>';
                }
            });
            $("#objects-table-body").html("").html(html);
            $(".object-link").click(function() {
                var index = $(this).attr("data-index");
                object = objects[index];
                loadObject();
            });
            showOnly("objects-div");
        }
    });
}

// Load the resource links we will need
function loadResources() {
    showMessage("Loading resource URLs for the selected API version ...");
    console.log("loadResources() started");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : version.url
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
            loadObjects();
        }

    });
}

// Load the available API versions, and let the user select the desired one
function loadVersions() {
    showMessage("Loading available API versions ...");
    console.log("loadVersions() started");
    osapi.jive.connects.get({
        alias : ALIAS,
        href : '/services/data'
    }).execute(function (response) {
        console.log("loadVersions() response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration");
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadVersions();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            versions = response.content;
            var html = "";
            $.each(versions, function(index, v) {
                html += '<li class="version-item">'
                      + '<a class="version-link" href="#" data-index="' + index + '">' + v.label + '</a>'
                      + ' (Version ' + v.version + ')</li>';
            });
            $("#versions-list").html("").html(html);
            $(".version-link").click(function() {
                var index = $(this).attr("data-index");
                version = versions[index];
                $(".version-title").html("").html(version.label + ' (Version ' + version.version + ')');
                loadResources();
            });
            showOnly("versions-div");
        }
    });
}

// Register UI event handlers
function registerHandlers() {
    $("#back-to-objects").click(function() {
        loadObjects();
    });
    $("#back-to-versions").click(function() {
        loadVersions();
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
