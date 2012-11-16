(function() {
	
    var Util = {},
        locURL = "http://api.shoe.io/location",  // URL to retrieve location data.
        peopleData,  // Cache from last time people details were received. 
        locData,  // Cache from last time location details were received. 
        lastDataCheck,  // Date/Time of last time data was retrieved. 
        lastQuery,  // The last query for location data.
        displayDateFormat = "dddd MMMM Do",  
        displayTimeFormat = "h:mm A", 
        currentFocusContainer,  // The container that is currently scrolled into view.
        timer;  // Several items (display date/time, weather) are refreshed on a timer.
	
    // DOM references
    var $locContainer = $('.locContainer'),
        $peopleContainer = $('.peopleContainer');
    

    // Function to handle retrieving location data. 
    function locationSearchHandler(location) {
        if (timer) clearInterval(timer);  // Clear out any existing timers	
        lastQuery = location;  // Save off the last query. 
		
        $locContainer.html('Fetching...');


        /*
        The app demonstrates three methods to retreive data from an external API. 
        You may comment-out/un-comment each one to see how they work. 
        osapi.http.get() is the preferred method. 
        */

        // OPTION 1: osapi.http.get()
        // http://docs.opensocial.org/display/OSD/Osapi.http+%28v0.9%29#Osapi.http%28v0.9%29-osapi.http.get
		// https://developers.jivesoftware.com/community/docs/DOC-1094
		osapi.http.get({
			href: locURL + '?q=' + encodeURI(location),
		    format: 'json'
		}).execute(function(response) {
		    locationSearchCallback(response.content);
		});
		
/*		
		// OPTION 2: makeRequest()
		// https://developers.google.com/gadgets/docs/reference/#gadgets.io.makeRequest
		var params = {};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		gadgets.io.makeRequest(locURL + '?q=' + encodeURIComponent(location), 
			function(data){
				locationSearchCallback(data.data);
			}, 
		params);
*/	
		
/*
		// OPTION 3: Typical XHR request. 
        $.ajax({
            url: locURL,
            method: 'GET',
            dataType: 'json',
            data: {
                q: location
            },
            success: function(data) {
                locationSearchCallback(data);
            },
            error: function(ex) {
                $locContainer.html('Well... this is embarrassing. Encountered error.');
            },
            complete: function() { }
        });
*/
    }


    // Handler once location data is retrieved. 
    function locationSearchCallback(data) {
		// Save the data so it's available later. 
	    locData = data.data; 
		
	    // Loop through the locations, set the offset date
	    for (var ii in locData.locations) {
	        locData.locations[ii].timeZone.displayDate = Util.getOffsetDisplayDate(locData.locations[ii].timeZone.offsetMS, displayDateFormat);
	        locData.locations[ii].timeZone.displayTime = Util.getOffsetDisplayDate(locData.locations[ii].timeZone.offsetMS, displayTimeFormat);
	        locData.locations[ii].id = Math.floor((Math.random()*100000)+1);  // Unique Id to reference for later updates. 
	    }
	
	    // Render the locations	
	    var template = $("#locationTemplate").html();
	    var html = Mustache.to_html(template, locData);
	    $locContainer.html(html);
	    
		// Save the Date/Time we last retrieved data
		lastDataCheck = new Date();
		// Kick off updates of display time(s)
		timer = setInterval(incrementTime, 1000);
    }


	
    // Retrieve the list of user's friends, display them. 
    function peopleSearchHandler() {
		
        // Retrieve the current user's details
        osapi.jive.core.users.get({
            id: '@viewer'
        }).execute( function (response) {
            var user = response.data;  // Current user
            
            // Now that we have the user's profile, get a list of their connections. 
            var request = user.connections.get();
            request.execute(function(response) { 
			
                // Does this user have connections?
                if (response.data && response.data.length > 0) { 				
                    
                    // Append the current user to the list of connections so they appear at the top of the list. 
                    // The user's location information is set in the user preferences for the app. See the app.xml for details.
                    user.profile = {};
                    var prefs = new _IG_Prefs();
                    user.profile.city = prefs.getString('userCity');
                    user.profile.state = prefs.getString('userState');
                    user.profile.country = prefs.getString('userCountry');
                    response.data.splice(0,0,user);  // Append the user to the list of connections. 

                    // Backfill profile data if it's missing from people data                    
                    for (var ii in response.data) {  // Loop through connections
                        if (!response.data[ii].profile)
                            response.data[ii].profile = Util.getRandomLocation();  // Add a random profile to this connection
						
                        // Concat the location information to create a display/search 'locale'
                        var profile = response.data[ii].profile;
                        var locale = profile.city;
                        if (profile.state && profile.state.length > 0) {
                            locale += ', ' + profile.state;
                        } else if (profile.country && profile.country.length > 0) {
                            locale += ', ' + profile.country;
                        }
                        response.data[ii].profile.locale = locale;
                    }

                    // The list of connections have been reviewed, now merge them into the template. 
                    var template = $("#peopleListTemplate").html();
                    var html = Mustache.to_html(template, response);
                    $peopleContainer.html(html);
                } else {
                    // User has no connections. 
                    $peopleContainer.html('You have no connections. Find some friends to follow.');
                }
            });
        });
    }
		
	
    // Handles incrementing the display date/time. 
    function incrementTime() {
        // Calculate how long since we last retrieved weather and other data. 
        var t1 = lastDataCheck.getTime();
        var t2 = new Date().getTime();
        var timespanMS = parseInt(t2-t1);
		
        if (moment.duration(timespanMS, 'ms').minutes() >= 15) {
            locationSearchHandler(lastQuery);  // It's been awhile, refresh all the data. 
        } else {	
            // Loop through the locations, update the offset time
            for (var ii in locData.locations) {
                $('#locDate_' + locData.locations[ii].id).html(Util.getOffsetDisplayDate(locData.locations[ii].timeZone.offsetMS, displayDateFormat));
                $('#locTime_' + locData.locations[ii].id).html(Util.getOffsetDisplayDate(locData.locations[ii].timeZone.offsetMS, displayTimeFormat));
            }
        }
    }
	
	
    // Toggles the various views into place
    function toggleView(focus) {
        // Only perform these actions when in "Home" view.  
        if (Util.isHome) {
	
            // Save off the focus for later reference
            currentFocusContainer = focus;
            // Switch visible column
            var box = document.getElementById('scrollableArea');            
            box.style.marginLeft = ( focus == 'location' ) ? '-100%' : '0%';
        }
        
    }	
	
	// For 'App Mention' callback handler once the app is instantiated for EDIT.
    function editEmbeddedReference(data) {
        var locale = data.target.context.locale; 
		
        // Set the search box with the locale. 
        $('#txtSearch').val(locale);
			
        // Kick off a search for this locale.
        locationSearchHandler(locale);
    }
    
	// For 'App Mention' callback handler once the app is instantiated for DISPLAY.    
    function displayEmbeddedReference(data) {
        var locale = data.target.context.locale; 
		
		// Remove the search box for this view.
		$('#searchContainer').css('display', 'none');
			
        // Kick off a search for this locale.
        locationSearchHandler(locale);
    }


	
    // A place for utility functions
    Util = {
        locationPool: [], // List of random locations to be populated using Data Pipelining. 

        // Not all Jive environments have people's location data (within .profile object?) available. 
        // To facilitate this demontration, backfill location data if it's missing. 
        getRandomLocation: function() {						
            // Return a random location
            var index = Math.floor(Math.random()*(this.locationPool.length-1)); 
            return this.locationPool[index];
        },		
		
        // Returns an offset UTC date string
        getOffsetDisplayDate: function(ms, format) {
            return moment.utc().add('ms', ms).format(format)
        },
		
        // Returns a specific location object by id
        retreiveLocation: function(id) {
            var loc = locData.locations.filter(function (el) {
                if (el.id == id) return true;
            });
			
            return loc[0];
        },
		
        // Some logic is dependent upon the home vs canvas view. 
        isHome: (gadgets.views.getCurrentView().name_ === 'home'),
        isCanvas: (gadgets.views.getCurrentView().name_ === 'canvas' || gadgets.views.getCurrentView().name_ === 'default'),
        isEmbedded: (gadgets.views.getCurrentView().name_.indexOf('embedded')>=0)
    };	
	
	
	
    $(document).ready(function () {
		
        if (Util.isHome || Util.isCanvas) {  // BEGIN HOME & CANVAS LOAD TASKS
		
	        // Using data pipelining to retrieve list of locations from an external source.
            // Details here: http://opensocial-resources.googlecode.com/svn/spec/0.9/OpenSocial-Data-Pipelining.xml#rfc.section.11            
            gadgets.util.registerOnLoadHandler(function() {
				osDataContext = opensocial.data.getDataContext();	
				osDataContext.registerListener('locationPool', function(key) {
					var locations = (osDataContext.getDataSet(key[0])).content.locations;
					Util.locationPool = locations;
					
					// Now that we have a list of 'dummy' locations, we can load the user's connections. 
					peopleSearchHandler();
			    });
			});
            
            // Attach an event handler to each person
            $peopleContainer.on("click", ".person", function() {
                locationSearchHandler($(".locale", this).html());
                toggleView('location');
            });
			
            // Attach an event handler to each "share" button
            $locContainer.on("click", ".locShare", function() {
                // Retrieve the location details for this location
                var loc = Util.retreiveLocation(this.id);
				
                // Build up the html to stick into the activity item
                var html = "The weather in <strong>" + loc.city + "</strong> is <strong>" + loc.weather.conditions + "</strong> and temperature is <strong>" + loc.weather.tempDescription + "</strong>. <br/>";
                html += "Humidity: " + loc.weather.humidity + "<br/>";
                html += "Wind: " + loc.weather.windDescription;
                console.log(html);
				
                // Build up the request to update the user's activity stream
                var params = {
                    activity: { 
                        title: "Current Weather", 
                        body: "Another weather update... ", 
                        verb: "post", 
                        object: { 
                            objectType: "article", 
                            summary: html, 
                            mediaLink: { 
                                mediaType: "photo", 
                                url: loc.weather.iconURL
                            }
                        }
                    }
                };

                // Post the activity to the activity stream
                osapi.activities.create(params).execute(
                    function(response) {
                        var msg = new gadgets.MiniMessage();
                        if(!response.error) {
                            msg.createTimerMessage("Posted weather activity for " + loc.city + ". ", 5);
                        } else {
                            msg.createTimerMessage("Encountered error: " + response.error, 5);
                        }
                    }
                );
                
                
                /*	
                // Optionally, the user's status can also be updated. 
                // Update the user's status                
                osapi.jive.core.updates.create(
                        { userId: '@viewer', update: { html: html, latitude: loc.latitude, longitude: loc.longitude } }
                ).execute(function(response) {
	                	var msg = new gadgets.MiniMessage();
	                	if(!response.error) {
	                        msg.createTimerMessage("Updated your status for " + loc.city + ". ", 5);
                        } else {
	                        msg.createTimerMessage("Encountered error: " + response.error, 5);
                        }
                });
                */                
	
            });
		
		
            if (Util.isHome) {
	            // Attach an event handler to scroll back to people list
	            $locContainer.on("click", "#back", function() {
	                toggleView('people');
	            });
				
	            // Attach event handler to load all (first 5) connection's locations. 
	            $peopleContainer.on("click", "#viewAll", function() {
	                var localeList = "";
	                $peopleContainer.children('.person:lt(5)').each(function () { 
	                    localeList += $(".personName .locale", this).html() + "|";
	                });
		
	                locationSearchHandler(localeList);  // Fire off the query. 
	                toggleView('location');
	            });
            }
            
		
        // END HOME & CANVAS LOAD TASKS
        } else if (Util.isEmbedded) {  // BEGIN EMBEDDED LOAD TASKS
			
            // Attach event handlers for the search 
            $('#txtSearch').keypress(function(e) { 
                if(e.which == 13) {
                    locationSearchHandler(this.value);
                }
            });
            $('#btnSearch').click(function(e) {
                locationSearchHandler($('#txtSearch').val());
            });
			
            // Attach an event handler to each "insert" button
            $locContainer.on("click", ".locShare", function() {
                // Retrieve the location details for this location
                var loc = Util.retreiveLocation(this.id);
				
                // Build up the location string that will be inserted into the document
                var locale = loc.city;
                if (loc.state && loc.state.length > 0) {
                    locale += ', ' + loc.state;
                } else if (loc.country && loc.country.length > 0) {
                    locale += ', ' + loc.country;
                }
				
                // Return location, close the app
                osapi.jive.core.container.closeApp( {
                    data: {
                        display: { 
                            type: "text", 
                            label: loc.city
                        }, 
                        target: { 
                            type: "embed", 
                            view: "embedded.callout_location", 
                            context: { 
                                locale: locale 
                            }
                        }
                    }
                });
            });
            
	        gadgets.util.registerOnLoadHandler(function() {
		
		        // Register a listener for embedded experience context
		        opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function(key) { 
		            var data = opensocial.data.getDataContext().getDataSet(key);
		            displayEmbeddedReference(data)
		        });
				
				
		        // Register update actions event, that will exectute when the app loads
		        gadgets.actions.updateAction({
		            id:"com.thomsonreuters.demo.callout.location",
		            callback:editEmbeddedReference
		        });
		    });
            
            gadgets.window.adjustHeight(250);
			
        // END EMBEDDED LOAD TASKS			
        }
		
    });

})();

			
// If CORS isn't supported by the browser, fallback to JSONP
$.ajaxPrefilter('json', function(options, orig, jqXHR) {
    if (options.crossDomain && !$.support.cors) return 'jsonp';
});


