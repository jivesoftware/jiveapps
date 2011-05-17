// Append the HTML for the quote at the specified index
function populateRow(index, quote, html) {
    html += "<tr>";
    html += "<td class=\"switch-view\" data-index=\"" + index + "\">" + quote.dueDateString + "</td>";
    html += "<td class=\"switch-view\" data-index=\"" + index + "\"><strong>" + quote.customer.name + "</strong></td>";
    html += "<td align=\"center\">" +
            "<span class=\"user-profile\" data-index=\"" + index + "\">" + quote.quoteUser.firstName + " " + quote.quoteUser.lastName + "</span></td>";
    html += "<td class=\"switch-view\" data-index=\"" + index + "\" align=\"center\">" + quote.quoteNumber + "</td>"
    html += "<td class=\"switch-view\" data-index=\"" + index + "\" align=\"right\">$" + quote.totalPriceString + "</td>";
    if (quote.status == "pending") {
        html += "<td align=\"center\">" + generateApprove(index) + generateReview(index) + generateReject(index) + "</td>";
    }
    else {
        html += "<td align=\"center\"><span class=\"" + quote.status + "\">" + quote.status + "</span></td>";
    }
    html += "</tr>";
    return html;
}

// Register handlers to request switching to homve view
function switchViewControls() {
    console.log("switchViewControls registering handlers");
    $(".switch-view").live("click", function() {
        params.index = parseInt($(this).attr("data-index"));
        console.log("Switching to home view with params " + JSON.stringify(params));
        gadgets.views.requestNavigateTo("home", params);
    });
    loadQuotes();
}

