function isMultipleSelected() {
  if ($('#select_multiple:checked').val() !== undefined)
    return true;
  else
    return false;
}

function getUsersFromResponse(response) {
  var users = [];
  if(response.data instanceof osapi.jive.core.User) {
    users.push(response.data);
  } else if (response.data instanceof Array) {
    users = response.data;
  }
  return users;
}

function renderUserTable(users) {
  var currentView = gadgets.views.getCurrentView().getName();

  // render header row
  var content = ""
  content += "<tr>"
  content += "<th>ID</th>";
  content += "<th>Name</th>";
  content += "<th>Username</th>";
  // include email in canvas view
  if (currentView == 'canvas' || currentView == 'default') // Jive 5 currently returns 'default' for the canvas view
    content += "<th>Email</th>";
  content += "</tr>";

  // render user rows
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    content += "<tr>"
    content += "<td>" + user.id + "</td>";
    content += "<td>" + user.name + "</td>";
    content += "<td>" + user.username + "</td>";
    // include email in canvas view
    if (currentView == 'canvas' || currentView == 'default') // Jive 5 currently returns 'default' for the canvas view
      content += "<td>" + user.email + "</td>";
    content += "</tr>";
  }

  $("#user-content").html(content);
  $("#user-info").show();
  gadgets.window.adjustHeight();
}

gadgets.util.registerOnLoadHandler(function() {

  $("#btn_user_picker").click(function() {
    var callback = function(response) {
      var users = getUsersFromResponse(response);
      renderUserTable(users);
    }
    osapi.jive.core.users.requestPicker({success: callback, multiple: isMultipleSelected()});
  });
});
