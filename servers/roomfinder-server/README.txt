ROOM FINDER SERVER

This application is a standalone Java web application that can be deployed in
a local Tomcat (or other servlet container) instance.  It provides an example
implementation of the back end services for the "Room Finder" Jive app.

The application uses Microsoft Exchange web services, and has been tested with
Exchange 2010 SP2.

To configure the application edit these files:
- application.properties   For Exchange web service and Jive instance URLs
- rooms.json   For conference room metadata

To build the application war file run "ant war"
