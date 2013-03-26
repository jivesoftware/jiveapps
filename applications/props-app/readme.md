Props App
=========

The Props App allows users to thank one another by awarding virtual goods. Users can give "props" up to three times a day, either via !props or the app canvas view. Each goodie has an image, name and optional message associated with it. Props publish to both the giver and receiver's activity streams.
 
Three props award types are available to users to give to others when they first create their Jive account. Users unlock more gifts to give as they earn more status points.
 
When a user launches the canvas view of an app, they'll see an option to give a prop on the left side of the screen, and in the main section the ability to see all props given to them as a trophy case. Props that have been received multiple times will get a badge that ranges from "2" to "99+". Clicking on a prop will display a details view on the right side of the screen that shows who gave a prop, when, and with what message. If a user earns a prop more 25+ time, the prop icon turns golden (e.g. standard Chuck Norris statue becomes Golden Chuck Norris statue).
 
It is possible to search and load the "trophy case for any other user", and to give the same prop to someone multiple times, but only once per day.

### Prop Types ###
Below are the various Props types available to a user for awarding to other users, as they ascend levels.

<table border="1" class="jiveBorder" style="border-image: initial; width: 100%; border-width: 1px; border-color: #000000; border-style: solid;">
<tbody>
<tr><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Short Name</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Image</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Potential Meaning</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Point Level</strong></th></tr>
<tr>
<td style="padding: 2px;">Beer</td>
<td style="padding: 2px;">Beer</td>
<td style="padding: 2px;">"I owe you a beer"</td>
<td style="padding: 2px;">Avail by default</td>
</tr>
<tr>
<td>Genius</td>
<td>Einstein or something similar</td>
<td>"You're a genius, or your solution was genius"</td>
<td>Avail by default</td>
</tr>
<tr>
<td style="padding: 2px;">Bug</td>
<td style="padding: 2px;">Crushed bug, fly swatter, see bug guts flying?</td>
<td style="padding: 2px;">"You squashed an important bug or issue"</td>
<td style="padding: 2px;">Avail by default</td>
</tr>
<tr>
<td>Thanks</td>
<td>Flowers</td>
<td>General thanks</td>
<td>Level 2</td>
</tr>
<tr>
<td style="padding: 2px;">Owl</td>
<td style="padding: 2px;">Owl</td>
<td style="padding: 2px;">"You worked super late / super hard"</td>
<td style="padding: 2px;">Level 2</td>
</tr>
<tr>
<td style="padding: 2px;">AmpedUp</td>
<td style="padding: 2px;">Amp turned to 11</td>
<td style="padding: 2px;">Did something amazing, beyond the normal limits</td>
<td style="padding: 2px;">Level 3</td>
</tr>
<tr>
<td style="padding: 2px;">ChuckNorris</td>
<td style="padding: 2px;">Chuck Norris doll</td>
<td style="padding: 2px;">For kicking ass</td>
<td style="padding: 2px;">Level 4</td>
</tr>
<tr>
<td style="padding: 2px;">HoneBadger</td>
<td style="padding: 2px;">Honey Badger, maybe mounted like you hunted and killed it?</td>
<td style="padding: 2px;">You're even more bad-ass than a honey-badger</td>
<td style="padding: 2px;">Level 5</td>
</tr>
</tbody>
</table>

<br>

### Architecture Summary ###
Jive Props is comprised of a nodejs server backend, and a Jive Apps frontend. The Jive App is installed on a Jive instance, and is primarily responsible for serving the user interface and for communicating with the backend.

Jive App
-----------

The Props Jive App a Backbone (http://backbonejs.org) app, which uses Underscore (http://underscorejs.org) and Boostrap (http://twitter.github.com/bootstrap) for templating. It interacts with the Props backend to surface props available for allocation, and which props have already been provided; and to interact with the Jive instance to target community members for Props.

To get started, create a Jive App based on the code described here, with your modifications, and make it available for installation in Jive instances using the normal channels. 

### Jive Instance Requirements ###
To use the Props Jive App, target Jive instances must have the following features enabled:

- jive-core-v3
- jive-opensocial-ext-v1
- opensocial-1.0
- opensocial-data
- osapi
- views

### Configuration and customizations ###

In your branch of the Jive App, you are free to make customizations specific to your business needs; please make sure that the appropriate changes to the backend are also made.

- In js/init.js, update <b>window.BACKEND_HOST</b> to point to your backend server (eg. https://your.props.appserver.com/).
- In app.xml and props.js, please replace <b>http://apphosting.jivesoftware.com/apps/dev/props</b> with the location of your copy of the Props Jive App codebase.

After any customizations and configuration changes, make sure to run the code minification step below.

### Code minification ###
For best performance, the App css and js assets are minified. We use Grunt (http://gruntjs.com) to compile included 3rd party vendor assets, as well as Jive App assets. If changes to any of these are made, you must run Grunt to incorporate the changes into the executable production code.

- Install npm and its dependencies
- Install Grunt and dependent modules
> npm install grunt
> npm grunt-contrib-concat -g
> npm install grunt-contrib-uglify -g
- Go to the App root where Grunfile.js lives, and run Grunt. This should create 3 files under dist, (vendor.js, props.js, and allmin.js).
>
> $ grunt
> Running "concat:vendor" (concat) task
> File "dist/vendor.js" created.
> 
> Running "concat:props" (concat) task
> File "dist/props.js" created.
> Running "uglify:dist" (uglify) task
> File "dist/all.min.js" created.

### REST API ###

The app makes the following REST style API calls for all of its operations to its back-end server. The API calls made to Jive, to lookup user names, post an action, etc. are not listed here.

All requests to back-end server are standard "signed" requests defined in opensocial/oauth specifications.

Each request includes the application id, Jive instance id &amp; user id on whose behalf the request is being made by the app.

It is the responsibility of the server to verify the authenticity of these requests.
The back-end can be replaced easily as long as it implements the functionality these API endpoints provide.

<table border="1" class="jiveBorder" height="1285" style="border: 1px solid #000000; width: 892px; height: 1246px;" jive-data-cell="{&quot;color&quot;:&quot;#575757&quot;,&quot;textAlign&quot;:&quot;left&quot;,&quot;padding&quot;:&quot;2&quot;,&quot;backgroundColor&quot;:&quot;transparent&quot;,&quot;fontFamily&quot;:&quot;arial,helvetica,sans-serif&quot;,&quot;verticalAlign&quot;:&quot;baseline&quot;}" jive-data-header="{&quot;color&quot;:&quot;#FFFFFF&quot;,&quot;backgroundColor&quot;:&quot;#6690BC&quot;,&quot;textAlign&quot;:&quot;center&quot;,&quot;padding&quot;:&quot;2&quot;}">
<tbody>
<tr><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px; width: 28%;" valign="middle"><strong>API</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Description</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Example</strong></th></tr>
<tr>
<td style="padding: 2px;"><code class="focusRow subFocusRow">GET /props/types?level</code><code class="focusRow subFocusRow">=1000</code></td>
<td style="padding: 2px;">
<p>Details about all props types for a user that has below 1000 points.</p>
<p></p>
<p>Various types of props can be made available for different point levels.</p>
</td>
<td style="padding: 2px;">
<p></p>
<p></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">[</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Genius",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0000",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "You're a genius!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/einstein.png">http://props.backend.com/img/prop_types/einstein.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/einstein.png">http://props.backend.com/img/prop_types/einstein.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "Genius"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Thank You",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0000",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "Thanks for all that you do!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/flowers.png">http://props.backend.com/img/prop_types/flowers.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/flowers.png">http://props.backend.com/img/prop_types/flowers.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "ThankYou"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Beer",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0025",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "I owe you a beer!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/beer.png">http://props.backend.com/img/prop_types/beer.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/beer.png">http://props.backend.com/img/prop_types/beer.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "Beer"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Crushed It",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0025",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "You squashed that bug dead!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/bug-crusher.png">http://props.backend.com/img/prop_types/bug-crusher.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/bug-crusher.png">http://props.backend.com/img/prop_types/bug-crusher.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "CrushedIt"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Night Owl",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0025",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "You worked super late! Thanks!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/owl.png">http://props.backend.com/img/prop_types/owl.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/owl.png">http://props.backend.com/img/prop_types/owl.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "NightOwl"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Turned It To 11",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0100",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "You did something amazing!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/amplifier.png">http://props.backend.com/img/prop_types/amplifier.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/amplifier.png">http://props.backend.com/img/prop_types/amplifier.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "TurnedItTo11"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Kick Ass",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "0500",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "You kick ass!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/chuck-norris.png">http://props.backend.com/img/prop_types/chuck-norris.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/chuck-norris.png">http://props.backend.com/img/prop_types/chuck-norris.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "KickAss"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }, {</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "title": "Honey Badger",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "level": "1000",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "definition": "You're even more bad-ass than a honey-badger!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/honey-badger.png">http://props.backend.com/img/prop_types/honey-badger.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/honey-badger.png">http://props.backend.com/img/prop_types/honey-badger.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "HoneyBadger"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">]</span></p>
</td>
</tr>
<tr>
<td style="padding: 2px;">
<p>POST</p>
<p><code class="focusRow subFocusRow">/props</code></p>
</td>
<td style="padding: 2px;">Saving a prop that was just given</td>
<td style="padding: 2px;">
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">Request:<br /></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">{</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "content_id": "",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "content_type": "",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "content_link": "",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "content_title": "",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "created_at": "2013-03-20T21:36:42.426Z",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>    "giver_avatar_url": "</span><a class="jive-link-external-small" href="http://jaf.jiveland.com:8080/api/core/v3/people/1/avatar">http://jaf.jiveland.com:8080/api/core/v3/people/1/avatar</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "giver_id": "1",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "giver_name": "Administrator",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>    "giver_profile_url": "</span><a class="jive-link-external-small" href="http://jaf.jiveland.com:8080/people/admin">http://jaf.jiveland.com:8080/people/admin</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "message": "Thanks for all that you do!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>    "prop_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/flowers.png">http://props.backend.com/img/prop_types/flowers.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "prop_title": "Thank You",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>    "user_avatar_url": "</span><a class="jive-link-external-small" href="http://company.jiveon.com/gadgets/proxy?container=default&amp;refresh=3600&amp;url=https://developers.jivesoftware.com/appsmarket/opensocial/applicationInstanceID/1c18e75e-9dfa-4e83-9e28-53180ae6696f/img/avatars/default.png">http://company.jiveon.com/gadgets/proxy?container=default&amp;refresh=3600&amp;url=https://developers.jivesoftware.com/appsmarket/opensocial/applicationInstanceID/1c18e75e-9dfa-4e83-9e28-53180ae6696f/img/avatars/default.png</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "user_name": " ",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>    "user_profile_url": "</span><a class="jive-link-external-small" href="http://company.jiveon.com/people">http://company.jiveon.com/people</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "stream_entry_url": "",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "user_id": "2015",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    "prop_type": "ThankYou",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>    "prop_reflection_image_url": "</span><a class="jive-link-external-small" href="http://props.backend.com/img/prop_types/flowers.png">http://props.backend.com/img/prop_types/flowers.png</a><span>"</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">}</span></p>
<p></p>
<p>Success Response:</p>
<p></p>
<p>{</p>
<p>    "message": "Thanks for all that you do!",</p>
<p>    "prop_type": "ThankYou",</p>
<p>    "giver_id": "1",</p>
<p>    "created_at": "2013-03-20T21:36:58.213Z",</p>
<p>    "user_id": "2015",</p>
<p>    "$ItemName": "3eadfdaf-3580-0091-ee19-66a44506c5e9"</p>
<p>}</p>
</td>
</tr>
<tr>
<td style="padding: 2px;">GET <code class="focusRow subFocusRow">/props/stream</code></td>
<td style="padding: 2px;">Stream list of props for display</td>
<td style="padding: 2px;">
<p>Response:</p>
<p></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">[{</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;"><span>        "stream_entry_url": "</span><a class="jive-link-external-small" href="http://company.jiveon.com/streamentry/1013">http://company.jiveon.com/streamentry/1013</a><span>",</span></span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "prop_type": "ThankYou",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "message": "Thanks for all that you do!",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "giver_id": "1",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "created_at": "2013-03-20T21:36:59.776Z",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "user_id": "2015",</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">        "$ItemName": "3eadfdaf-3580-0091-ee19-66a44506c5e9"</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">    }</span></p>
<p><span style="font-family: 'courier new', courier; font-size: 8pt;">]</span></p>
</td>
</tr>
<tr>
<td style="padding: 2px;">
<p>GET</p>
<p><code class="focusRow subFocusRow">/props?user_id=123</code></p>
</td>
<td style="padding: 2px;">Get Props given to the particular user with user id 123</td>
<td style="padding: 2px;">an array same as above.</td>
</tr>
</tbody>
</table>

<br>

Backend Server
--------------
The Props app backend is a nodejs application which is typically hosted as a Heroku app in Amazon Web Service (AWS), with a SimpleDB storage backend. It is responsible for providing  the REST API called by the Jive App front end, and for persistence.

### Storage Data Model ###
SimpleDB allows the following simple hierarchy for storage:

<table border="1" class="jiveBorder" style="border-image: initial; width: 100%; border-width: 1px; border-color: #000000; border-style: solid;">
<tbody>
<tr><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Parent</strong></th><th style="text-align: center; background-color: #6690bc; color: #ffffff; padding: 2px;" valign="middle"><strong>Child</strong></th></tr>
<tr>
<td style="padding: 2px;">One or more Domains</td>
<td style="padding: 2px;">One or more Items</td>
</tr>
<tr>
<td style="padding: 2px;">Item</td>
<td style="padding: 2px;">One or more Attributes</td>
</tr>
<tr>
<td style="padding: 2px;">Attribute</td>
<td style="padding: 2px;">One or more name value pairs</td>
</tr>
</tbody>
</table>

<br>

### Data Model ###

The Amazon Web Service (AWS) SimpleDB is used for backend data storage for the Props app. Here are the data structure that SimpleDB is using:

- User Account : Represents the entire data in the AWS SimpleDB account
- Domains : Domains represent similar data and similar to tables concept. You can execute queries against a domain, but cannot execute queries across different domains.
- Items : Items represent individual objects that contain one or more attribute name value pairs.
- Attributes : Attributes represent categories of data that can be assigned to items. Think of it like columns in database table rows.
- Values : Values represent instances of attributes for items. An attribute can have multiple values.

This link shows limitation of SimpleDB storage: http://docs.amazonwebservices.com/AmazonSimpleDB/latest/DeveloperGuide/SDBLimits.html

### Domains ###
Here are the domains needed for the Props app:

- DefaultProps: This domain will store the default props that can be given by user. The idea is that we could support extension for Jive instance specific DefaultProps domain that could override the default image and attributes or even add new kind of props.
- UserProps_&lt;Jive ID&gt;: The domains will store the props that are given to a user in a particular jive instance. So the name of the items in each of this domain will guaranteed unique within a jive instance. Each item will represent an action of prop giving to a user. We use SimpleDB count (http://docs.amazonwebservices.com/AmazonSimpleDB/latest/DeveloperGuide/CountingDataSelect.html) query to get the count for how many props a user have been given.
- User_&lt;Jive ID&gt;: The domains will store user info needed for each Jive instance.
- JiveInstance_&lt;JIve ID&gt;: These domains will store info for each Jive instance connected to the props backend.

### Attributes for Items in the Domains ###
####DefaultProps####

Name : Represents the short name used to uniquely identify each prop.
The items in DefaultProps domain could have these attributes:

- Image URL: Represents the image URL for a prop
- Definition: Represents the description or meaning of the prop. (TODO: do we need to support i18n for the description?)
- PointLevel: Represents the minimum point level needed for a user to give the prop.

#### UserProps_&lt;Jive ID&gt; ####
Similar to suggestion from https://forums.aws.amazon.com/thread.jspa?threadID=32405 we will take hash of target user id + timestamp + giver user id + prop short name.&rdquo; to generate unique name for each item name.

The items in UserProps_&lt;Jive ID&gt; domain could have these attributes:

- TargetUserID: represents the per jive instance unique user ID that is going to be given a prop.
- GiverUserID: represents the per jive instance unique user ID that is giving the prop.
- Timestamp: represents the timestamp when the prop giving occur in the Prop app backend server.
- PropName: the prop given based on short name
- Message: text message sent with the prop given
- Context: context info related with the prop.

#### User_&lt;Jive ID&gt; ####
Name: user id per Jive instance

The items in User_&lt;Jive ID&gt; domain could have these attributes:

- Level: Represent the current level each user to let what trophies can be given to him/her.
 
#### JiveInstance_&lt;Jive ID&gt; ####
Name: unique id per Jive instance

The items in JiveInstance_&lt;Jive_ID&gt; could have these attributes:

- PropName: the prop has been given in this community

### Security ###

- The oauth keys and Amazon SimpleDB access keys are stored in the node.js code.
- All collaborators have access to information stored in database.
- https is not used for communication to props app server.
- Although calls to gateway from Jive servers are protected by oauth signature the data is sent un-encrypted.
- aws-lib makes signed requests (not oauth) SimpleDB server. SimpleDB server calls are web-based and secured (https requests).

# License #
Copyright 2013 Jive Software

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

