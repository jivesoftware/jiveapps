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
