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

function Container() {
    return {

        mostRecentSize:{ width:0, height:0 },

        props: {},

        appContext: {},

        getValue:function (object, prop) {
            if (!(object && object[prop])) return null;
            return _.isFunction(object[prop]) ? object[prop]() : object[prop];
        },

        sync:function (method, model, options) {
            if (model.useAppData /* && model.appDataKey && model.appDataFields */) {
                // Ensure that we have the appropriate request data.
                if (!options.data && model && (method == 'create' || method == 'update')) {
                    var data = model.toJSON();
                    var key = model.appDataKey();

                    var obj = {};
                    obj[key] = JSON.stringify(data);
                    osapi.appdata.update({
                        data:obj,
                        userId:'@me',
                        escapeType:opensocial.EscapeType.NONE
                    }).execute(function (response) {
                            if (response.error) {
                                console.log("update error", response.error);
                                if (options.error) {
                                    options.error( response.error);
                                }
                            } else {
                                console.log("update response", response);
                                model.set('id', key);
                                if (options.postSuccess) {
                                    options.postSuccess(model);
                                }
                                model.trigger("saved");
                            }
                        });
                } else if (method == 'read') {
                    var payload = {
                        userId: model.creatorId ? model.creatorId() : '@me',
                        fields:model.appDataFields(),
                        escapeType:opensocial.EscapeType.NONE
                    };

                    osapi.appdata.get(payload).execute(function (response) {
                        if (response.error) {
                            console.log("fetch error", response.error);
                            if (options.error) {
                                options.error( response.error );
                            }
                        }
                        else {
                            model.parse(response);
                            if (options.postSuccess) {
                                options.postSuccess(model);
                            }
                        }
                    });
                } else if (method == 'delete') {
                    var payload = {
                        keys:model.appDataFields(),
                        userId:'@me'
                    };
                    console.log("to remove", payload);
                    osapi.appdata['delete'](payload).execute(function (response) {
                        if (response.error) {
                            console.log("delete error", response.error);
                            if (options.error) {
                                options.error(response.error);
                            }
                        }
                        else {
                            if (options.postSuccess) {
                                options.postSuccess(model);
                            }
                            model.trigger("deleted");
                        }
                    });
                }
            } else {
                // a call to some resource local to the app?

                var base = gadgets.util.getUrlParameters()['url'];
                base = base.substring(0, base.lastIndexOf('/'));

                var href = base + this.getValue(model, 'url') + "?ts=" + new Date().getTime();
                var payload = { 'href':href, 'format':'json', 'authz':null }; // xxx AUTHZ is unsigned for now!!! REMOVE THIS HACK WHEN GOING AGAINST REAL SERVICE
                if (model.headers) {
                    payload.headers = this.getValue(model, 'headers');
                }
                payload.callback = function (data) {
                    if (data.status == 200 || data.status == 204) {
                        model.parse(data.content);
                        if (options.postSuccess) {
                            options.postSuccess(model, data);
                        }
                    } else {
                        var resp;
                        if (data.content && data.content.jiveFault) {
                            resp = data.content;
                        } else {
                            resp = {"jiveFault":{"stackTrace":"", "errorMessage":data.status, "errorCode":"UNKNOWN_ERROR", "requestId":"", "blocking":false}};
                        }
                        options.error(model, resp);
                    }
                };

                if ((method == "read" && model.postForRead) || method == 'create') {
                    osapi.http.post(payload).execute(payload.callback);
                } else if (method == "read") {
                    osapi.http.get(payload).execute(payload.callback);
                } else {
                    alert('Unsupported method');
                }
            }

        },

        loadExperience:function () {
	        var container = this;
	        $.get(gadgets.io.getProxyUrl(gadgets.util.getUrlParameters()['url'].replace(/(\/app.xml)|(\/gadget.xml)/, '/templates.html')) + "&nocache=1",
		          function(templates) {
		              container.$templates = $(templates);
		              $('body').append(templates);
		              var experience = container.appContext.defaultRoute || 'main';
		              Backbone.history.navigate( experience, true );
		          });
        },

	    getTemplate: function(selector) {
	        return this.$templates.filter(selector).html();
	    },

        httpPost:function (options) {

            var base = gadgets.util.getUrlParameters()['url'];
            base = base.substring(0, base.lastIndexOf('/'));

            var payload = {
                'href':base + this.getValue(options, 'url'),
                'format':'json',
                'authz':'signed'
            };

            if (options.headers) {
                payload.headers = this.getValue(options, 'headers');
            }

            if (options.data) {
                payload.body = JSON.stringify(this.getValue(options, 'data'));
            }

            osapi.http.post(payload).execute(function (data) {
                if (data.status == 200 || data.status == 204) {
                    options.success(data.content);
                } else {
                    var resp;
                    if (data.content && data.content.jiveFault) {
                        resp = data.content;
                    } else {
                        resp = {"jiveFault":{"stackTrace":"", "errorMessage":data.status, "errorCode":"UNKNOWN_ERROR", "requestId":"", "blocking":false}};
                    }
                    //TODO: Generic Error Handling
                    if (options.error) {
                        options.error(resp);
                    }
                }
            });

        },

        httpGet:function (options) {

            var base = gadgets.util.getUrlParameters()['url'];
            base = base.substring(0, base.lastIndexOf('/'));

            var payload = {
                'href':base + this.getValue(options, 'url'),
                'format':'json',
                'authz':'signed'
            };

            if (options.headers) {
                payload.headers = this.getValue(options, 'headers');
            }

            osapi.http.get(payload).execute(function (data) {
                if (data.status == 200 || data.status == 204) {
                    options.success(data.content);
                } else {
                    var resp;
                    if (data.content && data.content.jiveFault) {
                        resp = data.content;
                    } else {
                        resp = {"jiveFault":{"stackTrace":"", "errorMessage":data.status, "errorCode":"UNKNOWN_ERROR", "requestId":"", "blocking":false}};
                    }
                    //TODO: Generic Error Handling
                    if (options.error) {
                        options.error(resp);
                    }
                }
            });

        },

        getProxyUrl:function (url) {
            return gadgets.io.getProxyUrl(url) + "&nocache=" + gadgets.util.getUrlParameters()['nocache'];
        },

        close:function (closeEvents) {
            if (closeEvents) {
                osapi.jive.core.container.closeApp({data:{events:closeEvents}});
            } else {
                osapi.jive.core.container.closeApp();
            }
        },

        getViewerId:function () {
            return opensocial.data.getDataContext().getDataSet('sbsContext').user.userID;
        },

        adjustSize:function () {
            this.adjustWidth();
            this.adjustHeight();
        },

        adjustWidth:function (opt_width) {
            if (gadgets.window.adjustWidth) {
                gadgets.window.adjustWidth(opt_width);
            }
        },

        adjustHeight:function (opt_height) {
            if (gadgets.window.adjustHeight) {
                gadgets.window.adjustHeight(opt_height);
            }
        },

        windowWidthHasChanged:function (opt_width) {

            var thisWidth = parseInt(opt_width || gadgets.window.getWidth(), 0);
            if (thisWidth == this.mostRecentSize.width)
                return false;

            this.mostRecentSize.width = thisWidth;
            return true;

        },

        windowHeightHasChanged:function (opt_height) {

            var thisHeight = parseInt(opt_height || gadgets.window.getHeight(), 0);
            if (thisHeight == this.mostRecentSize.height)
                return false;

            this.mostRecentSize.height = thisHeight;
            return true;

        },

        getUser:function (owner, callback) {
            osapi.people.get({"userId": owner}).execute(callback);
        },

        setProps: function( props ) {
            this.props = props;
        },

        getProps: function() {
            return this.props;
        },

        setAppContext: function( context ) {
            if ( context ) {
                this.appContext = context;
            }
        },

        getAppContext: function() {
            return this.appContext;
        }

    };
}
