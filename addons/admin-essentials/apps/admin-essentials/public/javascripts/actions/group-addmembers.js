var groupAddMembers = {

    jiveURL : opensocial.getEnvironment()['jiveUrl'],
	
	init : function() {
        var appObj = this;
		//** LOAD CURRENT VIEW ***
		var currentView = gadgets.views.getCurrentView().getName();
        var currentCtx;
		
		//** ADJUST HEIGHT OF VIWEW ***
	  	gadgets.window.adjustWidth(400);
	  	gadgets.window.adjustHeight(400);

		gadgets.actions.updateAction({
			id: "org.jivesoftware.adminessentials.group.addMembers",
			callback: gadgets.util.makeClosure(this, this.handleContext)
		});

        $("#btn_user_picker").click(function() {
            osapi.jive.corev3.people.requestPicker(
                {
                    success: function(response) {
                        var users = appObj.handleGetPickerUsers(response);
                        appObj.handleRenderPickerUsers(users);
                    },
                    multiple: true
                }
            );
          });

        $("#form-picker-cancel").click( function() { osapi.jive.core.container.closeApp(); } );
        $("#form-picker-submit").click( gadgets.util.makeClosure(this, this.clickPickerAddMembers) );

	}, // end init

    handleGetPickerUsers : function(response) {
        var users = [];
        if (response.list) {
            $.each(response.list, function() {
                users.push(this);
            }); // end for each
        } else {
            users.push(response);
        } // end if
        return users;
    },

    handleRenderPickerUsers: function(users) {
        var appObj = this;
        var currentView = gadgets.views.getCurrentView().getName();

        if (users && users.length < 1) {
            return;
        }

        // render header row
        var content = "";

        // render user rows
        for(var i = 0; i < users.length; i++) {
            var user = users[i];
            console.log(user);
            content += '<div class="selected-user">';
            content += '<img src="'+user.resources.avatar.ref+'" />';
            content += '<a href="javascript:void(0);" title="'+user.jive.username+'" class="fullname">'+user.displayName+'</a>';
            content += '<span pos="u'+i+'" class="userid">'+user.resources.self.ref+'</span>';
            content += '</div>';
        } // end for

        $("#picker-selected-list").html(content);
        $("#picker-selected-controls").show();
        $("#picker-selected-list").slideDown('fast',function() {
            gadgets.window.adjustHeight();
        });
    },
	
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
	
    handlePickerAddMembers : function(data) {
        var appObj = this;
        $("div.selected-user span.userid").each(function( index ) {
            var result = data[$(this).attr("pos")];
            if (result.type && result.type == "member") {
                $(this).parent().addClass("memberadd-success");
            } else if (result.status == 409) {
                $(this).parent().addClass("memberadd-error");
                $(this).parent().append("<p>"+result.error.message+"</p>")
            } else {
                $(this).parent().addClass("memberadd-warn");
                $(this).parent().append("<p>Unknown Error</p>")
            } // end if
        });
        gadgets.window.adjustHeight();
    },

    clickPickerAddMembers : function() {
        var appObj = this;

        var batchRequests = osapi.newBatch();

        $("div.selected-user span.userid").each(function( index ) {
            batchRequests.add(
                $(this).attr("pos"),
                appObj.currentCtx.createMember({
                    "person" : $(this).text(),
                    "state" : "member"
                },
                {
                    "fields" : "username"
                }
                )
            );
        });

        batchRequests.execute(appObj.handlePickerAddMembers);

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

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(groupAddMembers, groupAddMembers.init));
