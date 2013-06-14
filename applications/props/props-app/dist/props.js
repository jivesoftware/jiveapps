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

// change this to point to your backend service
window.BACKEND_HOST='http://gentle-scrubland-4425.herokuapp.com';
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

// Backbone.Sync implementation for Osapi.http
var OsapiHttpSync = function(method, model, options) {

  // console.log('OsapiHttpSync - method: ', method, ', model: ', model, ', options: ', options);

  if(options === null) {
    options = {};
  }

  var methodMap = {
    'create' : 'post',
    'update' : 'put',
    'delete' : 'delete',
    'read'   : 'get'
  };

  var type = methodMap[method];

  var params = {
    type: type,
    format: 'json',
    headers: {"Content-Type":["application/json"]},
    'authz': 'signed'
  };

  console.log("----- OsapiHttpSync options: ", options, ', model.url: ', model.url);

  // convert options.url or model.url to params.href (osapi.http expects href instead of url)
  if (!options.url) {
    params.href = (typeof(model.url) == "function" && model.url()) || model.url || null;//throw new Error('A "url" property or function must be specified');
  } else {
    params.href = options.url
    delete options.url;
  }

  if (!options.data && model && (method == 'create' || method == 'update')) {
    params.contentType = 'application/json';
    params.body = JSON.stringify(model.toJSON());
  }

  osapi.http[type](_.extend(params, options)).execute(function(res) {
    if(res.status >= 200 && res.status < 300) {
      options.success(res.content);
    } else {
      options.error(res);
    }
  });

};

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

window.Prop = Backbone.Model.extend({

    sync: OsapiHttpSync,
    urlRoot: BACKEND_HOST + '/props',

    /**
     * Set default attribute values
     * TODO: Blank out defaults once values are loaded from server
     */
    defaults: function() {
        return {
            content_id: '',
            content_type: '',
            content_link: '',
            content_title: '',
            created_at: new Date(),
            giver_avatar_url: $.jiveproxyurl('img/avatars/default.png'),
            giver_id: opensocial.data.getDataContext().getDataSet("viewer").id,
            giver_name: '&nbsp;',
            giver_profile_url: $.jiveAbsoluteLink('/people'),
            message: '&nbsp;',
            prop_image_url: '',
            prop_title: '&nbsp;',
            user_avatar_url:  $.jiveproxyurl('img/avatars/default.png'),
            user_name: '&nbsp;',
            user_profile_url: $.jiveAbsoluteLink('/people'),
            stream_entry_url: '',
	    streamEntry: undefined
        };
    },

    initialize: function() {
        var that = this;
        this.loadUser();
        this.loadGiver();
	    this.loadStreamEntry();

        this.on("change:user_id", function(val) {
            that.loadUser();
        });

        this.on("change:giver_id", function(val) {
            that.loadGiver();
        });

        this.on("change:stream_entry_url", function(val) {
            that.loadStreamEntry();
        });
    },

    set: function(attributes, options) {
        // get prop type image url
        if(attributes.prop_type) {
            var propType = propTypes.findByName(attributes.prop_type);

            attributes.prop_image_url = propType ? propType.get('proxy_image_url') : '';
            attributes.prop_reflection_image_url = propType ? propType.get('proxy_reflection_image_url') : '';
            attributes.prop_title = propType ? propType.get('title') : '';
        }

        if(attributes.content_type) {
            attributes.content_type_css_class = "jive-icon-" + _.last(attributes.content_type.split('.')).toLowerCase();
        }

        Backbone.Model.prototype.set.call(this, attributes, options);
        return this;
    },

    loadUser: function() {
        var that = this;
        window.people.loadIfAbsent(this.get('user_id'), function(person) {
            that.set({
                user_name: person.get('name').formatted,
                user_avatar_url: person.get('avatarURL'),
                user_profile_url: $.jiveAbsoluteLink('/people/' + person.get('jive').username)
            });
        });
    },

    loadGiver: function() {
        var that = this;
        window.people.loadIfAbsent(this.get('giver_id'), function(person) {
            that.set({
                giver_name: person.get('name').formatted,
                giver_avatar_url: person.get('avatarURL'),
                giver_profile_url: $.jiveAbsoluteLink('/people/' + person.get('jive').username)
            });
        });
    },

    loadStreamEntry: function() {
	if(this.get('stream_entry_url').match(/(\d+)$/)) {
	    var streamId = this.get('stream_entry_url').match(/(\d+)$/)[1];
	    var thisProp = this;
	    osapi.jive.corev3.streamEntries.get({uri: '/streamEntries/' + streamId }).execute(function(r) {
		if(r.error) console.log(JSON.stringify(error));
		else thisProp.set('streamEntry', r);
	    });
	}
    }
});
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

window.PropType = Backbone.Model.extend({

    /**
     * Set default attribute values
     * TODO: Blank out defaults once values are loaded from server
     */
    defaults: function() {
        return {
            image_url: "img/trophies/spider-man.png",
            title: "Spider Man",
            definition: "You did something amazing, beyond the normal limits.",
            level: 25
        };
    },

    set: function(attributes, options) {
        // compute image url
        if(attributes.image_url) {
            attributes.proxy_image_url = gadgets.io.getProxyUrl(attributes.image_url);
        }
        if(attributes.reflection_image_url) {
            attributes.proxy_reflection_image_url = gadgets.io.getProxyUrl(attributes.reflection_image_url);
        }
        if(attributes.level) {
            attributes.level = parseInt(attributes.level, 10);
        }

        Backbone.Model.prototype.set.call(this, attributes, options);
        return this;
    }

});
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

window.People = Backbone.Collection.extend({
  model: Person,

  findById: function(id) {
    return this.find(function(person) { return person.get('id') == id; });
  },

  exists: function(id) {
    return this.findById(id) !== undefined;
  },

  loadIfAbsent: function(id, callback) {
    if(!id) return;
    if(this.exists(id)) {
      var person = this.findById(id);
      callback(person);
    } else {
      var that = this;
      osapi.jive.corev3.people.get({id: id}).execute(function(user) {
        if(user) {
          var person = new Person(user);
          that.unshift(person);
          callback(person);
        }
      });
    }
  },

  addIfAbsent: function(model) {
    if( !this.exists(model.get('id')) ) {
      this.add(model);
    }
  }

});

People.lastSearchResults = [];

/*
// uses direct rpc to make the call eg. osapi.jive.corev3.people.get({ query: 'F' })
People.typeAheadSearch = function(typeahead, query) {
    var context = opensocial.getEnvironment().jiveUrl.match(/\/.+(\/.*)/);
    var url = (context ? context[1] : '') + "/social/rpc?st=" + encodeURIComponent(gadgets.util.getUrlParameters()['st']);
    var payload = [{
	"method":"jive.core.get",
	"id":"jive.core.get",
	"params": { "v":"v3", "href":"/people?query=" + query, "userId":"@viewer", "groupId":"@self" }
    }];

    function viewerFilter(list) {
	var viewerid = opensocial.data.getDataContext().getDataSet("viewer").id;
	for(var i = 0; i < list.length; ++i) {
	    if(list[i].id == viewerid) {
		list.splice(i, 1);
		return list;
	    }
	}

	return list;
    }

    // $.post(url, JSON.stringify(payload)).complete(function(res){
    $.ajax({
	url: url,
	type: 'POST',
	dataType: 'json',
	contentType: 'application/json',
	data: JSON.stringify(payload),
	success: function(res) {
	    if(res.length > 0 && res[0].result && res[0].result.status == 200) {
		var json = res[0].result.content;
		People.lastSearchResults = viewerFilter(json.list);
		typeahead.process(People.lastSearchResults);
	    } else {
		console.log(res);
	    }
	}
    });
};
*/

People.typeAheadSearch = function(typeahead, query) {

    function viewerFilter(list) {
	var viewerid = opensocial.data.getDataContext().getDataSet("viewer").id;
	for(var i = 0; i < list.length; ++i) {
	    if(list[i].id == viewerid) {
		list.splice(i, 1);
		return list;
	    }
	}

	return list;
    }

    osapi.jive.corev3.people.get({ query: query }).execute(function(res) {
	if(!res.error) {
	    People.lastSearchResults = viewerFilter(res.list);
	    typeahead.process(People.lastSearchResults);
	}
	else {
	    console.log(JSON.stringify(res.error));
	}
    });
};


People.findById = function(query) {
    var context = opensocial.getEnvironment().jiveUrl.match(/\/.+(\/.*)/);
    var url = (context ? context[1] : '') + "/social/rpc?st=" + encodeURIComponent(gadgets.util.getUrlParameters()['st']);
    var payload = [{
	"method":"jive.core.get",
	"id":"jive.core.get",
	"params": { "v":"v3", "href":"/people/" + query, "userId":"@viewer", "groupId":"@self" }
    }];

    function viewerFilter(list) {
	return list;
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
		user = res[0].result.content;
                console.log("search for people by id", user);
	    	
                var viewerid = opensocial.data.getDataContext().getDataSet("viewer").id;
                if(user.id != viewerid) {
			        //window.sidebarView.showView('give-props');
            		window.givePropsWizardView.recipientSelected(null, null, null, user);                               
                }
	    } else {
		console.log(res);
	    }
	}
    });    
};


People.findFromSearchResults = function(val) {
    return _.find(People.lastSearchResults, function (item) {
        return val == item.id;
    });
};

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

window.Props = Backbone.Collection.extend({
  model: Prop,
  sync: OsapiHttpSync,
  url: BACKEND_HOST + '/props/stream'
});

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

window.PropTypes = Backbone.Collection.extend({
  model: PropType,
  sync: OsapiHttpSync,
  url: BACKEND_HOST + '/props/types?level=1000',
  onLoadCallbacks: [],

  getAllByLevel: function(level) {
    return this.filter(function(propType) {
      return propType.get('level') <= level;
    });
  },

  findByName: function(name) {
    return this.find(function(prop) { return prop.get('$ItemName') == name; });
  },

  registerOnLoad: function(callback) {
      if(window.propTypes.ready) callback();
      else this.onLoadCallbacks.push(this.onLoadCallbacks, callback);
  },

  callOnLoadCallbacks: function() {
      for(var i in this.onLoadCallbacks) {
          this.onLoadCallbacks[i]();
      }
  }

});

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

window.SidebarView = Backbone.View.extend({

    initialize: function(options) {
        var that = this;
        _.bindAll(this, 'showView');
        this.$el = $(this.el);

        this.collection = new People();


        // this.sidebarListView = new SidebarListView({collection: this.collection, el: '#sidebar-list'});
        // this.sidebarListView.on('personSelected', function(selectedPerson) {
        //     that.deselectYourCase();
        //     that.trigger('personSelected', selectedPerson);
        // });

        // this.setupBrowsePeopleTypeahead();

        this.setupPropActivityButton();
        this.setupYourCaseButton();
        this.setupFindCaseButton();
        this.setupGivePropsButton();

    },

    setupButton: function(name, callback) {
        var that = this;
        this.$('li.' + name).click(function() {
            that.showView(name);
            callback();
        });
    },

    setupPropActivityButton: function() {
        var that = this;
        this.setupButton('prop-activity', function() {

            // Set Title
            $('#main-title').html("Recent Props");
        });
    },


    setupYourCaseButton: function() {
        var that = this;

        // this.yourCaseItem = new SidebarItemView({el: this.$('li.my-trophy-case'), model: viewer});

        this.setupButton('my-trophy-case', function() {

            that.trigger('personSelected', viewer);
        });
    },

    setupFindCaseButton: function() {
        var that = this;
        this.setupButton('find-trophy-case', function() {
            $('#main-title').html("Find Trophy Case");
        });
    },

    setupGivePropsButton: function() {
        var that = this;
        this.setupButton('give-props', function() {
            // TODO: event listenify the below

            $('#main-title').html("Give Props!");
        });
    },

    deselectYourCase: function() {
        this.$('li.my-trophy-case').removeClass('selected');
    },

    deselectAll: function() {
        this.$('li').removeClass('selected');
    },

    showView: function(view) {
        // highlight sidebar item
        this.deselectAll();
        this.$('li.' + view).addClass('selected');

        // show appropriate view
        $.each(['give-props', 'my-trophy-case', 'prop-activity', 'find-trophy-case'], function(index, name) {
            if(name === view) {
                $('#' + name).show();
                //Focus typeahead fields in the main app. Already implemented for embedProp
                if (name === 'find-trophy-case' || name === 'give-props' ) {
                    $(".user-typeahead").focus();
                }
            } else {
                $('#' + name).hide();
            }
        });

        this.trigger('viewChanged', view);
    }

    // setupBrowsePeopleTypeahead: function() {
    //     this.$('.browse-people').typeahead({
    //         matchProp: 'displayName',
    //         sortProp: 'displayName',
    //         valueProp: 'id',
    //         source: People.typeAheadSearch,
    //         itemSelected: this.typeAheadPersonSelected
    //     });
    // },

    // typeAheadPersonSelected: function(item, id, text) {
    //     var that = this;

    //     var personIsViewer = viewer.get('id') == id;
    //     if(personIsViewer) {
    //         this.selectViewer();
    //         return;
    //     }

    //     this.collection.loadIfAbsent(id, function(person) {
    //         that.sidebarListView.selectPerson(person);
    //         window.people.addIfAbsent(person);
    //         that.$('.browse-people').val(''); // clear out name
    //     });
    // },

    // deselectPerson: function() {
    //     this.$('.cases li').removeClass('selected');
    // }

});

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

/**
 * View class that is used to display a single sidebar item.
 */
window.SidebarItemView = Backbone.View.extend({
    tagName: 'li',
    className: 'case-item',

    template: _.template($('#sidebar-list-item-template').html()),

    initialize: function() {
        var that = this;
        this.model.on('change', function() {
            that.render();
        });
    },

    render: function() {
        var obj = this.model.toJSON();
        if(this.model == viewer) {
            obj.name = 'Your Trophy Case';
        }
        $(this.el).html(this.template(obj));
        $(this.el).attr('data-person-id', this.model.get('id'));
        return this;
    }

});

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

window.SidebarListView = Backbone.View.extend({

    initialize: function() {
        _.bindAll(this, 'render');
        this.$el = $(this.el);

        // bind render to collection events
        this.collection.on('add', this.render);
        this.collection.on('remove', this.render);
        this.collection.on('reset', this.render);

        this.setupListItemClickListener();
    },

    render: function() {
        var that = this;

        this.$el.empty();
        this.collection.each(function(person) {
            var sidebarItemView = new SidebarItemView({model: person});
            that.$el.append(sidebarItemView.render().el);
        });

        return this;
    },

    setupListItemClickListener: function() {
        var that = this;
        this.$el.on('click', 'li', function() {
            var personId = $(this).data('person-id');
            var selectedPerson = that.collection.find(function(person){ return person.get('id') == personId; });
            that.selectPerson(selectedPerson);
        });
    },

    deselectAll: function() {
        this.$el.find('li').removeClass('selected');
    },

    selectPerson: function(person) {
        var that = this;
        this.deselectAll();

        // find list item that matches this person and select it
        var li = this.$el.find('[data-person-id="' + person.get('id') + '"]');
        li.addClass('selected');

        this.trigger('personSelected', person);
    }

});

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

window.ActivityStreamView = Backbone.View.extend({

    initialize: function() {
        _.bindAll(this, 'render');
        this.$el = $(this.el);

        this.setupCollectionEvents();
    },

    setupCollectionEvents: function() {
        this.collection.on('add', this.render);
        this.collection.on('remove', this.render);
        this.collection.on('reset', this.render);
    },

    render: function() {
        var that = this;
        that.$el.empty();

        if(this.collection.length === 0) {
            this.$el.append("<p style='font-weight:bold'>&nbsp;<br>No props have been given lately, you should give some!</p>");
        } else {
            this.collection.each(function(prop) {
                // console.log('prop: ', prop.toJSON());
                var activityEntryView = new ActivityEntryView({model: prop});
                that.$el.append(activityEntryView.render().el);
            });
        }
        return this;
    }

});

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

window.ActivityEntryView = Backbone.View.extend({
    className: 'activity_entry',
    template: _.template($('#activity-entry-template').html()),

    initialize: function() {
	_.bindAll(this, 'render');
	this.model.on('change', this.render);
    },

    render: function() {
	// console.log('activityentryview - this.model.toJSON(): ', this.model.toJSON());
	$(this.el).html(this.template(this.model.toJSON()));
	this.updateSocialActions();
	return this;
    },

    updateSocialActions: function() {
	if(this.model.get('streamEntry')) {
	    var model = this.model;
	    var streamEntry = model.get('streamEntry')
	    var el = this.el;
	    if(streamEntry) {
		$('.jive_social_box', el).show();
		if(!streamEntry.like && !streamEntry.unlike) {
		    $($('.jive_social_box >div', el)[0]).hide();
		}
		else {
		    $('.jive-like', el).html(streamEntry.like ? 'Like' : 'Liked');
		    $('.jive-like', el).unbind('click');
		    $('.jive-like', el).click(function(event) {
			if(streamEntry.like) {
			    streamEntry.like().execute(function(resp) {
				if(!resp.error) model.trigger('change:stream_entry_url');
			    });
			}
			else {
			    streamEntry.unlike().execute(function(resp) {
				if(!resp.error) model.trigger('change:stream_entry_url');
			    });
			}
		    });
		}
	    }
	}
    }
});
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

window.FindTrophyCaseView = Backbone.View.extend({

  initialize: function() {
    var that = this;
    _.bindAll(this, 'userSelected', 'reset');
    this.setupClickListeners();
    this.setupUserTypeahead();
    this.trophyDisplayView = new TrophyDisplayView({el: this.$('.trophy_case')});
  },

  setupClickListeners: function() {
      this.$('.btn-pick-someone-else').click(this.reset);
  },

  setupUserTypeahead: function() {
    this.$('.user-typeahead').typeahead({
        matchProp: 'displayName',
        sortProp: 'displayName',
        valueProp: 'id',
        source: People.typeAheadSearch,
        itemSelected: this.userSelected
    });
  },

  userSelected: function (item, val, text) {
    var that = this;
    var searchResultPerson = this.selectedSearchResultPerson = People.findFromSearchResults(val);

    // // race condition possibility here - propTypes and viewer need to load for trophies to appear
    // this.renderTrophies();

    this.$('.user-typeahead').hide();
    $('.typeahead.dropdown-menu').hide();

    this.$('.trophy-case-wrapper h3').html(searchResultPerson.displayName + "'s Trophy Case");
    this.$('.chosen').show();
    this.$('.chosen span').html(searchResultPerson.displayName);
    this.$('.chosen img').remove();
    this.$('.chosen').prepend($('<img>').attr({'src': searchResultPerson.thumbnailUrl, 'width':'48', 'height':'48','border':'0'}));

    this.$('.trophy-case-wrapper').fadeIn();

    window.people.loadIfAbsent(searchResultPerson.id, function(person) {
      that.trophyDisplayView.selectPerson(person);
    });
  },

  reset: function() {
    this.$('.user-typeahead').show().val("");
    this.$('.chosen').hide();
    this.$('.trophy-case-wrapper').fadeOut();
    trophySidebarView.fadeOut();
  }

});

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

window.TrophyDisplayView = Backbone.View.extend({

    initialize: function() {
        _.bindAll(this, 'selectPerson', 'renderTrophies');
        this.$el = $(this.el);
        this.trophyTemplate = _.template($('#trophy-display-template').html());
        this.selectedPerson = null;
    },

    selectPerson: function(person) {
        // unselect previous person and unbind prop events
        if(this.selectedPerson && this.selectedPerson !== person) {
            this.selectedPerson.props.off();
            this.selectedPerson = null;
        }

        this.selectedPerson = person;

        person.props.on('add',    this.renderTrophies);
        person.props.on('remove', this.renderTrophies);
        person.props.on('reset',  this.renderTrophies);

        person.props.fetch();

        // this.renderTrophies(person.props);

        if(person.get('name') == viewer.get('name')) {
            $('#main-title').html('Your Trophy Case');
        }
        // else {
        //     $('#main-title').html(person.get('name') + "'s Trophy Case");
        // }
    },

    // setupPopovers: function() {
    //     this.$('div.trophy').popover({
    //         content: function() {
    //             return $(this).find('div.popover-content').html();
    //         }
    //     });
    // },

    renderTrophies: function(props) {
        var that = this;

        // scroll to the top of the trophy case
        this.$el.scrollTop(0);

        // clear out all trophy shelves and add a new one
        this.$el.find('.trophies').remove();
        this.$el.append('<div class="trophies"></div>');
        var $row = this.$el.find('.trophies').last();

        // if no props exist for this person, show a message, otherwise render trophies
        if(props.length === 0) {
            var message = this.selectedPerson.get('jive').username == viewer.get('jive').username ?
                "You have" :
                this.selectedPerson.get('displayName') + " has";
            message += " no trophies yet!";
            $row.append("<p class=\"message\">" + message + "</p>");
        } else {

            // TODO: Make grouped props sort by most recent first...
            var propGroups = props.groupBy(function(prop){ return prop.get('prop_type'); });

            _.each(propGroups, function(propGroup, key) {
                var prop = propGroup[0];
                prop.set('prop_count', propGroup.length);

            // props.each(function(prop) {

                if($row.children().length == 3) {
                    that.$el.append('<div class="trophies"></div>');
                    $row = that.$el.find('.trophies').last();
                }

                $row.append(that.trophyTemplate(prop.toJSON()));
            });

        }

        // make sure we have atleast three shelves (for visual correctness)
        var extraShelvesNeeded = 3 - this.$el.find('.trophies').length;
        if(extraShelvesNeeded > 0) {
            for(var i = 0; i < extraShelvesNeeded; i++) {
                this.$el.append('<div class="trophies"></div>');
            }
        }

        // this.setupPopovers();
        this.setupClickEvents();
    },

    setupClickEvents: function() {
        var that = this;
        this.$('div.trophy').click(function() {
            var propType = $(this).data('prop-type');
            var propTypeTitle = $(this).find('span.lbl').html();
            var props = that.selectedPerson.props.filter(function(prop) {
                return prop.get('prop_type') === propType;
            });
            that.trigger("trophySelected", that.selectedPerson, propTypeTitle, props);
        });
    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    }

});

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

window.TrophySidebarView = Backbone.View.extend({

    initialize: function(options) {
        var that = this;
        _.bindAll(this, 'render', 'fadeOut', 'fadeIn');
        this.$el = $(this.el);

        this.itemTemplate = _.template($('#trophy-sidebar-item-template').html());
        this.setupCloseButton();
    },

    setupCloseButton: function() {
        var that = this;
        this.$('.close').click(function() {
            that.$el.fadeOut();
        });
    },

    render: function(selectedPerson, propTypeTitle, props) {
        var that = this;

        if(props.length > 0) {
            // Set Title
            that.$('h2').html(selectedPerson.get('name').givenName + "'s " + propTypeTitle + " Trophies");

            // Clear existing entries
            var $sidebarItems = that.$('.trophy_sidebar_items');
            $sidebarItems.html("");

            // Render an entry for each
            _.each(props, function(prop) {
                $sidebarItems.append(that.itemTemplate(prop.toJSON()));
            });

            $('.trophy_sidebar').fadeIn();
        }
    },

    fadeIn: function() {
        this.$el.fadeIn('fast');
    },

    fadeOut: function() {
        this.$el.fadeOut('fast');
    }

});

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
