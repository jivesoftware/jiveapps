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
