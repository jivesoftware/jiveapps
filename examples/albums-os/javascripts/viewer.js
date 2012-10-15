/*
 * Copyright 2012, Jive Software Inc.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */


gadgets.util.registerOnLoadHandler(function() {

    window.app = new App();

    // register a listener for embedded experience context
    opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function (key) {
        var embeddedContext = opensocial.data.getDataContext().getDataSet(key);

        console.log("==== registerListener ====");
        console.log("embedded context:", embeddedContext);

        if (!window.console){console={log:function(s){}}};
        var appContext = {
            embedded: embeddedContext,
            defaultRoute: 'gallery-view/' + embeddedContext.target.context.galleryID + '/' + embeddedContext.target.context.userid
        };
        
        window.app.initialize(appContext);
    });
});
