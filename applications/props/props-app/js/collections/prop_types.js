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

window.PropTypes = Backbone.Collection.extend({
  model: PropType,
  sync: OsapiHttpSync,
  url: BACKEND_HOST + '/props/types?level=1000',
  onLoadCallbacks: [],

  getAllByLevel: function(level) {
    return this.filter(function(propType) {
      return propType.get('level') <= level;
    });
  },

  findByName: function(name) {
    return this.find(function(prop) { return prop.get('$ItemName') == name; });
  },

  registerOnLoad: function(callback) {
      if(window.propTypes.ready) callback();
      else push(onLoadCallbacks, callback);
  },

  callOnLoadCallbacks: function() {
      for(var i in onLoadCallbacks) {
          onLoadCallbacks[i]();
      }
  }

});
