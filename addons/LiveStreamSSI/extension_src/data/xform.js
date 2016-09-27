function transform(body, headers, options, callback)   {

/*
 * TO DO: Parse 'body' arg based on incoming event from 3rd party system.
 * TO DO: Replace the sample code below with your own transformation code.
 */

// Build activity object.
var activityInfo = { actor: {}, object:{}, jive: {} };

// Optional name of actor for this activity. Remove if n/a.
// activityInfo.actor.name = "Jane Doe";

// Optional email of actor for activity. Remove if n/a.
// activityInfo.actor.email = "janedoe@example.com";

// Optional URL for this activity. Remove if n/a.
activityInfo.object.url ="http://livestream.com/accounts/" + body.ownerAccountId + "/events/" + body.id;

// Required URL to the image for this activity.
activityInfo.object.image = body.logo.smallUrl;

// Required title of the activity.
activityInfo.object.title = body.fullName;

// Optional HTML description of activity. Remove if n/a.
activityInfo.object.description = body.description;

activityInfo.jive.app = {  
  'appUUID': "64404b68-73cb-4dc7-a774-dad72a34b878",  
  'view': "ext-object",  
  'context': {  
    'timestamp': new Date().getTime(),  
    'body': body,  
    'headers': headers,  
    'options': options
  }  
}  


/*
 * Call the callback function with our transformed activity information
 */

callback({ "activity" : activityInfo });

}