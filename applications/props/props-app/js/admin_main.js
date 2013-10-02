//
// Copyright 2013 Jive Software
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
var BASE_URL=window.BACKEND_HOST;

var defaultproptypes = [
    {
        $ItemName: 'Genius',
        title: 'Genius',
        definition: "You're a genius!",
        image_url: BASE_URL + '/img/prop_types/einstein.png',
        level: 0
    },

    {
        $ItemName: 'ThankYou',
        title: 'Thank You',
        definition: "Thanks for all that you do!",
        image_url: BASE_URL + '/img/prop_types/flowers.png',
        level: 0
    },

    {
        $ItemName: 'Beer',
        title: 'Beer',
        definition: "I owe you a beer!",
        image_url: BASE_URL + '/img/prop_types/beer.png',
        level: 25
    },

    {
        $ItemName: 'CrushedIt',
        title: 'Crushed It',
        definition: "You squashed that bug dead!",
        image_url: BASE_URL + '/img/prop_types/bug-crusher.png',
        level: 25
    },

    {
        $ItemName: 'NightOwl',
        title: 'Night Owl',
        definition: "You worked super late! Thanks!",
        image_url: BASE_URL + '/img/prop_types/owl.png',
        level: 25
    },

    {
        $ItemName: 'TurnedItTo11',
        title: 'Turned It To 11',
        definition: "You did something amazing!",
        image_url: BASE_URL + '/img/prop_types/amplifier.png',
        level: 100
    },

    {
        $ItemName: 'KickAss',
        title: 'Kick Ass',
        definition: "You kick ass!",
        image_url: BASE_URL + '/img/prop_types/chuck-norris.png',
        level: 500
    },

    {
        $ItemName: 'HoneyBadger',
        title: 'Honey Badger',
        definition: "You're even more bad-ass than a honey-badger!",
        image_url: BASE_URL + '/img/prop_types/honey-badger.png',
        level: 1000
    }
];
var noPropsHtml = '<tbody><tr><td>No Props Here</td></tr></tbody>';

gadgets.util.registerOnLoadHandler(function() {
    function clearForm() {
        $("#title-inp").val("");
        $("#definition-inp").val("");
        $("#level-inp").val("");
        $("#img-inp").val("");
    }

    $("#create-prop-type-tab").click(function() {
        $("#create-prop-type-tab").hide();
        $("#remove-prop-type-tab").show();

        clearForm();

        $("#remove-prop-types").fadeOut(400, function() {
            $("#create-prop-types").slideDown();
        });
    });
    $("#remove-prop-type-tab").click(function() {
        $("#remove-prop-type-tab").hide();
        $("#create-prop-type-tab").show();

        $("#create-prop-types").fadeOut(400, function() {
            $("#remove-prop-types").slideDown();
        });
    });

    $("#resetToDefaults").click(function() {
        console.log("Clicked reset to defaults");
        if (confirm("Reset all prop types to default? This cannot be undone.")) {
            makeRequest('get', BASE_URL+"/props/types/reset", null, function() {
                loadPropTypesIntoRemoveTable(function() {
                    alert("Prop Types have been reset.");
                });
            });
        }
    });

    $("#create-it").click(function() {
        var title = $("#title-inp").val();
        var definition = $("#definition-inp").val();
        var level = $("#level-inp").val();
        var image_url = $("#img-inp").val();

        if (!title||!definition||!image_url||!level) {
            alertBox('error', "Please fill in all fields.");
            clearForm();
            return;
        }

        if (level == "" || isNaN(level) || parseInt(level) < 0 || parseInt(level) > 1000) {
            alertBox('error', "Level must be an integer from 0-1000");
            clearForm();
            return;
        }

        function postProp() {
            makeRequest('post', BASE_URL+"/props/types",
                {
                    title:title,
                    definition:definition,
                    level:level,
                    image_url:image_url,
                    reflection_image_url:image_url
                }, function(res) {
                    loadPropTypesIntoRemoveTable(function() {
                        clearForm();
                        alertBox("success","The prop type "+title+" has been saved. Reload to see changes.");
                    });
                }
            );
        }

        $("<img>", {
            src: image_url,
            error: function() {
                alertBox('error', "Invalid Image URL.");
                clearForm();
            },
            load: function() {
                postProp();
            }
        });
    });

    loadPropTypesIntoRemoveTable(function() {
        $("#admin-panel-loading").hide();
        $("#admin-panel-main").show();

        $("#remove-prop-types").show();
    });
});

function alertBox(type, message) {
    if(!type) {
        type = 'success';
    }

    var alertBox = $(".alert").removeClass().addClass('alert-' + type).text(message).fadeIn();

    setTimeout(function(){
        alertBox.fadeOut(400, function() {
            alertBox.removeClass().addClass('alert');
        });
    }, 3000);
}

function tableRemoveOnClick(obj) {
    return function() {
        if (confirm("Remove the prop type "+obj.title+"? This cannot be undone.")) {
            makeRequest('get', BASE_URL+"/props/types/remove?type="+obj.$ItemName, null, function(res) {
                if ($("#dropdown-"+obj.$ItemName).parent().parent().parent().children().length == 1) {
                    $("#dropdown-"+obj.$ItemName).parent().parent().parent().html(noPropsHtml);
                }
                else {
                    $("#dropdown-"+obj.$ItemName).parent().parent().remove();
                }
                alertBox("success","Prop type "+obj.title+" removed.");
            });
        }
    }
}

function editProp(prop) {
    return function() {
        $("#create-prop-type-tab").hide();
        $("#remove-prop-type-tab").show();

        $("#remove-prop-types").fadeOut();
        $("#create-prop-types").slideDown();

        $("#title-inp").val(prop.title);
        $("#definition-inp").val(prop.definition);
        $("#level-inp").val(prop.level);
        $("#img-inp").val(prop.image_url);
    }
}

function checkIfDefaultProp(prop) {
    var found = false;
    for (var i in defaultproptypes) {
        var defprop = defaultproptypes[i];
        if (defprop.title == prop.title &&
            defprop.definition == prop.definition &&
            defprop.level == prop.level) { //TODO: check if image is the same
            found = true;
            break;
        }
    }
    return found;
}

function loadPropTypesIntoRemoveTable(callback) {
    $("#remove-prop-types .table").html('');
    makeRequest('get', BASE_URL+"/props/types?level=1000", null, function(res) {
        var result = $.parseJSON(res.content);
        var customitems = [];
        var defaultitems = [];
        var types = [];
        $.each(result, function(index, obj) {
            var row = '<tr>' +
                '<td>'+obj.title+'</td>' +
                '<td><a href=\"#\" class="btn btn-mini" id="edit-'+obj.$ItemName+'"><i class="icon-pencil"></i>Edit</a></td>'+
                '<td><a href=\"#\" class="btn btn-mini" id="dropdown-'+obj.$ItemName+'"><i class="icon-remove-circle"></i>Remove</a></td>'+
                '</tr>';
            if (checkIfDefaultProp(obj)) {
                defaultitems.push(row);
            }
            else {
                customitems.push(row);
            }
            types.push(obj);
        });
        if (customitems.length > 0) {
            $("#customtable").html('<tbody>'+customitems.join('')+'</tbody>');
        }
        else {
            $("#customtable").html(noPropsHtml);
        }
        if (defaultitems.length > 0) {
            $("#defaulttable").html('<tbody>'+defaultitems.join('')+'</tbody>');
        }
        else {
            $("#defaulttable").html(noPropsHtml);
        }
        $.each(types, function(index, obj) {
            $("#dropdown-"+obj.$ItemName).click(tableRemoveOnClick(obj));
            $("#edit-"+obj.$ItemName).click(editProp(obj));
        });
        if (callback) {
            callback()
        }
    });
}