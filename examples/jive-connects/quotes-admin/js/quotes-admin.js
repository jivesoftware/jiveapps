var ALIAS = "quotes";

// Replace Backbone.js default sync() implementation to communicate via a Jive Connects connection.
// Note that we know our server supports the correct verbs and JSON format, so not all functionality
// (Backbone.emulateJSON and Backbone.emulateHTTP) is included.
Backbone.sync = function(method, model, options) {

    console.log("Backbone.sync params(" + method + "," + JSON.stringify(model) + "," + JSON.stringify(options) + ")");

    var params = {
        alias : ALIAS,
        headers : { 'Accept' : [ 'application/json' ]},
        href : model.url
    };
    if ((method == 'create') || (method == 'update')) {
        params.body = model.toJSON();
        params.headers['Content-Type'] = [ 'application/json' ];
    }
    if (method == 'read') {
        doJiveConnectsGet(options, params);
    }
    else if (method == 'create') {
        osapi.jive.connects.post(params).execute(options.success);
    }
    else if (method == 'update') {
        osapi.jive.connects.put(params).execute(options.success);
    }
    else if (method == 'delete') {
        osapi.jive.connects['delete'](params).execute(options.success);
    }

}

// Perform a Jive Connects DELETE operation
function doJiveConnectsDelete(options, params) {
    osapi.jive.connects['delete'](params).execute(function(response) {
        console.log("doJiveConnectsDelete response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    doJiveConnectsGet(options, params);
                });
            }
            else {
                alert("Response error " + response.error.code + ": " + response.error.message);
            }
        }
        else {
            options.success(response.content);
        }
    });
}

// Perform a Jive Connects GET operation
function doJiveConnectsGet(options, params) {
    osapi.jive.connects.get(params).execute(function(response) {
        console.log("doJiveConnectsGet response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    doJiveConnectsGet(options, params);
                });
            }
            else {
                alert("Response error " + response.error.code + ": " + response.error.message);
            }
        }
        else {
            if (options.success) {
                options.success(response.content);
            }
        }
    });
}

// Perform a Jive Connects POST operation
function doJiveConnectsPost(options, params) {
    osapi.jive.connects.post(params).execute(function(response) {
        console.log("doJiveConnectsPost response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    doJiveConnectsGet(options, params);
                });
            }
            else {
                alert("Response error " + response.error.code + ": " + response.error.message);
            }
        }
        else {
            options.success(response.content);
        }
    });
}

// Perform a Jive Connects PUT operation
function doJiveConnectsPut(options, params) {
    osapi.jive.connects.put(params).execute(function(response) {
        console.log("doJiveConnectsPut response = " + JSON.stringify(response));
        if (response.error) {
            if (response.error.code == 401) {
                osapi.jive.connects.reconfigure(ALIAS, response, function(feedback) {
                    doJiveConnectsGet(options, params);
                });
            }
            else {
                alert("Response error " + response.error.code + ": " + response.error.message);
            }
        }
        else {
            options.success(response.content);
        }
    });
}

// Set the top level title and currently selected select element to the specified value
function configureTopLevelNav(title, category) {
    $(".top-level-title").html("").html(title);
    $("#top-level-select").val(category).change(onTopLevelNav);
}

// Navigate to the selected view
function onTopLevelNav() {
    var category = $("#top-level-select").val();
    var view = "canvas." + category;
    if (category == "introduction") {
        view = "canvas";
    }
    console.log("Navigating to view '" + category + "'");
    gadgets.views.requestNavigateTo(view);
}

