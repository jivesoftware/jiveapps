function Diagnostics() {
    var pushEndpoint, tileDescriptor;

    var $this = $('#diagnostics-view');
    $this.hide();
    function diagnosticsView($parent) {
        var testEndPoint = pushEndpoint;
        prepareView();
        showView();


        function showLastDataPushDetails(tileInstance) {
            if (tileInstance.lastActivityPost) {
                var lastActivityPost = "Retrieved results for last activity posted at " + tileInstance.lastActivityPost+".";
                showNotification(lastActivityPost);
                var error = tileInstance.lastActivityPost+ " : No errors were encountered during the post to endpoint.";
                if (tileInstance.publishError) {
                    error = tileInstance.publishError.lastDataPush + ": " + tileInstance.publishError.errorDetail +
                    "\n";
                }
                $('#txt-test-Results').val(error);

            }
            else {
                    showNotification("No Activity posted to stream yet.")
            }
        }

        function populateDataPushDetails() {
            osapi.jive.core.get({
                "v": "v3",
                "href": "/extstreams/external/" + extensionID() + "/" + tileDescriptor.externalId
            }).execute(function (data) {
                if (data.error) {
                    showError(data.error.message);
                }
                if (data) {
                    showLastDataPushDetails(data);
                }

            });
        }

        function prepareView() {
            $('#test-endpoint').text(testEndPoint);
            populateDataPushDetails();
            $('#btn-refresh:not(.bound)').addClass('bound').on('click', function () {
                populateDataPushDetails();
            });
            $('#btn-done').one('click', function () {
                hideDiagnosticsView();
            });
        }

        function showView() {
            $parent.hide();
            $this.show();
            gadgets.window.adjustHeight();
        }

        function hideDiagnosticsView() {
            $this.hide();
            $parent.show();
            gadgets.window.adjustHeight();
        }

    }

    function init(_pushEndpoint, _tileDescriptor) {
        pushEndpoint = _pushEndpoint;
        tileDescriptor = _tileDescriptor;
    }

    return {
        'init': init,
        'showDiagnostics': diagnosticsView
    }
}