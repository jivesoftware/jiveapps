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
