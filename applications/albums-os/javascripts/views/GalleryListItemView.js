window.GalleryListItemView = Backbone.View.extend({
    events:{
    },

    initialize:function () {
        if(arguments && arguments[0] && arguments[0].container) {
            this.container = arguments[0].container;
        }
    },

    render:function () {
        var gallery = this.model;

        var context = "";
        if(this && this.container && this.container.appContext) {
            context = this.container.appContext.context;
        }


        $(this.el).html(
            $(_.template(this.options.container.getTemplate('#GalleryListItem'), {
                "title" : gallery.get("title"),
                "galleryID" : gallery.get("id"),
                "listSrc" : gallery.get("preview"),
                "context" : context
            } ) )
        );

        $(this.el).find('a.j-img-delete').click(function() {
    	    return confirm("Delete album " + gallery.get("title") + "?");
        });

        return this.el;
    },

    createNewGallery : function() {
        Backbone.history.navigate('gallery-create', true);
        return false;
    }

});
