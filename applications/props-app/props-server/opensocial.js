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


// Parse OpenSocial specific parameters out of querystring

// /props/types
// ?  opensocial_owner_id    = 1%4046719dee-7651-416d-9a70-d181b643f7bb
// &  opensocial_viewer_id   = 1%4046719dee-7651-416d-9a70-d181b643f7bb
// &  opensocial_app_id      = e0a38fb5-a622-45a0-8f22-7180d7256df8
// &  opensocial_app_url     = http%3A%2F%2Fapphosting.jivesoftware.com%2Fapps%2Fdev%2Fprops%2Fapp.xml
// &  oauth_consumer_key     = e0a38fb5a62245a08f227180d7256df8
// &  oauth_signature_method = HMAC-SHA1
// &  oauth_timestamp        = 1335223168
// &  oauth_nonce            = 3043936698077483
// &  oauth_version          = 1.0
// &  oauth_signature        = vhSSD36rNeB%2BNp6CW5cg8ldU4w8%3D

exports.parseParams = function(key) {

  return function(request, response, next) {

    var query = request.query;

      function getPrefix() {
	  return query.oauth_consumer_key == key ? '' : "dev";
      }

    request.opensocial = {

      getAppId: function() {
        return query.opensocial_app_id;
      },

      getOwnerId: function() {
        var m = query.opensocial_owner_id.match(/(\d+)@(.+)/);
        if(m.length == 3) {
          return m[1];
        }
      },

      getJiveId: function() {
        var m = query.opensocial_owner_id.match(/(\d+)@(.+)/);
        if(m.length == 3) {
            return getPrefix() + m[2];
        }
      }

    };

    next();

  };

};
