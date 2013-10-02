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

// Not part of backend, a simple test for SimpleDB usage

var $ = require('jquery');
var simpledb = require('simpledb');

var awsCredentials = {
   keyid: "<key>",
   secret: "<secret>"
};
var sdb = new simpledb.SimpleDB(awsCredentials);

var query = "SELECT * FROM `developmentPropsJiveInstance-a6c1b5af-8e24-43de-8207-03023cae9ceb` WHERE user_id = '1' AND created_at != '' ORDER BY created_at desc";
query = "SELECT * FROM `productionPropsJiveInstance-94258a3b-c146-4780-bcb4-90e945302946` WHERE created_at >= '2012-08-01T22:12:38.887Z' AND created_at != '' ORDER BY created_at desc";
sdb.select(query, function(error, result, meta) {
    if (error) {
	console.log("  SimpleDB error: ", error);
    }
    else console.log(result);
});
