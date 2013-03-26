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


function Router() {

    var defaultRoutes = {
            'main'                  :         'showMain',
            'gallery-create'        :         'galleryCreate',
            'gallery-edit/:id'      :         'galleryEdit',
            'gallery-edit-cancel'   :         'galleryEditCancel',
            'gallery-delete/:id'    :         'galleryDelete',
            'gallery-drop/:id'      :         'galleryDrop',
            'gallery-select/:id'      :       'galleryDrop',
            'gallery-view/:id/:userid':         'galleryView',
            'gallery-saved/:id'     :         'gallerySaved',
            'close'                 :         'close',
            '*actions'              :         'defaultAction'
    };

    var container;
    var AppRouter = Backbone.Router.extend({


        showMain:function () {
            this.galleryList();
        },

        galleryList: function() {
            this.galleryListController.galleryList();
        },

        galleryCreate:function () {
            this.galleryController.galleryCreate();
        },

        galleryEdit:function (galleryID) {
            this.galleryController.galleryEdit(galleryID);
        },

        galleryEditCancel:function (galleryID) {
            this.showMain();
        },

        galleryDelete:function (galleryID) {
            this.galleryController.galleryDelete(galleryID);
        },

        gallerySaved:function (galleryID) {
            this.showMain();
        },

        galleryDrop:function (galleryID) {
            this.galleryController.galleryDrop(galleryID);
        },

        galleryView:function(galleryID,  userid) {
            this.galleryController.galleryView(galleryID, userid);
        },

        close: function() {
            osapi.jive.core.container.closeApp();
        },

        defaultAction:function () {
            container.loadExperience();
        }

    });

    var initialize = function (appContainer) {

        var routes = defaultRoutes;
	    container = appContainer;

        // override any routes according to context
        var appContext = container.getAppContext();
        if ( appContext ) {
            var routeOverrides = appContext.routes;
            if ( routeOverrides ) {
                for (var key in routeOverrides) {
                    if (routeOverrides.hasOwnProperty(key)) {
                        var val = routeOverrides[key];
                        if ( val ) {
                            routes[key] = val;
                        }
                    }
                }
            }
        }
        var app_router = new AppRouter( {
            routes: routes
        });

        var viewManager = new ViewManager();
        app_router.galleryListController = new GalleryListController(container, viewManager);
        app_router.galleryController = new GalleryController(container, viewManager);

        Backbone.history.start();
    };

    return {
        initialize:initialize
    };
}
