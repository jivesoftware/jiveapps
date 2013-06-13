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

window.GivePropsWizardView = Backbone.View.extend({

    initialize: function(options) {
        _.bindAll(this, 'recipientSelected', 'reset');

        this.$el = $(this.el);
        this.typeAheadSource = options.typeAheadSource || [];

        this.setupPropsRemainingCountListener();

        this.setupClickListeners();
        this.setupRecipientTypeahead();
        this.setupTrophyChooser();
        this.setupTrophyAnimation();
        this.setupModalActions();
        this.trophyTemplate = _.template($('#trophy-choice-template').html());
	    this.artifactTemplate = _.template($('#artifact-template').html());

        this.selectedPerson = null;

        this.alertTemplate = _.template($('#alert-template').html());

    },

    reset: function() {
        this.$('.user-typeahead').show().val("").focus();
        this.$('.chosen').hide();

        this.$('.trophy-case-wrapper').fadeOut('fast');
    },

    clearSelections: function() {
        this.selectedPerson   = null;
        this.selectedPropType = null;
    },

    setupPropsRemainingCountListener: function() {
        var that = this;
        window.viewer.on('change:props_remaining_today', function(model, value, options) {
            $('#props_remaining_today').html(value);
            if(value > 0) {
                that.$('.user-typeahead').show().focus();
            } else {
                that.$('.user-typeahead').hide();
            }
        });
    },

    setupClickListeners: function() {
        console.log('GivePropsWizardView, setupClickListeners: ', this.$('.btn-pick-someone-else'));
        this.$('.btn-pick-someone-else').click(this.reset);
    },

    // ======================================================
    // Recipient Typeahead
    // ======================================================

    setupRecipientTypeahead: function() {
        this.$('.user-typeahead').typeahead({
            matchProp: 'displayName',
            sortProp: 'displayName',
            valueProp: 'id',
            source: People.typeAheadSearch,
            itemSelected: this.recipientSelected
        });
    },

    recipientSelected: function (item, val, text, person) {
        if(!person) {
           this.selectedPerson = People.findFromSearchResults(val);
		   person =  this.selectedPerson;
        } else {
           this.selectedPerson = person;
        }

        // race condition possibility here - propTypes and viewer need to load for trophies to appear
        this.renderTrophies();

        this.$('.user-typeahead').hide();
        $('.typeahead.dropdown-menu').hide();

        this.$('.chosen').show();
        this.$('.chosen span').html(person.displayName);

	    var context = opensocial.getEnvironment().jiveUrl.match(/\/.+(\/.*)/);
	    var thumbnailUrl = (context ? context[1] : '') + "/people/" + person.jive.username + "/avatar";
        this.$('.chosen img').attr({ src: thumbnailUrl });
        // this.$('.chosen').prepend($('<img>').attr({'src': person.thumbnailUrl, 'width':'48', 'height':'48','border':'0'}));

        this.$('.trophy-case-wrapper').fadeIn();
    },

    // ======================================================
    // Trophy Chooser View
    // ======================================================

    renderTrophies: function(props) {
        var that = this;
        var el = this.$el.find('.trophy_case');
        el.find('.trophies').remove();
        el.append('<div class="trophies"></div>');
        var $row = el.find('.trophies').last();

        // race condition possibility here - propTypes and viewer need to load for trophies to appear
        if(viewer) {
            var viewerPoints = viewer.get('jive').level ? viewer.get('jive').level.points : 100000; // Jive not using points system
            propTypes.registerOnLoad(function() {
                propTypes.each(function(propType) {
                    if($row.children().length == 3) {
                        el.append('<div class="trophies"></div>');
                        $row = el.find('.trophies').last();
                    }

                    var trophyHtml = that.trophyTemplate(propType.toJSON());
                    if(propType.get('level') <= viewerPoints) {
                        trophyHtml = $(trophyHtml).addClass('enabled');
                    } else {
                        var message = propType.get('level') + " points needed to unlock!<br>You currently have " + viewerPoints + " points!";
                        trophyHtml = $(trophyHtml).addClass('disabled').attr('title', message);
                    }
                    $row.append(trophyHtml);
                });
            });
        }

        this.setupTrophyAnimation();
        this.setupTrophyTooltips();

        // add an extra shelf
        el.append('<div class="trophies"></div>');
    },

    setupTrophyChooser: function() {
        var that = this;
        this.$el.on('click', '.trophy.enabled', function() {
            var $this = $(this);

            // TODO: temporary hack to get trophy image, should come from propType,
            // once they have proper images
            var propTypeImage = $this.find('.bg').css('background-image');

            // determine trophy clicked on
            var propTypeName = $this.data('name');
            var propType = that.selectedPropType = propTypes.find(function(propType) { return propType.get('$ItemName') == propTypeName; });

            var firstName = that.selectedPerson.displayName.split(" ")[0];
            $('#propModal .name').html(firstName);

            $('#propModal .trophy .lbl').html(propType.get('title'));
            $('#propModal .trophy .bg').css('background-image', propTypeImage);
            $('#propModal textarea').val(propType.get('definition'));

            if ($.browser.msie) {
                console.log("IE detected in giving prop!");
                $("#propModal").show();
            }
            $('#propModal').modal('show');
        });

        $('#propModal').on('shown', function () {
            $('#propModal textarea')[0].focus();
            $('#propModal textarea')[0].select();
        });
    },

    setupTrophyAnimation: function() {
        this.$('.trophy.enabled').hover(function(){
            $(this).find('.bg').animate({top:'-10px'},{queue:false,duration:150});
        }, function(){
            $(this).find('.bg').animate({top:'0px'},{queue:false,duration:150});
        });
    },

    setupTrophyTooltips: function() {
        this.$('.trophy').tooltip({placement:'right'});
    },

    setupModalActions: function() {
        var that = this;
        $('#propModal .give-it').click(function() {
            // TODO: Create prop record, refresh prop collection & activity view
            console.log("About to create a new prop");

            $('#propModal .give-it').addClass('disabled').html("One sec...");

            var personName = that.selectedPerson.displayName.split(" ")[0];

            var newProp = new Prop({
                user_id: that.selectedPerson.id,
                prop_type: that.selectedPropType.get('$ItemName'),
                message: $('#propModal textarea').val(),
                stream_entry_url: ''
            });

            // If posting via the RTE, we should have a context reference to what piece of content this is...
            if(that.contextReference) {
                newProp.set({
                    content_type:  that.contextReference.type,
                    content_id:    that.contextReference.id,
                    content_title: that.contextReference.title,
                    content_link:  that.contextReference.link
                });
            }

            function postActivity() {
                var activity = {
                    content: "${@actor} gave ${@target} props.",
                    title: "Jive Props",
                    object: {
                        id: "/people/" + newProp.get("user_id"),
                        objectType: "article",
                        title: "object title",
                        summary: newProp.get("message"),
                        image: {
                            url: that.selectedPropType.get("image_url")
                        }
                    },
                    target: {
                        id: "/people/" + newProp.get("user_id")
                    }
                };
                osapi.jive.corev3.activities.create(activity).execute(postNotification);
            }

            function postNotification(activityPostResponse) { // activityPostResponse is a StreamEntry object
                console.log("activity post response:",activityPostResponse)
		        if(!activityPostResponse.error) {
                    newProp.set({ stream_entry_url: activityPostResponse.url });

                    // no need to notify if it is EE since the recipient is @mentioned
                    if(gadgets.views.getCurrentView().getName() === 'embedded.embedProp') {
                        completePropsGiving(activityPostResponse, activityPostResponse);
                        return;
                    }

                    var notification = {
			            openSocial: {
                            deliverTo: [ "/people/" +  newProp.get("user_id") ]
			            },
			            content: "${@actor} has given you props.",
			            title: "Jive Props",
			            object: {
                            // id: "/people/" + newProp.get("user_id"),
                            objectType: "article",
                            title: "object title",
                            summary: newProp.get("message") + "<br><br><a href='" + activityPostResponse.url + "'>Go to this Activity</a>",
                            image: {
				                url: that.selectedPropType.get("image_url")
                            }
			            },
			            target: {
                            id: "/people/" + newProp.get("user_id")
			            },
			            url: activityPostResponse.url
                    };
                    osapi.jive.corev3.activities.create(notification).execute(function(resp) { completePropsGiving(activityPostResponse, resp); });
		        }
		        else {
                    var errorString = "Posting of activity was unsuccessful! " + (activityPostResponse.error.message || '');
                    that.showAutoHideAlert('error', '<strong>Error!</strong> ' + errorString);
                    complete(true);
		        }
            }

            function completePropsGiving(activityPostResponse, notificationPostResponse) {
		        if(notificationPostResponse.error) {
		            var errorString = "Posting of notification was unsuccessful! " + (notificationPostResponse.error.message || '');
		            that.showAutoHideAlert('error', '<strong>Error!</strong> ' + errorString);
		            complete(true);
		        }
		        else {
		            $('#propModal .give-it').html("Almost done ...");
		            newProp.save(null, {
			            success: function(model, resp) {
			                console.log("Stream entry URL saved");
                            newProp.set({ '$ItemName': resp['$ItemName'] });
                            props.unshift(newProp);
                            window.viewer.decrementPropsRemaining();
                            that.showAutoHideAlert('success', '<strong>Success!</strong> Prop given to ' + personName + '!');
			                complete(false);
			            },
			            error: function(originalModel, resp, options) {
                            var errors = resp.content;
                            var errorString = _.map(errors, function(error) { return error[0] + " " + error[1]; }).join(", ");
                            that.showAutoHideAlert('error', '<strong>Error!</strong> ' + errorString);

                            complete(true);
			            }
		            });
		        }
            }

	        function complete(errored) {
		        if(gadgets.views.getCurrentView().getName() === 'embedded.embedProp') {
                    if(errored) that.reset();
                    else {
                        that.closeAppAndReturnArtifact(newProp,
                                                       that.selectedPerson.displayName,
                                                       that.selectedPropType.get('title'),
                                                       that.selectedPropType.get('image_url'));
                    }
		        }
                else {
		            window.sidebarView.showView('prop-activity');
		        }
		        that.clearSelections();
                $('#propModal').modal('hide');
                $('#propModal .give-it').removeClass('disabled').html("Give It!");
	        }

            $('#propModal .give-it').html("Saving ...");
            postActivity();

            console.log("newProp: ", newProp);

            // if(gadgets.views.getCurrentView().getName() !== 'embedded.embedProp') {
            that.reset(); // TODO: should listen for event
            // }
        });
    },

    showAutoHideAlert: function(type, message) {
        if(!type) {
            type = 'success';
        }

        var alertBox = $(this.alertTemplate()).addClass('alert-' + type).append(message);
	if(gadgets.views.getCurrentView().getName() === 'embedded.embedProp') {
	    $('#give-props').prepend(alertBox);
	}
        else $('#prop-activity #stream').prepend(alertBox);

        setTimeout(function(){
            alertBox.alert('close');
        }, 2000);
    },

    closeAppAndReturnArtifact: function(newProp, personName, propTypeTitle, imageUrl) {
        var message = window.viewer.get('name') + ' gave ' + personName;
        message    += ' the ' + propTypeTitle + ' prop - "';
        message    += newProp.get('message') + '"';

	    var artifactMetadata = {
	        display: {
		        type: "image",
		        previewImage: imageUrl,
		        label: message
	        },
	        target: {
                type: "embed",
                view: "embedded.showProp",
                context: {
		            "propId": newProp.get('$ItemName')
                }
	        }
        };

	    var thisView = this;
	    osapi.jive.core.container.artifacts.create(artifactMetadata, 'org.jiveProps.embedProp', function (artifactMarkup) {
	        if(!artifactMarkup.error) {
		        var artifactValues = {
                    user_profile_url: newProp.get("user_profile_url"),
                    prop_title: propTypeTitle,
                    user_name: personName,
		            artifact_markup: artifactMarkup.markup,
		            artifact_text: newProp.get('message'),
                    stream_entry_url: newProp.get('stream_entry_url')
		        };
		        var dropHtml = thisView.artifactTemplate(artifactValues);
		        osapi.jive.core.container.editor().insert(dropHtml);
		        // osapi.jive.core.container.closeApp();
	        }
	        else {
	        }
	    }, false, true);
    },

    locatePerson: function(replyToId, type) {
    	var context = opensocial.getEnvironment().jiveUrl.match(/\/.+(\/.*)/);
    	var url = (context ? context[1] : '') + "/social/rpc?st=" + encodeURIComponent(gadgets.util.getUrlParameters()['st']);
    	var payload = [{
		"method":"jive.core.get",
		"id":"jive.core.get",
		"params": { "v":"v3", "href":"/messages/" + replyToId, "userId":"@viewer", "groupId":"@self" }
    	}];

	    if(type == "osapi.jive.core.Comment") {
		    payload = [{
		    "method":"jive.core.get",
		    "id":"jive.core.get",
		    "params": { "v":"v3", "href":"/comments/" + replyToId, "userId":"@viewer", "groupId":"@self" }
        	}];
    	} else if(type == "osapi.jive.core.Document") {
		    payload = [{
		    "method":"jive.core.get",
		    "id":"jive.core.get",
		    "params": { "v":"v3", "href":"/document/" + replyToId, "userId":"@viewer", "groupId":"@self" }
        	}];
    	}

	    var result = undefined;
    	$.ajax({
		url: url,
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(payload),
        	asyncBoolean : false,
		success: function(res) {
	    	if(res.length > 0 && res[0].result && res[0].result.status == 200) {
			result = res[0].result.content;
                 	console.log("search for content", result);
	    	
    	        	this.selectedPerson = People.findById(result.author.id);                              
	    	} else {
			console.log("search for content error", res);
	    	}
	}
    });    
},

    loadJiveContent: function(contextReference) {
        console.log('loadJiveContent, contextReference: ', contextReference);
        var that = this;

        if(!contextReference) {
            contextReference = {};
        }
        this.contextReference = contextReference;

        if(contextReference.id) {
//            if(contextReference.type === 'osapi.jive.core.Document') {
//                osapi.jive.corev3.documents.get({id: contextReference.id}).execute(function(res) {
//                    if(!res.error) {
//                        var doc = res.data;
//                        that.contextReference.link = res.data.resources.html.ref;
//                        that.contextReference.title = res.data.subject;
//                        console.log("that.contextReference: ", that.contextReference);
//                    }
//                });
//            }
            // TODO: add other content types...
        }

        if(contextReference.inReplyToId) {
            console.log('reply to id = ' + contextReference.inReplyToId);
	    this.locatePerson(contextReference.inReplyToId, contextReference.inReplyTotype);
        } else {
            if(contextReference.type == "osapi.jive.core.Document") {
		         osapi.jive.corev3.documents.get(contextReference.id).execute(function(res) {
			         this.selectedPerson = People.findById(res.list[0].author.id); 
                 });
            } else if(contextReference.type == "osapi.jive.core.Discussion") {
		         osapi.jive.corev3.discussions.get(contextReference.id).execute(function(res) {
			         this.selectedPerson = People.findById(res.list[0].author.id); 
               });
            }
        }

    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    },

    toggle: function() {
        this.$el.toggle();
    }


});
