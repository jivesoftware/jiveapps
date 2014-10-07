if (typeof (osapi &&
            osapi.jive &&
            osapi.jive.corev3 &&
            osapi.jive.corev3.resolveContext) === "undefined") (function(){
    osapi = osapi || {};
    osapi.jive = osapi.jive || {};
    osapi.jive.corev3 = osapi.jive.corev3 || {};
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
            batch.execute(function(data) {
                for (var i = 0, l = batchKeys.length; i < l; i++) {
                    var key = batchKeys[i];
                    var match = /^(\w+)\.([a-z])$/.exec(key);
                    if (match) {
                        var out = match[1];
                        if (!data[out] || (data[out].error && !data[key].error)) {
                            data[out] = data[key];
                        }
                        delete data[key];
                        key = out;
                    }
                    var value = data[key];
                    if (value) {
                        if (value.list && value.list.length && !value.type) {
                            value = value.list[0];
                        }
                        data[key] = value;
                    }
                }
                callback.apply(this, arguments);
            });
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
                "osapi.jive.core.Document": getLoader(osapi.jive.corev3.contents, 102),
                "osapi.jive.core.Comment": getLoader(osapi.jive.corev3.contents, 105),
                "osapi.jive.core.Discussion": getLoader(osapi.jive.corev3.contents, 1),
                "osapi.jive.core.Message": getLoader(osapi.jive.corev3.contents, 2),
                "osapi.jive.core.Post": getLoader(osapi.jive.corev3.contents, 38),
                "osapi.jive.core.Update": getLoader(osapi.jive.corev3.contents, 1464927464),
                "osapi.jive.core.TileStreamEntry": getLoader(osapi.jive.corev3.contents, -960826044),
                "osapi.jive.core.DirectMessage": getLoader(osapi.jive.corev3.dms),
                "osapi.jive.core.Space": getLoader(osapi.jive.corev3.places, 14),
                "osapi.jive.core.Group": getLoader(osapi.jive.corev3.places, 700),
                "osapi.jive.core.Project": getLoader(osapi.jive.corev3.places, 600),
                "osapi.jive.core.User": getLoader(osapi.jive.corev3.people),
                "osapi.jive.core.Attachment": getLoader(osapi.jive.corev3.attachments),
                "osapi.jive.core.Mention": getLoader(osapi.jive.corev3.mentions),
                "osapi.jive.core.Share": getLoader(osapi.jive.corev3.shares),
                "*": function (type, id, key, batch) { // the Unknown type
                    var match = /osapi\.jive\.core\.Unknown\[(-?\d+)]/.exec(type);
                    var objectType = match && match[1];
                    if (objectType) {
                        var filter = byTypeAndId(objectType, id);
                        batch.add(key + ".a", osapi.jive.corev3.contents.get(filter));
                        batch.add(key + ".b", osapi.jive.corev3.places.get(filter));
                    }
                }
            };
        }
        return (loaders[type] || loaders["*"]);
    }

    osapi.jive.corev3.resolveContext = function(context, callback) {
        resolveImpl(context, callback, "v3", "osapi.jive.corev3.resolveContext");
    };
})();

