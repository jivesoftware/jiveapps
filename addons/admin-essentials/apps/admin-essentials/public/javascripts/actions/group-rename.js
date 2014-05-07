var groupRename = {

    jiveURL : opensocial.getEnvironment()['jiveUrl'],

	init : function() {
		//** LOAD CURRENT VIEW ***
		var currentView = gadgets.views.getCurrentView().getName();
		var rollbackCtx;
        var currentCtx;
		
		//** ADJUST HEIGHT OF VIWEW ***
	  	gadgets.window.adjustWidth(400);
	  	gadgets.window.adjustHeight(400);

		gadgets.actions.updateAction({
			id: "org.jivesoftware.adminessentials.group.rename",
			callback: gadgets.util.makeClosure(this, this.handleContext)
		});

		$("#form-cancel").click( function() { osapi.jive.core.container.closeApp(); } );
		$("#form-submit").click( gadgets.util.makeClosure(this, this.clickRename) );
		
		$("#renameConfirm").click(
			function() {
				if ($(this).is(':checked')) {
					$('#groupURL').removeAttr('disabled');
					$('#form-submit').removeAttr('disabled');
                    $('#group-rename-form').slideDown('fast',function() { gadgets.window.adjustHeight(); });
				} else {
                    $('#groupURL').attr('disabled','disabled');
                    $('#form-submit').attr('disabled','disabled');
                    $('#group-rename-form').slideUp('fast',function() { gadgets.window.adjustHeight(); });
                }// end if
			} // end function
		);	

		$("#renameConfirm").focus();
	}, // end init
	
	handleLoadContext : function(place) {
       var appObj = this;
       appObj.currentCtx = place;

       $('#currentGroup h1').append('<span class="jive-icon-huge '+place.iconCss+'"></span>'+place.name);
       $('#currentGroup p').html('<a href="/groups/'+place.displayName+'">/groups/'+place.displayName+'</a>');
       $('#groupURL').val(place.displayName);

	}, // end handleLoadContext
	
	handleContext : function(ctx) {
        var appObj = this;
        var options = { entityDescriptor: 700 + "," + ctx.jive.content.id };

        osapi.jive.corev3.places.get(options).execute( function(response) {
            if (response.error) {
                appObj.showError("Error loading DL: " + response.error.message + " (" + response.error.code + ")");
            } else {
                appObj.handleLoadContext(response.list[0]);
            } // end if
        });
	}, // end handleContext
	
    handleRename : function(response) {
        //TODO:  HOW TO TELL WHEN IT FAILS?
        var appObj = this;
        console.log(response);
        $("#groupURL").addClass("rename-success");
        //appObj.showInfo("Successfully Updated Group Information");
        //osapi.jive.core.container.closeApp();
    },

	clickRename : function() {
        var appObj = this;
        var groupURL = $('#groupURL').val();

        appObj.rollbackCtx =  appObj.currentCtx;
        appObj.currentCtx.displayName = groupURL;

        appObj.currentCtx.update().execute(appObj.handleRename);
    }, // end clickRename

    showInfo: function(str) {
        $("#info span").html(str);
        $("#info").show();
        gadgets.window.adjustHeight();
    },

    /**
     * Show unrecoverable error and hide all app functionality
     */
    showError: function(str) {
        $("#container").hide();
        $("img.activity-indicator").hide();
        $("#errors").html(str).show();
        gadgets.window.adjustHeight();
    }
	
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(groupRename, groupRename.init));
