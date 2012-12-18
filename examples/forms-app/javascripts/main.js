/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

// This command is only needed for doing local testing with plovr
// which uses the google closure library for dependencies
// goog.require('jive.fbldr.soy');

$j(document).ready(function() {

    $j('#fbldr-menu-create a').click(function() {
        displayView('create');
    });
    
    $j('#fbldr-menu-help a').click(function() {
        displayView('help');
    });
    
    $j('#fbldr-menu-forms a').click(function() {
        displayView('forms');
    });
    
    var displayView = function(displayName) {
        var canvas_view = new gadgets.views.View("canvas");
        gadgets.views.requestNavigateTo(canvas_view, { display: displayName });
        return false;
    };

    var viewParams = gadgets.views.getParams();

    if (viewParams['display'] == 'create') {
        var formCreator = new jive.fbldr.FormCreator({
        });        
    }
    else if (viewParams['display'] == 'help') {
        var formHelp = new jive.fbldr.FormHelp({
        });
    }
    else {
        var formBuilder = new jive.fbldr.FormBuilder({
            containerId: "fbldr-main",
            infoId: "fbldr-info"
        });
    }
});

if (typeof(gadgets) != "undefined") {
    gadgets.util.registerOnLoadHandler(function() {
        // gadgets.window.setTitle('Forms');
        // gadgets.window.adjustHeight();
    });
}