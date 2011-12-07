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

// Index of the currently selected group
var index;

// The invites to the selected group
var invites;

// The members of the selected group
var members;

// Page size limit (ultimately to be a user pref)
var limit = 10;

// Factory for mini messages
var mini;

// On-view-load initialization
function init() {
    $(".toplevel").hide();
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

// Select the specified group and retrieve the entire information
function onDetailsButton() {
    gadgets.log("onDetailsButton(data-index=" + $(this).attr("data-index") + ")");
    index = $(this).attr("data-index");
    osapi.jive.core.groups.get({
        id : groups[$(this).attr("data-index")].id
    }).execute(onDetailsData);
}

// Select the specified group and display its details
function onDetailsData(response) {
    gadgets.log("onDetailsData(" + JSON.stringify(response) + ")");
    group = response.data;
    showGroup();
}

// Trigger an update of this group, then reselect the list
function onGroupUpdateButton() {
    group.description = $("#group-description").val();
    group.displayName = $("#group-display-name").val();
    group.groupType = $("#group-group-type").val();
    group.name = $("#group-name").val();
    gadgets.log("onGroupUpdateButton(" + JSON.stringify(group) + ")");
    group.update().execute(onGroupUpdateResponse);
}

// Verify update completion and reselect
function onGroupUpdateResponse(response) {
    gadgets.log("onGroupUpdateResponse(" + JSON.stringify(response) + ")");
    if (response.error) {
        mini.createDismissibleMessage("Error updating group: " + response.error.message);
        // Stay on the group detail view
    }
    else {
        mini.createTimerMessage("Group '" + response.data.name + "' successfully updated", 5);
        groups[index] = response.data;
        showGroups();
    }
}

// Select this group and retrieve the corresponding invites
function onInvitesButton() {
    gadgets.log("onInvitesButton(" + JSON.stringify(group) + ")");
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
        groups = [];
    }
    showGroups();
}

// Trigger a delete of the specified member
function onMemberDeleteButton() {
    gadgets.log("onMemberDeleteButton(data-index=" + $(this).attr("data-index") + ")");
    members[$(this).attr("data-index")].destroy().execute(onMemberDeleteResponse);
}

// Process response to a member delete
function onMemberDeleteResponse(response) {
    gadgets.log("onMemberDeleteResponse(" + JSON.stringify(response) + ")");
    if (response.error) {
        mini.createDismissibleMessage("Error deleting member: " + response.error.message);
    }
    else {
        mini.createTimerMessage("Member delete was successful", 5);
    }
    onMembersButton();
}

// Trigger an update of the specified member
function onMemberUpdateButton() {
    var index = $(this).attr("data-index");
    gadgets.log("onMemberUpdateButton(data-index=" + index + ")");
    members[index].state = $("#member-state-" + index).val();
    members[index].update().execute(onMemberUpdateResponse);
}

// Process response to a member update
function onMemberUpdateResponse(response) {
    gadgets.log("onMemberUpdateResponse(" + JSON.stringify(response) + ")");
    if (response.error) {
        mini.createDismissibleMessage("Error updating member: " + response.error.message);
    }
    else {
        mini.createTimerMessage("Member update was successful", 5);
    }
    onMembersButton();
}

// Select this group and retrieve the corresponding members
function onMembersButton() {
    gadgets.log("onMembersButton(" + JSON.stringify(group) + ")");
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

// Prettify the canonical group type constant
function prettifyGroupType(groupType) {
    if (groupType == "OPEN") {
        return "Open";
    }
    else if (groupType == "MEMBER_ONLY") {
        return "Members Only";
    }
    else if (groupType == "PRIVATE") {
        return "Private";
    }
    else if (groupType == "SECRET") {
        return "Secret";
    }
    else {
        return groupType;
    }
}

// Prettify the membership state
function prettifyMemberState(state) {
    if (state == "banned") {
        return "Banned";
    }
    else if (state == "invited") {
        return "Invited";
    }
    else if (state == "member") {
        return "Member";
    }
    else if (state == "owner") {
        return "Owner";
    }
    else if (state == "pending") {
        return "Pending";
    }
    else {
        return state;
    }
}

// Register UI event handlers
function registerHandlers() {
    $("#group-back").click(showGroups);
    $("#group-update").click(onGroupUpdateButton);
    $("#invites-back").click(showGroup);
    $("#invites-button").click(onInvitesButton);
    $("#members-back").click(showGroup);
    $("#members-button").click(onMembersButton);
}

// Set the currently selected group
function selectGroup(index) {
    gadgets.log("Selecting group " + index + " = " + JSON.stringify(groups[index]));
    group = groups[index];
}

// Show the selected group
function showGroup() {
    gadgets.log("showGroup(" + JSON.stringify(group) + ")");
    $("#group-description").val(group.description);
    $("#group-display-name").val(group.displayName);
    $("#group-group-type").val(group.groupType);
    $("#group-name").val(group.name);
    $("#group-creator").html("").html(group.creator.name);
    $("#group-creation-date").html("").html(group.creationDate);
    $("#group-id").html("").html(group.id);
    $("#group-modification-date").html("").html(group.modificationDate);
    $("#group-view-count").html("").html(group.viewCount);
    $(".group-detail").attr("disabled", !group.update);
    $("#invites-button").attr("disabled", !group.invites);
    $("#members-button").attr("disabled", !group.members);
    showOnly("group-div");
}

// Show the assembled groups list
function showGroups() {
    gadgets.log("showGroups()");
    var html = "";
    $.each(groups, function(index, group) {
        html += '<tr>';
        html += '<td>' + group.name + '</td>';
        html += '<td>' + prettifyGroupType(group.groupType) + '</td>';
        html += '<td>';
        html += '<button class="details-button" data-index="' + index + '">Details</button>';
        html += '</td>';
        html += '</tr>';
    });
    $("#groups-tbody").html("").html(html);
    $(".details-button").click(onDetailsButton);
    showOnly("groups-div");
}

// Show the assembled invites list
function showInvites() {
    $("#invites-title").html("").html("Invites for Group '" + group.name + "'");
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
    $("#invites-tbody").html("").html(html);
    showOnly("invites-div");
}

// Show the assembled members list
function showMembers() {
    $("#members-title").html("").html("Members for Group '" + group.name + "'");
    var html = "";
    $.each(members, function(index, member) {
        html += '<tr>';
        html += '<td>' + member.user.username + '</td>';
        html += '<td>' + member.user.name + '</td>';
        html += '<td>' + showMembersState("member-state-" + index, index) + '</td>';
        html += '<td>' + showMembersUpdate("member-delete-" + index, index, !member.destroy) +
                         showMembersDelete("member-delete-" + index, index, !member.update) + '</td>';
        html += '</tr>';
    });
    $("#members-tbody").html("").html(html);
    $.each(members, function(index, member) {
        $("#member-state-" + index).val(member.state);
    });
    $(".member-delete").click(onMemberDeleteButton);
    $(".member-update").click(onMemberUpdateButton);
    showOnly("members-div");
}

// Return the HTML for a member delete button
function showMembersDelete(id, index, disabled) {
    var html = '<button id="' + id + '" data-index="' + index + '" class="member-delete"';
    if (disabled) {
        html += ' disabled="disabled"';
    }
    html += '>Delete</button>';
    return html;
}

// Return the HTML for a dropdown for the member state
function showMembersState(id, index) {
    var html = '<select id="' + id + '" data-index="' + index + '">';
    html += '<option value="banned">Banned</option>';
    html += '<option value="invited">Invited</option>';
    html += '<option value="member">Member</option>';
    html += '<option value="owner">Owner</option>';
    html += '<option value="pending">Pending</option>';
    html += '</select>';
    return html;
}

// Return the HTML for a member update button
function showMembersUpdate(id, index, disabled) {
    var html = '<button id="' + id + '" data-index="' + index + '" class="member-update"';
    if (disabled) {
        html += ' disabled="disabled"';
    }
    html += '>Update</button>';
    return html;
}

// Show only the specified top level div
function showOnly(name) {
    gadgets.log("showOnly('" + name + "')");
    $(".toplevel").hide();
    $("#" + name).show();
    gadgets.window.adjustHeight();
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);

