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
