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

window.PropType = Backbone.Model.extend({

    /**
     * Set default attribute values
     * TODO: Blank out defaults once values are loaded from server
     */
    defaults: function() {
        return {
            image_url: "img/trophies/spider-man.png",
            title: "Spider Man",
            definition: "You did something amazing, beyond the normal limits.",
            level: 25
        };
    },

    set: function(attributes, options) {
        // compute image url
        if(attributes.image_url) {
            attributes.proxy_image_url = gadgets.io.getProxyUrl(attributes.image_url);
        }
        if(attributes.reflection_image_url) {
            attributes.proxy_reflection_image_url = gadgets.io.getProxyUrl(attributes.reflection_image_url);
        }
        if(attributes.level) {
            attributes.level = parseInt(attributes.level, 10);
        }

        Backbone.Model.prototype.set.call(this, attributes, options);
        return this;
    }

});