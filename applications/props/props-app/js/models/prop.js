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

window.Prop = Backbone.Model.extend({

    sync: OsapiHttpSync,
    urlRoot: BACKEND_HOST + '/props',

    /**
     * Set default attribute values
     * TODO: Blank out defaults once values are loaded from server
     */
    defaults: function() {
        return {
            content_id: '',
            content_type: '',
            content_link: '',
            content_title: '',
            created_at: new Date(),
            giver_avatar_url: $.jiveproxyurl('img/avatars/default.png'),
            giver_id: opensocial.data.getDataContext().getDataSet("viewer").id,
            giver_name: '&nbsp;',
            giver_profile_url: $.jiveAbsoluteLink('/people'),
            message: '&nbsp;',
            prop_image_url: '',
            prop_title: '&nbsp;',
            user_avatar_url:  $.jiveproxyurl('img/avatars/default.png'),
            user_name: '&nbsp;',
            user_profile_url: $.jiveAbsoluteLink('/people'),
            stream_entry_url: '',
	    streamEntry: undefined
        };
    },

    initialize: function() {
        var that = this;
        this.loadUser();
        this.loadGiver();
	    this.loadStreamEntry();

        this.on("change:user_id", function(val) {
            that.loadUser();
        });

        this.on("change:giver_id", function(val) {
            that.loadGiver();
        });

        this.on("change:stream_entry_url", function(val) {
            that.loadStreamEntry();
        });
    },

    set: function(attributes, options) {
        // get prop type image url
        if(attributes.prop_type) {
            var propType = propTypes.findByName(attributes.prop_type);

            attributes.prop_image_url = propType ? propType.get('proxy_image_url') : '';
            attributes.prop_reflection_image_url = propType ? propType.get('proxy_reflection_image_url') : '';
            attributes.prop_title = propType ? propType.get('title') : '';
        }

        if(attributes.content_type) {
            attributes.content_type_css_class = "jive-icon-" + _.last(attributes.content_type.split('.')).toLowerCase();
        }

        Backbone.Model.prototype.set.call(this, attributes, options);
        return this;
    },

    loadUser: function() {
        var that = this;
        window.people.loadIfAbsent(this.get('user_id'), function(person) {
            that.set({
                user_name: person.get('name').formatted,
                user_avatar_url: person.get('avatarURL'),
                user_profile_url: $.jiveAbsoluteLink('/people/' + person.get('jive').username)
            });
        });
    },

    loadGiver: function() {
        var that = this;
        window.people.loadIfAbsent(this.get('giver_id'), function(person) {
            that.set({
                giver_name: person.get('name').formatted,
                giver_avatar_url: person.get('avatarURL'),
                giver_profile_url: $.jiveAbsoluteLink('/people/' + person.get('jive').username)
            });
        });
    },

    loadStreamEntry: function() {
	if(this.get('stream_entry_url').match(/(\d+)$/)) {
	    var streamId = this.get('stream_entry_url').match(/(\d+)$/)[1];
	    var thisProp = this;
	    osapi.jive.corev3.streamEntries.get({uri: '/streamEntries/' + streamId }).execute(function(r) {
		if(r.error) console.log(JSON.stringify(error));
		else thisProp.set('streamEntry', r);
	    });
	}
    }
});