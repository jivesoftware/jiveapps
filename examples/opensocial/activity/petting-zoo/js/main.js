function registerEvents() {
    var object = $("#object"),
            verb = $("#verb"),
            target = $("#target"),
            amount = $("#amount"),
            image = $("#image"),
            imageCaption = $("#imageCaption"),
            icon = $("#icon");

    function hasTarget() {
        return /buy|sell/.test(verb.val());
    }

    object.change(function() {
        image.attr("src", objects[object.val()].image);
        imageCaption.text(objects[object.val()].mediaLink.mediaType);
    });
    verb.change(function() {
        if (hasTarget()) {
            target.parent().show();
            $("#btn_inbox_approval").hide();
            $("#btn_inbox_bid").show();
        } else {
            target.parent().hide();
            $("#btn_inbox_bid").hide();
            $("#btn_inbox_approval").show();
        }
        icon.attr("src", verbs[verb.val()].icon);
        gadgets.window.adjustHeight();
    });
    $("#btn_publish").click(function() {
        if (hasTarget()) {
            publish(objects[object.val()], verbs[verb.val()], targets[target.val()], amount.val(), null, null);
        } else {
            publish(objects[object.val()], verbs[verb.val()], null, null, null, null);
        }
    });
    $("#btn_inbox_notification").click(function() {
        if (hasTarget()) {
            publish(objects[object.val()], verbs[verb.val()], targets[target.val()], amount.val(), $("#deliverTo_notify").val(), null);
        } else {
            publish(objects[object.val()], verbs[verb.val()], null, null, $("#deliverTo_notify").val(), null);
        }
    });
    $("#btn_inbox_bid, #btn_inbox_approval").click(function() {
        if (hasTarget()) {
            publish(objects[object.val()], verbs[verb.val()], null, amount.val(), $("#deliverTo_approve").val(), verbs[verb.val()].actionLinks);
        } else {
            publish(objects[object.val()], verbs[verb.val()], null, null, $("#deliverTo_approve").val(), verbs[verb.val()].actionLinks);
        }
    });
    object.change();
    verb.change();
}

function populateUserList(list) {
    osapi.people.get({groupId:"@all", startIndex:0, count:100}).execute(function(friends) {
        if (!(friends instanceof Array)) friends = [friends];
        if (friends[0] && friends[0].list && friends[0].list.length) friends = friends[0].list;
        for (var i = 0, j = friends.length; i < j; ++i) {
            var friend = friends[i];
            if (friend.displayName) {
                $("<option/>").text(friend.displayName).val(friend.id).appendTo(list);
            }
        }
        gadgets.window.adjustHeight();
    });
}

function init() {
    registerEvents();
    loadCurrentUserID();
    populateUserList($("#deliverTo_approve, #deliverTo_notify"));
}
gadgets.util.registerOnLoadHandler(init);

