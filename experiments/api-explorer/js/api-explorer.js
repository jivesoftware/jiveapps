var metadataProperties;
var objectNames;

function init() {
    $("#tabs").tabs();
    $("#metadata-accordion").accordion({
        change : onMetadataAccordionChange,
        fillSpace : true
    });
    loadObjectNames();
}

function loadMetadataProperties() {
    if (metadataProperties) {
        return;
    }
    osapi.jive.core3.properties.getProperties().execute(onMetadataProperties);
}

function loadObjectDetails() {
    osapi.jive.core3.objects.getObjectDetails({
        objectName : $("#metadata-object-select").val()
    }).execute(onObjectDetails);
}

function loadObjectNames() {
    if (objectNames) {
        return;
    }
    osapi.jive.core3.objects.getObjectNames().execute(onObjectNames);
}

function onMetadataAccordionChange(event, ui) {
    console.log("onMetadataAccordionChange(" + ui.newHeader.attr("id") + ")");
    if ("metadata-accordion-properties" == ui.newHeader.attr("id")) {
        loadMetadataProperties();
    }
    else if ("metadata-accordion-objects" == ui.newHeader.attr("id")) {
        loadObjectNames();
    }
}

function onMetadataProperties(response) {
    console.log("onMetadataProperties(" + JSON.stringify(response) + ")");
    metadataProperties = response;
    var html = "";
    $.each(metadataProperties, function(index, property) {
        html += '<tr><td>' + property.name + '</td>';
        html += '<td>' + property.type + '</td>';
        html += '<th>' + property.value + '</th>';
        html += '<td>' + property.description + '</td>';
        html += '</tr>';
    });
    $("#metadata-properties-tbody").html("").html(html);
    $("#metadata-properties-table").show();
}

function onObjectNames(response) {
    console.log("onObjectNames(" + JSON.stringify(response) + ")");
    objectNames = response.sort();
    var html = '<option disabled="disabled">----------</option>';
    $.each(objectNames, function(index, objectName) {
        html += '<option value="' + objectName + '">' + objectName + '</option>';
    });
    $("#metadata-object-select").html("").html(html).change(loadObjectDetails);
    $("#metadata-object-picker").show();
}

function onObjectDetails(response) {
    console.log("onObjectDetails(" + JSON.stringify(response) + ")");
    // object type summary
    var summary = "";
    if (response.description) {
        summary += response.description;
    }
    if (response.since) {
        summary += ' (Since: ' + response.since + ')';
    }
    $("#metadata-object-description").html("").html(summary);
    // fields table
    if (response.fields) {
        var fields = "";
        $.each(response.fields, function(index, field) {
            var type = field.type;
            if (field.array) {
                type += '[]';
            }
            fields += '<tr>';
            fields += '<td>' + field.name + '</td>';
            fields += '<td>' + type + '</td>';
            fields += '<td>' + (field.required ? 'true' : 'false') + '</td>';
            fields += '<td>' + (field.editable ? 'true' : 'false') + '</td>';
            fields += '<td>' + (field.description ? field.description : '&nbsp;') + '</td>';
            fields += '<td>' + (field.availability ? field.availability : '&nbsp;') + '</td>';
            fields += '<td>' + (field.since ? field.since : '&nbsp;') + '</td>';
            fields += '</tr>'
        });
        $("#metadata-object-fields-tbody").html("").html(fields);
        $("#metadata-object-fields-table").show();
    }
    else {
        $("#metadata-object-fields-table").hide();
    }
    // resources table
    if (response.resourceLinks) {
        var resources = "";
        $.each(response.resourceLinks, function(index, resource) {
            resources += '<tr>';
            resources += '<td>' + resource.name + '</td>';
            resources += '<td>' + (resource.description ? resource.description : '&nbsp;') + '</td>';
            resources += '<td>' + (resource.availability ? resource.availability : '&nbsp;') + '</td>';
            resources += '<td>' + (resource.since ? resource.since : '&nbsp;') + '</td>';
            resources += '</tr>';
        });
        $("#metadata-object-resources-tbody").html("").html(resources);
        $("#metadata-object-resources-table").show();
    }
    else {
        $("#metadata-object-resources-table").hide();
    }
}

gadgets.util.registerOnLoadHandler(init);
