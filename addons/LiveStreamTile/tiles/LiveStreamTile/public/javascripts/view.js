/****************************************************
* This file should load BEFORE main.js, since main.js calls the onReady, onContainer and onViewer methods
* Note:  This implmentation has been provided for convenience, developers are not required to use this pattern.
*
* SEE: Tile API & Development FAQ - https://community.jivesoftware.com/docs/DOC-185776
****************************************************/


//LiveStream options
const lsWidth = 300,
      lsHeight = 169,
      fetchNewCommentTimer = 3000,
      numberOfComments = 3;

var lastComments = [];

//************************************************************************
//NOTE: CALLED AS SOON AS THE FULL CONTEXT IS RESOLVED
//************************************************************************
function onReady(tileConfig,tileOptions,viewer,container) {
  if ( typeof tileConfig !== 'object' ) {
      tileConfig = JSON.parse(tileConfig || {} );
  }

  if(tileConfig.embed_id && tileConfig.account_id && tileConfig.event_id){
    let the_HTML = `<iframe id="ls_embed_ ${tileConfig.embed_id}" src="//livestream.com/accounts/${tileConfig.account_id}/events/${tileConfig.event_id}/player?width=${lsWidth}&height=${lsHeight}&enableInfoAndActivity=false&autoPlay=true&mute=false" width="${lsWidth}" height="${lsHeight}" frameborder="0" scrolling="no" allowfullscreen> </iframe>`
    $('#the_video').html(the_HTML);
  } else{
    $('#the_video').text("There was an error getting the video");
  }
  delayedLoop(tileConfig), fetchNewCommentTimer;
} // end function

//************************************************************************
// Iterative promise loop for comments to be fetched and displayed
// Only works if there's an activity stream objec from the LiveStream SSI
//************************************************************************
function delayedLoop(config){
  setTimeout(()=>{
    fetchComments(config)
    .then((val) =>{
      return processComments(val);
    })
    .then((value) =>{
      if(arraysEqual(value, lastComments)){
        throw "No new comments";
      } else{
        lastComments = value;
        displayComments(value);
      }
    })
    .catch((err) =>{
      console.log(err);
    });
  delayedLoop(config);
  }, fetchNewCommentTimer);
};


//************************************************************************
// Displays the comments array
//************************************************************************
function displayComments(comments){
  if(comments.length !== 0){
    $('#comments').html("");
    for(let i=0; i < comments.length && i < numberOfComments; i++){
      comment = comments[i].text.substring(0,40) + "... &rsaquo;";       // Truncating to 40 characters of the comment

      let url = `${comments[i].parentUrl}#comments-${comments[i].id}`
      $('#comments').hide().append(`<div><a href="${url}">${comment}</a></div>`).slideDown('slow');
    }
    gadgets.window.adjustHeight(230 + 20 * comments.length);  // Height of the window as more comments are added. Needs fine tuning/
  } else{
    throw new Error('No comments');
  }
}

//************************************************************************
// Check to see if currently displayed comments list is equal to new fetch
// The object's in the array's should have same keys
//************************************************************************
function arraysEqual(arr1, arr2) {
  if(arr1.length !== arr2.length)
      return false;
  for(let i=0; i < arr1.length; i++){
    var obj1 = Object.keys(arr1[i]); // Keys for both should be the same
    obj1.forEach((keys) =>{
      if(arr1[i][keys] !== arr2[i][keys])
        return false;
    })
  }
  return true;
}

//************************************************************************
// Comments are filtered through this function and stripped of unwanted
// parts.
// Returns a array containing object(s)
//************************************************************************
function processComments(list){
  var comments = [];
  list.forEach((value, index) =>{
    comment = value.content.text.split('<div class="jive-rendered-content"><p>').pop();
    comment = comment.substring(0,comment.indexOf('</p></div><!'));
    comments.push({
      'id' : value.id,
      'text' : comment,
      'parentUrl' : value.parentContent.html
    });
  });
  return comments;
}

//************************************************************************
// Gets comments from Jive external activity stream object if it exists
// resolves async http response
//************************************************************************
function fetchComments(tileConfig){
  return new Promise((resolve, reject) =>{
    if(!tileConfig.activities){
      reject("No activities generated");
    }
    tileConfig.activities.forEach((val,index) =>{
      if(val.event_id === val.event_id){
        let url = val.activity.resources.self.ref.split("/v3").pop() + "/comments";
        osapi.jive.core.get({  
          v : "v3",  
          href : url,  
          }).execute(function(response) {
            if(response.error || response.list.length === 0){
              reject(response.error || "No comments");
            }
            resolve(response.list);
          });  
      }
    })
  });
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
