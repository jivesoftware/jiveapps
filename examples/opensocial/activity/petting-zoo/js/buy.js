function init() {
    registerEvents();
    loadCurrentUserID();
    populateForm(requsetParams.seller, "#seller");
}
gadgets.util.registerOnLoadHandler(init);

