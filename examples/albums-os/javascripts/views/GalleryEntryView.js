window.GalleryEntryView = Backbone.View.extend({
    events:{
    },

    render:function (imgData) {

        if ( !imgData ) {
            // render a blank entry
            var imageId = this.model.get("id");
            imgData =  {
                "thumbSrc" : app.getProxiedUrl("/images/ajax_loader_large.gif"),
                "imageId" : imageId,
                "fileName" : "",
                "fullSrc" : "",
                "imageWidth" : "90",
                "imageHeight" : "90"
            };
            $(this.el).html( _.template(this.options.container.getTemplate('#GalleryEntry'), imgData ) );
            this.imgDom = $(this.el);
        } else {
            // render according to imgData
            this.imgDom = $(_.template(this.options.container.getTemplate('#GalleryEntry'), imgData ));
            $(this.el).html( this.imgDom );
        }

        var link = $(this.el).find("#image-" + imgData.imageId + "-delete");
        link.click(
            function(event){
                $(event.currentTarget).parent().remove();
                event.preventDefault();
            });


        return this.imgDom;
    },

    renderThumbnail: function( thumb ) {
        var previewSrc = thumb.get("src");
        var width = thumb.get("width");
        var height = thumb.get("height");
        this.imgDom.find("img").attr("src", previewSrc);
        this.imgDom.find("img").attr("data-width", width);
        this.imgDom.find("img").attr("data-height", height);

        return this.imgDom;
    },

    attachFullImageSource: function( fullImage ) {
        var fullSrc = fullImage.get("src");
        this.imgDom.find("img").attr("data-fullsrc", fullSrc);
    }

});
