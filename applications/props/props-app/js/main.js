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

var JIVE_INSTANCE = null;

gadgets.util.registerOnLoadHandler(function() {

    // ======================================================
    // Backbone App Initialization
    // ======================================================

    JIVE_INSTANCE = gadgets.config.get()['jive-opensocial-ext-v1']['jiveUrl'];

    window.people    = new People();
    window.props     = new Props();
    window.propTypes = new PropTypes();
    window.propTypes.fetch({success: function() {
        if(currentView === 'canvas' || currentView === 'default') props.fetch();
        window.propTypes.ready = true;
        window.propTypes.callOnLoadCallbacks();
    }});
    window.viewer = new Person();

    // Get viewer's level
    var dataContext = opensocial.data.getDataContext();
    var viewerData  = dataContext.getDataSet("viewer");
    osapi.jive.corev3.people.get({id:"@me"}).execute(function(me) {
        if(me) {
            viewer.set(me);
            people.add(viewer);
            viewer.getNumberOfPropsRemainingToday();
        }
    });

    var currentView = gadgets.views.getCurrentView().getName();

    // resize app window to fit content
    // gadgets.window.adjustHeight(550);

    window.trophyDisplayView   = new TrophyDisplayView({el: '#my-trophy-case'});
    window.trophySidebarView   = new TrophySidebarView({el: $('.trophy_sidebar')});

    window.givePropsWizardView = new GivePropsWizardView({collection: window.props, el: '#give-props'});
    window.sidebarView         = new SidebarView({el: '.sidebar'});

    sidebarView.on('viewChanged', trophySidebarView.fadeOut);

    // If invoked via the RTE
    if(currentView === 'embedded.embedProp' || currentView === 'embedded.showProp') {
        // Hide the Sidebar
        $('.sidebar').hide();

        // Make main column full width
        $('.main-content').removeClass('span9').addClass('span12');

        // Hide the titlebar
        $('.main-content .subnav').hide();

        // If embedding a prop
        if(currentView === 'embedded.embedProp') {
            // Show the Give Props view
            sidebarView.showView('give-props');

            // Get RTE context reference
            window.contextReference = {};
            gadgets.actions.updateAction({
                id: "org.jiveProps.embedProp",
                callback: function(context) {
                    console.log('All of the context: ', context);
                    if(context.jive.content.id === 0 && context.jive.content.parent && context.jive.content.parent.id !== 0) {
                        console.log('Refer to parent content', context.jive.content.parent.type, ' ', context.jive.content.parent.id);
                        contextReference.type = context.jive.content.parent.type;
                        contextReference.id   = context.jive.content.parent.id;

                        if(context.jive.content.inReplyTo) {
                            contextReference.inReplyToId = context.jive.content.inReplyTo.id;
                            contextReference.inReplyTotype = context.jive.content.inReplyTo.type;
                        }
                    } else {
                        console.log('Refer to this content', context.jive.content.type, ' ', context.jive.content.id);
                        contextReference.type = context.jive.content.type;
                        contextReference.id   = context.jive.content.id;
                    }
                    givePropsWizardView.loadJiveContent(contextReference);
                }
            });
        }

        // If showing a prop
        if(currentView === 'embedded.showProp') {
            opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function(key) {
                // get prop id from EE context
                var context = opensocial.data.getDataContext().getDataSet(key);
                var propId = context.target.context.propId;

                // fetch prop from server
                window.selectedProp = new Prop({id: propId});

                var intervalId = setInterval(function() {
                    if(window.propTypes.ready) {
                        clearInterval(intervalId);
                        // render single prop in activity stream
                        var activityEntryView = new ActivityEntryView({model: selectedProp});

                        selectedProp.fetch({success: function() {
                            console.log(activityEntryView.model);
                            $('#stream').append(activityEntryView.render().el);
                        }});
                    }
                }, 300);
            });

        }

    // otherwise, show main view
    } else {
        // Initialize additional components for main view
        window.sidebarView         = new SidebarView({el: '.sidebar'});
        window.activityStreamView  = new ActivityStreamView({collection: window.props, el: '#stream'});
        window.findTrophyCaseView  = new FindTrophyCaseView({el: '#find-trophy-case'});

        sidebarView.on('personSelected', trophyDisplayView.selectPerson);
        trophyDisplayView.on('giveProps', sidebarView.deselectPerson);

        trophyDisplayView.on('trophySelected', trophySidebarView.render);
        findTrophyCaseView.trophyDisplayView.on("trophySelected", trophySidebarView.render);
    }

    console.log("browser: "+$.browser)
    if ($.browser.msie) {
        console.log("IE detected!");
        $('#propModal').removeClass('hide').removeClass('fade').hide();
    }

    $('#panel-loading').hide();
    $('#panel-main').show();

    // ======================================================
    // Debug View
    // ======================================================
    var showDebugView = function() {
        givePropsWizardView.toggle();
        trophyDisplayView.hide();
        $('#debug-view').toggle();
        $('#main-title').html($('#main-title').html() === "Debug View" ? "Give Props!" : "Debug View");
        $('#btnDebugView').html($('#btnDebugView').html() === "Debug View" ? "Give Props" : "Debug View");
    };
    $('#btnDebugView').click(showDebugView);

    // // Temporary
    // if(currentView === 'embedded.embedProp') {
    //     showDebugView();
    // }

    $('#debug_backend_request_submit').click(function() {
        var method = $('#debug_backend_request_method').val().toLowerCase();

        var options = {
            href: $('#debug_backend_request_url').val(),
            format: 'json',
            authz: 'signed',
            noCache: true,
            headers: {"Content-Type":["application/json"]}
        };

        var params = $('#debug_backend_request_params').val();
        if(params.length > 0) {
            var paramsJSON = JSON.parse(params);
            options['body'] = JSON.stringify(paramsJSON);
        }

        osapi.http[method](options).execute(function(res) {
            // console.log(res);
            $('#debug_backend_request_result').val(JSON.stringify(res, null, 2));
        });
    });

    $('#debug_drop_rte_artifact').click(function(e) {
        e.preventDefault();

        var propType = propTypes.at(0);

        alert("icon + label + embedded id");

        // osapi.jive.core.container.closeApp({
        //   "display": {
        //     "type": "text",
        //     "icon": propType.get('image_url'),
        //     "label": "You Got Props!"
        //   },
        //   "target": {
        //     "type": "embed",
        //     "view": "embedded.embedProp",
        //     "context": {
        //       "id": "EDIT_ME_ID",
        //       "lastUpdated": "2012-Jan-23"
        //     }
        //   }
        // });

        osapi.jive.core.container.closeApp({
          data:{
            display: {
              type: "text",
              icon: "http://apphosting.jivesoftware.com/apps/dev/props/img/icon16.png",
              label: "You got props, son. (or daughter)"
            },
            target: {
                type: "embed",
                view: "embedded.showProp",
                context: {
                    "id": "EDIT_ME_ID"
                }
            }
            // target: {
            //   type: "url",
            //   url: propType.get('image_url')
            // }
          }
        });
    });

    // ======================================================
    // Preload Images
    // ======================================================

    function preloadCssBackgrounds(cssSelector) {
        $(cssSelector).each(function() {
            var str = $(this).css('background-image');
	    if(str != 'none') {
		str = str.substring(4, str.length-1);
		$('<img/>')[0].src = str;
	    }
        });
    }

    preloadCssBackgrounds('.trophies');
    preloadCssBackgrounds('.trophy .bg');

});
