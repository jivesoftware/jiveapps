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

require('coffee-script');
$         = require('jquery');
util      = require('./util.js');
log       = require('util');
request   = require('request');
assert    = require('assert');
DB        = require('./db_postgres.coffee');
pg        = require('pg');
domain    = require('domain');

var d = domain.create();

d.on('error', function(err) {
    log.debug("ERROR caught in domain: "+JSON.stringify(err));
    cleanUp();
});

// Default environment
var _env = 'development';

var env =  function(val) {
    if(val)
        return _env = val;
    else
    if(_env)
        return _env;
    else
        return 'development';
};

// Pull a postgres client from the client pool, and use it to run the query.
var query = function(query, callback) {
    log.log("  Postgres Query   " + query)
    pg.connect(exports.DB_LOCATION, function(err, client, done) {
        if(err) {
            log.debug("connect error: "+JSON.stringify(err))
        }
        else {
            client.query(query, function(err, res) {
                done();
                callback(err, res);
            });
        }
    });
};

var cleanUp = function() {
    var query1 = "DELETE FROM "+DB.PropType.tableName()+";";
    var query2 = "DELETE FROM "+DB.Instances.tableName()+";";
    log.debug("cleaning up state...");
    query(query1, function(err) {
        if (err) {
            log.debug("error cleaning up state");
        }
        else {
            query(query2, function(err2) {
                if (err2) {
                    log.debug("error cleaning up state 2")
                }
                else {
                    log.log("cleaned up state");
                    process.exit();
                }
            })
        }
    })
}

d.run(function() {
    var instancename = "testinstance";
    DB.env("test");
    DB.DB_LOCATION = "postgres://akshay.narayan@localhost:5432/akshay.narayan"; //#connection string: "postgres://username:password@hostname:port/database"

    DB.Instances.register(instancename, function(err) {
        if(err) {
            assert.fail("no error", err, "failed registering instance")
        }
        else {
            log.log("register passed");
            DB.PropType.insert(instancename, {
                title:"Guinea Pig",
                definition:"test prop",
                level:"0",
                image_url:"http://gentle-scrubland-4425.herokuapp.com/img/prop_types/1611518933.png"
            }, function(err, res) {
                if (err) {
                    log.debug(JSON.stringify(err))
                    assert.fail("no error", err, "failed inserting new prop type");
                }
                else {
                    log.log("create prop type passed");
                    DB.PropType.findAllByLevel(instancename, 0, function(err, res) {
                        if (err) {
                            assert.fail("no error", err, "failed getting prop types");
                        }
                        else {
                            log.log("result:"+JSON.stringify(res));
                            var found = false;
                            for(var i=0;i<res.length;i++){
                                var type = res[i];
                                if(type.title=="Guinea Pig") {
                                    found = true;
                                }
                            }
                            assert(found, "newly inserted prop type not found in database!");
                            log.log("passed test!");
                            cleanUp();
                        }
                    })
                }
            });
        }
    });
});