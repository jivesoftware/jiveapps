// Common JavaScript Functions and variables

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