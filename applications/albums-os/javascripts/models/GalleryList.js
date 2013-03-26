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

window.GalleryList = Backbone.Model.extend({
    defaults: {
        galleryIDs: []
    },
    useAppData : true,

    appDataKey: function() {
        return "gallery_list";
    },

    appDataFields:function () {
        return ["gallery_list"];
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
                if (dataId && dataId.indexOf('gallery_list') == 0) {
                    var content = JSON.parse(content[userId][dataId]);
                    this.set('galleryIDs', content.galleryIDs);
                }
            }
        }

        //// ????
        for(var i in content) {
            this.set(i, content[i]);
        }

        this.trigger("parsed", this.get("galleryIDs") );
    },

    add: function( galleryID ) {
        var ids = this.get("galleryIDs");
        console.log("current", ids);
        if ( $.inArray(galleryID, ids) < 0 ) {
            ids.push( galleryID );
        }
        console.log("after", ids);
    },

    subtract: function( galleryID ) {
        var ids = this.get("galleryIDs");
        ids.splice(ids.indexOf(galleryID), 1);
    },

    titleExists: function( title ) {
        var ids = this.get("galleryIDs");
        $.each(ids, function () {
            var galleryID = this;
            var gallery = new GalleryModel({id:galleryID});
            gallery.bind('parsed', function (gallery) {
                // todo check if given title matches gallery title
            });
            gallery.fetch();
        });

        // todo wait for all parsed event handlers to complete and then return true/false
    }

});
