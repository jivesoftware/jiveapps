function loadUpdates(updatesHtml, userId) {

  osapi.jive.core.updates.get({limit: 10, userId: userId}).execute(function(response) {
    if (response.error) {
      return;
    }
    var updates = response.data;

    var newUpdatesHtml = updatesHtml.clone().html('');
    for (var i = 0; i < updates.length; i++) {
      var update = updates[i];
      var user = update.author;

      newUpdatesHtml.append("<li><strong>" + (user ? user.name + ": " : "") + "</strong>" +
          update.content.text + "</li>");
    }

    updatesHtml.replaceWith(newUpdatesHtml);
    $("#updates-accordion").accordion("resize");
    gadgets.window.adjustHeight();
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
  $("#update-post").button();

  loadUpdates($("#all-updates"), null);
});