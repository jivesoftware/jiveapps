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
