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

$         = require('jquery');
util      = require('./util.js');
pg     = require('pg');
log   = require('util');

/**
 * This is a helper class to test the server's connection to the database. It also returns basic metrics.
 */

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

var query = function(query, callback) {
    log.debug("test database query: "+query);
    pg.connect(exports.DB_LOCATION, function(err, client, done){
        if(err) {
            callback("ERROR:Could not connect to database: "+err, 500);
        }
        else {
            client.query(query, function(error, result) {
                if(error) {
                    callback("ERROR:Connected to database, but query failed: "+error, 500);
                }
                else {
                    callback(result, 200);
                }
            });
        }
    });
};

var healthTest = function(callback) {
    var envStr = env();
    var queryStr = util.format("SELECT table_name FROM information_schema.tables WHERE table_name IN ('%sproptypes','%sprops','%sjiveinstances','%slinkedcontent');",envStr,envStr,envStr,envStr);
    query(queryStr, function(result, code) {
        if(code != 200) {
            callback(result, code);
        }
        else {
            log.debug("healthtest result:"+JSON.stringify(result));
            if (result.rowCount == 4) {
                callback("Running for "+process.uptime()+". All tables present!\n", 200);
            }
            else {
                callback("ERROR: One or more tables is/are missing. Access /manage/health/connectivity for more info.", 200);
            }
        }
    });
};

var connectivityCheck = function(callback) {
    var queryStr = "SELECT EXISTS (SELECT table_name FROM information_schema.tables WHERE table_name='"+env();
    var resp = "";
    query(queryStr+"jiveinstances');", function(result, code) {
        if (code != 200) {
            callback("Table of Jive Instances: "+result, code);
        }
        else {
            if(result.rows[0].exists) {
                resp += "Table of Jive Instances..........OK\n"
            }
            else {
                resp += "Table of Jive Instances..........FAIL\n"
            }
            query(queryStr+"linkedcontent');", function(result, code) {
                if (code != 200)  {
                    callback (resp+"Table of Linked Content: "+result, code)
                }
                else {
                    if(result.rows[0].exists) {
                        resp += "Table of Linked Content..........OK\n"
                    }
                    else {
                        resp += "Table of Linked Content..........FAIL\n"
                    }
                    query(queryStr+"proptypes');", function(result, code) {
                        if (code != 200)  {
                            callback (resp+"Table of Prop Types: "+result, code)
                        }
                        else {
                            if(result.rows[0].exists) {
                                resp += "Table of Prop Types..............OK\n"
                            }
                            else {
                                resp += "Table of Prop Types..............FAIL\n"
                            }
                            query(queryStr+"props');", function(result, code) {
                                if (code != 200)  {
                                    callback (resp+"Table of Props Given: "+result, code)
                                }
                                else {
                                    if(result.rows[0].exists) {
                                        resp += "Table of Props Given.............OK\n"
                                    }
                                    else {
                                        resp += "Table of Props Given.............FAIL\n"
                                    }
                                    callback(resp, 200);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

var getStats = function(callback) {
    var queryStr = "SELECT * FROM "+env()+"jiveinstances";
    var resp = "";
    query(queryStr, function(result, code) {
        if(code != 200) {
            callback(result, code)
        }
        else {
            resp += "Jive Instances registered: "+result.rowCount+"\n";
            queryStr = "SELECT * FROM "+env()+"props";
            query(queryStr, function(result, code) {
                if(code!=200) {
                    callback(resp+result, code);
                }
                else {
                    resp += "Props given: "+result.rowCount+"\n";
                    queryStr = "SELECT * FROM "+env()+"proptypes";
                    query(queryStr, function(result, code) {
                        if (code!= 200) {
                            callback(resp+result, code);
                        }
                        else {
                            resp += "Number of Prop Types: "+result.rowCount+"\n";
                            callback(resp, 200);
                        }
                    });
                }
            });
        }
    });
};

exports.healthTest = healthTest;
exports.connectivityCheck = connectivityCheck;
exports.getStats = getStats;