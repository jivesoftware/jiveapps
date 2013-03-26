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

window.Person = Backbone.Model.extend({

    /**
     * Set default attribute values
     * TODO: Blank out defaults once values are loaded from server
     */
    defaults: function() {
        return {
            prop_count: '&nbsp;',
            avatarURL: $.jiveproxyurl('img/avatars/default.png')
        };
    },

    initialize: function() {
        // _.bindAll(this, 'getNumberOfPropsLeftToday');
        this.setupPropsCollection();
    },

    set: function(attributes, options) {
        // compute avatar url
        if (attributes.thumbnailUrl && JIVE_INSTANCE) {
            if(attributes.thumbnailUrl.match(/^https?:\/\//i)) {
                attributes.avatarURL = attributes.thumbnailUrl;
            }
            else attributes.avatarURL = JIVE_INSTANCE + "/api/core/v3" + attributes.thumbnailUrl;
        } else if (attributes.resources && attributes.resources.avatar && JIVE_INSTANCE) {
            if(attributes.resources.avatar.ref.match(/^https:?\/\//i)) {
                attributes.avatarURL = attributes.resources.avatar.ref;
            }
            else attributes.avatarURL = JIVE_INSTANCE + "/api/core/v3" + attributes.resources.avatar.ref;
        }
        Backbone.Model.prototype.set.call(this, attributes, options);
        return this;
    },

    setupPropsCollection: function() {
        var that = this;
        this.props = new Props();

        // if it doesn't have an id on initialization (viewer), set props url once it does
        this.on('change:id', function() {
            that.props.url = BACKEND_HOST + '/props?user_id=' + that.get('id');
            // that.props.fetch();
        });

        // if it does have id on initialization, set props url now
        if(this.get('id')) {
            this.props.url = BACKEND_HOST + '/props?user_id=' + this.get('id');
            // this.props.fetch();
        }

        this.props.on('reset', function() {
            that.set('prop_count', that.props.length);
        });
    },

    getNumberOfPropsGivenToday: function(callback) {
        var that = this;
        osapi.http.get({
            href: BACKEND_HOST + '/props/count?days_ago=1&giver_id=' + this.get('id'),
            format: 'json',
            headers: {"Content-Type":["application/json"]},
            'authz': 'signed'
        }).execute(function(res) {
            if(res.content && res.content.length) {
                callback(parseInt(res.content[0].Count, 10));
            } else {
                console.log('error occurred getting # of props given today', res);
                callback(0);
            }
        });
    },

    getNumberOfPropsRemainingToday: function(callback) {
        if(!callback) {
            callback = function(){};
        }

        var that = this;
        var propsRemainingToday = this.get('props_remaining_today');
        if(propsRemainingToday === undefined) {
            this.getNumberOfPropsGivenToday(function(nbr) {
                propsRemainingToday = 20 - nbr;
                propsRemainingToday = propsRemainingToday > 0 ? propsRemainingToday : 0;
                that.set({props_remaining_today: propsRemainingToday});
                callback(propsRemainingToday);
            });
        } else {
            callback(propsRemainingToday);
        }
    },

    decrementPropsRemaining: function() {
        var propsRemainingToday = this.get('props_remaining_today') || 3;
        this.set({props_remaining_today: propsRemainingToday - 1});
    }

});
