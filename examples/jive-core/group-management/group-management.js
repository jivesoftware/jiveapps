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

// Flag saying we are creating a new row versus updating
var creating = false;

// Currently selected group
var current;

// Current page of groups
var groups;

// Index of the currently selected group
var index;

// The invites to the selected group
var invites;

// Source of invites being shown (group, invited, invites)
var invitesSource;

// The members of the selected group
var members;

// Page size limit (ultimately to be a user pref)
var limit = 10;

// Factory for mini messages
var mini;

// The viewing user
var viewer;

// On-view-load initialization
function init() {
    $(".toplevel").hide();
    registerHandlers();
    loadViewer();
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

// Load the viewing user then the initial groups
function loadViewer() {
    osapi.jive.core.users.get({
        id : '@viewer'
    }).execute(function(response) {
        gadgets.log("loadViewer(" + JSON.stringify(response) + ")");
        viewer = response.data;
        loadInitialGroups();
    });
}

// Set up to create a new social group
function onGroupCreateButton() {
    creating = true;
    group = {
        contentTypes : [ 'blog', 'discussions', 'documents', 'projects' ],
        creationDate : '',
        creator : {
            name : ''
        },
        description : '',
        displayName : '',
        groupType : 'OPEN',
        id : '',
        modificationDate : '',
        name : '',
        viewCount : ''
    };
    showGroup();
}

// Trigger deletion of the specified group - // TODO confirmation dialog
function onGroupDeleteButton() {
    gadgets.log("onGroupDeleteButton(" + JSON.stringify(group) + ")");
    group.destroy().execute(onGroupDeleteResponse);

}

// Process results of a group delete
function onGroupDeleteResponse(response) {
    if (response.error) {
        mini.createDismissibleMessage("Error deleting group: " + response.error.message);
    }
    else {
        mini.createTimerMessage("Group '" + group.name + "' was successfully deleted");
        loadInitialGroups();
    }
}

// Select the specified group and retrieve the entire information
function onGroupDetailsButton() {
    gadgets.log("onGroupDetailsButton(data-index=" + $(this).attr("data-index") + ")");
    creating = false;
    index = $(this).attr("data-index");
    osapi.jive.core.groups.get({
        id : groups[$(this).attr("data-index")].id
    }).execute(onGroupDetailsData);
}

// Select the specified group and display its details
function onGroupDetailsData(response) {
    gadgets.log("onDetailsData(" + JSON.stringify(response) + ")");
    group = response.data;
    showGroup();
}

// Trigger a create or update of this group, then reselect the list
function onGroupSaveButton() {
    group.contentTypes = [];
    if ($("#group-content-blog").is(':checked')) {
        group.contentTypes.push("blog");
    }
    if ($("#group-content-discussions").is(':checked')) {
        group.contentTypes.push("discussions");
    }
    if ($("#group-content-documents").is(':checked')) {
        group.contentTypes.push("documents");
    }
    if ($("#group-content-projects").is(':checked')) {
        group.contentTypes.push("projects");
    }
    group.description = $("#group-description").val();
    group.displayName = $("#group-display-name").val();
    group.groupType = $("#group-group-type").val();
    group.name = $("#group-name").val();
    gadgets.log("onGroupSaveButton(creating=" + creating + ",group=" + JSON.stringify(group) + ")");
    if (creating) {
        osapi.jive.core.groups.create(
            group
        ).execute(onGroupSaveResponse);
    }
    else {
        group.update().execute(onGroupSaveResponse);
    }
}

// Verify ceate or update completion and reselect
function onGroupSaveResponse(response) {
    gadgets.log("onGroupSaveResponse(" + JSON.stringify(response) + ")");
    if (response.error) {
        if (creating) {
            mini.createDismissibleMessage("Error creating group: " + response.error.message);
        }
        else {
            mini.createDismissibleMessage("Error updating group: " + response.error.message);
        }
        // Stay on the group detail view
    }
    else {
        mini.createTimerMessage("Group '" + response.data.name + "' successfully saved", 5);
        if (creating) {
            loadInitialGroups();
        }
        else {
            groups[index] = response.data;
            showGroups();
        }
    }
}

// Accept the specified invite
function onInviteAcceptButton() {
    onInviteUpdate($(this).attr("data-index"), "accepted");
}

// Send a new invite
function onInviteAddButton() {
    group.invites.create({
        invitees : [ $("#invite-add-username").val() ],
        body : $("#invite-add-body").val()
    }).execute(onInviteAddResponse);
}

// Process results of sending a new invite
function onInviteAddResponse(response) {
    if (response.error) {
        mini.createDismissibleMessage("Error sending invite: " + response.error.message);
    }
    else {
        mini.createTimerMessage("Sending invitation was successfully completed");
        onInvitesButton();
    }
}

// Resend the specified invite
function onInviteResendButton() {
    onInviteUpdate($(this).attr("data-index"), "resent");
}

// Revoke the specified invite
function onInviteRevokeButton() {
    onInviteUpdate($(this).attr("data-index"), "revoked");
}

// Update the specified invite
function onInviteUpdate(index, state) {
    var invite = invites[index];
    invite.state = state;
    invite.update().execute(onInviteUpdateResponse);
}

// Process the response to an invite update
function onInviteUpdateResponse(response) {
    if (response.error) {
        mini.createDismissibleMessage("Error updating invite: " + response.error.message);
        // Stay on the invite view
    }
    else {
        mini.createTimerMessage("Invite update was successful", 5);
        if (invitesSource == "group") {
            onInvitesButton();
        }
        else if (invitesSource == "invited") {
            onMyInvitedButton();
        }
        else if (invitesSource = "invites") {
            onMyInvitesButton();
        }
    }
}

// Return to the appropriate previous view
function onInvitesBack() {
    gadgets.log("onInvitesBack()");
    if (group != null) {
        showGroup();
    }
    else {
        showGroups();
    }
}

// Select this group and retrieve the corresponding invites
function onInvitesButton() {
    gadgets.log("onInvitesButton(" + JSON.stringify(group) + ")");
    $("#invites-title").html("").html("Invitations to Group '" + group.name + "'");
    invitesSource = "group";
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

// Trigger an add of a new member
function onMemberAddButton() {
    var member = {
        username : $("#member-add-username").val(),
        state : $("#member-add-state").val()
    }
    gadgets.log("onMemberAddButton(" + JSON.stringify(member) + ")");
    group.members.create(member).execute(onMemberAddResponse);
}

// Process response to a member delete
function onMemberAddResponse(response) {
    gadgets.log("onMemberAddResponse(" + JSON.stringify(response) + ")");
    if (response.error) {
        mini.createDismissibleMessage("Error adding member: " + response.error.message);
    }
    else {
        mini.createTimerMessage("Member add was successful", 5);
        onMembersButton();
    }
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

// Display a list of invites to me
function onMyInvitedButton() {
    gadgets.log("onMyInvitesButton()");
    group = null;
    invitesSource = "invited";
    $("#invites-title").html("").html("Invitations Received By Me");
    osapi.jive.core.invites.get({
        userId : '@viewer',
        groupId : '@invited'
    }).execute(onInvitesList);
}

// Display a list of invites from me
function onMyInvitesButton() {
    gadgets.log("onMyInvitedButton()");
    group = null;
    invitesSource = "invites";
    $("#invites-title").html("").html("Invitations Sent By Me");
    osapi.jive.core.invites.get({
        userId : '@viewer',
        groupId : '@invites'
    }).execute(onInvitesList);
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
    $("#group-create").click(onGroupCreateButton);
    $("#group-delete").click(onGroupDeleteButton);
    $("#group-save").click(onGroupSaveButton);
    $("#invite-add-button").click(onInviteAddButton);
    $("#invites-back").click(onInvitesBack);
    $("#invites-button").click(onInvitesButton);
    $("#member-add").click(onMemberAddButton);
    $("#members-back").click(showGroup);
    $("#members-button").click(onMembersButton);
    $("#my-invited").click(onMyInvitedButton);
    $("#my-invites").click(onMyInvitesButton);
}

// Show the selected group
function showGroup() {
    gadgets.log("showGroup(" + JSON.stringify(group) + ")");
    if (creating) {
        $("#group-table-title").html("").html("Create New Social Group");
    }
    else if (group.update) {
        $("#group-table-title").html("").html("Update Existing Social Group");
    }
    else {
        $("#group-table-title").html("");
    }
    showGroupSetContentType("group-content-blog", showGroupHasContentType("blog"));
    showGroupSetContentType("group-content-discussions", showGroupHasContentType("discussions"));
    showGroupSetContentType("group-content-documents", showGroupHasContentType("documents"));
    showGroupSetContentType("group-content-projects", showGroupHasContentType("projects"));
    $("#group-description").val(group.description);
    $("#group-display-name").val(group.displayName);
    $("#group-group-type").val(group.groupType);
    $("#group-name").val(group.name);
    $("#group-creator").html("").html(group.creator.name);
    $("#group-creation-date").html("").html(group.creationDate);
    $("#group-id").html("").html(group.id);
    $("#group-modification-date").html("").html(group.modificationDate);
    $("#group-view-count").html("").html(group.viewCount);
    $(".group-detail").attr("disabled", !(group.update || creating));
    $("#group-delete").attr("disabled", !group.destroy);
    $("#invites-button").attr("disabled", !(group.invites && group.invites.get));
    $("#members-button").attr("disabled", !group.members);
    showOnly("group-div");
}

// Return true if the current group has the specified content type enabled
function showGroupHasContentType(contentTypeToCheck) {
    var result = false;
    group.contentTypes.forEach(function(contentType) {
        if (contentType == contentTypeToCheck) {
            result = true;
        }
    });
    return result;
}

// Set the checkbox "checked" attribute appropriately
function showGroupSetContentType(id, state) {
    if (state) {
        $("#" + id).attr("checked", "checked");
    }
    else {
        $("#" + id).removeAttr("checked");
    }
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
        html += '<button class="group-details-button" data-index="' + index + '">Details</button>';
        html += '</td>';
        html += '</tr>';
    });
    $("#groups-tbody").html("").html(html);
    $(".group-details-button").click(onGroupDetailsButton);
    showOnly("groups-div");
}

// Show the assembled invites list
function showInvites() {
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
        if (invite.group) {
            html += '<td>' + invite.group.name + '</td>';
        }
        else {
            html += '<td>???</td>'
        }
        html += '<td>' + invite.state + '</td>';
        html += '<td>';
        html += showInvitesAction(index, 'invite-accept-' + index, 'invite-accept', 'Accept', showInvitesDisableAccept(invite));
        html += showInvitesAction(index, 'invite-resend-' + index, 'invite-resend', 'Resend', showInvitesDisableResend(invite));
        html += showInvitesAction(index, 'invite-revoke-' + index, 'invite-revoke', 'Revoke', showInvitesDisableRevoke(invite));
        html += '</td>';
        html += '</tr>';
    });
    $("#invites-tbody").html("").html(html);
    $(".invite-accept").click(onInviteAcceptButton);
    $(".invite-resend").click(onInviteResendButton);
    $(".invite-revoke").click(onInviteRevokeButton);
    $(".invite-add").attr("disabled", !group);
    $("#invite-add-body").html("");
    if (group) {
        $("#invite-add-body").html("Please join us in the '" + group.name + "' social group.");
    }
    showOnly("invites-div");
}

// Return HTML for an action button for invites
function showInvitesAction(index, id, styleClass, label, disabled) {
    var html = '<button id="' + id + '" data-index="' + index + '"';
    if (styleClass) {
        html += ' class="' + styleClass + '"';
    }
    if (disabled) {
        html += ' disabled="disabled"';
    }
    html += '>' + label + '</button>';
    return html;
}

// Return true if the accept button should be disabled for this invite
function showInvitesDisableAccept(invite) {
    if (!invite.update) {
        return true;
    }
    if (!invite.user) {
        return true; // Cannot accept an invite sent to an email address
    }
    if (invite.user.username != viewer.username) {
        return true;
    }
    return (invite.state != 'processing') && (invite.state != 'sent') && (invite.state != 'fulfilled');
}

// Return true if the resend button should be disabled for this invite
function showInvitesDisableResend(invite) {
    if (!invite.update) {
        return true;
    }
    if (invite.inviter.username != viewer.username) {
        return true;
    }
    return (invite.state != 'processing') && (invite.state != 'sent') && (invite.state != 'fulfilled');
}

// Return true if the revoke button should be disabled for this invite
function showInvitesDisableRevoke(invite) {
    if (!invite.update) {
        return true;
    }
    if (invite.state == 'revoked') {
        return true;
    }
    return (invite.inviter.username != viewer.username);
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
    $("#member-add").attr("disabled", !group.members.create);
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

