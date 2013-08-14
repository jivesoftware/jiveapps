Welcome to the new and improved version of the props app!

##What's changed in props app?##
--------------------------------
- Added: Integration with Bunchball Gamification
- Added: Ability for community administrators to create, modify, and delete prop types
- Moved the props backend to a server hosted by Jive, with a postgreSQL database instead of Amazon SimpleDB.
- Fixed an issue where users were unable to give props when using Internet Explorer.

##Running Your Own Version of Props App##
-----------------------------------------

###Setup and Configuration###

###Server###
- Edit lib/util.js in props-server to point to your database and your server.
- In your database, run dbsetup.sql
    - If using heroku: cat dbsetup.sql | heroku pg:psql

####Bunchball####
- Please contact jive-dev [at] jivesoftware.com or post in community.jivesoftware.com to get the bunchball gamification library for props app
- If you want to use Bunchball Gamification: edit lib/bunchball.js with:
    - your Bunchball JSON API's base URL
    - your Bunchball API Sey
    - your Bunchball API Secret.

- If you don't, comment out the indicated lines in web.coffee (see line 295).

###Client###
- Edit js/init.js in props-app to point to your server. (This should match with the server address on the server side).

###Running###
0.  Set up a postgres database with the schema described below. If you're going to be using heroku to run the app, heroku's postgres add-on is a good option.
1.  Deploy props-server to heroku (git push heroku ...)
2.  Check that your server is running:
    curl http://[YOUR_PROPS_SERVER]/manage/ping
    ... and connected to the DB:
    curl http://[YOUR_PROPS_SERVER]/manage/health/check
    curl http://[YOUR_PROPS_SERVER]/manage/health/connectivity
    More info about these endpoints is below.
3.  Run grunt in props-app after configuring it as indicated above
4.  Configure a Jive App in your instance: https://community.jivesoftware.com/docs/DOC-65551
    Note: You may want to change the title of the Jive app in app.xml
5.  Get the app-id, key and secret for your Jive App
6.  Run this to register your app with your server:
    curl -H "Content-Type: application/json" -X PUT -i http://[YOUR_PROPS_SERVER]/keys/[YOUR_APP_ID] --data '{ "key": "[YOUR_API_KEY]", "secret": "[YOUR_API_SECRET]", "gateway": "[YOUR_GATEWAY]", "description": "[APP_NAME]" }'
7.  Check that your keys have been registered:
    curl -X GET http://[YOUR_PROPS_SERVER]/keys
    ... and that the app is ready to use:
    curl http://[YOUR_PROPS_SERVER]/manage/health/metrics
        There should be at least one Jive instance registered, and at least 8 prop types.
8.  Deploy props-app in your instance (git push jiveapps ...)
9.  Profit!

##Postgres DB Structure##
-------------------------

1.  Jive Instances: 1 column
    - jiveinstanceid primary key:  varchar(50)

2.  Prop Types: 6 columns: primary key ID (integer, hash of instanceID and title), text title, text definition, integer level,
    - ID (primary key): integer, hash of instanceID and title
    - title: text
    - definition: text
    - level: integer (level required to give)
    - jiveinstanceid (foreign key, references Jive Instances table): varchar(50)
    - image: bytea (the actual prop image)
    - image_url: text (link to prop image)

3.  Linked Content: stores information about content linked to by embedded props.
    - content_id (primary key):	varchar(50)
    - content_type:	text
    - content_link:	text
    - content_title: text
    - jiveinstanceid (foreign key, references Jive Instances table): varchar(50)

4.  Props Table: stores given props
    - id (primary key):	varchar(50)
    - user_id not null:	integer
    - giver_id not null:	integer
    - prop_type (foreign key, references Prop Types table) not null:	integer
    - message not null:	text
    - stream_entry_url:	text
    - orig_id:	varchar(50)
    - jiveinstanceid (foreign key, references Jive Instances table) not null: varchar(50)
    - created_at not null:	timestamp
    - content_id (foreign key, can be null): varchar(50)

##New Endpoints##
-----------------
- GET /props/types: get prop types for the calling instance
    - request should include prop level as a query parameter.
    - To get all prop types, set the query parameter level to 1000
- GET /props/types/reset: reset prop types for the calling instance to defaults.
- GET /props/types/remove: remove the specified prop type from the calling instance.
    - the prop type id to remove should be passed as a query parameter.
- POST /props/types: create a new prop type
    - necessary fields in the POST body are: body.title, body.definition, body.image_url and body.level
- GET /manage/ping: returns 200 OK.
- GET /manage/version: returns the version of props app (1.1.0)
- GET /manage/health/check: checks that the DB exists
- GET /manage/health/connectivity: basic sanity check that connects to the DB and ensures there exist tables with the proper names and column names. If it fails, check heroku logs for details. Also take a look at lib/dbhealth_postgres.js
- GET /manage/health/metrics: provides basic metrics for props app.

##Requirements to run##
-----------------------
- node.js
- imagemagick: used to process images. Images are downloaded and stored in the database, after being resized by imagemagick to 128x128.
Note: These requirements are taken care of if your app is run on heroku. Props app uses a heroku buildpack with all dependencies included.