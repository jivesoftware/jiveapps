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
