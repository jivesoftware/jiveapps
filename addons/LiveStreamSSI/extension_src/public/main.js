(function () {

    jive.tile.onOpen(function (config, options) {

        //////////////////////////////////////////////////////////////////////////////////////////////
        // state

        var configAdaptor = ConfigAdaptor();
        var diagnostics = Diagnostics();
        configAdaptor.init(config);
        var tileDescriptor = configAdaptor.prepareDescriptor();
        var endPointTemplate = getJiveURL() + "/api/core/v3/extstreams/activities/external/{extensionUUID}/{externalId}/{privatePath}";

        ////////////////////////////////////////////////////////////////////////////////////////////////
        // main

        configAdaptor.init(config, tileDescriptor);
        var endPoint = generateEndPoint();
        diagnostics.init(endPoint, tileDescriptor);
        showEndpoint(endPoint, "POST");

        $('#j-activity-stream-title').val(tileDescriptor.displayName);

        showTestButtonWarning(tileDescriptor.isNew);
        gadgets.window.adjustHeight();

        function showTestButtonWarning(show) {
            if (show) {
                $('#test-btn-warning').html(i18n("main.html.button.test.warning.text"));
                $('#btn-test').prop('disabled', true);
            }

            gadgets.window.adjustHeight();
        }

        function generateEndPoint() {
            return endPointTemplate
                .replace("{extensionUUID}", extensionID())
                .replace("{externalId}", tileDescriptor.externalId)
                .replace("{privatePath}", tileDescriptor.privatePath);
        }

        function regenerateEndPoint() {
            showTestButtonWarning(true);
            tileDescriptor.generatePrivatePath();
            showNotification('The POST URL has been regenerated. Changes will take effect after the page is saved.');
            return generateEndPoint();
        }

        function showEndpoint(endpoint) {
            $('#rest-endpoint').text(endpoint);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////
        // UI events

        $('#btn-regenerate').click(function () {
            showEndpoint(regenerateEndPoint());
        });

        $('#btn-cancel').click(function () {
            jive.tile.close();
        });

        $('#btn-apply').click(function () {
            tileDescriptor.displayName = $('#j-activity-stream-title').val();
            configAdaptor.writeDescriptor(tileDescriptor, config);
            var sampleData = [{
                'name': 'Remote-push-Tile',
                'data': config.data
            }];
            jive.tile.close(config, sampleData);
            showNotification('Saved Tile');
        });

        $('#btn-test').click(function () {
            var $parent = $('.j-main-view');
            diagnostics.showDiagnostics($parent);
        });

    });

})();

