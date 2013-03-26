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
