// Common JavaScript Functions and variables

var data = opensocial.data.DataContext;
var options = { };

// Calculate and return the set of fields from the multiple select options for the specfied select element id
// (It is assumed that @all is always first, and overrides any additional selections)
function calculateFields(id) {
    var values = $("#" + id).val();
    console.log("calculateFields(" + JSON.stringify(values) + ")");
    if (values[0] == '@all') {
        return "@all";
    }
    var fields = '';
    var first = true;
    $(values).each(function(index, value) {
        if (first) {
            first = false;
        }
        else {
            fields += ",";
        }
        fields += value;
    });
    return fields;
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