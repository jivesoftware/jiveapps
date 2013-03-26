window.GalleryEditView = Backbone.View.extend({

    didNotChangeImages: true,

    events:{
        "click  #uploadbtn"             : "triggerUpload",
        "click  #link_save"             : "saveGallery",
        "click  #link_cancel"           : "cancelEdit",
        "click  #gallery_title"         : "selectText",
        "change #upload"                : "uploadFiles",
        "drop .j-draganddrop"           : "uploadFiles",
        "click .green.addmore": "triggerUpload"
    },

    initialize:function (options) {
        this.render();
        this.imageProcessor = new ImageProcessor();
        this.preventDefaultDropBehavior();
    },

    render:function () {
        var dom = $(this.el);
        var resultDom = dom.find("#result");

        var base = gadgets.util.getUrlParameters()['url'];
        base = base.substring(0, base.lastIndexOf('/')) + '/';

        dom.html(_.template(this.options.container.getTemplate('#GalleryEdit'), {
            spinnerSource: base + "/images/loading-images.gif"
        }));

        this.addDropEvents();
    },

    deactivateIE: function() {
        var dom = $(this.el);
        var ieUploadButton = dom.find("#ieUpload");
        ieUploadButton.hide();
    },

    setupIE: function() {
        var dom = $(this.el);
        var ieUploadButton = dom.find("#ieUpload");

        dom.find("#upload-files").hide();

        var base = gadgets.util.getUrlParameters()["url"].replace("/app.xml", "");
        var imageTo64 = gadgets.io.getProxyUrl(base + "/flashupload/bin/flashupload.swf?cachebust=" + Math.random());
        var expressInstall = gadgets.io.getProxyUrl(base + "/flashupload/expressInstall.swf");
        var version = "10.0.0";

        $.fn.addFlashUpload = function() {
            return this.each(function() {
                var $this = $(this);
                var uploadId = "flashUpload-" + $.fn.addFlashUpload.id++;
                var width = $this.outerWidth();
                var height = $this.outerHeight();
                var position = $this.css("position");

                // this span will get replaced by the Flash content
                $this.attr("data-uploadid", uploadId).append('<span id="' + uploadId + '"></span>');

                // be sure the parent (button) has relative/absolute positioning so that our Flash can sit on top
                if (position !== "absolute" && position !== "relative") {
                    $this.css("position", "relative");
                }

                // pass in the uploadId to the Flash for it to pass back out on upload
                var flashvars = {
                    uploadId: uploadId
                };

                // make transparent and able to access JavaScript
                var params = {
                    wmode: "transparent",
                    allowscriptaccess: "always"
                };

                // position over the top of the button the Flash is inside of
                var attributes = {
                    style: "position: absolute; z-index: 100; left: 0; right: 0; top: 0; bottom: 0;"
                };

                // embed the Flash
                swfobject.embedSWF(imageTo64, uploadId, width, height, version, expressInstall, flashvars, params, attributes);
            });
        };
        $.fn.addFlashUpload.id = 1;


        // handle the uploads and use jQuery's events to notify listeners of this button's upload
        window.processBase64Encodings = function( fileName, fileData, uploadId ) {
            $( "[data-uploadid=" + uploadId + "]" ).trigger( "upload", [ fileName, fileData ] );
        };

        // Handle IE upload button
        var self = this;
        ieUploadButton.addFlashUpload().bind( "upload", function( event, fileName, fileData ) {
            var mime = fileName.split(".").pop();
            mime = mime.toLowerCase();
            if (mime === "jpg") {
                mime = "jpeg";
            }

            var container = self.options.container;
            var successCallback = function(imgData ) {
                var galleryEntryView = new GalleryEntryView({ container: container });
                var imgDom = galleryEntryView.render(imgData);

                // Hide IE Upload Button
                var dom = $(self.el);
                ieUploadButton.hide();

                imgDom.prependTo("#result")
                    .hide()
                    .css({ 'z-index':self.zindex++ })
                    .show();

                self.setupDropEvents();
                $(".imagesAdded-addmore").show(); // show add more in the right column
                $("#link_save").show();
                $("#link_save").prop("disabled", false);
            };
            self.imageProcessor.buildImage( fileName,  "data:image/" + mime + ";base64," + fileData, successCallback );
        });
    },

    renderGallery: function( gallery ) {
        var dom = $(this.el);

        var title = gallery.get("title");
        title = this.getSafeTitle(title);
        dom.find("#gallery_title").val(title);
        dom.find('#gallery_title').select();

        // load images
        var ids = gallery.get("imgIDs");
        if(ids.length) {
            $("#dnd-blurb", dom).hide(); // hide upload button from d-n-d area
            $(".imagesAdded-addmore", dom).show();
            $("#link_save").prop("disabled", false);
        }
        else {
            $("#dnd-blurb", dom).show(); // show upload button from d-n-d area
            $(".imagesAdded-addmore", dom).hide();
        }

        if ( !ids || ids.length < 1 ) {
            // nothing else to do if there are no images
            return;
        }

        console.log("Prepping image id manifest", ids);

        var galleryEntryMap = {};
        var container = this.options.container;

        // pre-seed the gallery entry doms
        $.each( ids, function(index) {
            if(index == 30) {
                osapi.jive.core.container.sendNotification({message: 'You can have only 30 images per album.', severity: 'error'});
            }

            if(index > 29) {
                return;
            }
            var imageId = this;

            var model = new GalleryEntry({id: imageId});
            var view = new GalleryEntryView({model: model, container: container });
            galleryEntryMap[imageId] = { view: view, model: model };

            var entryDom = view.render();
            dom.find("#result").append( entryDom );
        });

        // now load
        $.each( ids, function(index) {
            if(index > 29) {
                return;
            }
            var imageId = this;
            console.log("loading image id " + imageId );

            var galleryEntry = galleryEntryMap[imageId];

            var model = galleryEntry.model;
            var view =  galleryEntry.view;

            model.bind("fetchedThumbnail", function(thumbImage) {
                view.renderThumbnail(thumbImage);
            });

            model.bind("fetchedFullSource", function(fullImage) {
                view.attachFullImageSource(fullImage);
            });

            model.fetch();
        });


        this.setupDropEvents();

    },

    setupDropEvents: function() {
        var that = this;

        $(this.el).find("#result").sortable(
            {
                tolerance: "pointer",
                opacity: 0.8
            }).disableSelection();

//        $(this.el).find("#trashcan_img").droppable({
//            accept: "#result img",
//            tolerance: "touch",
//            drop: function(event, ui) {
//                //remove image from the DOM. Upon saving it will be removed
//                ui.draggable.remove();
//                $(that.el).find("#trashcan_img_active").hide();
//                $(that.el).find("#trashcan_img").show();
//            },
//            activate: function(event, ui) {
//                $(that.el).find("#trashcan_img").hide();
//                $(that.el).find("#trashcan_img_active").show();
//            },
//            deactivate: function(event, ui) {
//                $(that.el).find("#trashcan_img_active").hide();
//                $(that.el).find("#trashcan_img").show();
//            }
//
//        });


    },

    triggerUpload: function(event) {
        $("#upload").click();
        event.preventDefault();
    },

    saveGallery: function() {
        var self = this;
        var dom = $(this.el);
        var gallery = this.model;

        var images = dom.find("#result img");
        if ( images.length < 1 ) {
            console.log("Nothing to save");
            osapi.jive.core.container.sendNotification({message: 'Please upload at least one image to save this album.', severity: 'info'});

            return;
        }

        var galleryList = this.options.listModel;
        // todo if (galleryList.titleExists(gallery)) ... show warning about duplicate title

        $('#link_save').prop('disabled', true);

        //First pass, generate new IDs, set -1 if it didn't have one already (new image)
        var imageIDs = [];
        $.each( images, function() {
            var image = $(this);
            var imageID = image.attr("data-id") || -1; //-1 means we need to gen a new ID

            imageIDs.push(imageID);
        });

        //Second pass--generate random IDs, checking that they don't exist already.
        for (var i = 0; i < imageIDs.length; i++) {
            if (imageIDs[i] === -1) {
                do {
                    var newId = randomNum();
                } while (imageIDs.indexOf(newId) >= 0);
                imageIDs[i] = newId;
            }
        }


        // save gallery images first
        var container = this.options.container;
        this.saveGalleryImages( images, imageIDs, function() {
            var title = dom.find("#gallery_title").val();
            title = self.getSafeTitle(title);
            var previewView = new GalleryPreviewView({ container: container });

            var onloadPromises = $.map( images, function(img) {
                var i = $(img);
                var t = $("<img>").attr("src", i.attr("data-fullsrc"));
                $("#secret").append(t);

                var deferred = $.Deferred(),
                    timeout = setTimeout(deferred.resolve, 1500);
                t.on('load', function() {
                    clearTimeout(timeout);
                    deferred.resolve();
                });
                return deferred.promise();
            });

            $.when.apply($, onloadPromises).done(function() {

                previewView.generatePreview($("#secret"), title, images.length).done(function(previewSrc) {

                    gallery.set( {
                        "title": title,
                        "imgIDs": imageIDs,
                        "preview": previewSrc
                    } );

                    // tell the gallery model to save itself
                    gallery.save();

                });

            });
        });
    },

    saveGalleryImages: function(images, imageIDs, successCallback) {
        var savedCount = 0;
        var destroyCount = 0;
        var gallery = this.model;
        var oldIDs = gallery.get('imgIDs') == "" ? [] : gallery.get('imgIDs');

        //figure out difference between oldIDs and imageIDs in DOM (previous gallery state vs. new state)
        var toDelete = [];
        var toUpload = [];
        var that = this;

        //Go through the new IDs, and mark for upload if they're not in the old IDs
        $.each(imageIDs, function(index, imgId) {
            if (oldIDs.indexOf(imgId) < 0) {
                toUpload.push(
                    {
                        id: imgId,
                        dom: $(that.el).find("#result").find("[data-id=" + imgId + "]")[0]
                    }); //place new ID (may be generated) and img element in array
            }
        });

        //Go through the old IDs, and mark for deletion if they're not in the new IDs
        $.each(oldIDs, function(index, imgId) {
            if (imageIDs.indexOf(imgId) < 0 ) {
                toDelete.push({ id: imgId }); //for deleting, just push ID
            }
        });

        //Callback so that images are deleted sequentially after saving.
        var deleteImagesAfterSaving = function() {
            if (toDelete.length == 0) {
                successCallback();
            }
            $.each( toDelete, function(index, value) {
                destroyCount++;

                var data = {
                    imageId : value.id
                };

                var callback = function( theID ) {
                    console.log("Destroyed image id " + theID + " source");
                };

                var galleryEntryModel = new GalleryEntry();
                galleryEntryModel.destroy( data, callback );
                if ( destroyCount == toDelete.length ) {
                    console.log("Done destroying " + destroyCount);
                    successCallback();
                }
            })
        };

        if (toUpload.length == 0) { //Don't make a save request if there are no images to upload
            deleteImagesAfterSaving();
        } else {
            var count = 0;
            $.each( toUpload, function(index, value) {
                var image = $(value.dom);

                var data = {
                    previewSrc: image.attr("src"),
                    fullSrc : image.attr("data-fullsrc"),
                    width : image.attr("data-width"),
                    height : image.attr("data-height"),
                    imageId : value.id
                };

                var callback = function( imageId ) {
                    console.log("Saved image id " + imageId + " source");
                    savedCount++;

                    if ( savedCount == toUpload.length) {
                        console.log("Done saving " + savedCount);
                        deleteImagesAfterSaving();
                    }
                };

                window.setTimeout( function() {
                    var galleryEntryModel = new GalleryEntry();
                    galleryEntryModel.save( data, callback ); //Callback = delete imgs in toDelete
                }, count * 0 ); // change 0 to some value to throttle requests
            });
        }

    },

    cancelEdit: function() {
        Backbone.history.navigate('gallery-edit-cancel', true);
    },

    uploadFiles: function(event) {
        var self = this;
        if (event.originalEvent && event.originalEvent.dataTransfer && event.originalEvent.dataTransfer.files) {
            event.preventDefault();
            var files = event.originalEvent.dataTransfer.files;
        } else {
            var files = event.target.files;
        }
        this.didNotChangeImages = false;

        var startedCallback = function(file) {
            $("#link_save").prop('disabled', true);
            $("#dnd-blurb").hide(); // hide upload button from d-n-d area
            self.showSpinner();
        };


        var html  = "<div class=\"ui-progress-bar\" id=\"progress_bar\" style=\"\">"
            + "<div class=\"ui-progress\" style=\"width: 50%;\"></div>"
            + "</div>";

        $(html).prependTo("#result");

        var allDoneCallback = function() {
            $("#progress_bar").remove();

            self.setupDropEvents();
            $(".imagesAdded-addmore").show(); // show add more in the right column
            $("#link_save").prop('disabled', false);

            self.hideSpinner();
        };

        var successCallback = function(file, imgData) {
            var galleryEntryView = new GalleryEntryView({ container: self.options.container });
            var imgDom = galleryEntryView.render(imgData);

            //Do not add files more than 30
            if($("#result .result_img").length > 30) {
                return;
            }
            imgDom.prependTo("#result")
                .hide()
                .css({ 'z-index':self.zindex++ })
                .show();
        };

        var errorCallback = function(file, error) {
            alert(error);
        };

        var promises;

        if(files && typeof FileReader !== "undefined") {
            //process each files only if browser is supported
            if($("#result .result_img").length + files.length > 30) {
                osapi.jive.core.container.sendNotification({message: 'You can have only 30 images per album.', severity: 'error'});
                return;
            }
            promises = $.map(files, function(file) {
                return self.imageProcessor.readFile(
                    file,
                    startedCallback
                ).then(successCallback, errorCallback);
            });
            $.when.apply($, promises).done(allDoneCallback);
        } else {
            // hmm??
            // xxx todo -- a good error!
        }
    },

    selectText: function(event) {
        event.currentTarget.select();
        $(event.currentTarget).unbind('click');
    },

    prettyDate: function(date) {

        function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }

        //It makes me cry that this isn't provided by javascript
        function getPrettyMonth(m) {
            switch (m) {
            case 0: return "Jan.";
            case 1: return "Feb.";
            case 2: return "Mar.";
            case 3: return "Apr.";
            case 4: return "May";
            case 5: return "June";
            case 6: return "July";
            case 7: return "Aug.";
            case 8: return "Sep.";
            case 9: return "Oct.";
            case 10: return "Nov.";
            case 11: return "Dec.";
            }
            return ""; //fail
        }

        function getPrettyTime(h, m) {
            return ( (h % 12 == 0) ? "12" : ( h  % 12 ) ) + ":" + pad(m) + (h < 12 ? " AM" : " PM");
        }

        return getPrettyMonth(date.getMonth())
            + ' ' + date.getDate()
            + ', ' + date.getFullYear()
            + ' ' + getPrettyTime( date.getHours(), date.getMinutes());
    },

    showSpinner: function() {
        $('.j-loading-images').show();
    },

    hideSpinner: function() {
        $('.j-loading-images').hide();
    },
    
    getSafeTitle: function(value) {
        value = $.trim(value);
        value = $('<div/>').text(value).html(); // escapes html tags, etc.
        
        if (!value) {
        	value = this.prettyDate(new Date());
        }
        
        return value;
    },

    // Prevent the page location from changing to a dropped file
    // when a file is dropped anywhere on the page.  This should
    // help to prevent confusion when a user tries to drop
    // a file on an element that is not actually a file drop
    // target.
    preventDefaultDropBehavior: function() {
        $(document)
        .on('dragover', function(event) {
            var onFileInput = event.target && event.target.type === 'file';

            if (!onFileInput) {
                event.preventDefault();
                event.stopPropagation();
            }
        })
        .on('drop', function(event) {
            var dt = event.originalEvent.dataTransfer
              , files = dt && dt.files && dt.files.length > 0
              , onFileInput = event.target && event.target.type === 'file';

            if (files && !onFileInput) {
              event.preventDefault();
            }
        });
    },

    addDropEvents: function() {
        var view = this, $elem = $(this.el), target = '.j-draganddrop';

        $elem
        .on('dragenter', target, function(event) {
            // IE10 requires a preventDefault() call here to make
            // $target a drop target.
            // http://blogs.msdn.com/b/ie/archive/2011/07/27/html5-drag-and-drop-in-ie10-ppb2.aspx
            event.preventDefault();
        })
        .on('dragleave', target, function() {
            $(this).removeClass('j-drag-over');
        })
        .on('dragover', target, function(event) {
            // Allows dragged elements to be dropped here.  Not all
            // browsers require stopPropagation() to be called; but
            // apparently some do.
            // http://www.html5rocks.com/en/tutorials/dnd/basics/
            event.preventDefault();
            event.stopPropagation();

            // Setting a class on 'dragover' seems to be more
            // reliable than using the 'dragenter' event.
            $(this).addClass('j-drag-over');
            event.originalEvent.dataTransfer.dropEffect = 'copy';
        });
        //.on('drop', target, function(event) {
        //    event.preventDefault();

        //    var files = event.originalEvent.dataTransfer.files;

        //    if (files.length >= 1) {
        //        view.select(files);
        //    }
        //});
    }

});
