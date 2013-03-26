QUOTES SERVER

(1) Background

This application is a standalone Java web application that can be deployed in
a local Tomcat (or other servlet container) instance.  It provides the back
end services for the "Quotes Approval" demo application for the Jive
Application Framework.

For easy installation, the application is designed to require minimal
configuration and preparation.  As such, it implements an in memory
"database" whose content is not persisted.  Instead, it is reset each
time the web application is started.

(2) Installing and Configuring Tomcat

(2.1) Install Apache Tomcat (version 6.0.x)

Acquire a recent binary distribution of Apache Tomcat (version 6.0.x) at:

    http://tomcat.apache.org

and install it according to the instructions on the Tomcat web site.  For
the rest of this document, replace "{tomcatHome}" with the absolute path to
the directory in which you installed Tomcat.

(2.2) Configure Service Port

Although the Quotes Server application imposes no restrictions on what port
it runs on, these instructions assume that you will be running a separate
Tomcat instance in addition to the one normally used for development (which
is typically configured to run on port 8080).  Therefore, we will adjust
the new Tomcat instance to run on port 9080 instead.

To accomplish this, edit file "{tomcatHome}/conf/server.xml" and make the
following changes:

- Change every occurrence of "8080" to "9080".

- Change every occurrence of "8005" to "9005".

These changes will ensure that the new Tomcat instance will not conflict
with any servlet container that is running on port 8080 on your system.

(2.3) Configure Roles and Authentication Credentials

The demo server expects to be using HTTP Basic authentication, allowing
any user that has been granted the role "basic" to access the web services.
Details of how this is accomplished depend upon the "realm" implementation
you have selected.  For the purposes of this document, we will assume that
you are using Tomcat's default implementation, which consults an XML file
named "{tomcatHome}/conf/tomcat-users.xml".  To set up users using some
other realm configuration, consult the Tomcat documentation at:

    http://tomcat.apache.org/tomcat-6.00-doc/realm-howto.html

We need to edit the "{tomcatHome}/conf/tomcat-users.xml" file and add
the following information:

- A role named "basic".

- One or more users (with associated passwords) that are granted this role.

An example tomcat-users.xml file that defines a user named "myusername"
(with password "mypassword") that possesses the correct role would look
something like this:

    <tomcat-users>
      <role rolename="basic"/>
      <user username="myusername" password="mypassword" roles="basic"/>
    </tomcat-users>

The credentials specified here correspond to the credentials that a user
of the quotes service must specify on every request to the back end service.

(2.4) Start Tomcat

Now that Tomcat has been configured, it can be started.  The simplest way
to do this is use the "startup.sh" (Unix) or "startup.bat" (Windows) script
in the "{tomcatHome}/bin" directory.

(3) Install and Configure Quotes Server Application

(3.1) Acquire and Install Maven

The build process for the server application requires Maven version 2.2
or later, which can be acquired from:

    http://maven.apache.org

Follow the instructions on the Maven website to download and install Maven.

(3.2) Acquire and Compile Quotes Server Source Code

Acquire a bundle containing the source code for the Quotes Server application
(and other Jive Application Framework demos and examples) from TBD.

To build the server, open a shell window and navigate to the
"apps/server/QuotesServer" subdirectory.  Then, issue the command
"mvn clean package".  This will accomplish the following:

- Download dependencies from public Maven repositories (if not already
  downloaded).

- Compile the source code for the Quotes Server application.

- Create a war file "target/QuotesServer.war" that can be deployed.

(3.3) Deploy the Quotes Server On Tomcat

The simplest way to deploy the server is to copy the "QuotesServer.war"
application produced by the previous step into your Tomcat server's
"webapps" directory ("{tomcatHome}/webapps").  This will cause Tomcat
to notice that a new application has been deployed, which will then be
started up.  Consult the Tomcat log file ("{tomcatHome}/logs/catalina.out")
to ensure that no error messages describing deployment problems have
occurred.

A simple way to verify correct operation of the server is to use the
"curl" command line tool (available on most Unix systems, as well as
being part of the Cygwin package on Windows).  An example command to
retrieve all customers from the server would look like this:

    curl --include --user myusername:mypassword \
         http://localhost:9080/QuotesServer/customers

If everything is installed and operating correctly, this command should
return a JSON document containing an array with nested elements for each
sample customer in the "database".

(4) Configure Jive Connects Service

The "Quotes Approval" demo application expects a Jive Connects service
with a tag "quotes" that points at this service.  To configure the service,
log on to your Jive instance as a Jive administrator, and navigate to the
System -> Settings -> App Services page.  Press the "New App Service" button,
and configure a service entry with the following values:

- Name: "Quotes Server"

- Authorization:  "basic"

- Description: "Quotes Server back end for the Quotes Approval demo."

- Tags: "jive:service://jivesoftware.com/demo/quotes?version=1"

- URI: "http://localhost:9080/QuotesServer" (or whever you have
  actually deployed this application)

(5) Configure Jive "Users" for Sales Representatives

The demo application assumes that two Jive usernames ("sales1" and
"sales2") represent sales reps associated with the quotes.  As Jive
admin, set up these two users in your Jive instance, and configure
the user profiles with interesting data.

The application will still work without these users set up, but the
pop-up profile displays will have no data to be shown.

(6) Install the Quotes Approval Demo Application

Log on to your Jive instance as a regular user (or as the administrator).
Navigate to the "Apps" page, and use a TBD process to install the demo
application.  As part of installation, you will be required to confirm
that the "Quotes Server" service will be using your credentials to access
the back end web service.

The first time you actually use the application, Jive will notice that you
have never entered credentials for this service, and will ask you for a
username and password.  The values entered here must match one of the users
that you configured in Tomcat with the "basic" role ("myusername" and
"mypassword" if you used the example shown above).  These credentials may,
but need not, match your credentials in Jive itself.  These credentials
will be stored in the credentials vault inside Jive, and will not be
available to the application itself.

Now, each time the Quotes Approval application makes a request to the back
end Quotes Server application, Jive Connects will "decorate" the request
with an appropriate HTTP Basic "Authorization" header based on your
credentials (for this service) from the Credentials Vault.
