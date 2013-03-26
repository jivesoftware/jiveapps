/*
 * Copyright 2012, Jive Software Inc.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

window.GalleryImage = Backbone.Model.extend({
    defaults: {
        width: '',
        height: 0,
        src: '',
        userid: '',
        created: 0
    },
    useAppData : true,

    appDataKey: function() {
        return this.get('id');
    },

    getImageKey: function() {
        return this.get('id');
    },

    appDataFields:function () {
        return [this.get('id')];
    },

    initialize: function() {
    },

    creatorId: function() {
        return this.get('userid');
    },

    parse:function(content) {
        //there should be only one user
        for (var userId in content) {

            //there should be only one data
            for (var dataId in content[userId]) {
                if (dataId && dataId.indexOf( this.getImageKey() ) == 0) {
                    var content = JSON.parse(content[userId][dataId]);

                    this.set('id', dataId);
                    this.set('width', content.width);
                    this.set('height', content.height);
                    this.set('src', content.src);
                    this.set('created', content.created);
                    this.set('userid', userId);
                }
            }
        }

        //// ????
        for(var i in content) {
            this.set(i, content[i]);
        }

        this.trigger("parsed", this );
    },

    save: function(key, value, options) {
        if( this.isNew() ) {
            this.set('created', new Date().getTime());
        }
        //super call
        Backbone.Model.prototype.save.call(this, key, value, options);
    },

    destroy: function(key, value, options) {
        Backbone.Model.prototype.destroy.call(this, key, value, options);

    }
});
