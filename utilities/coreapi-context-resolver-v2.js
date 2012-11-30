(function(){
    osapi = osapi || {};
    osapi.jive = osapi.jive || {};
    osapi.jive.core = osapi.jive.core || {};
    var loaders;

    function resolveImpl(context, callback, version, calledMethodName) {
        // Step 1 -- Resolve the passed context. Queue what needs to be fetched.
        var ctx = [];
        if (context && !(context.type && context.id)) {
            if (context.jive) {
                context = context.jive;
            }
            if (context.content) {
                context = context.content;
            }
        }
        function queueContextFetch(key, context) {
            if (typeof(context) === "object" && context.type && context.id != null) {
                if (context.id) {
                    ctx.push({ key:key, type:context.type, id:context.id });
                }
                return true;
            }
            return false;
        }
        if (queueContextFetch("content", context)) {
            queueContextFetch("parent", context.parent);
            queueContextFetch("inReplyTo", context.inReplyTo);
        }
        if (ctx.length == 0) {
            throw "Invalid context passed to " + calledMethodName + ": " + context;
        }

        // Step 2 -- Build a batch request to fetch the queued contexts.
        var batch = osapi.newBatch();
        var batchKeys = [];
        var batchAdd = function(key) {
            batchKeys.push(key);
            return batch.add.apply(batch, arguments);
        };
        for (var i = 0; i < ctx.length; i++) {
            var c = ctx[i];
            var loadFn = findLoader(c.type);
            loadFn(c.type, c.id, c.key, { add: batchAdd });
        }

        // Step 3 -- Call the server, marshal the data, and pass it to the callback.
        if (batchKeys.length == 0) {
            window.setTimeout(function() {
                var api = "Core " + version + " API";
                var msg = "Context data types are either not supported by the " + api +
                          " or the " + api + " is not available.";
                callback({ error: msg });
            }, 1);
        } else {
            batchKeys.sort();
            batch.execute(callback);
        }
    }
    function getLoader(staticClass, typeId) {
        return function(type, id, key, batch) {
            if (staticClass && typeof(staticClass.get) === "function") {
                var filter = typeId == null ? byID(id) : byTypeAndId(typeId, id);
                batch.add(key, staticClass.get(filter));
            }
        };
    }
    function byTypeAndId(type, id) {
        return { entityDescriptor: type + ',' + id }
    }
    function byID(id) {
        return { id: id }
    }
    function findLoader(type) {
        if (!loaders) {
            // loaders for the various data types
            loaders = {
                "osapi.jive.core.Document": getLoader(osapi.jive.core.documents),
                "osapi.jive.core.Comment": getLoader(osapi.jive.core.comments),
                "osapi.jive.core.Discussion": getLoader(osapi.jive.core.discussions),
                "osapi.jive.core.Message": getLoader(osapi.jive.core.messages),
                "osapi.jive.core.Post": getLoader(osapi.jive.core.posts),
                "osapi.jive.core.Update": getLoader(osapi.jive.core.updates),
                "osapi.jive.core.DirectMessage": getLoader(osapi.jive.core.dms),
                "osapi.jive.core.Space": getLoader(osapi.jive.core.spaces),
                "osapi.jive.core.Group": getLoader(osapi.jive.core.groups),
                "osapi.jive.core.Project": getLoader(osapi.jive.core.projects),
                "osapi.jive.core.User": getLoader(osapi.jive.core.users),
                "osapi.jive.core.Attachment": getLoader(osapi.jive.core.attachments),
                "osapi.jive.core.Mention": getLoader(osapi.jive.core.mentions),
                "osapi.jive.core.Share": getLoader(osapi.jive.core.shares),
                "*": function(){} // other types are not supported
            };
        }
        return (loaders[type] || loaders["*"]);
    }

    osapi.jive.core.resolveContext = function(context, callback) {
        resolveImpl(context, callback, "v2", "osapi.jive.core.resolveContext");
    };
})();
