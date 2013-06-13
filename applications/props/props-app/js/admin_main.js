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
gadgets.util.registerOnLoadHandler(function() {
    $("#create-prop-type-tab").click(function() {
        //console.log("in the create tab");
        if ($("#remove-prop-type-tab").parent().hasClass("active")) {
            $("#remove-prop-type-tab").parent().removeClass("active");
            $("#create-prop-type-tab").parent().addClass("active");
        }
        $("#remove-prop-types").hide();
        $("#create-prop-types").show();
    });
    $("#remove-prop-type-tab").click(function() {
        //console.log("in the remove tab");
        if ($("#create-prop-type-tab").parent().hasClass("active")) {
            $("#create-prop-type-tab").parent().removeClass("active");
            $("#remove-prop-type-tab").parent().addClass("active");
        }
        $("#create-prop-types").hide();
        $("#remove-prop-types").show();
    });

    $("#resetToDefaults").click(function() {
        console.log("Clicked reset to defaults");
        if (confirm("Reset all prop types to default? This cannot be undone.")) {
            makeRequest('get', BASE_URL+"/props/types/reset", null, function() {
                loadPropTypesIntoRemoveList(function() {
                    alert("Prop Types have been reset.");
                });
            });
        }
    });

    $(".btn.btn-success.create-it").click(function() {
        console.log("clicked create-it");
        var title = $("#title-inp").val();
        var definition = $("#definition-inp").val();
        var level = $("#level-inp").val();
        var image_url = $("#img-inp").val();

        if (!title||!definition||!image_url||!level) {
            alert("Please fill all fields to create a new prop type");
            return;
        }

        makeRequest('post', BASE_URL+"/props/types",
            {
                title:title,
                definition:definition,
                level:level,
                image_url:image_url,
                reflection_image_url:image_url
            }, function(res) {
                addToRemoveDropdown(title);
                alert("The prop type "+title+" has been created/modified.");
                $("#title-inp").val("");
                $("#definition-inp").val("");
                $("#level-inp").val("");
                $("#img-inp").val("");
            }
        );
    });

    loadPropTypesIntoRemoveList(function() {
        $("#admin-panel-loading").hide();
        $("#admin-panel-main").show();

        $("#create-prop-types").show();
    });
});

var addToRemoveDropdown = function(newType) {
    $(".dropdown-menu").append('<li><a href=\"#\" id=\"dropdown-'+newType+'\">'+newType+'</a></li>');
    $("#dropdown-"+newType).click(dropdownOnClick(newType));
}

var dropdownOnClick = function(obj) {
    return function() {
        if (confirm("Remove the prop type "+obj.title+"? This cannot be undone.")) {
            makeRequest('get', BASE_URL+"/props/types/remove?type="+obj.$ItemName, null, function(res) {
                console.log(res);
                console.log(obj.title, "#dropdown-"+obj.$ItemName);
                $("#dropdown-"+obj.$ItemName).remove();
                alert("Prop type "+obj.title+" removed.");
            });
        }
    }
}

var loadPropTypesIntoRemoveList = function(callback) {
    makeRequest('get', BASE_URL+"/props/types?level=1000", null, function(res) {
        //console.log(typeof(res.content), res.content);
        var result = $.parseJSON(res.content);
        var items = [];
        var types = [];
        $.each(result, function(index, obj) {
            //console.log("name: "+obj.$ItemName);
            items.push('<li><a href=\"#\" id=\"dropdown-'+obj.$ItemName+'\">'+obj.title+'</a></li>');
            types.push(obj);
        });
        $(".dropdown-menu").html(items.join(''));
        $.each(types, function(index, obj) {
            //console.log(obj, "#dropdown-"+obj);
            $("#dropdown-"+obj.$ItemName).click(dropdownOnClick(obj));
        });
        if (callback) {
            callback()
        }
    });
}