/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.ContentCreator = function(template, form) {
    
    var prefs = new gadgets.Prefs();
    
    var create = function(callback) {
    	var type = template.content.type;
        var title = parse(template.content.title);
        var body = parse(template.content.body);
        
        if (jive.fbldr.isEmbedded()) {
            osapi.jive.core.container.editor().insert(body);
        }
        else if (type == 'message') {
        	getUsers(function(users) {
        		if (users.error) {
        		    callback({ error: users.error });
        		}
        		else {
        			createMessage(users, { title: title, body: body }, callback);
        		}
        	});
        }
        else {
            var tags = getFormTags();
            
        	getContainer(function(container) {
        		if (container.error) {
        		    callback({ error: container.error });
        		}
        		else {
        			createContent(container, { title: title, body: body, tags: tags }, callback);
        		}
        	});
        }
    };
    
    var preview = function() {
        var title = parse(template.content.title);
        var body = parse(template.content.body);
        var tags = getFormTags();
        
        return {
            title: title,
            body: body,
            tags: tags
        }
    };
    
    var parse = function(text) {
        var replaced = text;
        for (var i = 0; i < template.fields.length; i++) {
            var field = template.fields[i];
            
            if (field.type == 'tags') {
                continue;
            }
            
            var value = getFieldValue(field);
            
            var elseRegex = new RegExp("\\{if \\$" + field.id + "\\}([\\\s\\\S]*?)\\{else\\}([\\\s\\\S]*?)\\{\\/if\\}", "g");
            var ifRegex   = new RegExp("\\{if \\$" + field.id + "\\}([\\\s\\\S]*?)\\{\\/if\\}", "g");
            var valueRegex = new RegExp("\\{\\$" + field.id + "\\}", "g");
            var labelRegex = new RegExp("\\{\\$" + field.id + "\\.label\\}", "g");
            
            if (!value) {
                replaced = replaced.replace(elseRegex, "$2");
                replaced = replaced.replace(ifRegex, "");
            }
            else {
                replaced = replaced.replace(elseRegex, "$1");
                replaced = replaced.replace(ifRegex, "$1");
            }
            
            replaced = replaced.replace(valueRegex, value);
            replaced = replaced.replace(labelRegex, field.label);
        }
        return replaced;
    };
    
    var getFieldValue = function(field) {
        var value;
        
        if (field.type == "link") {
            value = getLinkValue(field);
        }        
        else if (field.type == "list") {
            value = getListValues(field);
        }
        else if (field.type == "multi-select") {
            value = getMultiSelectValues(field);
        }
        else if (field.type == "userpicker") {
            value = getUserPickerValues(field);
        }
        else if (field.type == "userselect") {
            value = getUserSelectValues(field);
        }
        else {
            value = getSafeValue(field);
        }
        
        return value;
    };
    
    var convertItemsToList = function(field, items) {
        var style = field.listStyle;
        
        if (!items) {
            return '';
        }
        else if (style == 'comma') {
            return items.join(', ');
        }
        else {
            return jive.fbldr.soy.list({
               items: items,
               ordered: (style == 'ordered'),
               unstyled: (style == 'none')
            });
        }
    }

    var getLinkValue = function(field) {
        var href = getSafeValue(field) || '';
        var label = getSafeValue({ id: field.id + '-text' }) || '';
        
        if (href.length > 0 && label.length <= 0) {
            return '<a href="' + href + '">' + href + '</a>';
        }
        else if (href.length <= 0 && label.length > 0) {
            return label;
        }
        else if (href.length > 0 && label.length > 0) {
            return '<a href="' + href + '">' + label + '</a>';
        }
        else {
            return '';
        }
    };
    
    var getListValues = function(field) {
        var items = splitValues(field);
        return convertItemsToList(field, items);
    };
    
    var splitValues = function(field, separator) {
        if (!separator) {
            separator = ',';
        }
        
        var items = new Array();
        var values = getSafeValue(field, true).split(separator);
        for (var i = 0; i < values.length; i++) {
            var value = $j.trim(values[i]);
            if (value) {
                items.push(value);
            }
        }
        return items;
    };

    var getMultiSelectValues = function(field) {
        var items = $j(form).find("#fbldr-field-" + field.id).val();
        return convertItemsToList(field, items);
    };
    
    var getUserPickerValues = function(field) {
        var userLinks = new Array();
        var users = $j(form).find("#fbldr-field-" + field.id).find('li');
        for (var i = 0; i < users.length; i++) {
            var id = $j(users[i]).attr('userid');
            var name = $j(users[i]).attr('username');
            userLinks.push(jive.fbldr.soy.userlink({ userId: id, name: name }));
        }
        return convertItemsToList(field, userLinks);
    };

    var getUserSelectValues = function(field) {
        // TODO: This doesn't work with !app, and we don't currently have names
        var userLinks = new Array();
        var userIds = $j(form).find("#fbldr-field-" + field.id).val().split(",");
        for (var i = 0; i < userIds.length; i++) {
            var id = $j.trim(userIds[i]);
            userLinks.push(jive.fbldr.soy.userlink({ userId: id, name: '' }));
        }
        return convertItemsToList(field, userLinks);
    };
    
    var getSafeValue = function(field, clearNewlines) {
    	return sanitizeValue($j(form).find("#fbldr-field-" + field.id), clearNewlines);
    };
    
    var sanitizeValue = function(element, clearNewlines) {
        if (clearNewlines == null) {
            clearNewlines = false;
        }
        
        var value = $j(element).val();
        value = $j.trim(value);
        value = $j('<div/>').text(value).html(); // escapes html tags, etc.
        value = value.replace(/\n/g, clearNewlines ? '' : '<br/>');
        return value;    	
    };
    
    var getFormTags = function() {
        // Get the tags included with the template
        var tags = template.content.tags || [];
        
        // Get any user-entered tags
        for (var i = 0; i < template.fields.length; i++) {
            var field = template.fields[i];
            
            if (field.type == 'tags') {
                var items = splitValues(field, /[\s,]+/);
                if (items && items.length > 0) {
                    tags = tags.concat(items);
                }
            }
        }
        
        return tags;
    };
    
    var createMessage = function(users, content, callback) {
    	if (jive.fbldr.isDebug()) {
    		console.log("Create message for users: ", users);
    		console.log("Content title: ", content.title);
    		console.log("Content body: ", content.body);
    	}

    	var data = {
    	    html: '<p>' + content.title + '</p><p>' + content.body + '</p>',
    	    participant: []
    	};
    	
    	var baseUrl = getBaseUrl();

    	for (var i = 0; i < users.length; i++) {
    		var user = users[i];
    		data.participant.push(baseUrl + '/api/core/v2/users/' + user.id);
    	}

    	osapi.jive.core.directmessages.create(data).execute(function(response) {
            if (response.error) {
                callback({ error: response.error.message });
            }
            else {
                var message = response.data;
                message.contentType = "message";
                message.href = "/inbox/dm/" + response.data.id;
                message.subject = content.title;

                doActions(message, callback);
            }
    	});
    };    

    var createContent = function(container, content, callback) {
    	if (jive.fbldr.isDebug()) {
    		console.log("Create content in container: ", container);
    		console.log("Content title: ", content.title);
    		console.log("Content body: ", content.body);
    		console.log("Content tags: ", content.tags);
    	}
    	
        var containerType = container.containerType;
        var containerId = container.containerId;
        
        var contentType = template.content.type;
        var data = { subject: content.title, html: content.body }; 
        
        if (contentType == "document") {
            contentType = "document";
        }
        else if (contentType == "discussion" || contentType == "question") {
            data.question = (contentType == "question");
            contentType = "discussion";
        }
        else {
            var error = "Unable to create content of unknown type: " + contentType;
            callback({ error: error });
            return;
        }
        
        if (content.tags && content.tags.length > 0 && jive.fbldr.isVer3()) {
            var origCallback = callback;
            callback = function(response) {
                jive.fbldr.updateTags(response, contentType, content.tags, origCallback);
            };
        }
        
        if (containerType == "group") {
            postToGroup(containerId, contentType, data, callback);
        }
        else if (containerType == "project") {
            postToProject(containerId, contentType, data, callback);
        }
        else if (containerType == "space") {
            postToSpace(containerId, contentType, data, callback);
        }
    };
    
    var postToGroup = function(groupId, contentType, data, callback) {
        osapi.jive.core.groups.get({id: groupId}).execute(function(response) {
        	doPost(response, contentType, data, callback);
        });
    };

    var postToProject = function(projectId, contentType, data, callback) {
        osapi.jive.core.projects.get({id: projectId}).execute(function(response) {
        	doPost(response, contentType, data, callback);
        });
    };    

    var postToSpace = function(spaceId, contentType, data, callback) {
        osapi.jive.core.spaces.get({id: spaceId}).execute(function(response) {
            doPost(response, contentType, data, callback);
        });
    };
    
    var doPost = function(response, contentType, data, callback) {
        if (response.error) {
            callback({ error: response.error.message });
            return;
        }

        var container = response.data;
        
        if (contentType == "discussion") {
            postDiscussion(container, data, callback); 
        }
        else if (contentType == "document") {
            postDocument(container, data, callback);
        }
    };
    
    var postDiscussion = function(container, data, callback) {
        container.discussions.create(data).execute(function(response){
            if (response.error) {
                callback({ error: response.error.message });
            }
            else {
                var discussion = response.data;
                discussion.contentType = (data.question) ? "question" : "discussion";
                discussion.href = "/threads/" + response.data.id;
                discussion.subject = data.subject;
                
                /* 
                 * Currently cannot add attachments or images to discussions, at least
                 * not when using Jive Core API v2, revisit when moving to Core API v3
                 *
                if (template.content.includeAttachment) {
                	addAttachments(template, discussion, callback);
                }
                else {
                    doActions(discussion, callback);
                }
                 */
	
                doActions(discussion, callback);
            }
        });
    };

    var postDocument = function(container, data, callback) {
        container.documents.create(data).execute(function(response){
            if (response.error) {
                callback({ error: response.error.message });
            }
            else {
                var document = response.data;
                document.contentType = "document";
                document.href = "/docs/DOC-" + response.data.id;
                document.subject = data.subject;

                if (template.content.includeAttachment) {
                	addAttachments(template, document, callback);
                }
                else {
                    doActions(document, callback);
                }
            }
        });
    };
    
    var addAttachments = function(template, content, callback) {
        if (!content.attachments) {
            content.attachments = [];
        }
        
    	var dirty = false;
    	
        $j('#fbldr-dialog').html(jive.fbldr.soy.attachments({
        	variables: getHtmlVariables(content.content.text)
        })).dialog({
        	buttons: { 
        	    Finished: function() {
        		    $j(this).dialog("close");
        	    }
            },
        	closeOnEscape: false,
        	modal: true,
        	title: "Add Attachments",
        	close: function() {
            	if (dirty) {
            		content.update().execute(function(response) {
            			doActions(content, callback);
            		});
            	}
            	else {
            	    doActions(content, callback);
            	}
            }
        }); 
    	
        $j('#fbldr-attach-file').click(function() {
            $j("#fbldr-attach-file").attr("disabled", "disabled");
            $j("#fbldr-attach-link").attr("disabled", "disabled");
            
        	content.requestAttachmentUpload(function(attachment) {
        	    if (attachment && attachment.id) {
        	        handleAttachmentUpload(attachment);
        	    }
        	    else {
        	        content.get().execute(function(response) {
                        try {
            	            if (response.error) {
            	                handleAttachmentUpload();
            	            }
            	            else {
            	                handleAttachmentUpload(getNewAttachment(content, response.data));
            	            }
                        }
                        catch (e) {
                            console.log('Error adding attachment', e);
                        }
        	        });
        	    }
            }, {
                dialogTitle: "Form Attachment",
                instructionMsg: "Select a file to attach to the content being created by the form."
            });
        });
        
        var handleAttachmentUpload = function(attachment) {
            if (!attachment) {
                $j("#fbldr-attach-file").removeAttr("disabled");
                $j("#fbldr-attach-link").removeAttr("disabled");
                return;
            }

            console.log("Added attachment:", attachment);   
            content.attachments.push(attachment);
            
            var linkField = $j("#fbldr-attach-link");
            var linkTo = sanitizeValue(linkField);
            if (linkTo) {
                var parsedText = parseAttachment(linkTo, content, attachment);
                content.content.text = parsedText;
                $j('#fbldr-attach-link').find('option[value="' + linkTo + '"]').remove();
            }
            $j(linkField).val("");
            $j('#fbldr-attach-files').append(jive.fbldr.soy.attachFile({
                attachment: attachment,
                linkTo: linkTo
            }));
            
            $j("#fbldr-attach-file").removeAttr("disabled");
            $j("#fbldr-attach-link").removeAttr("disabled");
            
            dirty = true;
        };
        
        var getNewAttachment = function(oldContent, newContent) {
            if (!newContent || !newContent.attachments) {
                return null;
            }
            
            var oldAttaches = oldContent.attachments || [];
            var newAttaches = newContent.attachments || [];
            
            for (var i = 0; i < newAttaches.length; i++) {
                if (!containsAttach(oldAttaches, newAttaches[i])) {
                    return newAttaches[i];
                }
            }
            
            return null;
        };
        
        var containsAttach = function(oldAttaches, newAttach) {
            var contains = false;
            
            for (var i = 0; i < oldAttaches.length; i++) {
                if (newAttach.id == oldAttaches[i].id) {
                    contains = true;
                    break;
                }
            }
            
            return contains;
        };
    };
    
    var getHtmlVariables = function(text) {
    	var variables = [];
    	
    	var varRegex = new RegExp("\\{\\$(.*?)\\.(?:link|img)\\}", "g");
    	var match;
    	
    	while (match = varRegex.exec(text)) {
    		var variable = match[1];
    		if (variables.indexOf(variable) < 0) {
    			variables.push(variable);
    		}
    	}
    	
    	return variables.sort();
    };
    
    var parseAttachment = function(linkTo, content, attachment) {    	
        var replaced = content.content.text;
        
        var config = {
            filename: attachment.name,
            attachId: attachment.id,
            docId: content.id
        };
        
        var linkRegex = new RegExp("\\{\\$" + linkTo + "\\.link\\}", "g");
        replaced = replaced.replace(linkRegex, jive.fbldr.soy.attachLink(config));

        if (attachment.contentType && attachment.contentType.indexOf('image') == 0) {
            var imgRegex = new RegExp("\\{\\$" + linkTo + "\\.img\\}", "g");
            replaced = replaced.replace(imgRegex, jive.fbldr.soy.attachImage(config));
        }
        
        return replaced;
    };
    
    var doActions = function(content, callback) {
        content.href = getBaseUrl() + content.href;
        callback({ content: content, error: null });
    };

    var getBaseUrl = function() {
        if (gadgets && gadgets.util) {
            return gadgets.util.getUrlParameters().parent;    
        }

        var baseUrl =
            window.location.protocol + '//' +
            window.location.host +
            ((window.location.port) ? ':' + window.location.port : '');
        
        return baseUrl;
    };
    
    var getContainer = function(callback) {
    	var container = {
    	    containerType: $j.getViewParam('locationType'),
    	    containerId: parseInt($j.getViewParam('locationId'))
    	};
    	
    	if (isValidContainer(container)) {
    		console.log("Got place from URL: ",  container);    		
    		callback(container);
    	}
    	else {
    		var contentType = (template.content.type == "document") ? "document" : "discussion";
    		
    		osapi.jive.core.places.requestPicker({
                success: function(response) {
    			    if (!response.data) {
    			    	callback({ error: "Invalid place selected: must be a space, project, or group." });
    			    	return;
    			    }
    		
    			    var place = response.data;
    			
    			    console.log('Got place from chooser: ', place); 
    			    
    			    var uri = place.resources.self.ref;
    			    
    			    if (uri.indexOf('/spaces/') >= 0) {
    			    	container.containerType = "space";
    			    }
    			    else if (uri.indexOf('/groups/') >= 0) {
    			        container.containerType = "group";
    		        }
    			    else {
    			        container.containerType = "project";
    		        }
    		        
    		        container.containerId = place.id;
    			    
    		        if (isValidContainer(container)) {
    		            callback(container);
    		        }
    		        else {
    		        	callback({ error: "Invalid place selected: must be a space, project, or group." })
    		        }
                },
        	    error: function(response) {
                	callback({ error: response.message });
                },
                contentType: contentType
            });
    	}
    };
    
    var isValidContainer = function(container) {
    	if (!container) {
    		return false;
    	}
    	
    	var containerType = container.containerType;
    	var containerId = container.containerId;
    	
        if (!containerType || (containerType != "group" && containerType != "project" && containerType != "space")) {
            return false;
        }
        if (isNaN(containerId) || containerId <= 0) {
            return false;
        }
        return true;
    };
    
    var getUsers = function(callback) {
    	var user = {
    		id: parseInt($j.getViewParam('userId'))
    	};
    	
    	if (isValidUser(user)) {
    		console.log("Got user from URL: ",  user);    		
    		callback([ user ]);
    	}
    	else {
            osapi.jive.core.users.requestPicker({
                multiple : true,
                success : function(response) {
    			    if (!response.data) {
    			    	callback({ error: "Invalid user selected." });
    			    	return;
    			    }
            	
                    var users;
                    if ($j.isArray(response.data)) {
                        users = response.data;
                    } else {
                        users = new Array();
                        users.push(response.data);
                    }
                    
                    console.log('Got users from chooser: ', users);
                    
                    if (users.length > 0) {
                        callback(users);
                    }
                    else {
                    	callback({ error: 'No users selected.' });
                    }
                },
                error : function(error) {
                	callback({ error: response.message });
                }
            });
    	}
    };

    var isValidUser = function(user) {
    	if (!user) {
    		return false;
    	}
    	
    	var userId = user.id;
    	
        if (isNaN(userId) || userId <= 0) {
            return false;
        }
        return true;
    };
            
    return {
        create: create,
        preview: preview
    };
    
}
