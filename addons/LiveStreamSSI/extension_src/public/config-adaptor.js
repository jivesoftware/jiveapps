function ConfigAdaptor() {

    var config;

    function prepareDescriptorFromConfig() {
        var jiveConfig = config.__jive__;
        if (!jiveConfig) {
            jiveConfig = {};
        }

        var tileDescriptor = {
            externalId: "",
            privatePath: "",
            displayName: "",
            isNew: false,
            generatePrivatePath: function () {
                this.privatePath = randomString(32);
            }
        };
        var isNew = typeof jiveConfig.externalId == 'undefined';
        // set externalId  if new tile, otherwise load from config
        if (isNew) {
            tileDescriptor.externalId = "stream-" + randomString(8, "0123456789abcdef");
            tileDescriptor.generatePrivatePath();
            tileDescriptor.isNew = true;
            tileDescriptor.displayName = "LiveStreamSSI";
        }
        else {
            // attributes loaded from __jive__ child of config
            tileDescriptor.externalId = jiveConfig.externalId;
            tileDescriptor.privatePath = jiveConfig.privatePath;
            tileDescriptor.displayName = jiveConfig.displayName;
        }

        return tileDescriptor;
    }

    function writeDescriptorToConfig(tileDescriptor) {
        var jiveConfig = config.__jive__;
        if (!jiveConfig) {
            jiveConfig = {};
            config.__jive__ = jiveConfig;
        }

         // attributes saved under __jive__ child of config
        jiveConfig.externalId = tileDescriptor.externalId;
        jiveConfig.privatePath = tileDescriptor.privatePath;
        jiveConfig.displayName = tileDescriptor.displayName;
    }

    function init(_config) {
        config = _config;
    }

    return {
        'init': init,
        'prepareDescriptor': prepareDescriptorFromConfig,
        'writeDescriptor': writeDescriptorToConfig
    }

}