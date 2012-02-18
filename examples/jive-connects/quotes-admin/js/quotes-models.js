// Models

window.Customer = Backbone.Model.extend({

    // Default values for a new instance
    defaults : function() {
        return {
            accountNumber : "",
            name : "",
            userID : 0
        };
    }

});

window.CustomerCollection = Backbone.Collection.extend({

    model : Customer,

    url : "/customers"

});

window.SalesRep = Backbone.Model.extend({

    // Default values for a new instance
    defaults : function() {
        return {
            firstName : "",
            lastName : ""
        };
    }

});

window.SalesRepCollection = Backbone.Collection.extend({

    model : SalesRep,

    url : "/users"

});
