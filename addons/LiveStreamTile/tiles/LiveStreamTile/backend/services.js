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

var jive = require("jive-sdk");
var q = require('q');
const _ = require('underscore'),
    credentials = jive.service.options['livestreamCredentials'];
    jiveAccessToken = jive.service.options['jiveAccessToken'];

// These are parameters needed by Live Stream
const embed_id = Date.now(),    // embed ID is a random unique identifier for the embedded video player
    account_id = credentials.accountId,      // account id is the public ID # for a Live Stream
    APIKey = credentials.apiKey,    // API Key must be retrieved from https://www.livestreamapis.com/apiKeys
    base64APIKey = new Buffer(`${APIKey}:`).toString('base64');  // Don't use jive.util.base64Encode() since it's not an object

var lastLSPayload = {
    'data' : {
        'event_data' : [],
        'activities' : []
    }
};

/**
 * Handles actually pushing data to the tile instance
 * @param instance
 */
//************************************************************************
// 1) Gets the events associated with the Live Stream account
// 2) Processes the payload and the existing config to create a updated config
// 3) Checks to see if updated event is the same
//      (a)If it's the same, it will NOT update the tile — this is so the tile
//          window doesn't refresh
// 4) If a video has a 'isLive' = true & there's a SSI listener URL, it will generate
//      an activity stream entry
// 5) Sends the updated config to the tile instance
//************************************************************************
function processTileInstance(instance) {
    jive.logger.debug('Running data pusher for ', instance.name, 'instance', instance.id);
    var configData = instance.config;

    getLiveStreamEvents(configData)
    .then((eventsPayload) =>{
        return processPayload(eventsPayload, configData);
    }).then((val) =>{
        if(_.isEqual(lastLSPayload.data.event_data, val.data.event_data)){
            jive.logger.debug("LiveStream events unchanged");
            return val;
        }
        return Promise.all([val, generateActivities(val)]);
    }).then((results) =>{
        if(Array.isArray(results) && results[1]){      // If the results is not an array we know that the json hasn't 
            results[0].data.activities.push(results[1]);
            lastLSPayload = results[0];         
            return jive.tiles.pushData(instance, lastLSPayload);
        } else{
            lastLSPayload = results[0] || results;
        }
    })
    .catch((err) =>{
        jive.logger.error(err)
    });
}

//************************************************************************
// This function creates an activity if a Simple Stream Integration
// listener URL is provided in the tile configuration and event's "isLive"
// param is true
//************************************************************************
function generateActivities(currentPayload){
    return new Promise((resolve, reject) =>{
        for(var i=0; i < currentPayload.data.total; i++){
            if(currentPayload.data.event_data[i].isLive){
                var flag = false;
                if(currentPayload.data.activities){
                    currentPayload.data.activities.forEach((val,index) =>{
                        if(val.event_id === currentPayload.data.event_data[i].id){
                            flag = true;
                        }
                    })
                }
                
                if(!flag && currentPayload.data.webhook_URI){
                    let requestOptions = {
                        'url' : currentPayload.data.webhook_URI,
                        'method' : 'POST',
                        'postBody' : currentPayload.data.event_data[i],
                        'headers' : null,
                        'options' : null
                    }
                    let resolveOption = {
                        'activity' : null,
                        'event_id' : currentPayload.data.event_data[i].id
                    }
                    sendRequest(requestOptions, resolve, reject, resolveOption);
                } else{
                    jive.logger.debug("Activity already created or no webhook url");
                    resolve();
                }
            } else{
                jive.logger.info('No live video streams available');
                resolve();
            }
        }
    })
}

//************************************************************************
// Maps the LiveStream payload to our service's
//************************************************************************
function processPayload(lsEvents, config){
    var sortedPayload = {
        'data' : {
            'embed_id' : embed_id,
            'account_id' : account_id,
            'event_data' : lsEvents.data,
            'total' : lsEvents.total,
            'event_id' : config.event_id,
            'webhook_URI' : config.webhook_URI,
            'activities' : config.activities || []
        }
    };

    return sortedPayload;
}

//************************************************************************
// Retrieves 10 more recent events from the Live Stream Upcoming Events endpoint
//************************************************************************
function getLiveStreamEvents(config){
    return new Promise((resolve, reject) =>{
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
    });
}

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
                   if(option[key] === null)
                    option[key] = response.entity 
               });
               resolve(option);
            }
            resolve(response.entity);
        }),
        (error) =>{
            reject(error);
        };
}

/**
 * Iterates through the tile instances registered in the service, and pushes an update to it
 */
var pushData = function() {
    var deferred = q.defer();
    jive.tiles.findByDefinitionName('LiveStreamTile').then(function(instances) {
        if (instances) {
            q.all(instances.map(processTileInstance)).then(function() {
                deferred.resolve(); //success
            }, function() {
                deferred.reject(); //failure
            });
        } else {
            jive.logger.debug("No jive instances to push to");
            deferred.resolve();
        }
    });
    return deferred.promise;
};

/**
 * Schedules the tile update task to automatically fire every 10 seconds
 */
exports.task = [
    {
        'interval' : 10000,
        'handler' : pushData
    }
];

/**
 * Defines event handlers for the tile life cycle events
 */
exports.eventHandlers = [

    // process tile instance whenever a new one is registered with the service
    {
        'event' : jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : processTileInstance
    },

    // process tile instance whenever an existing tile instance is updated
    {
        'event' : jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : processTileInstance
    }
];