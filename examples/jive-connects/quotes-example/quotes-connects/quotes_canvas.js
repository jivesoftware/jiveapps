/*
   Copyright 2011 Jive Software

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

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

