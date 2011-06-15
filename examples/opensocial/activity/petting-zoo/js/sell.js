function init() {
    registerEvents();
    loadCurrentUserID();
    populateForm(requsetParams.buyer, "#buyer");
}
gadgets.util.registerOnLoadHandler(init);

