/****************************************************
* This file should load AFTER view.js or container.js, or whichever .js file that defines the onReady, onContainer and onViewer
*
* Note:  This implmentation has been provided for convenience, developers are not required to use this pattern.
*
* SEE: Tile API & Development FAQ - https://community.jivesoftware.com/docs/DOC-185776
****************************************************/


//************************************************************************
// Must provide your service URL
//************************************************************************
const serviceURL = "https://rashed.ngrok.io";


//************************************************************************
//NOTE: CALLED AS SOON AS THE FULL CONTEXT IS RESOLVED
// Make sure the tileConfig is an object, and display the videos available
// in the LiveStream account.
// Also takes an OPTIONAL Simple Stream Integration listener URL to generate
// activity stream objects & then pulls comments from that object into the
// tile's view.
// On submit, it will save the fields to the config
//************************************************************************
function onReady(tileConfig,tileOptions,viewer,container) {
  test = tileConfig;
  var json;
  if(!tileConfig || (Object.keys(tileConfig).length === 0 && tileConfig.constructor === Object)){
    var events = getEvents(tileOptions.definitions[0].name)
    .then((val) => {
      json = val;
      displayData(json.webhook_URI, json.event_data);
    })
    .catch((err) => console.log(err));
  } else if ( typeof tileConfig === "string" ) {
    json = JSON.parse(tileConfig);
  } else{
    json = tileConfig;
    displayData(json.webhook_URI, json.event_data);
  } // end if


  $("#btn_submit").click( function() {  
      // update config data from input dialog
      var event_id = parseInt($('#the_list').val());
      var webhook_URI = $('#ssi_url').val();

      json["webhook_URI"] = webhook_URI !== '' ? webhook_URI : null;

      json["event_id"] = event_id;
      console.log(JSON.stringify(json, null, '\t'));
      console.log(`Event ${json.event_id} selected`);

      // send config to service
      jive.tile.close(json, {} );
  });

  app.resize();
} // end function

//************************************************************************
// Fetches the service's /events endpoint with a GET request
// This is an optional endpoint and can be removed
// only used if the service hasn't had a chance to update the config yet
//************************************************************************
function getEvents(tileName){
  return new Promise((resolve, reject) =>{
    osapi.http.get({
      'href' : `${serviceURL}${tileName}/events`,
      'noCache' : true
    }).execute((response)=>{
      if(response.status === 200){
        console.log("Fetched new list of events");      
        response.content = (response.content && typeof response.content !== 'object' ? JSON.parse(response.content) : response.content);
        resolve(response.content);
      } else{
        reject("Error: " + JSON.stringify(response, null, '\n'));
      }
    })
  })
}

//************************************************************************
// Displays the data from the config
//************************************************************************
function displayData(uri, feeds){
  feeds.map((obj) =>{
    $('#the_list').append($('<option/>',{
      value : obj.id,
      text : obj.fullName
    }))
  })
  if(uri && uri !== "")
    $("#ssi_url").val(uri);
}

//************************************************************************
//NOTE: CALLED AS SOON AS THE CONFIG IS RESOLVED
//************************************************************************
function onConfig(tileConfig,tileOptions) {
  console.log('onConfig',tileConfig,tileOptions);
} // end function

//************************************************************************
//NOTE: CALLED AS SOON AS THE CONTAINER IS RESOLVED
//************************************************************************
function onContainer(container) {
  console.log('onContainer',container);
} // end function

//************************************************************************
//NOTE: CALLED AS SOON AS THE VIEWER IS RESOLVED
//************************************************************************
function onViewer(viewer) {
  console.log('onViewer',viewer);
} // end function
