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


//************************************************************************
// The /events endpoint takes a GET request without any query parameters
// this is optional because the tile may install an need event information
// before the scheduled task gets a chance to push data to the tile
//************************************************************************



var jive = require("jive-sdk");

const credentials = jive.service.options['livestreamCredentials'];

// Livestream Secure Token
// https://www.livestreamapis.com/docs/?shell#secure-tokens
const APIKey = credentials.apiKey,          // Get from https://www.livestreamapis.com/apiKeys
    clientId = credentials.clientId,        // Use the client ID associated with your API Key
    account_id = credentials.accountId,
    embed_id = Date.now(),
    APIScope = credentials.scope,           // Can be "all" or "readonly" or "playback"
    base64APIKey = new Buffer(`${APIKey}:`).toString('base64');  // Don't use jive.util.base64Encode() since it's only a string and not an Object

exports.route = function(req, res){
    var conf = jive.service.options;

    var LSData = new Promise((resolve, reject) =>{
        let requestOptions = {
        'url' : `https://livestreamapis.com/v1/accounts/${account_id}/upcoming_events?page=1&max_items=10`,
        'method' : 'GET',
        'postBody' : null,
        'headers' : {
            'Authorization' : `Basic ${base64APIKey}`
        },
        'options' : null
    };
        sendRequest(requestOptions, resolve, reject);
    })
    .then((val) =>{
        var payload = {
            'embed_id' : embed_id,
            'account_id' : account_id,
            'event_data' : val.data,
            'total' : val.total
        }
        res.send(payload);
    })
    .catch((err) => {
        jive.logger.debug(err);
    })
};

//************************************************************************
// Reusable HTTP request function
// Resolves a parent promise
// Takes requestParameters = {
//      url : string (required)
//      method : GET, POST, PUT, or DELETE (required)
//      postBody : string or JSON Object (optional)
//      headers : JSON object (optional. Default includes applicaiton/json as Content-Type)
//      options : JSON Object (optional)
// }
//************************************************************************
function sendRequest(requestParameters, resolve, reject, option){
    return jive.util.buildRequest(requestParameters.url, requestParameters.method, requestParameters.postBody, requestParameters.headers, requestParameters.options)
        .then((response) =>{
            if(option){
               Object.keys(option).forEach((key,index) =>{
                   if(option.key === null)
                    option.key = response.entity 
               });
               resolve(option);
            }
            resolve(response.entity);
        }),
        (error) =>{
            reject(error);
        };
}