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
