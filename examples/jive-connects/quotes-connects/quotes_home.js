// Append the HTML for the quote at the specified index
function populateRow(index, quote, html) {
    html += "<tr>";
    html += "<td class=\"date switch-view\" data-index=\"" + index + "\" align=\"center\">" + quote.dueDateString + "</td>";
    html += "<td><span class=\"switch-view\" data-index=\"" + index + "\"><strong>" + quote.customer.name + "</strong></span><br/>";
    html += "<span class=\"switch-view\" data-index=\"" + index + "\">$" + quote.totalPriceString + "</span>, ";
    html += "<span class=\"user-profile\" data-index=\"" + index + "\">" + quote.quoteUser.firstName + " " + quote.quoteUser.lastName + "</span>";
    html += "</td>";
    if (quote.status == "pending") {
        html += "<td align=\"center\">" + generateApprove(index) + generateReject(index) + "</td>";
    }
    else {
        html += "<td align=\"center\"><span class=\"" + quote.status + "\">" + quote.status + "</span></td>";
    }
    html += "</tr>";
    return html;
}

// Register handlers to request switching to canvas view
function switchViewControls() {
    console.log("switchViewControls registering handlers");
    $(".switch-view").live("click", function() {
        params.index = parseInt($(this).attr("data-index"));
        console.log("Switching to canvas view with params " + JSON.stringify(params));
        gadgets.views.requestNavigateTo("canvas", params);
    });
    $("#banner").click(function() {
        $(".banner-div").hide();
        $(".h_view").show();
        $(".buttons").show();
        loadQuotes();
    });
}

