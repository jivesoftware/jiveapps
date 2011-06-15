/*
 * Copyright 2011 Jive Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function counterBidDeepLinkActionURI(verb, object, bid, otherUserId) {
    var other = {"buy":"sell","sell":"buy"};
    var params = {
        verb: other[verb],
        object: object,
        buyer: verb == "sell" ? otherUserId : currentUserId,
        seller: verb == "buy" ? otherUserId : currentUserId,
        bid: bid
    };
    return osapi.jive.core.activities.createDeepLink("canvas.bid." + other[verb], params);
}

var currentUserId = null;

function loadCurrentUserID() {
    osapi.people.get({userId: "@me"}).execute(function(myself) {
        if (!(myself instanceof Array)) myself = [myself];
        if (myself[0] && myself[0].list && myself[0].list.length) myself = myself[0].list;
        for (var i = 0, j = myself.length; i < j; ++i) {
            currentUserId = myself[i].id;
        }
        gadgets.window.adjustHeight();
    });
}

function keyFor(verb, type, isRequest) {
    // using concatenation to prevent the container from substituting i18n keys inline
    return "__MSG" + "_activity.verbs." + verb.key + "." + type + (isRequest ? ".request" : "") + "__";
}

function publish(object, verb, target, amount, deliverTo, actionLinks) {
    var o = JSON.parse(JSON.stringify(object));
    delete o.key;
    delete o.image;
    var params = {
        object: o,
        verb: [verb.uri, "post"],
        title: keyFor(verb, "title", Boolean(deliverTo && actionLinks)),
        body: keyFor(verb, "body", Boolean(deliverTo && actionLinks)),
        streamFaviconUrl: verb.icon
    };
    if (target) {
        params.target = target;
    }
    if (amount != null) {
        params.purchasePrice = amount == 0 ? "free" : "$" + amount + ".00";
    }
    var payload = {
        activity:params
    };
    if (deliverTo) {
        payload.deliverTo = deliverTo;
        if ( actionLinks) params.object.actionLinks = actionLinks.concat();
        if (amount != null) {
            params.object.actionLinks.push({
                title: "counter bid",
                url: counterBidDeepLinkActionURI(verb.key, object.key, amount, deliverTo)
            });
        }
    } else if(verb.jiveDisplay) {
        params.jiveDisplay = verb.jiveDisplay;
    }

    osapi.activities.create(payload).execute(onPublish);
}

var hidePublishMessage = null;
function onPublish(data) {
    if (hidePublishMessage) window.clearTimeout(hidePublishMessage);
    $("#response").text(JSON.stringify(data)).parent().show();
    hidePublishMessage = window.setTimeout(function() {
        hidePublishMessage = null;
        $("#response").parent().hide("slow", function() {
            gadgets.window.adjustHeight();
        });
    }, 30000);
    gadgets.window.adjustHeight();
}

