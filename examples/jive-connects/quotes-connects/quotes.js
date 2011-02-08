// Symbolic constant for our connection alias
var QUOTES = "quotes";

// Context parameters also used to manage quotes pagination
var params = {
    direction : "ascending",
    index : 0,
    limit : 5,
    offset : 0,
    order :  "dueDate"
}

// Configured connection we are using
var connection;

// Customers on this page, keyed by customerID
var customers = { };

// Quotes for this page, as an array
var quotes = [ ];

// Users (sales reps) on this page, keyed by username
var users = { };

// Enable all of the active page elements
function enableHandlers() {
    $(".approve").live("click", function() {
        var index = parseInt($(this).attr("data-index"));
        var quote = quotes[index];
        console.log("Approving quote " + JSON.stringify(quote));
        update(quote, "approved");
    });
    $("#next").click(function() {
        console.log("Next clicked at offset " + params.offset);
        params.offset += params.limit;
        $(this).blur();
        loadQuotes();
    })
    $("#previous").click(function() {
        console.log("Previous clicked at offset " + params.offset);
        params.offset -= params.limit;
        if (params.offset < 0) {
            params.offset = 0;
        }
        $(this).blur();
        loadQuotes();
    });
    $("#refresh").click(function() {
        console.log("Refresh clicked at offset " + params.offset);
        $(this).blur();
        loadQuotes();
    });
    $(".reject").live("click", function() {
        var index = parseInt($(this).attr("data-index"));
        var quote = quotes[index];
        console.log("Rejecting quote " + JSON.stringify(quote));
        update(quote, "rejected");
    });
}

// Generate an "approve" action for the specified row
function generateApprove(index) {
    var html = "<a href=\"#\"";
    html += " class=\"icon i-approve approve\"";
    html += " data-index=\"" + index + "\"";
    html += "Approve";
    html += "</a>";
    return html;
}

// Generate a "reject" action for the specified row
function generateReject(index) {
    var html = "<a href=\"#\"";
    html += " class=\"icon i-reject reject\"";
    html += " data-index=\"" + index + "\"";
    html += "Reject";
    html += "</a>";
    return html;
}

// On-view-load initialization
function init() {
    var data = gadgets.views.getParams();
    console.log("Received params " + JSON.stringify(data));
    if (data && data.offset) {
        params = data;
    }
    console.log("Params are now " + JSON.stringify(params));
    enableHandlers();
    switchViewControls();
    gadgets.window.adjustHeight();
//    loadQuotes(); // Called from within switchViewControls at the appropriate time
}

// Load and cache information about the configured connection we are using
function loadConnection() {
    console.log("Loading connection information")
    osapi.jive.connects.connection({
        alias : QUOTES
    }).execute(function(result) {
        console.log("Connection information response is " + JSON.stringify(result));
        connection = result;
    });

}

function _contains(ids, id) {
    return (ids.indexOf(id) >= 0);
}

// Return a request object to retrieve the specified customer by customerID
function loadCustomer(customerID) {
    return osapi.jive.connects.get({
        alias : QUOTES,
        headers : { 'Accept' : [ 'application/json' ] },
        href : '/customers/' + customerID
    });
}

// Retrieve all the unique customers for the quotes on this page, and cache them by customerID
function loadCustomers() {
    console.log("Loading customer information");
    var customerIDs = [ ];
    $.each(quotes, function(index, quote) {
        if (!_contains(customerIDs, quote.customer.id)) {
            customerIDs.push(quote.customer.id);
        }
    });
    if (customerIDs.length < 1) {
        return;
    }
    console.log("Requesting customer IDs " + JSON.stringify(customerIDs));
    var batch = osapi.newBatch();
    $.each(customerIDs, function(index, customerID) {
        batch.add('customer' + customerID, loadCustomer(customerID));
    });
    batch.execute(function(responses) {
        customers = { };
        $.each(customerIDs, function(index, customerID) {
            var response = responses['customer' + customerID];
            // TODO - deal with response.error not being null
            customers[customerID] = response.content;
        });
        console.log("Result customers = " + JSON.stringify(customers));
    });
}

// Retrieve all the quotes on this page, respecting our pagination controls
function loadQuotes() {
    var message = "Loading data at offset " + params.offset;
    console.log(message);
    $("#table-body").html("<tr><td colspan=\"5\" align=\"center\">" + message + "</td></tr>");
    osapi.jive.connects.get({
        alias : QUOTES,
        headers : { 'Accept' : [ 'application/json' ] },
        href : '/quotes',
        params : params
    }).execute(function(response) {
        if (response.error) {
            if (response.error.code == 401) {
                console.log("Received a 401 response, triggering reconfiguration before trying again");
                osapi.jive.connects.reconfigure(QUOTES, response, function(feedback) {
                    console.log("Received reconfigure feedback " + JSON.stringify(feedback));
                    loadQuotes();
                })
            }
            else {
                alert("Error " + response.error.code + " loading data: " + response.error.message);
            }
        }
        else {
            var html = "";
            quotes = response.content;
            $.each(quotes, function(index, quote) {
                html = populateRow(index, quote, html);
            });
            $("#table-body").html(html);
            gadgets.window.adjustHeight();
            loadConnection();
            loadCustomers();
            loadUsers();
        }
    })
}

// Hack to calculate userID (TODO - obsolete after Jive Core returns it)
function hackUserID(user) {
    if (!user.id) {
        var url = user.resources.self.ref;
        var index = url.lastIndexOf("/");
        var id = url.substring(index + 1);
        user.id = id;
    }
}

// Return a request object to retrieve the specified user by username
function loadUser(username) {
    return osapi.jive.core.users.get({
        username : username
    });
}

// Use Jive Core API to retrieve user profile informationf or each unique sales rep
// in the quotes on this page, and cache them by username
function loadUsers() {
    console.log("Loading user information");
    var usernames = [ ];
    $.each(quotes, function(index, quote) {
        if (!_contains(usernames, quote.quoteUser.username)) {
            usernames.push(quote.quoteUser.username);
        }
    });
    if (usernames.length < 1) {
        return;
    }
    console.log("Requesting usernames " + JSON.stringify(usernames));
    users = { };
/* TODO use batch when core supports it
    var batch = osapi.newBatch();
    $.each(usernames, function(index, username) {
        batch.add(username, loadUser(username));
    });
    batch.execute(function(responses) {
        var response = responses[username];
        // TODO - deal with response.error not being null
        var user = response.data;
        hackUserID(user);
        users[user.username] = user;
    });
*/
    $.each(usernames, function(index, username) {
        loadUser(username).execute(function(response) {
            if (response.error) {
                alert("Error looking up user information for username '" + username + "', code=" +
                      response.error.code + ", message='" + response.error.message + "'");
            }
            else {
//                var user = response.content;
                var user = response.data; // TODO - should be response.content?
                console.log("Got user " + JSON.stringify(user));
                hackUserID(user);
                users[user.username] = user;
            }
        });
    });
}

// Update the specified quote to reflect the specified new approve/reject status
function update(quote, newstatus) {
    delete quote.jiveUserID;
    quote.status = newstatus;
    osapi.jive.connects.put({
        alias : QUOTES,
        body : quote,
        headers : { 'Content-Type' : [ 'application/json' ] },
        href : '/quotes/' + quote.id
    }).execute(function(response) {
        console.log("Update response is " + JSON.stringify(response));
        loadQuotes();
    });
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);
