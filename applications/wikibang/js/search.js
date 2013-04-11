/*
 *
 *      Copyright 2013 Jive Software
 *
 *      Licensed under the Apache License, Version 2.0 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

gadgets.util.registerOnLoadHandler(function() {
	//this code will set the background image on the embedded experience. Feels a bit too busy to me
	// var bg = $("#protoImage");
	// $("body").css("background-image","url('" + bg.attr('src') + "')");
	// $("body").css("background-repeat", "no-repeat");
	// $("body").css("background-position", "center top");
	$('.loading').hide();
	var loadContent = function(selection) {
		var title = '';
		if(selection.display) {
			title = selection.display.label;
			$('#searchinput').val(title);
			display($('#searchinput').val());
			$('#ok').removeClass("disabled");
		}
	};
	gadgets.actions.updateAction({
        	id:"com.jivesoftware.rte.wikipedia",
        	callback:loadContent
    });
	window.focus(); 
	$('#searchinput').focus();	
});

$(function() {

    var typeAhead = $('#searchinput').typeahead({
        onselect: function(obj) {
            $('#searchinput').val(obj);
            display($('#searchinput').val());
	    $('#ok').removeClass("disabled").focus();
        }
    });

    var autocomplete = typeAhead.on('keyup',
    function(ev) {
	
		if ($('#searchinput').val() == '') {
			$("#display").empty();
			$("#thumbnail").empty();
			$('#ok').addClass("disabled");
		}

        ev.stopPropagation();
        ev.preventDefault();

        //filter out up/down, tab, enter, and escape keys
        if ($.inArray(ev.keyCode, [40, 38, 9, 13, 27]) === -1) {

            var self = $(this);

            //set typeahead source to empty
            self.data('typeahead').source = [];

            //active used so we aren't triggering duplicate keyup events
            if (!self.data('active') && self.val().length > 0) {

                self.data('active', true);

                var callback = function(response) {
                    var data = JSON.parse(response.data);
                    //set this to true when your callback executes
                    self.data('active', true);

                    var arr = [];
                    var res = data[1];
                    i = res.length;
                    while (i--) {
                        arr[i] = res[i];
                    }

                    //set your results into the typehead's source
                    self.data('typeahead').source = arr;

                    //trigger keyup on the typeahead to make it search
                    self.trigger('keyup');

                    //All done, set to false to prepare for the next remote query.
                    self.data('active', false);

                };

                var url = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + encodeURIComponent($(this).val()) + "&limit=12";
                gadgets.io.makeRequest(url, callback);

            }
        } else if (ev.keyCode == 13) {
            display($('#searchinput').val());
			$('#ok').removeClass("disabled");
			$("#ok").focus();
		}
    });

	$('#ok').click(function(e) {
		if ($('#ok').hasClass('disabled')) {
			return;
		}
		if ($('#searchinput').val()) {

            var imageUrl = $('#dummyImg').attr('src').replace('blank.gif', 'images/icon16.png');
            var serverRoot = gadgets.config.get()['jive-opensocial-ext-v1']['jiveUrl'];
            imageUrl = imageUrl.replace('//' + serverRoot.split('//')[1], serverRoot);

            osapi.jive.core.container.closeApp({
                data:{
                    display: {
                        type:"text",
                        icon: imageUrl,
                        label: $('#searchinput').val()
                    },
                    target: {
                        type: "embed",
                        view: "embedded",
                        context: {
                            page: $('#searchinput').val()
                        }
                    }
                }
	        });
		}
		$('#searchinput').focus();
    });

	$('#cancel').click(function(e) {
		osapi.jive.core.container.closeApp({});
    });
});
