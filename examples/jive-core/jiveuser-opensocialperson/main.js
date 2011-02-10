

 function getViewerCallback(viewerData) {
         var personInfo = $('#os_personInfo'),
             thumbnail =$('#os_thumbnail');
         if (!viewerData.error) {
           console.log("OpenSocial Person Object");
           console.log(viewerData);
           /*
           $('#os_displayName').text("displayName: " + viewerData.displayName);
           $('#os_name').text("name.formatted: " + viewerData.name.formatted);
           $('#os_name').append("name.givenName: " + viewerData.name.givenName);
           $('#os_thumbnail').text(viewerData.thumbnailUrl);
           $('#os_thumbnail').append('<img src="' + viewerData.thumbnailUrl + '"/>');
           */
           personInfo.append("---OpenSocial Person Info---");
           personInfo.append("<br/>");
           personInfo.append("id: " + viewerData.id);
           personInfo.append("<br/>");
           personInfo.append("displayName: " + viewerData.displayName);
           personInfo.append("<br/>");
           personInfo.append("name.formatted: " + viewerData.name.formatted);
           personInfo.append("<br/>");
           personInfo.append("name.givenName: " + viewerData.name.givenName);
           thumbnail.append(viewerData.thumbnailUrl + " ");
           thumbnail.append('<img src="' + viewerData.thumbnailUrl + '"/>');
           thumbnail.append('<br/>');
           
         };
        
 };
 
  function jiveUserCallback(response) {
         var juHtml =  $('#ju_Info'),
             avatarHtml = $('#ju_avatar'),
             jiveUser = response.data;
         console.log("jive user");
         console.log(jiveUser);
         if (!response.error) {
           juHtml.append("---Jive User Info---");
           juHtml.append("<br/>");
           juHtml.append("id: " + jiveUser.id);
           juHtml.append("<br/>");
           juHtml.append("name: " + jiveUser.name);
           juHtml.append("<br/>");
           juHtml.append("firstName: " + jiveUser.firstName);
           juHtml.append("<br/>");
           juHtml.append("lastName: " + jiveUser.lastName);
           juHtml.append("<br/>");
           juHtml.append("email: " + jiveUser.email);
           juHtml.append("<br/>");
           avatarHtml.append("avatarUrl: " + jiveUser.avatarURL);
           avatarHtml.append("<br/>");

       
         };
       
  };



function init() {
         osapi.people.getViewer().execute(getViewerCallback);
         osapi.jive.core.users.get({id: '@viewer'}).execute(jiveUserCallback);
       };

gadgets.util.registerOnLoadHandler(function() {
  init();
  gadgets.window.adjustHeight(500);

});
