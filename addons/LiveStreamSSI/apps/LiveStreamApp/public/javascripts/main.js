//LiveStream options
var lsWidth = 960,
    lsHeight = 540,
	accountId = 21071424;

var app = {

    jiveURL : opensocial.getEnvironment()['jiveUrl'],
    
    currentView : null,
    
	init : function() {
		//** LOAD CURRENT VIEW ***
		this.currentView = gadgets.views.getCurrentView().getName();
		
		/*** LOAD CONTEXT ***/
		osapi.jive.core.container.getLaunchContext(this.handleContext);
		
	}, // end init

	handleContext : function(ctx) {
		var appObj = this;

		var body = ctx.jive.context.body;

		var the_HTML = '<iframe id="ls_embed_' + ctx.jive.context.timestamp + '" src="//livestream.com/accounts/' + accountId + '/events/' + body.id + '/player?width=' + lsWidth +'&height=' + lsHeight +'&enableInfoAndActivity=false&autoPlay=true&mute=false" width="' + lsWidth +'" height="' + lsHeight +'" frameborder="0" scrolling="no" allowfullscreen> </iframe>'
		$('#the_video').html(the_HTML);

		$("#output").html('<pre>'+JSON.stringify(ctx, null, '\t')+'</pre>');  
		gadgets.window.adjustHeight();
	} // end handleContext
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.init));