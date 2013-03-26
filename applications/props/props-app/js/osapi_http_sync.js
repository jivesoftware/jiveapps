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

// Backbone.Sync implementation for Osapi.http
var OsapiHttpSync = function(method, model, options) {

  // console.log('OsapiHttpSync - method: ', method, ', model: ', model, ', options: ', options);

  if(options === null) {
    options = {};
  }

  var methodMap = {
    'create' : 'post',
    'update' : 'put',
    'delete' : 'delete',
    'read'   : 'get'
  };

  var type = methodMap[method];

  var params = {
    type: type,
    format: 'json',
    headers: {"Content-Type":["application/json"]},
    'authz': 'signed'
  };

  console.log("----- OsapiHttpSync options: ", options, ', model.url: ', model.url);

  // convert options.url or model.url to params.href (osapi.http expects href instead of url)
  if (!options.url) {
    params.href = (typeof(model.url) == "function" && model.url()) || model.url || null;//throw new Error('A "url" property or function must be specified');
  } else {
    params.href = options.url
    delete options.url;
  }

  if (!options.data && model && (method == 'create' || method == 'update')) {
    params.contentType = 'application/json';
    params.body = JSON.stringify(model.toJSON());
  }

  osapi.http[type](_.extend(params, options)).execute(function(res) {
    if(res.status >= 200 && res.status < 300) {
      options.success(res.content);
    } else {
      options.error(res);
    }
  });

};
