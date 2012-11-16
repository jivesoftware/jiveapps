# Jive Location Demo

## Using the App
To load this app in your Jive environment, follow these steps:

1. Clone this app.
2. Host the app content on a public-facing web server. 
3. Instantiate the [Dev Console](https://developers.jivesoftware.com/community/docs/DOC-1513) on your dashboard. 
4. From the Dev Console, Click 'Add App', provide the URL to the app.xml from your public-facing web server, check 'Install this app on my dashboard', click 'Add'. 
5. The app is now on your dashboard. Click 'Configure App' and grant the app permission to load on your dashboard. 
6. Enjoy.


## About this Application
The Location Demo app demonstrates many of the core concepts available for most Jive applications. The app retrieves the list of the user's connections from the Jive platform, then retrieves details about each connection's location (time/weather). 
The Location app provides examples of retrieving content from the platform (user's connections), retrieving content from an external RESTful API (location details), posting an update to the activity stream or update the user's status, and instantiating the app using App Mention. 

Key features of the Jive framework implemented by this app are outlined below. 

Retrieving user's connections
* [osapi.jive.core.users.get()](http://docs.jivesoftware.com/apireferences/5.0.2/javascriptapi/osapi.jive.core.User.html#method_activities.get)
* peopleSearchHandler()

Retreiving content from RESTful API
* [osapi.http.get()](http://docs.opensocial.org/display/OSD/Osapi.http+%28v0.9%29#Osapi.http%28v0.9%29-osapi.http.get)
* [gadgets.io.makeRequest()](https://developers.google.com/gadgets/docs/reference/#gadgets.io.makeRequest)
* locationSearchHandler(location)
* locationSearchCallback(data)

Posting status update
* [osapi.jive.core.updates.create()](https://developers.jivesoftware.com/community/docs/DOC-1117)

Posting to activity stream
* [Overview](https://developers.jivesoftware.com/community/docs/DOC-1431)
* [osapi.activities.create()](http://opensocial-resources.googlecode.com/svn/spec/1.0/Social-Gadget.xml#osapi.activities.create)

Mini Message
* [gadgets.MiniMessage()](https://developers.google.com/gadgets/docs/reference/#gadgets.MiniMessage)

User Preferences
* [Overview](https://developers.google.com/gadgets/docs/xml_reference#Userprefs_Ref)
* app.xml

Data Pipelining
* [opensocial.data.getDataContext](http://opensocial-resources.googlecode.com/svn/spec/0.9/OpenSocial-Data-Pipelining.xml#rfc.section.11)
* &lt;osd:HttpRequest key="KEY" href="URL"/&gt;

App Mention listener
* [gadgets.util.registerOnLoadHandler()](https://developers.google.com/gadgets/docs/reference/#gadgets.util.registerOnLoadHandler)


## About the API
The API that powers this application combines services from Yahoo Placefinder and Weather Underground. 
Yahoo was selected over Google's API because Yahoo does not place restrictions on how the search results are used.

* [Yahoo Placefinder API](http://developer.yahoo.com/geo/placefinder/)
* [Weather Underground API](http://www.wunderground.com/weather/api/)

The API uses the free service tier from Wunderground, which restricts the number of requests that can be performed per minute/hour/day. 
__Please be kind and avoid using the API outside the appliction__. 

### Attributes of a good RESTful API
The following features should be considered for your RESTful services. 
* JSON, JSON_P
* [CORS](http://enable-cors.org/)
* OAUTH
* Correct use of GET/POST/PUT/DELETE

## Third-Party Libraries
A few additional libraries, beyond jQuery, were used in this app. 

### [MomentJS](http://momentjs.com/)
A lightweight library for parsing and manipulating date objects. Useful in this app when applying timezone offsets for each location. 

### [Mustache](http://mustache.github.com/)
A logic-less templating engine that combines JSON with a template to produce anything you like. Can be use on both the client and on the server. 

If you like Mustache, but want the benefit of logic (if/then, for loops, etc) in your templates, check out [HandlebarsJS](http://handlebarsjs.com/).


## Learn More
Get Involved in the Jive Developer Community
* https://community.jivesoftware.com/community/developer/

The 'Hello World' Example
* https://community.jivesoftware.com/docs/DOC-67828

Using the Dev Console
* https://community.jivesoftware.com/docs/DOC-65860

Integrating App Mentions (!App) into a Jive app
* https://community.jivesoftware.com/docs/DOC-68013
* https://community.jivesoftware.com/docs/DOC-66636
* https://community.jivesoftware.com/docs/DOC-66635

Data Pipelining
* http://opensocial-resources.googlecode.com/svn/spec/trunk/Core-Gadget.xml#DataPipelining
* http://opensocial-resources.googlecode.com/svn/spec/trunk/Core-Gadget.xml#DataPipelining-ProxiedContent

Accessing data via Jive Connects API
* https://community.jivesoftware.com/docs/DOC-65829
* https://community.jivesoftware.com/docs/DOC-65892
