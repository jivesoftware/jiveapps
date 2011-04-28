var currentSpace = null;
var currentDoc = null;

function initEditor() {
  $('textarea.tinymce').tinymce({
    // Location of TinyMCE script
    script_url : 'https://github.com/jivesoftware/jiveapps/raw/master/examples/jive-core/document-crud-rte/tinymce/jscripts/tiny_mce/tiny_mce.js',

    // General options
    theme : "advanced",
    plugins : "style,table,preview,media,searchreplace,contextmenu,paste,directionality,noneditable,visualchars,nonbreaking",

    // Theme options
    theme_advanced_buttons1 : "fontselect,fontsizeselect,|,bullist,numlist,outdent,indent",
    theme_advanced_buttons2 : "bold,italic,underline,strikethrough,forecolor,styleselect,|,justifyleft,justifycenter,justifyright,justifyfull",
    theme_advanced_buttons3 : "",
    theme_advanced_buttons4 : "",
    theme_advanced_toolbar_location : "top",
    theme_advanced_toolbar_align : "left",
    theme_advanced_statusbar_location : "bottom",
    theme_advanced_resizing : false,

    // Example content CSS (should be your site CSS)
    content_css : "css/word.css",

    // Drop lists for link/image/media/template dialogs
    template_external_list_url : "lists/template_list.js",
    external_link_list_url     : "lists/link_list.js",
    external_image_list_url    : "lists/image_list.js",
    media_external_list_url    : "lists/media_list.js",

    // Replace values for the template plugin
    template_replace_values : {
      username : "Some User",
      staffid  : "991234"
    }
  });
}

function initPlacePickerButton() {
  $("#btn_choose_place").click(function() {
    osapi.jive.core.places.requestPicker({placeType: 'space', success: function(response) {
      currentSpace = response.data;
      $("#document_list_title").html("Documents for Space: " + currentSpace.name);
      $("#btn_new").show();
      initDocList(currentSpace);
    }})
  });
}

function initNewButton() {
  $("#btn_new").click(function() {
    $("#doc_subject").val("");
    tinyMCE.get('doc_content').setContent("");
    $("#panel_edit_title").html("Create New Document in \"" + currentSpace.name + "\"");
    currentDoc = null;

    $("#panel_list").hide();
    $("#panel_edit").show();
  });
}

function initPublishButton() {
  $("#btn_publish").click(function() {
    var publishCallback = function(response) {
      console.log(response);
      initDocList(currentSpace);
      $("#panel_list").show();
      $("#panel_edit").hide();
    }

    if(currentDoc == null) { // new doc
      var newDocObj = {
        subject: $("#doc_subject").val(),
        html: tinyMCE.get('doc_content').getContent()
      };
      currentSpace.documents.create(newDocObj).execute(publishCallback);
    } else { // existing doc
      currentDoc.subject      = $("#doc_subject").val();
      currentDoc.content.text = tinyMCE.get('doc_content').getContent();
      currentDoc.update().execute(publishCallback);
    }


  });
}

function initCancelButton() {
  $("#btn_cancel").click(function() {
    $("#panel_list").show();
    $("#panel_edit").hide();
  });
}

function initDocList(space) {
  space.documents.get().execute(function(response) {
    documents = response.data;
    var docHtml = ""
    for(var i = 0; i < documents.length; i++) {
      docHtml += "<li>" + documents[i].subject + " - <a href='#' class='edit' data-idx='" + i + "'>Edit</a> | <a href='#' class='delete' data-idx='" + i + "'>Delete</a></li>";
    }
    $("#document_list").html(docHtml);
    $("#document_list a.edit").click(function(link) {
      var index = parseInt($(this).attr('data-idx'));
      var summaryDoc = documents[index];
      loadDocInEditor(summaryDoc);
      return false;
    });

    $("#document_list a.delete").click(function(link) {
      if(confirm("Are you sure you want to delete this document?")) {
        var index = parseInt($(this).attr('data-idx'));
        var summaryDoc = documents[index];
        summaryDoc.destroy().execute(function(response) {
          initDocList(currentSpace);
          $("#panel_list").show();
          $("#panel_edit").hide();
        });
      }

      
      return false;
    });
  });
}

function loadDocInEditor(summaryDoc) {
  // get full doc with html content. summary doc only has text content.
  summaryDoc.get().execute(function(response) {
    console.log('loadDocInEditor response:');
    console.log(response);
    currentDoc = response.data;
    var html = currentDoc.content.text;

    $("#panel_list").hide();
    $("#panel_edit").show();

    $("#panel_edit_title").html("Edit Document \"" + currentDoc.subject + "\"")
    $("#doc_subject").val(currentDoc.subject);
    tinyMCE.get('doc_content').setContent(html);
  });

}

gadgets.util.registerOnLoadHandler(function() {
  initPlacePickerButton();
  initNewButton();
  initPublishButton();
  initCancelButton();
  initEditor();
});
