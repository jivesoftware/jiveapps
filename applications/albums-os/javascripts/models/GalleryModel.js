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

window.GalleryModel = Backbone.Model.extend({
    defaults: {
        title: '',
        imgIDs: '',
        preview: '',
        userid: '',
        created: 0,
        parentList: null
    },
    useAppData : true,

    appDataKey: function() {
        if(this.isNew()) {
            var create_ts = new Date().getTime();
            return $.trim( "gallery_" + create_ts );
        } else {
            return this.get('id');
        }
    },

    appDataFields:function () {
        return [this.get('id')];
    },

    creatorId: function() {
        return this.get('userid');
    },

    initialize: function() {
    },

    parse:function(content) {
        //there should be only one user
        var userIdToSave;
        for (var userId in content) {
            userIdToSave = userId;

            //there should be only one data
            for (var dataId in content[userId]) {
                if (dataId && dataId.indexOf('gallery_') == 0) {
                    var content = JSON.parse(content[userId][dataId]);

                    this.set('id', dataId);
                    this.set('title', content.title);
                    this.set('imageIDs', content.imageIDs);
                    this.set('preview', content.preview);
                    this.set('created', content.created);
                }
            }
        }

        //// ????
        for(var i in content) {
            this.set(i, content[i]);
        }

        this.set('userid', userIdToSave );

        this.trigger("parsed", this );
    },

    save: function(key, value, options) {
        if( this.isNew() ) {
            this.set('created', new Date().getTime());
        }
        //super call
        Backbone.Model.prototype.save.call(this, key, value, options);
    },

    destroy: function(passedData, callback) {
        var imgs = (this.get('imgIDs') == '' ? [] : this.get('imgIDs') );
        var title = this.get("title");

        // batch delete of the images in the gallery -- no need to do this
        // one by one
        var imgKeys = new Array();
        $.each(imgs, function(index, val) {
            imgKeys.push( 'thumb_' + val );
            imgKeys.push( 'image_' + val );
        });

        var toDelete = Backbone.Model.extend({
            useAppData: true,

            appDataFields:function () {
                return imgKeys;
            },

            isNew: function() {
                return false;
            }
        });
        var deleteInstance = new toDelete();
        var self = this;

        deleteInstance.bind("deleted", function() {
            Backbone.Model.prototype.destroy.call(self);
        });

        deleteInstance.destroy();
    }


});
