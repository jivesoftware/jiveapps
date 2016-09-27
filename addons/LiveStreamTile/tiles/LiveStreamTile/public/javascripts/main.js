/****************************************************
* This file should load AFTER view.js or container.js, or whichever .js file that defines the onReady, onContainer and onViewer
*
* Note:  This implmentation has been provided for convenience, developers are not required to use this pattern.
*
* SEE: Tile API & Development FAQ - https://community.jivesoftware.com/docs/DOC-185776
****************************************************/
var app = {

  config : null,
  options : null,
  viewer : null,
  container : null,

  resize : function() {
    /*** DELAYED TO MAKE SURE DOM HAS SETTLED ***/
    setTimeout(function() {
      gadgets.window.adjustHeight();
      gadgets.window.adjustWidth();
    },200);
  },

  loadUI : function() {
      if (this.viewer && onViewer && typeof onViewer === "function") {
        onViewer(this.viewer);
      } // end if

      if (this.container && onContainer && typeof onContainer === "function") {
        onContainer(this.container);
      } // end if

      if (this.container && this.viewer && onReady && typeof onReady === "function") {
        onReady(this.config,this.options,this.viewer,this.container);
      } // end if

  }, // end function

  init: function(config,options) {
    this.config = config;
    this.options = options;

    if (this.config && onConfig && typeof onConfig === "function") {
      onConfig(this.config,this.options);
    } // end if

    /*** CALLS APP FRAMEWORK AND ASKS FOR THE VIEWER TO BE PASSED BACK ***/
    osapi.jive.corev3.people.getViewer().execute(gadgets.util.makeClosure(this, this.handleViewer));

    /*** CALLS THE TILE FRAMEWORK TO DISCOVER WHERE IT IS LOCATED ***/
    jive.tile.getContainer(gadgets.util.makeClosure(this, this.handleContainer));
  }, // end function

  handleViewer : function(viewer) {
    this.viewer = viewer;
    this.loadUI();
  },

  handleContainer : function(container) {
    this.container = container;
    this.loadUI();
  }

};

jive.tile.onOpen(
    function(config, options) {
      app.init(config,options);
});