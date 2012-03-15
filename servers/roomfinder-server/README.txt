ROOM FINDER SERVER

This application is a standalone Java web application that can be deployed in
a local Tomcat (or other servlet container) instance.  It provides an example
implementation of the back end services for the "Room Finder" Jive app.

The application uses Microsoft Exchange web services, and has been tested with
Exchange 2010 SP2. There are two servlets:
- RoomFinderServlet in url "/room-finder" services GET and POST requests which 
  get room availability info and handle room booking. It expects a username and password 
  according to Http Basic authentication, and forwards these credentials to Exchange
  web services to authenticate requests.
- LocationServlet in url "/locations" services GET requests to get room location
  metadata. No authentication is required for this endpoint.

You will find all jar dependencies included in the repository. The "EWSAPI-1.1.5-Jive.jar"
is a modified version of Exchange web services Java API (http://archive.msdn.microsoft.com/ewsjavaapi).
The original version of that API will work if you run your server in UTC timezone, but
our modified version fixes these timezone handling bugs in EwsServiceXmlReader,
ExchangeServiceBase and EwsUtilities classes to allow any timezone.

To configure the application edit these files:
- application.properties   Exchange web service and Jive instance URLs
- rooms.json               Conference room metadata
- locations.json           Location metadata

To build the application war file run "ant war" and the deploy according to your
servlet container instructions.

To use this server from the Room Finder app, you need to configure a Jive Connects 
service in your Jive instance. Log in as administrator and go to Admin Console, System,
Settings, App Services page. Add a new service with the following parameters:
- Authentication: Basic (could be different if you modified the server code)
- Tags: jive:service://jivesoftware.com/it/roomfinder?version=1
- URI: https://yourserver.com/RoomFinderService

This service definition is available for app users to choose when they configure
the app during installation.