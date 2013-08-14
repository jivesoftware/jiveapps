#   Copyright 2013 Jive Software
# 
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.


scopedClient = require "scoped-http-client"
oauth        = require "oauth"
util       = require './util.js'

config =
  streamPath: "/gateway/api/activity/v1/update/"
  inboxPath: "/gateway/api/activity/v1/updateInbox/"


signHMAC = (url, creds) ->
  oauthobj = new oauth.OAuth(`undefined`, `undefined`, config.key, creds.secret, "1.0", `undefined`, "HMAC-SHA1", `undefined`)
  oauthobj.signUrl url, `undefined`, `undefined`, "POST"

# activitySimple = items: [
#   title: "Test activity title2"
#   body: "From an external client"
#   object:
#     title: "object title"
#     summary: "this is an object summary"
#  ]

# activityComplex = items: [
#   body: "From an external client"
#   title: "More complex example 4"
#   object:
#     objectType: "article"
#     title: "object title"
#     summary: "${@actor} gave ${@target} props."
#     mediaLink:
#       mediaType: "photo"
#       url: "http://apphosting.jivesoftware.com/apps/dev/props/img/trophies/captain-america-with-reflection.png"

#   target:
#     id: "urn:jiveObject:user/2008"
#     displayName: "Aron"
#  ]

exports.postAction = (jiveId, giverId, receiverId, activity, creds, callback=()->) ->
  postUrl = creds.gateway + config.streamPath + jiveId + "/" + creds.id + "/" + giverId + '?deliverTo=' + receiverId
  console.log("Posting prop notification to " + postUrl);
  client = scopedClient.create(signHMAC(postUrl, creds))
  client.header "Content-Type", "application/json"
  client.header "Accept", "application/json"
  client.header "X-Jive-App-Id", creds.id
  client.header "Host", creds.gateway.match(/https?:\/\/(.+)/)[1]
  if client.options.port
    util.makePostRequest client, JSON.stringify(activity), callback
  else
    client.post JSON.stringify(activity), (err, resp, body) ->
      callback err, resp, body

exports.postActivity = (jiveId, userId, activity, creds, callback=()->) ->
  postUrl = creds.gateway + config.streamPath + jiveId + "/" + creds.id + "/" + userId
  console.log("Posting prop activity to " + postUrl);
  client = scopedClient.create(signHMAC(postUrl, creds))
  client.header "Content-Type", "application/json"
  client.header "Accept", "application/json"
  client.header "X-Jive-App-Id", creds.id
  client.header "Host", creds.gateway.match(/https?:\/\/(.+)/)[1]
  if client.options.port
    util.makePostRequest client, JSON.stringify(activity), callback
  else
    client.post JSON.stringify(activity), (err, resp, body) ->
      callback err, resp, body


exports.postProp = (jiveId, propObj, propImageUrl, creds, callback=()->) ->
  activity =
    body: "${@actor} has given you props."
    title: "Jive Props"
    object:
      objectType: "article"
      title: "object title"
      summary: propObj.message
      mediaLink:
        mediaType: "photo"
        url: propImageUrl

    target:
      id: "urn:jiveObject:user/#{propObj.user_id}"
      # displayName: "Aron"
    jiveDisplay: [ "inbox" ]

  activityWrapper = items: [activity]
  jiveId = jiveId.replace(/^dev/, '');

  exports.postActivity jiveId, propObj.user_id, activityWrapper, creds, callback

#  activity.title = "${@actor} has given you props."
#  exports.postAction jiveId, propObj.giver_id, propObj.user_id, activityWrapper, creds, callback
