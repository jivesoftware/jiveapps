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

# Require Vendor Libraries
#
$            = require "jquery"
coffeescript = require "coffee-script"
crypto       = require "crypto"
express      = require "express"

# Require Project Libraries
#
oauth      = require "./oauth.js"
opensocial = require "./opensocial.js"
DB         = require "./db.coffee"
activity   = require "./activity.coffee"
util       = require './util.js'

# App OAuth Credentials
#
prodAppId = "6e966b7a-2e6e-4eeb-9f71-9c2b2d9b1b3f"
oauthCreds =
  "6e966b7a-2e6e-4eeb-9f71-9c2b2d9b1b3f":
    id: "<app-id>",
    key: "<key>"
    secret: "<secret>",
    gateway: "http://gateway.jivesoftware.com",
    description: "Production, DO NOT MODIFY"

# Authenticate OAuth Request
#
authenticate = (request, response, next) ->
  console.log "authenticate called"

  request.on "end", ->
    oauthobj = new oauth.OAuth(undefined, undefined, oauthCreds.key, oauthCreds.secret, "1.0", undefined, "HMAC-SHA1", undefined)
    console.log oauthobj
    verified = oauthobj.verifySignature("http://" + request.headers.host + request.url)
    message = (if verified then "Success. Signature Verified!" else "Failure. Signatures do not match!")
    response.writeHead 200,
      "Content-Length": message.length

    response.write message
    response.end()

  next()


# Handle OAuth errors by returning a 401 status and JSON representation of error object
#
handleError = (error, request, response, next) ->
  if error instanceof oauth.OAuthError
    console.log "OAuth Error: ", error
    response.statusCode = 401
    response.end '{ error: "' + error.message + '" }'
  else
    next error

handleSimpleDbErrors = (error, request, response, noSuchDomainResponse=[]) ->
  if error.Code and error.Code is "NoSuchDomain"
    console.log "No such domain exists for this Jive instance, sending empty array."
    response.send noSuchDomainResponse
  else
    response.send error, 400


# Lookup oauth keys...
#
oauthLookup = (request, type, appId, callback) ->
  if type is "token"
    callback ""
  else if type is "client"
    if oauthCreds[appId]
      callback oauthCreds[appId].secret;
    else
      console.log "Lookup for unknown " + appId + " attempted."
      callback ""
  else
    console.log "Unknown secret type ", type

# Setup Webserver
#
app = express.createServer(express.logger())

# Setup Web App Middleware
#
app.use oauth.parseHeader()
app.use opensocial.parseParams(oauthCreds[prodAppId].key)
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.static(__dirname + '/public')
app.use setContentType = (req, res, next) ->
  res.header "Content-Type", "application/json"
  next()

app.error handleError


# ########## App Routes ###########


# ### Prop Types ###

# GET /props/types
# Get default prop types, optionally filter by current request level
#
app.get "/props/types", oauth.verifySignature(oauthLookup), (req, res) ->
  DB.PropType.findAllByLevel req.query.level, (error, result, meta) ->
    if error
      res.send error, 400
    else
      res.send result

app.get "/props/types/reset", (req, res) ->
  DB.PropType.resetDomain()
  res.send("Resetting prop types.")


# GET /props
# Get all props for a user
# Filter by
#   user_id   - id of the user the prop belongs to. defaults to owner id
#   giver_id  - id of the user who gave the prop
#   prop_type - the type of prop
#
app.get "/props", oauth.verifySignature(oauthLookup), (req, res) ->
  options = $.extend({}, req.query)
  options.jiveInstanceId = req.opensocial.getJiveId()
  options.ownerId = req.opensocial.getOwnerId()

  DB.Prop.findAll options, (error, result, meta) ->
    if error
      handleSimpleDbErrors error, req, res
    else
      res.send result

# GET /props/count?prop_type=propname
# Return count of props for viewer based on prop name.
# Filter by
#   user_id   - id of the user the prop belongs to
#   giver_id  - id of the user who gave the prop
#   prop_type - the type of prop
#   days_ago  - number of days back to count
#
app.get "/props/count", oauth.verifySignature(oauthLookup), (req, res) ->
  options = $.extend({}, req.query)
  options.ownerId = req.opensocial.getOwnerId()

  DB.Prop.count req.opensocial.getJiveId(), options, (error, result, meta) ->
    if error
      handleSimpleDbErrors error, req, res, [{"$ItemName":"Domain","Count":"0"}]
    else
      res.send result

# GET /props/stream
# Get the streams of props given during certain period from the request.
#
app.get "/props/stream", oauth.verifySignature(oauthLookup), (req, res) ->
  options = $.extend({}, req.query)

  DB.Prop.stream req.opensocial.getJiveId(), options, (error, result, meta) ->
    if error
      handleSimpleDbErrors error, req, res
    else
      res.send result

# GET /props/:id
# Get a prop by its id
#
app.get "/props/:id", oauth.verifySignature(oauthLookup), (req, res) ->
  DB.Prop.find req.opensocial.getJiveId(), req.params.id, (error, result, meta) ->
    if error
      res.send error, 400
    else if result == null
      res.send "", 404
    else
      res.send result


# POST /props
# Create a prop
#
app.post "/props", oauth.verifySignature(oauthLookup), (req, res) ->
  propObj = $.extend(req.body,
    giver_id: req.opensocial.getOwnerId()
  )

  # disallow self propping
  if propObj.giver_id == propObj.user_id
    return res.send { error: "Forbidden: Just do it in your mind, not so publicly" }, 403

  propObj.message = util.escapeMessage propObj.message
  DB.Prop.create req.opensocial.getJiveId(), propObj, (error, result, meta) ->
    if error
      res.send error, 400
    else
      DB.PropType.findByName propObj.prop_type, (error, propTypeResult) ->
        propImageUrl = propTypeResult.image_url
        # creds = oauthCreds[req.opensocial.getAppId()]
        # activity.postProp req.opensocial.getJiveId(), propObj, propImageUrl, creds
        res.send result, 201

app.post "/debugPost", (req, res) ->
  console.log(typeof(req.body), req.body)
  obj =
    body: req.body
    params: req.params
    headers: req.headers
    query: req.query
  res.send obj

app.get "/keys", (req, res) ->
  pubCreds = {}
  $.extend(true, pubCreds, oauthCreds)
  for id of pubCreds
    delete pubCreds[id]['secret']
  res.send JSON.stringify(pubCreds, null, 4), 200

app.put "/keys/:app_id", (req, res) ->
  devAppKeys = req.body
  if req.params.app_id && devAppKeys.key && devAppKeys.secret
    if req.params.app_id == prodAppId
      res.send 403
    else
      devAppKeys.gateway = oauthCreds[prodAppId].gateway unless devAppKeys.gateway
      devAppKeys.id = req.params.app_id
      oauthCreds[req.params.app_id] = devAppKeys
      res.send 201
  else
    res.send "app id, key & secret are required.", 400

app.delete "/keys/:app_id", (req, res) ->
  devAppKeys = req.body
  if req.params.app_id == prodAppId
    res.send 403
  else
    delete oauthCreds[req.params.app_id]
    res.send 200


app.get "/status", (req, res) ->
  res.send 200



# Listen for requests on the specified port
#
port = process.env.PORT or 5000
console.log("about to listen...")
app.listen port, ->
  DB.env process.env.NODE_ENV # Set db environment (development/production/etc)
  DB.init()                   # Initialize database, populate propTypes table if needed
  console.log "Running in #{DB.env()} mode, listening on #{port}"
