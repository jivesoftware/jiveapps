(function() {
    jive.tile.onOpen(function(config, options ) {
        gadgets.window.adjustHeight();

        if ( typeof config === "string" ) {
            config = JSON.parse(config);
        }

        var json = config || {
            "startSequence": "1"
        };

        // prepopulate the sequence input dialog
        $("#start_sequence").val( json["startSequence"]);

        $("#btn_submit").click( function() {
            config["startSequence"] = $("#start_sequence").val();
            jive.tile.close(config, {} );
            gadgets.window.adjustHeight(300);
        });
    });

})();

