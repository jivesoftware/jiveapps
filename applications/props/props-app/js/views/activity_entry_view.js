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