var core = osapi.jive.core;

function loadUpdates(updatesHtml, userId) {
  core.updates.get({limit: 10, userId: userId}).execute(function(response) {
    processUpdates(updatesHtml, response);
  });
}

function processUpdates(updatesHtml, response) {
  if (response.error) {
    return;
  }
  var updates = response.data;

  var newUpdatesHtml = updatesHtml.clone().html('');
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    var user = update.author;

    var userAnchor;
    if (user) {
      userAnchor = $("<a href='javascript:void(0);'>" + user.name + ":</a>").data("userResource",
          user.self.get()).click(loadUserUpdates);
    } else {
      userAnchor = "";
    }
    var updateListItem = $("<li></li>");
    updateListItem.append($("<strong></strong>").append(userAnchor));
    updateListItem.append(update.content.text);

    updateListItem.appendTo(newUpdatesHtml);
  }

  updatesHtml.replaceWith(newUpdatesHtml);
  $("#updates-accordion").accordion("resize");
}

function loadUserUpdates() {
  var userResource = $(this).data("userResource");
  userResource.execute(function(response) {
    var user = new core.User(response.data);
    user.updates.get().execute(function(response) {
      $("#updates-accordion").accordion("activate", 2);
      processUpdates($("#user-updates"), response)
    });
  });
}

function accordionChange(event, ui) {
  var userId;
  var headerId = ui.newHeader.attr("id");
  if (headerId == "all-updates-header") {
    userId = null;
  }
  else if (headerId == "my-updates-header") {
    userId = "@viewer"
  }
  ui.oldContent.find("li").remove();
  loadUpdates($(ui.newContent).find("ul"), userId);
}

gadgets.util.registerOnLoadHandler(function() {
  var form = $('update-form');
  form.onsubmit = function() {
    var html = $('update-entry').value();
    osapi.jive.core.updates.create({userId: '@viewer', update: {html: html}}).
        execute(function(response) {
      if (!response.error) {
        $('update-entry').value('');
        loadUpdates();
      }
    });

    return false;
  };
  $("#updates-accordion").accordion({changestart: accordionChange});
    $("#updates-accordion").accordion({change: function() {
      gadgets.window.adjustHeight();
    }});
  $("#update-post").button();

  loadUpdates($("#all-updates"), null);
});