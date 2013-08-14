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

// NOT PART OF APPLICATION BACKEND

// Libraries
var scopedClient = require('scoped-http-client');
var oauth        = require('oauth');

// Config
var config = {
  jiveUri:    'http://gateway.jivesoftware.com',
  streamPath: '/gateway/api/activity/v1/update/',
  inboxPath:  '/gateway/api/activity/v1/updateInbox/',
  jiveId:     '<jiveid>',
  appId:      '<appid>', // props app id
  key:        '<key>',     // props consumer key
  secret:     '<secret>',         // props consumer secret
  userId:     2061                  
};

// Example Activity
var activitySimple = {
  "items": [
    {
        "title": "Test activity title2",
        "body": "From an external client",
        "object": {
            "title": "object title",
            "summary": "this is an object summary"
        }
    }
  ]
};

var activityComplex = {
  "items": [
    {
      "title": "More complex example 4",
      "body": "From an external client",
      "object": {
        "objectType": "article",
        "title": "object title",
        "summary": "${@actor} gave ${@target} props.",
        "mediaLink": {
          "mediaType": "photo",
          "url" : "http://apphosting.jivesoftware.com/apps/dev/props/img/trophies/captain-america-with-reflection.png"
        }
      },
      "target": {
        "id": "urn:jiveObject:user/2008",
        "displayName": "John"
      }
    }
  ]
};

// Create proper URL to post an activity to the gateway
var postUrl = config.jiveUri + config.streamPath + config.jiveId + '/' + config.appId + '/' + config.userId;

// Oauth Signing Function
function signHMAC() {
  var oauthobj = new oauth.OAuth(undefined, undefined, config.key, config.secret, "1.0", undefined, 'HMAC-SHA1', undefined);
  return oauthobj.signUrl(postUrl, undefined, undefined, 'POST');
}

// Create and send a POST request to the gateway,
//   (using scoped-http-client - Github Source / Docs:
//    https://github.com/technoweenie/node-scoped-http-client)
var client = scopedClient.create(signHMAC());
client.header('Content-Type', 'application/json');
client.header('Accept', 'application/json');
client.header('X-Jive-App-Id', config.appId);
//client.post(JSON.stringify(activitySimple))(function(err, resp, body) {
client.post(JSON.stringify(activityComplex))(function(err, resp, body) {
  console.log("resp: ", resp);
  console.log("===============");
  console.log("body: ", body);
  // doesn't output anything in the body, but it does return a 200 OK
  // activity entry appears in jive instance stream within a few minutes
  // presumably it is polling the gateway every 15 minutes or so
});
