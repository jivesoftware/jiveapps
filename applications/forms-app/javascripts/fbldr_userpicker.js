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

jive.fbldr.UserPicker = function(options) {

    var isMultiple = (options.multiple) ? true : false;
    var field = options.field;
    
    var linkId = "fbldr-link-" + field.id;
    var link = "#" + linkId;
    var listId = "fbldr-field-" + field.id;
    var list = "#" + listId;

    var $userList = $j(list);
            
    $j(link).click(function() {
        osapi.jive.core.users.requestPicker({
            multiple : isMultiple,
            success : function(response) {
                // if multiple is true, response.data will be an array
                // of osapi.jive.core.User objects
                var users;
                if ($j.isArray(response.data)) {
                    users = response.data;
                } else {
                    users = new Array();
                    users.push(response.data);
                }

                $j.each(users, function() {
                    var user = this;
                    if (!isInUserList(user)) {
                        var $user = $j('<li title="Click to remove user"/>')
                            .html('<span class="fbldr-userpicker-remove">[x]</span> ' + user.name)
                            .attr('userid', user.id)
                            .attr('username', user.name);
                        $user.appendTo($userList);
                        $user.click(function() {
                            $j(this).remove();
                            // gadgets.window.adjustHeight();
                        });
                        // gadgets.window.adjustHeight();
                    }
                });
            },
            error : function(error) {
                console.log("An unexpected error has occurred while initializing userpicker");
            }
        });
    });

    var isInUserList = function(user) {
        var users = $userList.find('li');
        for ( var i = 0; i < users.length; i++) {
            if ($j(users[i]).attr('userid') == user.id)
                return true;
        }
        return false;
    }
    
}
