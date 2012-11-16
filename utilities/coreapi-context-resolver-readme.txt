This utility provides a simple and convenient way to convert a Jive context
available to app actions, !app invocations, or embedded experiences.

Two versions are provided to support version 2 and 3 of the Jive Core API.
Please select the appropriate one. If should be noted that equivalent
functionality will soon be added to the Core v3 API, so this may be considered
a stop-gap or shim until that feature is released.



The Jive Context Object
=======================

The context object provided to app action handlers and embedded experiences
provides information about the content object the user is interacting with. A
typical context object looks like this:

    {
        jive: {
            content: {
                id: 1234,
                type: "osapi.jive.core.Document"
            }
        }
    }

A more complex example, that might appear if a user !App in a comment:

    {
        jive: {
            content: {
                id: 0,
                type: "osapi.jive.core.Comment",
                inReplyTo: {
                    id: 5678,
                    type: "osapi.jive.core.Comment"
                },
                parent: {
                    id: 1234,
                    type: "osapi.jive.core.Document"
                }
            },
            rte: {
                htmlBody: "<p>Creating a comment</p>"
            }
        }
    }

See the Jive Community for more information:
    https://community.jivesoftware.com/docs/DOC-68012



Using This Utility
==================

To obtain the Core API object that represents the relevant context object, call
the version appropriate resolveContext() function:

    Core v2 API:   osapi.jive.core.resolveContext(context, callback);
    Core v3 API:   osapi.jive.corev3.resolveContext(context, callback);

The data objects passed to the callback function are complete JavaScript
objects and contain all the same functionality you expect from the regular
JavaScript APIs.



Supported Data Types
====================

Not all Jive data types are supported with this extension! You should always
check for errors in your callback function, and fail as gracefully as possible
if there was a problem handling the context or loading objects.

There is much better support for various data types in Core v3, so if you are
currently using Core v2 and haven't considered converting your app to use Core
v3, now is the time to start thinking about it.

For a list of Core v2 supported types:
    http://docs.jivesoftware.com/apireferences/latest/javascriptapi/index.html

For a list of Core v3 supported types, see the Core v3 documentation:
    https://developers.jivesoftware.com/api/js/



Response Data Format
====================

These function take a callback function that is passed a single data parameter.
This data parameter will contain 1, 2, or 3 properties, or an error message.

In the Core v2 API:

    {
        "content": {
            "data": {
                type: "...",
                resources: {...},
                ...
            }
        }
    }

In the Core v2 API:

    {
        "content": {
            type: "...",
            resources: {...},
            ...
        }
    }

A more complex result in the Core v3 API might be:

    {
        "content": {
            type: "...",
            resources: {...},
            ...
        },
        "parent": {
            type: "...",
            resources: {...},
            ...
        },
        "inReplyTo": {
            type: "...",
            resources: {...},
            ...
        }
    }

If there is an error parsing the context:

    {
        "error": "Some explanation of what went wrong reading the context"
    }

If there is a server side error:

    {
        "content": {
            "error": {
                "code": 4021,
                "message": "Could not load object with type 102 and ID 1234"
            }
        },
        "parent:" {
            "error": {...}
        }
    }
