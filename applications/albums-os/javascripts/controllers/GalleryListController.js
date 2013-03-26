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

window.GalleryListController = function(container, viewManager) {

    this.viewManager = viewManager;
    this.container = container;

    this.galleryList = function () {
        var galleryListModel = new GalleryList();
        var galleryListView = new GalleryListView({ container: this.container });

        galleryListModel.bind('parsed', function (galleryIDs) {

            if (!galleryIDs || galleryIDs.length < 1) {
                galleryListView.renderNoGalleries();
            }
            else {
                galleryListView.renderGalleries();

                galleryIDs.reverse();
                $.each(galleryIDs, function () {
                    var galleryID = this;

                    var gallery = new GalleryModel({id:galleryID});
                    gallery.bind('parsed', function (gallery) {
                        galleryListView.renderGallery(gallery);
                    });

                    gallery.fetch();
                });
            }

        });

        galleryListView.render();
        this.viewManager.showView(galleryListView);

        galleryListModel.fetch();
    }
}
