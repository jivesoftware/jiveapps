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

// Currently selected document or discussion
var current;

// All discussions for this group
var discussions = [ ];

// All documents for this group
var documents = [ ];

// Currently selected group
var group;

// All visible groups
var groups = [ ];

// Factory for mini messages
var mini;

// Currently logged in user
var user;

// Create a new (empty) discussion and display it.
function createDiscussion() {
    current = {
        html : "",
        subject : ""
    };
    console.log("createDiscussion() = " + JSON.stringify(current));
    showNewDiscussion();
}

// Create a new (empty) document and display it.
function createDocument() {
    current = {
        html : "",
        subject : ""
    };
    console.log("createDocument() = " + JSON.stringify(current));
    showNewDocument();
}

// Delete current discussion
function deleteDiscussion() {
    console.log("deleteDiscussion() started");
    var isDeleteSupported = current.resources.self && $.inArray('DELETE', current.resources.self.allowed) != -1;
    if (!isDeleteSupported) {
        alert("You are not allowed to delete this discussion");
        return;
    }
    if (confirm("Really delete discussion '" + current.message.subject + "'?")) {
        showMessage("Deleting discussion '" + current.message.subject + "' ...");
        current.destroy().execute(function(response) {
            console.log("deleteDiscussion() response = " + JSON.stringify(response));
            loadDiscussions();
        });
    }
    else {
        loadDiscussions();
    }
}

// Delete current document
function deleteDocument() {
    console.log("deleteDocument() started");
    var isDeleteSupported = current.resources.self && $.inArray('DELETE', current.resources.self.allowed) != -1;
    if (!isDeleteSupported) {
        alert("You are not allowed to delete this document");
        return;
    }
    if (confirm("Really delete document '" + current.subject + "'?")) {
        showMessage("Deleting document '" + current.subject + "' ...");
        current.destroy().execute(function(response) {
            console.log("deleteDocument() response = " + JSON.stringify(response));
            loadDocuments();
        });
    }
    else {
        loadDocuments();
    }
}

// Forward the body of this document to the specified URL with a POST
function forwardDocument() {
    console.log("forwardMessage() started on " + JSON.stringify(current));
    var url = $("#document-url").val();
    if (!url || (url == "")) {
        mini.createDismissibleMessage("A url to which the document will be POSTed must be set");
        return;
    }
    osapi.http.post({
        authz : "signed",
        body : current.content.text,
        format : "json",
        headers : { "Content-Type" : [ "text/plain;charset=UTF-8" ] },
        href : url,
        noCache : true
    }).execute(function(response) {
        console.log("Forward response was " + JSON.stringify(response));
    });
}

// On-view-load initialization
function init() {
    registerHandlers();
    loadUser();
    mini = new gadgets.MiniMessage();
}

// Load the replies to the currently selected discussion
function loadDiscussionReplies() {
    console.log("loadDiscussionReplies() started");
    var root = current.messages.root;
    console.log("root message is " + JSON.stringify(root));
    root.get().execute(function(response) {
        console.log("get response is " + JSON.stringify(response));
        root = response.data;
        root.replies.get({}).execute(function(response) {
            console.log("replies response is " + JSON.stringify(response));
            var replies = response.data;
            showDiscussionReplies(replies);
        });
    });

}

// Load the discussions for this group
function loadDiscussions() {
    console.log("loadDiscussions() started");
    showMessage("Loading discussions for '" + group.name + "' ...");
    group.discussions.get({
        limit : 100
    }).execute(function(response) {
            console.log("loadDiscussions() response = " + JSON.stringify(response));
            var html = '<ul>';
            discussions = response.data;
            $.each(discussions, function(index, disc) {
                html += '<li>';
                html += '<a href="#" class="discussion-select" data-index="' + index + '">' + disc.message.subject + '</a>';
                html += ' (' + disc.viewCount + ' views)';
                html += '</li>';
            });
            html += '</ul>';
            $("#discussions-list").html("").html(html);
            $(".discussion-select").click(function () {
                var index = $(this).attr("data-index");
                current = discussions[index];
                $(".discussion-subject").html("").html(current.message.subject);
                showDiscussion();
            });
            showOnly("discussions-div");
        });
}

// Load the documents for this group
function loadDocuments() {
    console.log("loadDocuments() started");
    showMessage("Loading documents for '" + group.name + "' ...");
    group.documents.get({
        limit : 100
    }).execute(function(response) {
            console.log("loadDocuments() response = " + JSON.stringify(response));
            var html = '<ul>';
            documents = response.data;
            $.each(documents, function(index, doc) {
                html += '<li>';
                html += '<a href="#" class="document-select" data-index="' + index + '">' + doc.subject + '</a>';
                html += ' (' + doc.viewCount + ' views)';
                html += '</li>';
            });
            html += '</ul>';
            $("#documents-list").html("").html(html);
            $(".document-select").click(function () {
                var index = $(this).attr("data-index");
                current = documents[index];
                $(".document-subject").html("").html(current.subject);
                showDocument();
            });
            showOnly("documents-div");
        });
}

// Load all visible groups for this user
function loadGroups() {
    console.log("loadGroups() started");
    showMessage("Showing visible groups for '" + user.name + "' ...");
    showOnly("groups-div");
    var callback = function(response) {
        var data = response.data;
        console.log("selected group: ", JSON.stringify(data));
        console.log("selected group is an osapi.jive.core.Group? " + (data instanceof osapi.jive.core.Group));
        group = data;
        $(".group-name").html("").html(group.name);
        loadDocuments();
    };
    $('#select-group-button').unbind().bind("click", function() {
        osapi.jive.core.places.requestPicker({success: callback, placeType: "group", contentType: "document"});
    });
}

// Load the currently logged in user
function loadUser() {
    console.log("loadUser() started");
    showMessage("Loading the currently logged in user ...");
    osapi.jive.core.users.get({
        id : '@viewer'
    }).execute(function(response) {
            console.log("loadUser() response = " + JSON.stringify(response));
            user = response.data;
            $(".user-name").html("").html(user.name);
            loadGroups();
        });
}

// Register UI event handlers
function registerHandlers() {
    $(".back-to-discussions").click(function() {
        loadDiscussions();
    });
    $(".back-to-documents").click(function() {
        loadDocuments();
    });
    $(".back-to-groups").click(function() {
        loadGroups();
    });
    $(".discussion-cancel").click(function() {
        loadDiscussions();
    });
    $(".discussion-create").click(function() {
        createDiscussion();
    });
    $(".discussion-delete").click(function() {
        deleteDiscussion();
    });
    $(".discussion-save").click(function() {
        saveDiscussion();
    });
    $(".document-cancel").click(function() {
        loadDocuments();
    });
    $(".document-create").click(function() {
        createDocument();
    });
    $(".document-delete").click(function() {
        deleteDocument();
    });
    $(".document-forward").click(function() {
        forwardDocument();
    });
    $(".document-save").click(function() {
        saveDocument();
    });
}

// Save current (new or existing) discussion
function saveDiscussion() {
    if (current.id) {
        console.log("saveDiscussion(old) started");
        showMessage("Updating existing discussion ...");
        console.log("Get the root message, which should be " + JSON.stringify(current.messages.root));
        current.messages.root.get().execute(function(response) {
            console.log("Root message response is " + JSON.stringify(response));
            var message = response.data;
            var isUpdateSupported = message.resources.self && $.inArray('PUT', message.resources.self.allowed) != -1;
            if (!isUpdateSupported) {
                alert("You are not allowed to update this discussion");
                loadDiscussions();
                return;
            }
            message.subject = $("#discussion-subject").val();
            message.content.text = $("#discussion-text").val();
            console.log("Update the root message");
            message.update().execute(function(response) {
                console.log("Update response = " + JSON.stringify(response));
                loadDiscussions();
            });
        });
    }
    else {
        console.log("saveDiscussion(new) started");
        showMessage("Saving new discussion ...");
        current.subject = $("#new-discussion-subject").val();
        current.html = $("#new-discussion-html").val();
        group.discussions.create(current).execute(function(response) {
            console.log("saveDiscussion(new) response = " + JSON.stringify(response));
            loadDiscussions();
        });
    }
}

// Save current (new or existing) document
function saveDocument() {
    if (current.id) {
        console.log("saveDocument(old) started");
        var isUpdateSupported = current.resources.self && $.inArray('PUT', current.resources.self.allowed) != -1;
        if (!isUpdateSupported) {
            alert("You are not allowed to update this document");
            return;
        }
        showMessage("Updating existing document ...");
        current.subject = $("#document-subject").val();
        current.content.text = $("#document-text").val();
        current.update().execute(function(response) {
            console.log("Update response = " + JSON.stringify(response));
            loadDocuments();
        });
    }
    else {
        console.log("saveDocument(new) started");
        showMessage("Saving new document ...");
        current.subject = $("#new-document-subject").val();
        current.html = $("#new-document-html").val();
        group.documents.create(current).execute(function(response) {
            console.log("saveDocument(new) response = " + JSON.stringify(response));
            loadDocuments();
        });
    }
}

// Show the existing discussion in "current"
function showDiscussion() {
    console.log("showDiscussion() started");
    var name = current.author ? current.author.name : "(Yourself)";
    $("#discussion-author").html("").html(name);
    $("#discussion-creationDate").html("").html(current.message.creationDate);
    $("#discussion-likeCount").html("").html(current.message.likeCount);
    $("#discussion-modificationDate").html("").html(current.message.modificationDate);
    $("#discussion-replies").hide();
    $("#discussion-replyCount").html("").html(current.message.replyCount);
    $("#discussion-status").html("").html(current.message.status);
    $("#discussion-subject").attr("value", current.message.subject);
    $("#discussion-text").html("").html(current.message.content.text);
    $("#discussion-viewCount").html("").html(current.viewCount);
    showOnly("discussion-div");
    loadDiscussionReplies();
}

// Show the specified top level replies for the current discussion
function showDiscussionReplies(replies) {
    var html = "<hr>";
    if (replies) {
        $.each(replies, function(index, reply) {
            html += '<p>Reply ' + (index + 1) + ' by ' + reply.author.name + '</p>';
            html += '<p>' + reply.content.text + '</p>';
            if (reply.replyCount && (reply.replyCount > 0)) {
                html += '<p>' + reply.replyCount + ' replies (not shown)' + '</p>'
            }
            html += '<hr>';
        });
    }
    $("#discussion-replies").html("").html(html).show();
    gadgets.window.adjustHeight();
}

// Show the existing document in "current"
function showDocument() {
    console.log("showDocument() started");
    var name = current.author ? current.author.name : "(Yourself)";
    $("#document-author").html("").html(name);
    $("#document-creationDate").html("").html(current.creationDate);
    $("#document-likeCount").html("").html(current.likeCount);
    $("#document-modificationDate").html("").html(current.modificationDate);
    $("#document-replyCount").html("").html(current.replyCount);
    $("#document-status").html("").html(current.status);
    $("#document-subject").attr("value", current.subject);
    $("#document-text").html("").html(current.content.text);
    $("#document-viewCount").html("").html(current.viewCount);
    $("#document-url").html("");
    showOnly("document-div");
}

// Show the specified status message
function showMessage(message) {
    $("#status-message").html("").html(message);
    showOnly("status-div");
}

// Show the new discussion in "current"
function showNewDiscussion() {
    console.log("showNewDiscussion() started");
    $("#new-discussion-subject").attr("value", current.subject);
    $("#new-discussion-html").html("").html(current.html);
    showOnly("new-discussion-div");
}

// Show the new document in "current"
function showNewDocument() {
    console.log("showNewDocument() started");
    $("#new-document-subject").attr("value", current.subject);
    $("#new-document-html").html("").html(current.html);
    showOnly("new-document-div");
}

// Show only the specified top level div
function showOnly(id) {
    $(".top-level-div").hide();
    $("#" + id).show();
    gadgets.window.adjustHeight();
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);
