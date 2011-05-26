function loadUpdates() {
  osapi.jive.core.updates.get({limit: 10}).execute(function(response) {
    if (!response.error) {
      var updates = response.data;
      var recentUpdates = document.getElementById('recent_updates');
      while (recentUpdates.hasChildNodes()) {
        recentUpdates.removeChild(recentUpdates.lastChild);
      }

      for (i = 0; i < updates.length; i++) {
        var update = updates[i];
        var user = update.author;
        var node = document.createElement('li');
        node.innerHTML = "<strong>" + (user ? user.name + ": " : "") + "</strong>" +
            update.content.text;
        recentUpdates.appendChild(node);
      }
      gadgets.window.adjustHeight();
    }
  });
}

gadgets.util.registerOnLoadHandler(function() {
  var form = document.getElementById('update_form');
  form.onsubmit = function() {
    var html = document.getElementById('update_entry').value;
    osapi.jive.core.updates.create({userId: '@viewer', update: {html: html}}).
        execute(function(response) {
      if (!response.error) {
        var updateEntry = document.getElementById('update_entry');
        updateEntry.value = '';
        loadUpdates();
      }
    });

    return false;
  };

  loadUpdates();
});