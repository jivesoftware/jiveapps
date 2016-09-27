/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

// Livestream Secure Token
// https://www.livestreamapis.com/docs/?shell#secure-tokens
// This endpoint can be used to get a secure token to access other LiveStream APIs
// A secure token isn't used for embedding video


//************************************************************************
// Should your service need to be expanded to include non-public Live Stream
// API features and you need a token, this endpoint will generate one
//************************************************************************
var jive = require("jive-sdk");
const crypto = require('crypto');
const credentials = jive.service.options['livestreamCredentials'];

const liveStreamAPIKey = credentials.apiKey,    // Get from https://www.livestreamapis.com/apiKeys
    clientId = credentials.clientId,            // Use the client ID associated with your API Key
    APIScope = credentials.scope;               // Can be "all" or "readonly" or "playback"


exports.route = function(req, res){
    var conf = jive.service.options;
    var timestamp = (new Date()).getUTCMilliseconds();

    const secret = liveStreamAPIKey + ":" + APIScope + ":" + timestamp;
    const hash = crypto.createHmac('md5', liveStreamAPIKey)
                        .update(secret)
                        .digest('hex');

    var payload = {
        'md5Hash' : hash,
        'clientId' : clientId,
        'timestamp' : timestamp
    }

    res.send(payload);
};