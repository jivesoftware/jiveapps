window.GalleryViewer = Backbone.View.extend({
    events:{
        "click  #close"             : "close"
    },

    initialize:function () {
    },

    close: function() {
        osapi.jive.core.container.closeApp();
    },

    prepareIE: function(ids) {
        // show flash viewer element, hide html malsup one
        $("#flashviewer").show();
        $("#main-photo").hide();

        var self = this;
        var base = gadgets.util.getUrlParameters()['url'];
        base = base.substring(0, base.lastIndexOf('/')) + '/';

        if ( window.location.protocol == 'https:' ) {
            base = base.replace('http:','https:');
        }
        // remove xx parameter when development is done!! todo
        var swfPath = gadgets.io.getProxyUrl( base + 'viewer.swf?xx=' + new Date().getTime() );

        swfobject.embedSWF( swfPath, 'flashviewer', '600', '550', '9.0.0');

        var ptr = 0;
        $("#next").click ( function() {
            ptr++;
            if ( ptr > ids.length - 1 ) {
                ptr = 0;
            }
            self.showInFlashViewer( ids[ptr] );
        });

        $("#previous").click ( function() {
            ptr--;
            if ( ptr < 0 ) {
                ptr = ids.length - 1;
            }
            self.showInFlashViewer( ids[ptr] );
        });
    },

    showInFlashViewer: function(id) {
        var imgDom = $("#main-photo img[data-id=" + id + "]");
        var src = imgDom.attr("src");
        var from = src.indexOf("base64,") + "base64,".length;
        var to = src.length;

        window['flashviewer'].setImage(src.substring(from, to ));
    },

    render:function () {
        var self = this;

        var gallery = this.model;

        var dom = $(this.el);
        var base = gadgets.util.getUrlParameters()['url'];
        base = base.substring(0, base.lastIndexOf('/')) + '/';

        dom.html(_.template(this.options.container.getTemplate('#GalleryViewer'), {
            "title": gallery.get("title"),
            spinnerSource: base + "/images/loading-images.gif"
        } ) );

        var ids = gallery.get("imgIDs");
        if(ids.length ==0) {
            $(this.el).find(".view-gallery").hide();
            $(this.el).find(".view-gallery-empty").show();
            return this.el;
        }

        var sourceToProcessQueue = new Array();
        var loadCount = 0;
        var previousContainerHeight = 0;

        var loaded = function( loadCount) {
            if  ( loadCount < ids.length ) {
                return;
            }
            console.log(loadCount, "versus", ids.length );

            console.log("Loaded " + loadCount++);
            $(".j-loading").hide();
            $("#main-photo").show();

            gadgets.window.adjustWidth();

            // if need flash
            if ( self.needFlashViewer() ) {
                self.prepareIE(ids);
            } else {
                $("#flashviewer").hide();

                // if not need flash then prepare the malsup slideshow
                $('#main-photo').cycle({
                    next : ".js-photo-fwd",         // JQuery selector for "next" control
                    pause: 1,               // Pause transitions when mouse is over the image
                    prev : ".js-photo-back",     // JQuery selector for "previous" control
                    speed: 0,            // Time to complete a cycle (ms)
                    timeout: 0,           // Time between cycles (ms)
                    pager: "#thumbs ul",
                    activePagerClass: 'active',
                    pagerAnchorBuilder: function(idx, slide) {
                        // return selector string for existing anchor
                        return '#thumbs ul li:eq(' + idx + ') a';
                    }

                });



                // on load, calculate container width.
                var thumbNum = $('#thumbs li').length,
                    thumbW = $('#thumbs li:first').outerWidth(),
                    paddingOff = parseInt($('#thumbs li:last').css('padding-right')), // the last element doesn't have right padding, so subtract it.
                    $thumbParent = $('#thumbs ul'); // the container that needs to be teh hueg


                console.log($thumbParent);
                // make said container teh hueg
                $thumbParent.width(thumbNum * thumbW-paddingOff);


                // update the enabled-ness of the arrows. Visual only, does not affect
                function updateArrows() {
                    var currentOffset = parseInt($thumbParent.css('left'));
                    if (isNaN(currentOffset)) { currentOffset = 0; }
                    var containWidth = $('#thumbs').innerWidth();


                    // check for back
                    if (currentOffset >= 0) {
                        $('.js-page-back').addClass('disabled');
                    } else {
                        $('.js-page-back').removeClass('disabled');
                    }

                    // check for forward
                    if (containWidth - parseInt($thumbParent.width()) >= currentOffset) {
                        $('.js-page-fwd').addClass('disabled');
                    } else {
                        $('.js-page-fwd').removeClass('disabled');
                    }
                }




                // let's see if the arrows need to light up.
                updateArrows();

                // also when the window resizes we'll check if the arrows need to light up.
                $(window).resize(function() {
                    updateArrows();
                });

                // on click, page forward.
                $('.js-page-fwd').click(function(e) {


                    var containWidth = $('#thumbs').innerWidth();	// visible container width, changes on window resize
                    var currentOffset = parseInt($thumbParent.css('left'));	// existing offset, if any
                    if (isNaN(currentOffset)) {
                        currentOffset = 0;
                    }

                    var n = Math.floor((-currentOffset + containWidth) / thumbW); // the first ele we need to scroll to

                    var newOffset = (n*thumbW);


                    // check for overflow, we want to pin them to the right, no blank area at all.
                    if (newOffset > ($thumbParent.width() - containWidth)) {
                        newOffset = ($thumbParent.width() - containWidth);
                    }

                    // animate to the new offset. Aw yiss.
                    $thumbParent.animate({
                        left: -newOffset
                        }, 300, function() {
                            updateArrows();
                        });



                    e.preventDefault();
                });


                // on click, page back.
                $('.js-page-back').click(function(e) {

                    var containWidth = $('#thumbs').innerWidth(), // visible container width
                        currentOffset = parseInt($thumbParent.css('left')), // existing offset, if any
                        n = Math.ceil(-currentOffset / thumbW), // the first ele we want to scroll to
                        newOffset = (n*thumbW)-containWidth;

                    // check for overflow, we don't want to go any further left than 0
                    if (newOffset < 0) {
                        newOffset = 0;
                    }

                    // aand ANIMATE.
                    $thumbParent.animate({
                        left: -newOffset
                    },300, function() {updateArrows();} );


                    e.preventDefault();

                });






            }

            // if need flash
            if ( self.needFlashViewer() ) {
                // show the first image
//                self.showInFlashViewer( ids[0] );
            }

            $.each( sourceToProcessQueue, function() {
                var fn = this;
                fn();
            });

        };

        var galleryEntryMap = {};

        // pre-seed the gallery entry doms
        var container = this.options.container;

        var galleryCreatorId = gallery.creatorId ? gallery.creatorId() : '@me';

        $.each( ids, function() {
            var imageId = this;

            var model = new GalleryEntry({id: imageId, userid: galleryCreatorId });
            var view = new GalleryEntryView({model: model, container: container });
            galleryEntryMap[imageId] = { view: view, model: model };

            var entryDom = view.render();
            entryDom.hide();
            entryDom.find("a.j-img-delete").remove();
            dom.find("#main-photo").append( entryDom );
            entryDom.show();
            // build thumb
            var thumbSrc = entryDom.find("img").attr("src");
            var thumb = $(_.template(self.options.container.getTemplate('#GalleryViewerThumnail'), {
                src: thumbSrc,
                id: imageId
            } ));
            dom.find("#thumbs ul").append( thumb );
        });

        // now load
        var count = 0;
        $.each( ids, function() {
            var imageId = this;
            console.log("loading image id " + imageId );

            var galleryEntry = galleryEntryMap[imageId];

            var model = galleryEntry.model;
            var view =  galleryEntry.view;

            window.setTimeout( function() {

                model.fetchThumb( function(thumbImage) {
                    var thumbnailDom = view.renderThumbnail(thumbImage);

                    var thumbStyle = "url(" + thumbImage.get("src") + ")";
                    var pagerImgDom = $("#thumbs a[data-id=" + imageId + "]")
                        .css("background-image", thumbStyle);

                    // scale image
                    thumbnailDom.find("img").css("width", thumbImage.get("width") * 1.0 );
                    thumbnailDom.find("img").css("height", thumbImage.get("height") * 1.0 );
                    //thumbnailDom.css("margin-left", 20);

                    thumbnailDom.find("div.result_img").removeClass('result_img');

                    // center image -- note maybe this can be done pure css??
                    var containerHeight = $("#main-photo").css("height").replace('px','');
                    var containerWidth = $("#main-photo").css("width").replace('px','');
                    var imgWidth = thumbnailDom.find("img").css("width").replace('px','');
                    var imgHeight = thumbnailDom.find("img").css("height").replace('px','');
                    var deltaWidth = containerWidth - imgWidth;
                    var deltaHeight = containerHeight - imgHeight;
                    thumbnailDom.find("img").css("margin-left", deltaWidth / 2 - 10);
                    //thumbnailDom.find("img").css("margin-top", (imgHeight / 2) - (containerHeight - previousContainerHeight)/2);
                    var marginTopComputeBase = 451;
                    if(imgHeight > marginTopComputeBase) {
                        marginTopComputeBase = imgHeight;
                    }
                    thumbnailDom.find("img").css("margin-top", (marginTopComputeBase / 2) - (imgHeight / 2));
                    previousContainerHeight = containerHeight;
                    // only if flashviewer is not visible
                    if ( self.needFlashViewer() ) {
                        pagerImgDom.click( function(e) {
                            self.showInFlashViewer( imageId );
                            e.preventDefault();
                        });
                    }

                    loadCount++;
                    loaded(loadCount);

                    model.fetchSource(function( source ) {
                            //debugger;
                            console.log("loaded image id " + imageId );
                            var fullSrc = source.get("src");
                            if(fullSrc) {
                                var imgDom = $("#main-photo img[data-id=" + imageId + "]");
                                imgDom.attr("src", fullSrc);
                            }
                        }
                    );

                    // Image loading optimizations are temporarily removed.
                    // We need to see whether we should dig dip into this.
                    // Issue being the size computation & pager not firing
                    // proper queue processing.
//                    sourceToProcessQueue.push( function() {
//                        model.fetchSource( function( source ) {
//                            debugger;
//                            console.log("loaded image id " + imageId );
//                            var fullSrc = source.get("src");
//                            var imgDom = $("#main-photo img[data-id=" + imageId + "]");
//                            imgDom.attr("src", fullSrc);
//                            imgDom.attr("width", thumbImage.get("width") * 1.5);
//                            imgDom.attr("height", thumbImage.get("height") * 1.5);
//                            // center image -- note maybe this can be done pure css??
//                            var containerHeight = $("#main-photo").css("height").replace('px','');
//                            var containerWidth = $("#main-photo").css("width").replace('px','');
//                            var imgWidth = imgDom.css("width").replace('px','');
//                            var imgHeight = imgDom.css("height").replace('px','');
//                            var deltaWidth = containerWidth - imgWidth;
//                            var deltaHeight = containerHeight - imgHeight;
//                            imgDom.css("margin-left", deltaWidth);
//                            imgDom.css("margin-top", (deltaHeight/2));
//
//                            // if NOT need flash then we want to show
//                            // the full image in the slideshow area
//                            if ( !self.needFlashViewer() ) {
//                                imgDom.show();
//                            }
//                        });
//                    });
                });

                count++;
            }, count * 250 );

        });


        return this.el;
    },

    needFlashViewer: function() {
        // flashviewer is needed if IE and less than IE9
        return ($.browser.msie && $.browser.version < 9)
    }

});
