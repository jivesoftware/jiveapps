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
  var content = ""
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    content += "<tr>"
    content += "<td>" + user.id + "</td>";
    content += "<td>" + user.name + "</td>";
    content += "<td>" + user.username + "</td>";
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
