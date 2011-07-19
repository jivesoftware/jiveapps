// On-view-load initialization
function init() {
    $("#search").click(search);
    gadgets.window.adjustHeight();
}

// Perform a search and display the results
function search() {
    $("search-results").html("");
    gadgets.window.adjustHeight();
    var types = [];
    $("input:checked").each(function() {
        types.push(this.id);
    });
    var params = {
        limit : $("#limit").val(),
        query : $("#query").val(),
        sort : $("#sort-type").val(),
        sortOrder : $("#sort-order").val()
    };
    if (types.length > 0) {
        params.type = types;
    }
    console.log("searching for " + JSON.stringify(params));
    osapi.jive.core.searches.searchContent(params).execute(function(response) {
        console.log("searching response is " + JSON.stringify(response));
        if (response.error) {
            alert(response.error.message);
        }
        else {
            var html = "";
            var rows = response.data;
            $.each(rows, function(index, row) {
                html += "<tr>";
                html += "<td>" + row.type + "</td>";
                html += "<td>" + row.resources.self.ref + "</td>";
                html += "<td>" + row.modificationDate + "</td>";
                html += "<td>" + row.subject + "</td>";
                html += "</tr>";
            });
            $("#search-results").html(html);
            gadgets.window.adjustHeight();
        }
    });
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);
