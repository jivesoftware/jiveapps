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
