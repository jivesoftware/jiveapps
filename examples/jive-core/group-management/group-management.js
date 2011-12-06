/*
 - Copyright 2011 Jive Software
 -
 - Licensed under the Apache License, Version 2.0 (the "License");
 - you may not use this file except in compliance with the License.
 - You may obtain a copy of the License at
 -
 -    http://www.apache.org/licenses/LICENSE-2.0
 -
 - Unless required by applicable law or agreed to in writing, software
 - distributed under the License is distributed on an "AS IS" BASIS,
 - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 - See the License for the specific language governing permissions and
 - limitations under the License.
 */

// Currently selected group
var current;

// Current page of groups
var groups;

// The invites to the selected group
var invites;

// The members of the selected group
var members;

// Page size limit (ultimately to be a user pref)
var limit = 25;

// Factory for mini messages
var mini;

// On-view-load initialization
function init() {
    registerHandlers();
    loadInitialGroups();
    mini = new gadgets.MiniMessage();
}

// Load the initial page of groups
function loadInitialGroups() {
    osapi.jive.core.groups.get({
        limit : limit
    }).execute(onLoadGroups);
}

// Load the next page of groups
function loadNextGroups() {
    // TODO - loadNextGroups
}

// Load the previous page of groups
function loadPreviousGroups() {
    // TODO - loadPreviousGroups
}

// Select this group and retrieve the corresponding invites
function onInvitesButton() {
    gadgets.log("onInvitesButton(data-index=" + $(this).attr("data-index") + ")");
    selectGroup($(this).attr("data-index"));
    group.invites.get({
    }).execute(onInvitesList);
}

// Display the retrieved list of invites
function onInvitesList(response) {
    gadgets.log("onInvitesList(" + JSON.stringify(response) + ")");
    if (response.data) {
        invites = response.data;
        showInvites();
    }
    else {
        mini.createDismissibleMessage("No 'data' element is present in the response");
    }
}

// Handler for loading a page of groups
function onLoadGroups(response) {
    gadgets.log("onLoadGroups(" + JSON.stringify(response) + ")");
    if (response.data) {
        groups = response.data;
    }
    else {
        mini.createDismissibleMessage("No 'data' element is present in the response");
    }
    showGroups();
}

// Select this group and retrieve the corresponding members
function onMembersButton() {
    gadgets.log("onMembersButton(data-index=" + $(this).attr("data-index") + ")");
    selectGroup($(this).attr("data-index"));
    group.members.get({
    }).execute(onMembersList);
}

// Display the retrieved list of members
function onMembersList(response) {
    gadgets.log("onMembersList(" + JSON.stringify(response) + ")");
    if (response.data) {
        members = response.data;
        showMembers();
    }
    else {
        mini.createDismissibleMessage("No 'data' element is present in the response");
    }
}

// Register UI event handlers
function registerHandlers() {
    $("#invites-back").click(showGroups);
    $("#members-back").click(showGroups);
}

// Set the currently selected group
function selectGroup(index) {
    gadgets.log("Selecting group " + index + " = " + JSON.stringify(groups[index]));
    group = groups[index];
}

// Show the assembled groups list
function showGroups() {
    var html = "";
    $.each(groups, function(index, group) {
        html += '<tr>';
        html += '<td>' + group.name + '</td>';
        html += '<td>' + group.groupType + '</td>';
        html += '<td>';
        html += '<button class="invites-button" data-index="' + index + '">Invites</button>';
        html += '<button class="members-button" data-index="' + index + '">Members</button>';
        html += '</td>';
        html += '</tr>';
    });
    $("#groups-tbody").html("").html(html);
    $(".invites-button").click(onInvitesButton);
    $(".members-button").click(onMembersButton);
    showOnly("groups-div");
}

// Show the assembled invites list
function showInvites() {
    $("#invites-title").html().html("Invites for Group '" + group.name + "'");
    var html = "";
    $.each(invites, function(index, invite) {
        html += '<tr>';
        html += '<td>' + invite.inviter.username + '</td>';
        if (invite.user) {
            html += '<td>' + invite.user.username + '</td>';
        }
        else if (invite.email) {
            html += '<td>' + invite.email + '</td>';
        }
        else {
            html += '<td>Unknown</td>';
        }
        html += '<td>' + invite.state + '</td>';
        html += '</tr>';
    });
    $("#invites-tbody").html().html(html);
    showOnly("invites-div");
}

// Show the assembled members list
function showMembers() {
    $("#members-title").html().html("Members for Group '" + group.name + "'");
    var html = "";
    $.each(membewrs, function(index, member) {
        html += '<tr>';
        html += '<td>' + member.user.username + '</td>';
        html += '<td>' + member.user.name + '</td>';
        html += '<td>' + member.state + '</td>';
        html += '<td>TODO</td>';
        html += '</tr>';
    });
    $("#members-tbody").html().html(html);
    showOnly("members-div");
}

// Show only the specified top level div
function showOnly(name) {
    $(".toplevel").hide();
    $("#" + name).show();
    gadgets.window.adjustHeight();
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);

