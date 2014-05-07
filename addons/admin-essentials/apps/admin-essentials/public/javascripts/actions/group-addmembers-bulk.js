var groupAddMembersBulk = {

    jiveURL : opensocial.getEnvironment()['jiveUrl'],
    batchSize : 25,   //TODO: EVALUATE PERFORMANCE AND FIND BEST VALUE FOR 1000+
    processedCount : 0,
    successCount : 0,
    errorCount : 0,
    warnCount: 0,
    lineCount: 0,
	
	init : function() {
        var appObj = this;
		//** LOAD CURRENT VIEW ***
		var currentView = gadgets.views.getCurrentView().getName();
        var currentCtx;
		
		//** ADJUST HEIGHT OF VIWEW ***
	  	gadgets.window.adjustWidth(400);
	  	gadgets.window.adjustHeight(400);

		gadgets.actions.updateAction({
			id: "org.jivesoftware.adminessentials.group.addMembersBulk",
			callback: gadgets.util.makeClosure(this, this.handleContext)
		});

        $("#userIDs").change(function() {
           $("#line-count span").text($(this).val().trim().split('\n').length);
        });

        $("#form-bulk-cancel").click( function() { osapi.jive.core.container.closeApp(); } );
        $("#form-bulk-submit").click( gadgets.util.makeClosure(this, this.clickBulkAddMembers) );

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
	
    handleBulkAddMembers : function(data) {
        var appObj = groupAddMembersBulk;
        //console.log('Processing Batch Results ...');
        $(data).each(function( x, value ) {
          for (var key in value) {
              var result = value[key];
              if (result.error) {
                  if (result.status === 409) {
                    appObj.handleWarn('['+key+'] - '+result.error.message);
                  } else {
                    appObj.handleError('['+key+'] - '+result.error.message);
                  } // end if
              } else if (result.type && result.type === "member") {
                  appObj.handleSuccess();
              } else {
                  appObj.handleWarn('['+key+'] - Unknown Error');
              } // end if
          } // end for key
        });
        appObj.handleCounterUpdate();
        // console.log('Batch Results Processed!');
        gadgets.window.adjustHeight();

        //console.log('processed='+appObj.processedCount+', success='+appObj.successCount+', error='+appObj.errorCount+', warn='+appObj.warnCount);

        if (appObj.processedCount >= appObj.lineCount) {
            console.log('Done.  Resetting UI ['+(new Date() - appObj.startTime)+']');
            $('#userIDs').removeAttr('disabled');
            $('#working').hide('fast',
                function() {
                    $('#form-buttons').show('fast');
                }
            );
        } // end if
    },

    runBatch : function() {
        var appObj = this;

        var userIDs = $("#userIDs").val().trim().split('\n');
        appObj.lineCount = userIDs.length;

        appObj.reset();

        function isInt(n) { return parseInt(n,10) ? true : false; }

        var batchRequests = osapi.newBatch();
        var queuedRequests = 0;
        $.each(userIDs, function( index, value ) {
           if (value && !isInt(value)) {
             appObj.handleWarn('IGNORE - Invalid User ID: '+value);
           } else if (value) {
               //console.log('Adding ['+value+'] to batchRequest...');
               queuedRequests+=1;
               true;
               batchRequests.add(
                   value,
                   appObj.currentCtx.createMember({
                       "person" : appObj.jiveURL + '/api/core/v3/people/' + value,
                       "state" : "member"
                   },
                   {
                       "fields" : "username"
                   }
                   )
               );
               if ((index > 0) && ((index+1) % appObj.batchSize == 0)) {
                   console.log('Submitting Batch [Size='+appObj.batchSize+'] ...');
                   batchRequests.execute(appObj.handleBulkAddMembers);
                   batchRequests = osapi.newBatch();
                   queuedRequests = 0;
               } // end if
           } else {
               appObj.handleWarn();
           } // end if
        });

        if (queuedRequests > 0) {
           console.log('Submitting Final Batch [Size='+queuedRequests+'] ...');
           batchRequests.execute(appObj.handleBulkAddMembers);
        } // end if

    }, // end runBatch

    clickBulkAddMembers : function() {
        var appObj = this;

        $('#userIDs').attr('disabled','disabled');
        $('#form-buttons').hide('fast',
            function() {
                $('#working').show('fast');
                $('#messages').show('fast',function() {
                    gadgets.window.adjustHeight();
                    appObj.runBatch();
                });
            }
        );
    },

    logMessage : function(message,type) {
        $('#message-log').prepend('<p class="log-message '+type+'">'+message+'</p>');
    },

    handleSuccess : function() {
        this.processedCount++;
        this.successCount++;
    },

    handleError : function(message) {
        this.processedCount++;
        this.errorCount++;
        if (message) {
            this.logMessage(message,'error');
        }
    },

    handleWarn : function(message) {
        this.processedCount++;
        this.warnCount++;
        if (message) {
            this.logMessage(message,'warn');
        } // end if
    },

    handleCounterUpdate : function() {
        $('#success-count').text(this.successCount);
        $('#error-count').text(this.errorCount);
        $('#warn-count').text(this.warnCount);
        $('#processed-count span').text(this.processedCount);
    },

    reset : function() {
        var appObj = this;

        appObj.processedCount = 0;
        appObj.successCount = 0;
        appObj.errorCount = 0;
        appObj.warnCount = 0;

        appObj.handleCounterUpdate();
        appObj.startTime = new Date();
        $('#message-log').html('');
    }
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(groupAddMembersBulk, groupAddMembersBulk.init));
