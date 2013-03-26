/**
   Copyright 2013 Jive Software
 
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
**/

$ = require('jquery');
path = require('path');
http = require('http');
https = require('https');
url = require('url');
qs = require('querystring');

exports.S4 = function() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
exports.guid = function() {
  var S4 = exports.S4;
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

exports.escapeMessage = function(message) {

    // message = message.replace(/<script>/ig, "&lt;script&gt;");
    // message = message.replace(/<\/script>/ig, "&lt;/script&gt;");
    // message = message.replace(/<img /ig, "<span >");
    // message = message.replace(/javascript:/ig, "");

    var cleanMessage = '';
    saveOnlyAnchors($('<body>' + message + '</body>'));
    return cleanMessage;

    function saveOnlyAnchors($message) {
	$message.each(function(index, el) {
	    if(el.nodeName == 'A') {
		cleanMessage += '<A href="' + el.href + '">' + $(el).text() + '</A>';
	    }
	    else if(el.childNodes.length) {
		for(var i = 0; i < el.childNodes.length; ++i) {
		    saveOnlyAnchors($(el.childNodes[i]));
		}
	    }
	    else {
		cleanMessage += $(el).text();
	    }
	});
    }
};

// bug in ScopedClient when using port, so override for dev purposes
exports.makePostRequest = function(scopedClient, reqBody, callback) {
    var method = 'POST';
    var headers, port, req, sendingData;
    try {
	headers = scopedClient.options.headers;
	sendingData = reqBody;
	if (sendingData) {
	    headers['Content-Length'] = reqBody.length;
	}
	port = scopedClient.options.port;
	req = (scopedClient.options.protocol === 'https:' ? https : http).request({
	    port: port,
	    host: scopedClient.options.hostname,
	    method: method,
	    path: scopedClient.fullPath(),
	    headers: headers,
	    agent: false
	});
	if (callback) {
	    req.on('error', callback);
	}
	if (sendingData) {
	    req.write(reqBody, 'utf-8');
	    req.end();
	}
	if (callback) {
	    callback(null, req);
	}
    }
    catch (err) {
	if (callback) {
	    callback(err, req);
	}
    }
};
