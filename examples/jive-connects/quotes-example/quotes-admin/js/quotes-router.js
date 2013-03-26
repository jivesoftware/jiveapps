var SalesRepRouter = Backbone.Router.extend({

    initialize: function() {
    },

    listSalesReps: function() {
        console.log("SalesRepRouter.listSalesReps()");
        this.salesRepListView = new SalesRepListView({collection:SalesRepCollection});
        SalesRepCollection.fetch();
        var table = $("#sales-rep-table");
        $("#sales-rep-table").html("").html(this.salesRepListView.render().el);
    },

    routes : {
        "" : "listSalesReps"
    }

});
