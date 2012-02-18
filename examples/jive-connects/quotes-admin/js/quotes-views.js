// A single customer as an input form
/*
window.CustomerFormView = Backbone.View.extend({

});
*/

// A single customer as a row in a table
/*
window.CustomerRowView = Backbone.View.extend({

});
*/

// A list of customers as a table
/*
window.CustomerListView = Backbone.View.extend({

});
*/

/*
// A single sales rep as an input form
window.SalesRepFormView = Backbone.View.extend({

});
*/

// A single sales rep as a row in a table
window.SalesRepRowView = Backbone.View.extend({

    initialize: function() {
        var text = $('#sales-rep-row-template').html();
        this.template = _.template(text)
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    tagName : 'tr'


});

// A list of sales reps as a table
window.SalesRepListView = Backbone.View.extend({

    className: 'j-table',

    initialize: function() {
        var text = $('#sales-rep-list-template').html();
        this.template = _.template(text);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        console.log("SalesRepListView.render(), collection = " + JSON.stringify(this.collection));
        var tbody = $("#sales-rep-list-tbody").empty();
        _.each(this.collection, function(salesRep) {
            tbody.append(new SalesRepRowView({model : salesRep}).render().el);
        });
//        console.log("  model JSON is " + this.model.toJSON());
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    tagName: 'table'

});
