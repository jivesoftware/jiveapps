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

jive = jive || {};
jive.fbldr = jive.fbldr || {};

$j = jQuery.noConflict();

jive.fbldr.dataFilter = function(data, type) {
    return type === 'json' ? $j.trim(data.replace(/^throw [^;]*;/, '')) : data;
};

jive.fbldr.isDebug = function() {
	if (gadgets) {
		var prefs = new gadgets.Prefs();
		return prefs.getBool("fbldr_debug");
	}
	else {
		return true;
	}
}

jive.fbldr.isEmbedded = function() {
    return ($j("body#fbldr-body-embed").length > 0);
}

jive.fbldr.isVer3 = function() {
    if (gadgets && gadgets.util) {
        return gadgets.util.hasFeature("jive-core-v3");
    }
    else {
        return false;
    }
}

jive.fbldr.errorMessage = function(msg) {
    var $p = $j('<p/>').html(msg);
    $j('<div title="Error"/>').append($p).dialog({modal: true}); 
};

jive.fbldr.successMessage = function(msg) {
    var $p = $j('<p/>').html(msg);
    $j('<div title="Success"/>').append($p).dialog({modal: true}); 
};

jive.fbldr.updateTags = function(postResponse, contentType, tags, callback) {
    if (!jive.fbldr.isVer3() || postResponse.error) {
        callback(postResponse);
        return;
    }
    
    var descriptor = (contentType == "document" ? "102" : "1")
        + "," + postResponse.content.id;

    osapi.jive.corev3.contents.get({ entityDescriptor: descriptor }).execute(function(response) {
        if (response.error) {
            callback(postResponse);
            return;
        }
        
        var content = response.list[0];
        content.tags = tags;
        
        // console.log("Updating tags on content", tags, content);
        
        content.update().execute(function(response) {
            if (response.error) {
                console.log("Error updating tags on content", postResponse, response);
            }
            callback(postResponse);
        });
    });
};

(function ($) {
    $.extend({      
        getQueryString: function (name) {           
            function parseParams() {
                try {
                    var params = {},
                        e,
                        a = /\+/g,  // Regex for replacing addition symbol with a space
                        r = /([^&=]+)=?([^&]*)/g,
                        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                        q = window.parent.location.search.substring(1);
    
                    while (e = r.exec(q))
                        params[d(e[1])] = d(e[2]);
    
                    return params;
                }
                catch(e) {
                    // handle security exception in case apps are not in same domain as site
                    return {};
                }
            }

            if (!this.queryStringParams)
                this.queryStringParams = parseParams(); 

            return this.queryStringParams[name];
        },
        getViewParam: function (name) {
            if (gadgets) {
                var viewParams = gadgets.views.getParams();
                return viewParams[name];
            }
            else {
                return null;
            }
        }
    });
})(jQuery);
