window.GalleryListView = Backbone.View.extend({
    events:{
        "click #btn_create_an_album"             : "createNewGallery",
        "click #helpToggle"             : "toggleHelp"
    },

    initialize:function () {
        this.collection = new GalleryList();
    },

    render:function () {
    },

    createNewGallery : function() {
        Backbone.history.navigate('gallery-create', true);
        return false;
    },

    renderNoGalleries: function() {
        $(this.el).html(_.template(this.options.container.getTemplate('#GalleryListNone') ) );
    },

    renderGalleries: function() {
        $(this.el).html(_.template(this.options.container.getTemplate('#GalleryList')));
    },

    toggleHelp: function(event) {
        $('.j-howtouse').toggle();
        if ($('.j-howtouse').is(':visible') ) {
            $('#helpToggle').text("Close");
        } else {
            $('#helpToggle').text("How to use");
        }
        event.preventDefault();
    },

    renderGallery: function( gallery ) {

        var galleryListItemView = new GalleryListItemView( {model: gallery, container: this.options.container } );
        var galleryListItemDom = galleryListItemView.render();
        $(galleryListItemDom).attr("name", gallery.get('created')).addClass("j-album-display");

        var dom = $(this.el);
        var container = dom.find("#listcontent");
        var galleries = dom.find("#listcontent > .j-album-display");

        if (galleries.length <= 0) {
            container.append( galleryListItemDom );
        }
        else { //Insert in order
//            var wasInserted = false;
//            for (var i = 0; i < galleries.length; i++) {
//                if ($(galleries[i]).attr("name") > gallery.get('created')) {
//                    $(galleries[i]).before(galleryListItemDom);
//                    wasInserted = true;
//                    break;
//                }
//            }
//            if (! wasInserted ) {
                container.append(galleryListItemDom);
//            }

        }

        return this.el;
    }

});
