/*
 * Copyright 2011 Jive Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
jive.namespace('apps.user.photo');

jive.apps.user.photo.PhotoRecognition = function(unlimited) {
    var CHOSEN_LIMIT = (unlimited) ? -1 : 10;

    var friends;
    var lastFriend;
    var viewer;
    
    var lastIndex = -1;
    var chosen = 0;
    var consecutive = 0;
    var correct = 0;
    
    function addSelection(name, option) {
        var elem = '<input type="radio" name="who" option="' + option + '"><span class="jive-apps-photo-radio">' + name + '</span></input><br />\n'
            
        if ((Math.floor(Math.random() * 2)) % 2 == 0) {
            jQuery('#jive-apps-photo-form').append(elem);
        }
        else {
            jQuery('#jive-apps-photo-form').prepend(elem);
        }
    }
    
    function displayComplete() {
        jQuery('#jive-apps-photo-form').empty();
        jQuery('#jive-apps-photo-friend').empty();
    
        jQuery('#jive-apps-photo-result').append(
            '<span class="jive-apps-photo-finished">Congratulations!</span>\n' +
            '<a id="jive-apps-photo-publish" href="javascript:;">Publish Results?</a>\n'
        );
        
        handlePublish();
    }
    
    function displayRandom() {
        if (!friends)
            return;
	
	jQuery('#jive-apps-photo-form').empty();
	jQuery('#jive-apps-photo-friend').html('<div class="jive-apps-photo-loading"></div>');
	
        var random = lastIndex;
        while (random == lastIndex) {
            random = Math.floor(Math.random() * friends.length);
        }
        
        lastIndex = random;
        lastFriend = friends[random];
        
        var query = lastFriend.displayName.replace(/ /, " OR ");
        
        osapi.jive.core.users.get({query: query, start: 0, limit: 4}).execute(similarCallback);
    };
    
    function initialize() {
        osapi.people.getViewer().execute(viewerCallback);
        osapi.people.getViewerFriends().execute(viewerFriendsCallback);
    };
    
    function handleNotify() {
        jQuery('#jive-apps-photo-notify').click(function() {
            if (!confirm('Notify the user that you are having a difficult time connecting them with their photo?'))
                return;
                
            var msg = "One of your connections, " + viewer.displayName + ", is having difficulty recognizing you from your photo.  Perhaps you should change your photo to something that better represents you.";            
            var activity = {
                title  : "User Photo Recognition Notification",
                body   : msg
            }

            osapi.activities.create({
                activity: activity,
                deliverTo: lastFriend.id,
            }).execute(function(response){
                if (!response.error) {
                    jQuery('#jive-apps-photo-notify').unbind('click');
                    jQuery('#jive-apps-photo-notify').html('Done!');
                }
            });

            return false;
        });
    }
    
    function handlePublish() {
        jQuery('#jive-apps-photo-publish').click(function() {
            jQuery('#jive-apps-photo-publish').unbind('click');
            jQuery('#jive-apps-photo-publish').html('Publishing...');
        
            // Post a status update
            osapi.jive.core.updates.create({
                userId: '@viewer',
                update: {
                    html: "Just correctly identified " + correct + " of " + CHOSEN_LIMIT + " people, based on their photo, using the User Photo Recognition App.  Can you do better?"
                }
            }).execute(function(response) {
                // If status update succeeds then post a notification, unbind button, and alert
                if (!response.error) {
                    var msg = "<b>Congratulations!</b>  You correctly identified " + correct + " of " + CHOSEN_LIMIT + " people, based on their photo.  ";
                    if (correct == CHOSEN_LIMIT) {
                        msg += "100% correct.  Perfect score!  Nicely done!";
                    }
                    else {
                        msg += "Not quite a perfect score, but oh so close.  Please try again.";
                    }
            
                    osapi.activities.create({
                        activity: {
                            title : "User Photo Recognition Results",
                            body  : msg
                        },
                        deliverTo: viewer.id
                    }).execute(function(response){
                        if (!response.error) {
                            jQuery('#jive-apps-photo-publish').html('Published Results!');
                        }
                    });                    
                }
            });

            return false;
        });
    }
    
    function handleReload() {
        jQuery('#jive-apps-photo-reload').click(function() {
            displayRandom();
            
            return false;
        });
    };

    function handleSelection() {
        if (unlimited) {
            handleUnlimitedSelection();
        }
        else {
            handleLimitedSelection();
        }
    }

    function handleLimitedSelection() {
        jQuery('#jive-apps-photo-form input').change(function() {
            var isCorrect = (jQuery(this).attr('option') == 'true');
            var css = (isCorrect) ? 'jive-apps-photo-green' : 'jive-apps-photo-red';
            
            if (isCorrect) { correct++; }
            
            jQuery('#jive-apps-photo-progress-' + chosen)
                .removeClass('jive-apps-photo-gold')
                .addClass(css);
                
            chosen++;
            
            jQuery('#jive-apps-photo-progress-' + chosen)
	        .removeClass('jive-apps-photo-white')
                .addClass('jive-apps-photo-gold');
            
            jQuery('#jive-apps-photo-correct').html(correct);

            if (chosen == CHOSEN_LIMIT) {
                displayComplete();
                return;
            }
            
            displayRandom();
        });
    }

    function handleUnlimitedSelection() {
        jQuery('#jive-apps-photo-form input').change(function() {
            var isCorrect = (jQuery(this).attr('option') == 'true');
            
            if (isCorrect) { consecutive++; correct++; }
            else { consecutive = 0 };
                
            chosen++;
            
            var response = (isCorrect) ? 'Correct!' : 'Incorrect!';
            var streak = (consecutive) ? consecutive + ' correctly identified in a row.' : '';
            
            jQuery('#jive-apps-photo-response')
                .toggleClass('jive-correct', isCorrect)
                .toggleClass('jive-incorrect', !isCorrect)
                .html(response);
            
            jQuery('#jive-apps-photo-streak').html(streak);

            displayRandom();
        });
    }

    function similarCallback(userData) {
        if(!userData || userData.error)
            return;

        jQuery('#jive-apps-photo-friend').html(
            '<img src="' + lastFriend.thumbnailUrl + '" alt="Mystery Photo"/>\n' +
            '<div class="jive-apps-photo-friend-control"><a href="javascript:;" id="jive-apps-photo-reload">Skip</a>' +
            '<a href="javascript:;" id="jive-apps-photo-notify">Who?</a></div>\n'
        );

        var i;

        for (i = 0; i < userData.data.length; i++) {
            var name = userData.data[i].name;
            var correct = false;

            if (userData.data[i].name == lastFriend.displayName) {
                correct = true;
            }
            
            addSelection(name, correct);
        }
        
        var fill = 4 - userData.data.length;
        
        for (var i = 0; i < fill; i++) {
            var random = Math.floor(Math.random() * friends.length);
            while (random == lastIndex) {
                random = Math.floor(Math.random() * friends.length);
            }

            var friend = friends[random];
            var name = friend.displayName;
            
            addSelection(name, false);
        }
        
        handleNotify();
        handleReload();
        handleSelection();

        // var msg = new gadgets.MiniMessage();
        //     msg.createTimerMessage("Random Display Updated.", 3);
        
        gadgets.window.adjustHeight();
    };

    function viewerCallback(viewerData) {
        if (!viewerData || viewerData.error) 
            return;
        
        viewer = viewerData;
        
        jQuery('#jive-apps-photo-user').html(
            '<img src="' + viewer.thumbnailUrl + '" alt="Your Photo"/>\n' + 
            '<div class="jive-apps-photo-name">' + viewer.displayName + '</div>\n'
        );
        
        gadgets.window.adjustHeight();
    };

    function viewerFriendsCallback(viewerFriendsData) {
        if (!viewerFriendsData || viewerFriendsData.error)
            return;
            
        friends = viewerFriendsData.list;
            
        displayRandom();
    };
        
    initialize();
};
