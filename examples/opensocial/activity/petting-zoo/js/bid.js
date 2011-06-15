var requsetParams = gadgets.views.getParams();
var object = objects[requsetParams.object];
var verb = verbs[requsetParams.verb];
var deliverTo = null;
var activeItem = null;

function dismissInboxItem(actionLinkIndex) {
    // actionLinkIndex refers to the activity that brought the user here:
    //     activity.object.actionLinks[actionLinkIndex]
    // The action is marked completed and cleared from the user's inbox.
    // When marked completed, one of these action links MUST be specified, 
    // and that link is recorded are the resolution action take by the user.
    activeItem.actions[actionLinkIndex].resolve().execute(function() {
        gadgets.views.requestNavigateTo("canvas");
    });
}

function registerEvents() {
    $("#btn_approve").click(function() {
        $("button").attr("disable", "disable");
        publish(object, verb, null, $("#offer").val(), deliverTo, verb.actionLinks);
        dismissInboxItem(0);
    });
    $("#btn_reject").click(function() {
        $("button").attr("disable", "disable");
        publish(object, verb, null, $("#offer").val(), deliverTo, verb.actionLinks);
        dismissInboxItem(1);
    });
    $("#btn_counter_bid").click(function() {
        $("button").attr("disable", "disable");
        publish(object, verb, null, $("#offer").val(), deliverTo, verb.actionLinks);
        dismissInboxItem(2);
    });
    $("#btn_go_to_canvas_view").click(function() {
        $("button").attr("disable", "disable");
        gadgets.views.requestNavigateTo('canvas');
    });
}

function populateForm(userId, selector) {
    osapi.jive.core.inboxEntries.getActive().execute(function(item) {
        if (item && item.data) {
            activeItem = item.data;
        }
        else {
            $("#no-item").parent().children().hide();
            $("#no-item").show();
            gadgets.window.adjustHeight();
        }
    });
    osapi.people.get({userId:userId}).execute(function(friends) {
        if (!(friends instanceof Array)) friends = [friends];
        if (friends[0] && friends[0].list && friends[0].list.length) friends = friends[0].list;
        for (var i = 0, j = friends.length; i < j; ++i) {
            var friend = friends[i];
            if (friend.displayName) {
                $(selector).text(friend.displayName);
            }
            else {
                $(selector).text(friend.id);
            }
            deliverTo = friend.id;
        }
        gadgets.window.adjustHeight();
    });
    $("#object").text(object.title);
    var bid = String(Math.round(Number(requsetParams.bid) * 100));
    bid = bid.substring(0, bid.length - 2) + "." + bid.substring(bid.length - 2);
    $("#amount").text(Number(requsetParams.bid) ? "$" + bid : "free");
    $("#offer").val(Number(requsetParams.bid) ? bid : "0").focus();
}

