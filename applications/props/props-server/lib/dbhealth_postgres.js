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
pg        = require('pg');
log       = require('util');

/**
 * This is a helper class to test the server's connection to the database. It also returns basic metrics.
 */
function query(query, callback) {
    log.debug("test database query: "+query);
    console.log("DB location: ", util.DB_LOCATION);
    pg.connect(util.DB_LOCATION, function(err, client, done){
        if(err) {
            callback("ERROR:Could not connect to database: "+err, 200);
        }
        else {
            client.query(query, function(error, result) {
                if(error) {
                    callback("ERROR:Connected to database, but query failed: "+error, 200);
                    done();
                }
                else {
                    callback(result, 200);
                    done();
                }
            });
        }
    });
}

function healthTest(callback) {
    var queryStr = log.format("SELECT table_name FROM information_schema.tables WHERE table_name IN ('proptypes','props','jiveinstances','linkedcontent');");
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
}

function connectivityCheck(callback) {
    function printToResp(resp, passed, name) {
        if (passed) {
            return resp + "Table of "+name+"..........OK\n"
        }
        else {
            return resp + "Table of "+name+"..........FAIL\n";
        }
    }
    function findInRows(w, arr) {
        for (var i=0;i<arr.length;i++) {
            if (arr[i].column_name == w) {
                return true;
            }
        }
        return false;
    }
    function check(arr, rows) {
        var good = (arr.length == rows.length);
        for (var i=0;i<arr.length;i++) {
            if (!good) {
                return false;
            }
            good = good && findInRows(arr[i], rows);
        }
        return good;
    }
    var queryStr = "SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '";
    var resp = "";
    query(queryStr+"jiveinstances';", function(result, code) {
        if (code != 200 || !(result.rows)) {
            callback("Table of Jive Instances: "+result, code);
        }
        else {
            result = result.rows;
            resp = printToResp(resp, (result.length == 1 && result[0].column_name == 'instanceid'), "Jive Instances");
            query(queryStr+"linkedcontent';", function(result, code) {
                if (code != 200 || !(result.rows))  {
                    callback (resp+"Table of Linked Content: "+result, code)
                }
                else {
                    result = result.rows;
                    resp = printToResp(resp, check(["content_id","content_type","content_link","content_title","jiveinstanceid"], result), "Linked Content");
                    query(queryStr+"proptypes';", function(result, code) {
                        if (code != 200 || !(result.rows))  {
                            callback (resp+"Table of Prop Types: "+result, code)
                        }
                        else {
                            result = result.rows;
                            resp = printToResp(resp, check(["id","title","definition","level","jiveinstanceid","image","image_url"], result), "Prop Types");
                            query(queryStr+"props';", function(result, code) {
                                if (code != 200 || !(result.rows))  {
                                    callback (resp+"Table of Props Given: "+result, code)
                                }
                                else {
                                    result = result.rows;
                                    resp = printToResp(resp, check(["id","user_id","giver_id","prop_type","message","stream_entry_url","orig_id","jiveinstanceid","created_at","content_id"], result), "Props Given");
                                    callback(resp, 200);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function getStats(callback) {
    var queryStr = "SELECT * FROM jiveinstances";
    var resp = "";
    query(queryStr, function(result, code) {
        if(code != 200) {
            callback(result, code)
        }
        else {
            resp += "Jive Instances registered: "+result.rowCount+"\n";
            queryStr = "SELECT * FROM props";
            query(queryStr, function(result, code) {
                if(code!=200) {
                    callback(resp+result, code);
                }
                else {
                    resp += "Props given: "+result.rowCount+"\n";
                    queryStr = "SELECT * FROM proptypes";
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
}

exports.healthTest = healthTest;
exports.connectivityCheck = connectivityCheck;
exports.getStats = getStats;