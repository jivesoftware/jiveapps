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

jive.fbldr.JiveTemplateSource = function(options) {
    
    var infoId = options.infoId;
    var info = "#" + infoId;
    var loadId = "fbldr-load";
    var load = "#" + loadId;
    var menuId = "fbldr-menu";
    var menu = "#" + menuId;
    var progId = "fbldr-load-progress";
    var prog = "#" + progId;
    
    var onLoad = options.onLoad;
    
    var prefs = new gadgets.Prefs();
    
    var templates = [];
    var docsFound = 0;
    var docsLoaded = 0;

    var loadTemplates = function() {
        templates = [];
        docsFound = 0;
        docsLoaded = 0;
        
        showLoading();
        updateProgress(0);
        searchDocuments();
	};
	
	var searchDocuments = function() {
	    var docs = prefs.getString('fbldr_docs').replace(/\s+/g, '').replace(/DOC-/gi, '').split(",");
        var tags = prefs.getString('fbldr_tags').replace(/\s*,\s*/g, ' OR ');
        
        var request = osapi.jive.core.searches.searchContent({query: tags, limit: 100, type: ['document']});
        request.execute(function(response) {
            var results = response.data || [];
            
            for (var i = 0; i < results.length; i++) {
                var doc = results[i];
                var docRef = doc.resources.self.ref; 
                var docId = docRef.substring(docRef.lastIndexOf("/") + 1);
                
                if ($j.inArray(docId, docs) < 0) {
                    docs.push(docId);
                }
            }
            
            getDocuments(docs);
        });
	};
	
	var checkComplete = function(forceComplete) {
	    if (!forceComplete && (docsFound != docsLoaded)) {
	        return;
	    }
	    
	    if (forceComplete) {
	        updateProgress(100);
	    }
	    
	    // Let the progress bar sit full for a brief moment
        setTimeout(complete, 250);
	};
	
	var complete = function() {
        hideLoading();
        showMenu();
        
        if (onLoad) {
            onLoad(templates);
        }
        else {
            console.log('Error: no onLoad callback specified for template source');
        }
	}
	
    var docLoaded = function(forceLoad) {
        docsLoaded++;
        updateProgress(Math.round(docsLoaded / docsFound * 100));
        checkComplete();
    };
	
	var getDocuments = function(docs) {
		docsFound = docs.length;
		
		if (docsFound == 0) {
		    checkComplete(true);
		    return;
		}

		for (var docIndex = 0; docIndex < docs.length; docIndex++) {
			var docId = docs[docIndex];

			var request = osapi.jive.core.documents.get({id: docId});
			request.execute(function(response) {
			    if (!response.data) {
			        docLoaded();
			        return;
			    }

			    var document = response.data;
                var text = $j("<div/>").html(document.content.text).html()
                text = text.replace(/\n/g,'').replace(/&nbsp;/g,' ');
                
                var regex = /<pre.*?>(.*?)<\/pre>/gi;
                var match = regex.exec(text);
                
                // if no template content, we're done with this doc
                if (match == null) {
                    docLoaded();
                    return;
                }
                
                var matches = [];
                
                while (match != null) {
                    matches.push(match[1]);
                    match = regex.exec(text);
                }
                
                parseTemplates(matches, document.subject);
			});
		}
	};
	
	var parseTemplates = function(unparsedTemplates, defaultCategory) {
	    var parsedTemplates = [];
	    
	    var handleParsedTemplate = function(template) {
	        parsedTemplates.push(template);
	        if (parsedTemplates.length == unparsedTemplates.length) {
	            handledParsedTemplates(parsedTemplates);
	        }
	    };
	    
	    for (var i = 0; i < unparsedTemplates.length; i++) {
	        parseTemplate(unparsedTemplates[i], defaultCategory, handleParsedTemplate);
	    }
	};
	
	var parseTemplate = function(text, defaultCategory, callback) {
	    var template = null;
        
        try {
            text = $j("<div/>").html(text).text();
            template = $j.parseJSON(text);
            template.defaultCategory = defaultCategory;

            var validator = new jive.fbldr.TemplateValidator(template, function() {
                callback(template);
            });
        }
        catch (error) {
        	if (!template) {
        		template = {};
        	}
        	
            var msg = 'Error validating template: ' + error.message + '\n' + text;
            console.log(msg);
            template.errors = [ msg ];
            callback(template);
        }  
	}
	
	var handledParsedTemplates = function(parsedTemplates) {
	    for (var i = 0; i < parsedTemplates.length; i++) {
	        templates.push(parsedTemplates[i]);
	    }
        docLoaded();
	};
	
	var getLoading = function() {
	    var loading = $j(info).find(load);
	    if (loading.length == 0) {
	        loading = $j(info).append(jive.fbldr.soy.load()).find(load);
	    }
	    return loading;
	};
	
	var updateProgress = function(value) {
	    var $progressbar = $j(info).find(prog);
	    $progressbar.find('.fbldr-progress-text').html( value + '%');
	    return $progressbar.progressbar({value : value});
	};
	
	var hideLoading = function() {
	    getLoading().hide();
	};
	
	var showLoading = function() {
	    getLoading().show();
	};
	
	var showMenu = function() {
        $j(menu + '-create').show();
        $j(menu + '-help').show();
        $j(menu + '-forms').hide();
	    
	    $j(menu).fadeIn();
	};
	
	return {
		loadTemplates: loadTemplates
	};
};

jive.fbldr.FakeTemplateSource = function(options) {
    
    var onLoad = options.onLoad;
    
    var abcTemplate = {
        "category": "My Templates",
        "name": "ABC Template",
        "desc": "This is a template that I use to record stuff.",
        "fields": [
            { "type": "userpicker", "id": "who", "label": "Who", "required": true },
            { "type": "text", "id": "what", "label": "What", "value": "this is what" },
            { "type": "text", "id": "why", "label": "Why", "value": "this is why" },
            { "type": "text", "id": "where", "label": "Where", "value": "this is where" },
            { "type": "date", "id": "when", "label": "When", "title": "Pick a date, any date." },
            { "type": "textarea", "id": "how", "label": "How", "value": "this is how" },
            { "type": "text", "id": "quantity", "label": "How Many", "value": "this is how many", "title": "Must be a number", "patterns": ["\\d+"] },
            { "type": "boolean", "id": "like", "label": "Like", "value": true }
        ],
        "content": {
            "type": "document",
            "title": "A {$what} is Happening",
            "body": "&lt;body&gt;&lt;div&gt;&lt;h4&gt;For&lt;/h4&gt;{$who}&lt;/div&gt;&lt;div&gt;&lt;h4&gt;{$why.label}&lt;/h4&gt;&lt;span&gt;{$why}&lt;/span&gt;&lt;/div&gt;&lt;div&gt;&lt;h4&gt;{$where.label}&lt;/h4&gt;&lt;span&gt;{$where}&lt;/span&gt;&lt;/div&gt;&lt;div&gt;&lt;h4&gt;{$when.label}&lt;/h4&gt;&lt;span&gt;{$when}&lt;/span&gt;&lt;/div&gt;&lt;div&gt;&lt;h4&gt;{$how.label}&lt;/h4&gt;&lt;span&gt;{$how}&lt;/span&gt;&lt;/div&gt;&lt;div&gt;&lt;h4&gt;Liked?&lt;/h4&gt;&lt;span&gt;{$like}&lt;/span&gt;&lt;/div&gt;&lt;/body&gt;"
        }
    };

    var myTemplate = {
        "category": "My Templates",
        "name": "A Template",
        "desc": "This is a template that I use to do stuff.",
        "fields": [
            { "type": "text", "id": "firstName", "label": "First Name", "required": true },
            { "type": "text", "id": "lastName", "label": "Last Name", "required": true },
            { "type": "text", "id": "email", "label": "Email" },
            { "type": "text", "id": "phone", "label": "Phone" },
            { "type": "text", "id": "ipaddr", "label": "IP Address", "title": "A valid IP address (ex: 192.168.1.1)", "patterns": ["\\d{1,4}\\.\\d{1,4}\\.\\d{1,4}\\.\\d{1,4}"], "patternError": "valid IP address" },
            { "type": "select", "id": "contact", "label": "Best Contact", "values": [{"value":"immediately","label":"Now"}, {"value":"soon","label":"Later"},{"value":"future","label":"Never"}], "value": "future" },
            { "type": "textarea", "id": "notes", "label": "Notes" }
        ],
        "content": {
            "type": "discussion",
            "title": "A Discussion Title",
            "body": "&lt;body&gt;Discussion Body&lt;/body&gt;"
        }
    };

    var yourTemplate = {
        "category": "Your Templates",
        "name": "Message Template",
        "desc": "This is a template that I use to message stuff.",
        "fields": [
            { "type": "text", "id": "msgTo", "label": "To", "required": true, "title": "Who are you sending this to?" },
            { "type": "text", "id": "msgFrom", "label": "From", "required": true, "title": "This should be you." },
            { "type": "userselect", "id": "msgCopy", "label": "CC", "required": true, "values": [{"value":"3218,3378","label":"Developers"},{"value":"3218","label":"Fernando"},{"value":"3378","label":"Monte"}] },
            { "type": "text", "id": "msgSubj", "label": "Subject", "required": true, "title": "What is this regarding?" },
            { "type": "textarea", "id": "msgBody", "label": "Message", "title": "This is the body of your message." },
            { "type": "select", "id": "msgSend", "label": "Send Via", "values": ["Email", "IM", "Text"], "required": true  }
        ],
        "content": {
            "type": "question",
            "title": "A Question",
            "body": "&lt;body&gt;Question Body&lt;/body&gt;"
        }
    };
    
    var errorTemplate = {
        "category": "Your Templates",
        "name": "Error Template",
        "fields": [
            { "type": "invalid", "id": "invalidType", "label": "Invalid Type" },
            { "id": "missingType", "label": "Missing Type" },
            { "type": "text", "label": "Missing ID" },
            { "type": "text", "id": "missingLabel" }
        ],
        "content": {
        }
    };
    
    var loadTemplates = function() {
        if (onLoad) {
            onLoad([ abcTemplate, myTemplate, yourTemplate, errorTemplate ]);
        }
        else {
            console.log('Error: no onLoad callback specified for template source');
        }
    };
    
    return {
        loadTemplates: loadTemplates 
    };
    
};
