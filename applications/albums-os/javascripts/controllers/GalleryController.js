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


window.GalleryController = function(container, viewManager) {

    this.viewManager = viewManager;
    this.container = container;

    this.galleryCreate = function () {
        var galleryModel = new GalleryModel();
        var galleryEditView = new GalleryEditView({model:galleryModel, container: this.container });

        if ( !$.browser.msie ) {
            galleryEditView.deactivateIE();
        }

        this.viewManager.showView(galleryEditView);
        if (  $.browser.msie ) {
            galleryEditView.setupIE();
        }

        galleryModel.bind("saved", function () {

            var galleryID = galleryModel.get("id");
            var galleryListModel = new GalleryList();
            galleryListModel.bind("saved", function () {
                Backbone.history.navigate('gallery-saved/' + galleryID, true);
            });
            galleryListModel.bind("parsed", function () {
                galleryListModel.add(galleryID);
                galleryListModel.save();
            });

            galleryListModel.fetch();
        });

        galleryEditView.renderGallery(galleryModel);
    };

    this.galleryEdit = function (galleryID) {

        var galleryList = new GalleryList();
        var galleryModel = new GalleryModel({id:galleryID});
        var galleryEditView = new GalleryEditView({model:galleryModel, container: this.container, listModel:galleryList });
        galleryList.fetch();

        if ( !$.browser.msie ) {
            galleryEditView.deactivateIE();
        }

        viewManager.showView(galleryEditView);
        if (  $.browser.msie ) {
            galleryEditView.setupIE();
        }

        galleryModel.bind('parsed', function (gallery) {
            galleryEditView.renderGallery(gallery);
        });

        galleryModel.bind("saved", function () {
            var galleryListModel = new GalleryList();
            galleryListModel.bind("saved", function () {
                Backbone.history.navigate('gallery-saved/' + galleryID, true);
            });
            galleryListModel.bind("parsed", function () {
                galleryListModel.add(galleryID);
                galleryListModel.save();
            });

            galleryListModel.fetch();
        });

        galleryModel.fetch();
    };

    this.galleryDelete = function (galleryID) {
        var galleryModel = new GalleryModel({id:galleryID});
        galleryModel.bind("deleted", function () {
            var galleryListModel = new GalleryList();
            galleryListModel.bind("saved", function () {
                Backbone.history.navigate('main', true);
            });
            galleryListModel.bind("parsed", function () {
                galleryListModel.subtract(galleryID);
                galleryListModel.save();
            });

            galleryListModel.fetch();
        });
        
        galleryModel.fetch( {
            postSuccess: function(model) {
        	    model.destroy();
            },
            error: function(model, response) {
                console.log("Error fetching Gallery Model to be deleted", response);
            }
        });
    };

    this.galleryDrop = function (galleryID) {
        var model = new GalleryModel({id:galleryID});
        model.fetch({postSuccess:function () {
            var galleryOwnerId = model.get("userid");

            // xxxx todo move this

            function getImageUrl(relativeUrl, proxied) {
                var gadgetURL = _args()["url"];
                var baseURL = gadgetURL.replace(/[a-zA-Z0-9_]+\.xml(\?.*)?/, "");
                return proxied ? gadgets.io.getProxyUrl(baseURL + relativeUrl) : baseURL + relativeUrl;
            }

            var title = model.get("title");
            osapi.jive.corev3.people.get({id:"@me"}).execute(function (result) {
                var id = result.id;
                var outgoing = {
                    display:{
                        "type":"text",
                        "label":"View " + title
                    },
                    target:{
                        "type":"embed",
                        "view":"show",
                        "context":{
                            "galleryID":galleryID,
                            "userid": galleryOwnerId
                        }
                    }
                };

                osapi.jive.version.getVersionInfo().execute(function (data) {
                    osapi.jive.core.container.artifacts.create(outgoing, 'com.jivesoftware.inline.gallery.show',
                                                               function (markupResponse) {
                                                                   var artifactMarkup = markupResponse.markup, error = markupResponse.error;
                                                                   var artifactDom = $('<span>' + artifactMarkup + '</span>');
                                                                   artifactDom.find('a').html('<img src="' + model.get("preview") + '"/>');
                                                                   var html = artifactDom.html() + "<div>" + artifactMarkup + "</div>";
                                                                   osapi.jive.core.container.editor().insert(html);
                                                               }, false, true);
                });
            });
        }});


    };

    this.galleryView = function( galleryID,  userid) {

        var gallery = new GalleryModel({id:galleryID, userid: userid});
        var view = new GalleryViewer({model: gallery, container: this.container });

        var viewManager = this.viewManager;
        gallery.bind("parsed", function(gallery) {
            gadgets.window.setTitle("Jive Albums: "+ gallery.attributes.title)
            view.render();
            viewManager.showView(view);
        });

        gallery.fetch();
    };

}
