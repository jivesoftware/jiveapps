//
// Copyright 2013 Jive Software
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

var makeRequest = function(type, url, data, onResult) {
    if (type=="post") {
        //POST request.
        var postData = data;
        var postObj = {href:url,
            format:'json',
            noCache:true,
            headers: {"Content-Type":["application/json"]},
            body:postData,
            authz:'signed'
        };
        console.log("post request: "+JSON.stringify(postObj));
        osapi.http.post(postObj).execute(function(res) {
            console.log("response: "+JSON.stringify(res));
            onResult(res);
        });
    }
    else {
        var request;
        if (data) {
            request = osapi.http.get({href:url,
                format:'json',
                noCache:true,
                headers: {"Content-Type":["application/json"]},
                authz:'signed',
                body:JSON.stringify(data)}
            );
        }
        else request = osapi.http.get({href:url,
            headers:{"Accept":["application/json"]},
            noCache:true,
            authz:'signed'});
        request.execute(function(res) {
            console.log(res);
            onResult(res);
        });
    }
}
