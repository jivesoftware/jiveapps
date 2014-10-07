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

/**
 * EXAMPLE: Demonstates how to kick off service autowiring a directory of tiles.
 */

///////////////////////////////////////////////////////////////////////////////////////////////////
// Setup express

var express = require('express'),
    http = require('http'),
    jive = require('jive-sdk');

var app = express();

///////////////////////////////////////////////////////////////////////////////////////////////////
// Setup jive

var failServer = function(reason) {
    console.log('FATAL -', reason );
    process.exit(-1);
};

var startServer = function () {
    if ( !jive.service.role || jive.service.role.isHttp() ) {
        var server = http.createServer(app).listen( app.get('port') || 8090, function () {
            console.log("Express server listening on port " + server.address().port);
        });
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Setting up your service

//
// Service startup sequence (Easy as 1-2-3!):
//

// 1. initialize service setup -- optionally pass in a JSON configuration object or path to a configuration object;
// if one is not provided, it assumes that [app root]/jiveclientconfiguration.json file exists.
jive.service.init(app)

// 2. autowire all available definitions in /tiles; see explanation below.
.then( function() { return jive.service.autowire() } )

// 3. start the service, which performs sanity checks such as clientId, clientSecret, and clientUrl defined.
// if successful service start, call the start the http server function defined by you; otherwise call the
// fail one
.then( function() { return jive.service.start() } ).then( startServer, failServer );

///////////////////////////////////////////////////////////////////////////////////////////////////
// Below is an explanation of each step in the above sequence successful.

/*
====================
Step 1. Service Init
====================

jive.service.init() must at minimum be called with an app, as the framework will use that to
prepare the express app.

A second argument (omitted above) can be provided, which can be either (1) the JSON for the options
required to start the service (clientUrl, port), or the location of a JSON
file containing those setup options.

If no 2nd argument is provided, then the system will try to locate a command line parameter to
node called config (eg. config=/path/to/my.json), or an environment variable (eg. CONFIG_FILE=/path/to/my.json).

If neither are present, the system will assume that a file [app root]/jiveclientconfiguration.json] exists, and
will try to parse that file for options.

==================
Step 2. Autowiring
==================

Once jive.service.init() completes, the next promise in the chain above is jive.service.autowire(), which
will inspect your system for tiles and external stream definitions in [app root]/tiles, and automatically try to
discover definition JSON, routes, tasks, and event handlers that are placed there in expected locations.

The .autowire() assumes the following directory structure exists:
[app root]/tiles
            /tile1
                /public (optional)
                    configuration.html (optional)
                /backend (optional)
                    *.js
                    /routes (optional)
                        /config (optional)
                            get.js (optional)
                definition.json (optional)

Note: The optional items above are recommended.

Regarding the /routes directory:
--------------------------------
The system will recursively search for .js files exporting either a function(req, res), or
a routes datastructure, and construct a route based on the path in the directory, for the
associated tile. You should refer to these routes in your definition.json (eg. the "configure"
and "register" attributes for example), so that a Jive instance receiving the definition for your
tile or external activity stream will know which endpoints to call for producing the configuration UI
for your tile, and for which endpoints to call when registering a tile or activity stream instance.

Route autowiring can happen with two possible flavors:

(1) Route autowire by verb file (get.js, put.js, delete.js, post.js)

If a .js file in the routes directory corresponds to one of the http verbs (eg. get.js, put.js, delete.js, post.js),
and the exported function is named 'route' specifically, a node JS express route will be created
based on the directory path. For example:

            ..
            /samplelist
                /backend
                    /routes
                        /config
                            get.js

Assuming that /samplelist/backend/routes/config/get.js contains the following:

            exports.route = function(req, res) { ..  };

The following route will be automatically created:

            GET /samplelist/config

You may then safely reference this route in your definition.json:

            {
             ..
                 "config": "/samplelist/configure",
             ..
            }

(2) Route autowire by datastructure
If the .js file exports a datastructure containing BOTH "verb" string and "route" function attributes,
the system will attempt to construct a node JS express route based on the directory path plus either
name of the exported datastructure (or an optional "path" parameter", and
set the verb to the value of the verb attribute.

For example:

            exports.mypath = {
                'verb': 'get',
                'route': function(res,req) { .. }
            };

Assuming that this export lives in /samplelist/routes/prod/extra/routes.js, the following route will be automatically
created:

            GET /samplelist/prod/extra/mypath

If a path attribte was present:

         exports.mypath = {
             'path' : 'more',
             'verb': 'get',
             'route': function(res,req) { .. }
         };

The following path will be autowired:

        GET /samplelist/prod/extra/mypath/more

As with the autowire by verb file example above, you should reference these routes in your definition.json.

Regarding the backend directory:
--------------------------------
Though the system will search for .js files anywhere under the tile directory, it is good practice to put your
services related items in a specific backend directory.

The system will try to discover any event handlers and tasks exported in .js files.

(1) Event Handlers
If you have a file that exports an .eventHandlers array property, the system will call jive.definitions.addEventHandler()
on each of the object elements.
For example:

If in /samplelist/services/lifecycle.js this existed:

        exports.eventHandlers = [
         { 'event': 'destroyingInstance',
           'handler' : function(theInstance){
                 override
             }
         }
        ];

This will add the event listener 'destroyingInstance' to the definition samplelist, which will be called
whenever an instance of samplelist is destroyed.

(2) Task exports
If you have a file that exports a .task property, the system will call jive.definitions.addTasks( .. ) on that
object, which can be either a task object (see jive-sdk/lib/task.js) or a function.

If in /samplelist/backend/datapusher.js this existed:

     exports.task = function() { .. }
             - or -
     exports.task = jive.tasks.build( function() { ..} , 5000 )

This will schedule a task based on the function in either statement to execute either every 15 seconds
(default for a plain function), or the interval specified in the task (5 seconds in the provided example).

Regarding definition.json:
-------------------------
If a definition.json file is located in a tile directory (for example /samplelist/definition.json), the system
will call either jive.tile.definitions or jive.extstreams.definitions .save(), based on the "style" attribute
in this json structure. If style is "ACTIVITY", jive.extstreams.definitions.save() will be called; otherwise
its assumed to be a tile, and jive.tiles.definitions.save() will be called.

When the /tiles development endpoints are called, it will return all the tiles and external stream definitions
defined in your system through the aforementioned .save() command. The tile definitions output via this
endpoint is in the format expected by the jivelinks API.

(1) If the "configure" attribute is not specified, the value will be interpreted as
     [clientUrl]/[tile name]/configure. Please make sure this endpoint
     is available either through manual configuration, or route autowiring (see above).
(2) If "registration" attribute is not specified, the value will be interpreted as
     http[your service url]/registration (this is the shared, framework provided registration endpoint).
(3) Any paths containing {{{host}}} will have that value substituted with the value of clientUrl from your
    configuration file.

=====================
Step 3. START SERVICE
=====================
 The final link in the promise chain is jive.service.start(), which performs the following:
 - Prepares the express app based passed in the first step, .init() above, adding globally available
   endpoints such as:
        /registration
        /tiles (dev mode only)

- Validates service setup options, making sure that require attributes such as
clientUrl are present
- If there are any problems, the failure callback on the .then() of this promise gets executed, and the
  service process exits with an error. Otherwise the http server starts when the success callback is executed.

At this point, the service should be ready to serve purposeful places integrations.

In development mode, you can inspect what tiles are active on the service by invoking:

    GET /tiles

*/
