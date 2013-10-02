VIDYO CALL SERVER

This application is a standalone Java web application that can be deployed in
a Tomcat (or other servlet container) instance.  It provides an example
implementation of the back end services for the "Vidyo Call" Jive app.

The application uses Vidyo SOAP/XML web services and provides a REST style web 
service API with JSON content to query Vidyo user status and start conference calls. 
It uses JAX-RS/Jersey to implement the web services.

To configure and build the application follow these steps 
- edit application.properties 
- generate Vidyo web service client classes from WSDL into src/com/vidyo/admin and src/com/vidyo/user
- run "ant war" 
- deploy according to your servlet container instructions

To use this server from the Vidyo Call app, you need to configure a Jive Connects 
service in your Jive instance. Log in as administrator and go to Admin Console, System,
Settings, App Services page. Add a new service with the following parameters:
- Authentication: Basic
- Tags: jive:service://jivesoftware.com/it/vidyo?version=1
- URI: https://yourserver.com/VidyoService/resources
