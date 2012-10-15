/*
 * Copyright 2012, Jive Software Inc.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

window.GalleryList = Backbone.Model.extend({
    defaults: {
        galleryIDs: []
    },
    useAppData : true,

    appDataKey: function() {
        return "gallery_list";
    },

    appDataFields:function () {
        return ["gallery_list"];
    },

    initialize: function() {
    },

    parse:function(content) {
        //there should be only one user
        for (var userId in content) {

            //there should be only one data
            for (var dataId in content[userId]) {
                if (dataId && dataId.indexOf('gallery_list') == 0) {
                    var content = JSON.parse(content[userId][dataId]);
                    this.set('galleryIDs', content.galleryIDs);
                }
            }
        }

        //// ????
        for(var i in content) {
            this.set(i, content[i]);
        }

        this.trigger("parsed", this.get("galleryIDs") );
    },

    add: function( galleryID ) {
        var ids = this.get("galleryIDs");
        console.log("current", ids);
        if ( $.inArray(galleryID, ids) < 0 ) {
            ids.push( galleryID );
        }
        console.log("after", ids);
    },

    subtract: function( galleryID ) {
        var ids = this.get("galleryIDs");
        ids.splice(ids.indexOf(galleryID), 1);
    }

});
;window.GalleryModel = Backbone.Model.extend({
    defaults: {
        title: '',
        imgIDs: '',
        preview: '',
        created: 0,
        parentList: null
    },
    useAppData : true,

    appDataKey: function() {
        if(this.isNew()) {
            var create_ts = new Date().getTime();
            return $.trim( "gallery_" + create_ts );
        } else {
            return this.get('id');
        }
    },

    appDataFields:function () {
        return [this.get('id')];
    },

    initialize: function() {
    },

    parse:function(content) {
        //there should be only one user
        for (var userId in content) {

            //there should be only one data
            for (var dataId in content[userId]) {
                if (dataId && dataId.indexOf('gallery_') == 0) {
                    var content = JSON.parse(content[userId][dataId]);

                    this.set('id', dataId);
                    this.set('title', content.title);
                    this.set('imageIDs', content.imageIDs);
                    this.set('preview', content.preview);
                    this.set('created', content.created);
                }
            }
        }

        //// ????
        for(var i in content) {
            this.set(i, content[i]);
        }

        this.trigger("parsed", this );
    },

    save: function(key, value, options) {
        if( this.isNew() ) {
            this.set('created', new Date().getTime());
        }
        //super call
        Backbone.Model.prototype.save.call(this, key, value, options);
    },

    destroy: function(passedData, callback) {
        
        var imgs = (this.get('imgIDs') == '' ? [] : this.get('imgIDs') );
        //Delete each image that was in the gallery.
        $.each(imgs, function(index, val) {
            var data = {imageId: val};
            var galleryEntryModel = new GalleryEntry();
            galleryEntryModel.destroy( data, function() {
                console.log("Destroyed image '" + val + "' in GalleryModel.destroy");
            });
        });

        Backbone.Model.prototype.destroy.call(this);
    }


});
;window.GalleryEntry = Backbone.Model.extend({
    initialize: function() {
    },

    fetch:function() {
        // override fetch to delegate to submodels for thumb and full source
        this.fetchThumb();
        this.fetchSource();
    },

    fetchThumb: function( callback ) {
        var imageId = this.get("id");
        var thumb = new GalleryImage({id:"thumb_"+ imageId});
        var self = this;

        thumb.bind("parsed", function( thumbImage ) {
            self.trigger("fetchedThumbnail", thumbImage );
            if ( callback ) {
                callback( thumbImage );
            }
        });

        thumb.fetch();
    },

    fetchSource: function(callback) {
        var imageId = this.get("id");
        var full = new GalleryImage({id:"image_"+ imageId});
        var self = this;

        full.bind("parsed", function( fullImage ) {
            self.trigger("fetchedFullSource", fullImage );
            if ( callback ) {
                callback( fullImage );
            }
        });

        full.fetch();
    },

    save: function( data, callback ) {

        // cascading save (thumbnail first, full image next)

        var thumb = new GalleryImage();
        thumb.set( {
            "id" :  "thumb_" + data.imageId,
            "src": data.previewSrc,
            "width": data.width,
            "height": data.height
        } );

        var onThumbSave = function () {
            var fullImage = new GalleryImage();
            fullImage.set( {
                "id" :  "image_" + data.imageId,
                "src": data.fullSrc,
                "width": data.width,
                "height": data.height
            } );

            fullImage.bind("saved", function() {
                callback( data.imageId );
            });

            fullImage.save();
        };

        thumb.bind("saved", onThumbSave );
        thumb.save();

    },

    destroy: function( data, callback ) {

        // cascading save (thumbnail first, full image next)

        var thumb = new GalleryImage();
        thumb.set( {
            "id" :  "thumb_" + data.imageId,
            "src": data.previewSrc,
            "width": data.width,
            "height": data.height
        } );

        var fullImage = new GalleryImage();
        fullImage.set( {
            "id" :  "image_" + data.imageId,
            "src": data.fullSrc,
            "width": data.width,
            "height": data.height
        } );

        var onThumbDestroy = function () {
            fullImage.destroy();
        };

        thumb.bind("destroy", onThumbDestroy );
        fullImage.bind("saved", function() {
            callback( data.imageId );
        });

        thumb.destroy();

    }
});;window.GalleryImage = Backbone.Model.extend({
    defaults: {
        width: '',
        height: 0,
        src: '',
        created: 0
    },
    useAppData : true,

    appDataKey: function() {
        return this.get('id');
    },

    getImageKey: function() {
        return this.get('id');
    },

    appDataFields:function () {
        return [this.get('id')];
    },

    initialize: function() {
    },

    parse:function(content) {
        //there should be only one user
        for (var userId in content) {

            //there should be only one data
            for (var dataId in content[userId]) {
                if (dataId && dataId.indexOf( this.getImageKey() ) == 0) {
                    var content = JSON.parse(content[userId][dataId]);

                    this.set('id', dataId);
                    this.set('width', content.width);
                    this.set('height', content.height);
                    this.set('src', content.src);
                    this.set('created', content.created);
                }
            }
        }

        //// ????
        for(var i in content) {
            this.set(i, content[i]);
        }

        this.trigger("parsed", this );
    },

    save: function(key, value, options) {
        if( this.isNew() ) {
            this.set('created', new Date().getTime());
        }
        //super call
        Backbone.Model.prototype.save.call(this, key, value, options);
    },

    destroy: function(key, value, options) {
        Backbone.Model.prototype.destroy.call(this, key, value, options);

    }
});
;function ImageProcessor() {

    // private

    var imgWidth = 90,
        imgHeight = 90,
        zindex = 0;

    var getDimensions = function(maxWidth, maxHeight, width, height ) {
        var neww, newh = 0;
        var rw = width / maxWidth; // width and height are maximum thumbnail's bounds
        var rh = height / maxHeight;

        if (rw > rh)
        {
            newh = height / rw;
            neww = maxWidth;
        }
        else
        {
            neww = width / rh;
            newh = maxHeight;
        }

        return {
            width: neww,
            height: newh
        };
    };

    var compareWidthHeight = function (width, height) {
        var diff = [];
        if(width > height) {
            diff[0] = width - height;
            diff[1] = 0;
        } else {
            diff[0] = 0;
            diff[1] = height - width;
        }
        return diff;
    };

    //Black & White image effect
    //by Marco Lisci - http://badsharkco.com/
    var grayscale = function(context) {
        var imgd = context.getImageData(0, 0, imgWidth, imgHeight);
        var pix = imgd.data;
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var grayscale = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
            pix[i  ] = grayscale;
            pix[i+1] = grayscale;
            pix[i+2] = grayscale;
        }
        context.putImageData(imgd, 0, 0);
    };

    //canvas-blur effect
    //by Matt Riggott - http://www.flother.com/
    var blurry = function(context, image, diff) {
        var i, x, y,
            blureffect = 4;

        context.globalAlpha = 0.1;
        for (i = 1; i <= blureffect; i++) {
            for (y = -blureffect/2; y <= blureffect/2; y++) {
                for (x = -blureffect/2; x <= blureffect/2; x++) {
                    context.drawImage(image, diff[0]/2, diff[1]/2, image.width-diff[0], image.height-diff[1], x, y, imgWidth, imgHeight);
                }
            }
        }
        context.globalAlpha = 1.0;
    };

    var addNoise = function(ctx, alpha) {
        var imageData = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
        var pixels = imageData.data;
        var alpha1 = 1 - alpha;

        // Pick the best array length
        var rl = Math.round(ctx.canvas.width * 3.73);
        var randoms = new Array(rl);

        // Pre-calculate random pixels
        for (var i = 0; i < rl; i++) {
            randoms[i] = Math.random() * alpha + alpha1;
        }

        // Apply random pixels
        for (var i = 0, il = pixels.length; i < il; i += 4) {
            pixels[i] =  (pixels[i] * randoms[i % rl]) | 0;
        }

        ctx.putImageData(imageData, 0, 0);
    };

    var mkImage = function(image, width, height, effect, croping ) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');

        //default resize variable
        var diff = [0, 0];
        if(croping == 'crop') {
            //get resized width and height
            diff = compareWidthHeight(image.width, image.height);
        }

        //draw canvas image
        ctx.drawImage(image, diff[0]/2, diff[1]/2, image.width-diff[0], image.height-diff[1], 0, 0, width, height);

        //addNoise( ctx, 0.2 );
        //apply effects if any
        if(effect == 'grayscale') {
            grayscale(ctx);
        } else if(effect == 'blurry') {
            blurry(ctx, image, diff);
        } else {}

        return canvas.toDataURL("image/jpeg", 0.95);
    };

    var getPreviewImage = function(image) {
        var effect = $('input[name=effect]:checked').val();
        var croping = $('input[name=croping]:checked').val();
        var dimensions = getDimensions(90, 90, image.width, image.height );

        return {
            width: dimensions.width,
            height: dimensions.height,
            url: mkImage(image, dimensions.width, dimensions.height, effect, croping )
        };
    };

    var getSourceImage = function(image) {
        var effect = $('input[name=effect]:checked').val();
        var croping = $('input[name=croping]:checked').val();
        var dimensions = getDimensions(350, 350, image.width, image.height );

        return {
            width: dimensions.width,
            height: dimensions.height,
            url: mkImage(image, dimensions.width, dimensions.height, effect, croping )
        };
    };

    var randomNum = function(maxVal) {
        var maxRandomVal = maxVal ? maxVal : 1000000;

        return Math.floor(Math.random()*maxRandomVal);
    };

    var convertToKBytes = function(number) {
        return (number / 1024).toFixed(1);
    };

    //convert datauri to blob
    var dataURItoBlob = function(dataURI) {
        var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.BlobBuilder;

        //skip if browser doesn't support BlobBuilder object
        if(typeof BlobBuilder === "undefined") {
            $('#err').html('Ops! There have some limited with your browser! <br/>New image produced from canvas can\'t be upload to the server...');
            return dataURI;
        }

        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var bb = new BlobBuilder();
        bb.append(ab);
        return bb.getBlob(mimeString);
    };

    var buildImage = function( fileName, base64, successCallback ) {
        return $('<img/>')
            .load(function() {
                //when image fully loaded
                var thumb = getPreviewImage(this);
                var full = getSourceImage(this);
                console.log(thumb, full);

                var imgData = {};
                imgData.imageId = randomNum();
                imgData.thumbSrc = thumb.url;
                imgData.fullSrc = full.url;
                imgData.imageWidth = full.width;
                imgData.imageHeight = full.height;
                imgData.fileName = fileName.substr(0, fileName.lastIndexOf('.')); //subtract file extension

                if ( successCallback )  {
                    successCallback( imgData );
                }
            })
            .attr('src', base64 );
    };

    var readFile = function(file, startedCallback, successCallback, errorCallback) {
        if( (/image/i).test(file.type) ) {
            //define FileReader object
            var reader = new FileReader();

            startedCallback( file );

            //init reader onload event handlers
            reader.onload = function(e) {
                $('<img/>')
                    .load(function() {
                        //when image fully loaded
                        var thumb = getPreviewImage(this);
                        var full = getSourceImage(this);
                        console.log(thumb, full);

                        var imgData = {};
                        imgData.imageId = randomNum();
                        imgData.thumbSrc = thumb.url;
                        imgData.fullSrc = full.url;
                        imgData.imageWidth = full.width;
                        imgData.imageHeight = full.height;
                        imgData.fileName = file.name.substr(0, file.name.lastIndexOf('.')); //subtract file extension
                        imgData.fileOriSize = convertToKBytes(file.size);
                        imgData.fileUploadSize = convertToKBytes(dataURItoBlob(thumb.url).size); //convert new image URL to blob to get file.size

                        successCallback( file, imgData );
                    })
                    .attr('src', e.target.result);
            };

            //begin reader read operation
            reader.readAsDataURL(file);
        } else {
            //some message for wrong file format
            errorCallback(file, '*Selected file format not supported!');
        }
    };

    return {
        readFile: readFile,
        buildImage: buildImage
    };

};window.GalleryPreviewView = (function() {

    function getImageUrl(relativeUrl, proxied) {
        var gadgetURL = _args()["url"];
        var baseURL= gadgetURL.replace(/[a-zA-Z0-9_]+\.xml(\?.*)?/,"");
        return proxied ? gadgets.io.getProxyUrl(baseURL + relativeUrl) : baseURL + relativeUrl;
    }

    return Backbone.View.extend({
        events:{
        },

        generatePreview:function ( imgContainerDom, title, numImages ) {

            // uses 3 canvases
            function makeStaticSlide(image, $thumbNails, title, numImgs) {
                var playGraphic = new Image();
                playGraphic.src = getImageUrl("images/play-graphic.png", true);
                var embedBgImg = new Image();
                embedBgImg.src = getImageUrl("images/background_wood.jpg", true);

                /////////////////////////////////

                var imgObj = new Image();//necessary to get actual height / width
                imgObj.src = $(image).attr("src");

                var actualWidth = imgObj.width;
                var actualHeight = imgObj.height;
                imgObj = null; //To cleanup data from image.

                var baseHeight = numImgs == 1 ? 240 : 180;
                var baseWidth = 240;
                var imageWidth, imageHeight;

                var ratio = actualWidth / actualHeight;
                if (actualHeight > actualWidth ) {
                    imageHeight = baseHeight;
                    imageWidth = imageHeight * ratio;

                } else {
                    imageWidth = baseWidth;
                    imageHeight = imageWidth * 1/ratio;
                }

                //For the case where we have > 1 image and the width > height, make sure we didn't make the height too large
                //This is needed due to the fact that the above code is for embedding rectangles inside squares, not inside rectangles
                if (imageHeight > baseHeight) {
                    var ratio2 = baseHeight / imageHeight;
                    imageHeight *= ratio2;
                    imageWidth *= ratio2;
                }

                var excessWidth = baseWidth - imageWidth;
                var excessHeight = baseHeight - imageHeight;

                // var imageWidth = 240, imageHeight = numImgs == 1 ? 240 : 180; //if 1 image, expand to fill
                var titleAreaHeight = 40;
                var borderWidth = 10, thumbBorderWidth = 13;
                var thumbWidth = 50, thumbHeight = 50;

                var titleAreaY = Math.max(titleAreaHeight + borderWidth, imageHeight + excessHeight / 2 - titleAreaHeight + borderWidth);

                var topLevelCanvas = $('<canvas></canvas>')[0];
                var thumbnailCanvas = $('<canvas></canvas>')[0];
                var titleCanvas = $('<canvas></canvas>')[0];

                topLevelCanvas.width = baseWidth + 2*borderWidth;
                topLevelCanvas.height = topLevelCanvas.width;

                thumbnailCanvas.width = baseWidth;
                thumbnailCanvas.height = thumbHeight;

                titleCanvas.width = baseWidth;
                titleCanvas.height = titleAreaHeight;

                // draw topLevelCanvas background
                var topLevelContext = topLevelCanvas.getContext('2d');
                topLevelContext.drawImage(embedBgImg, 0, 0, topLevelCanvas.width, topLevelCanvas.height);

                // draw thumbnails
                var thumbnailContext = thumbnailCanvas.getContext('2d');
                var tnLeft = 0;
                $thumbNails.each(function(index, thumbNailImg) {
                    if ( index <=3 ) { //Draw at most 4 images.
                        thumbnailContext.drawImage(thumbNailImg, tnLeft, 0, thumbWidth, thumbHeight);
                        tnLeft += (thumbWidth + thumbBorderWidth);
                    }
                });

                var imageData = thumbnailContext.getImageData(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
                topLevelContext.putImageData(imageData, borderWidth, borderWidth + baseHeight + borderWidth);

                //Draw main image with transparency as specified by Amy
                //Must do it this way, putImageData function doesn't work with transparency

                topLevelContext.globalAlpha=0.8;
                topLevelContext.drawImage(image, borderWidth + excessWidth / 2, borderWidth + excessHeight / 2, imageWidth, imageHeight);

                //Draw transparent title area
                topLevelContext.globalAlpha=0.4;
                topLevelContext.fillStyle="black";
                topLevelContext.fillRect(borderWidth, titleAreaY, baseWidth, titleAreaHeight); //Draw the title bar

                //Draw the title text
                var maxTitleLength = 20;
                var wasAbbreviated = false;
                var oldTitleLen = title.length;
                if (title.length > maxTitleLength) {
                    wasAbbreviated = true;
                }
                title = title.slice(0, Math.min(maxTitleLength, title.length)); //limit to 20 chars.

                if (wasAbbreviated) {
                    title += "...";
                } else {
                    for (var i = 0; i < (maxTitleLength - oldTitleLen); i++)
                        title += " ";
                    title += "   ";
                }

                title += " (" + numImgs +")";

                var fontSize = 14;
                topLevelContext.globalAlpha = 1.0;
                topLevelContext.font = fontSize + "px Georgia";
                topLevelContext.fillStyle="#ffffff";
                topLevelContext.fillText(title, borderWidth*2, titleAreaY + titleAreaHeight/2 + fontSize/2);

                return topLevelCanvas.toDataURL("image/jpeg");
            }

            var firstImg = imgContainerDom.find("img").first();
            return makeStaticSlide(firstImg[0], imgContainerDom.find("img").slice(1), title, numImages);
        },

        generateListEntry:function ( imgContainerDom ) {

            function makeStaticSlide(image) {
                /////////////////////////////////

                var imgObj = new Image();//necessary to get actual height / width
                imgObj.src = $(image).attr("src");

                var actualWidth = imgObj.width;
                var actualHeight = imgObj.height;
                imgObj = null; //To cleanup data from image.

                var baseHeight = 120;
                var baseWidth = 120;
                var imageWidth, imageHeight;

                var ratio = actualWidth / actualHeight;
                if (actualHeight > actualWidth ) {
                    imageHeight = baseHeight;
                    imageWidth = imageHeight * ratio;

                } else {
                    imageWidth = baseWidth;
                    imageHeight = imageWidth/ratio;
                }

                //For the case where we have > 1 image and the width > height, make sure we didn't make the height too large
                //This is needed due to the fact that the above code is for embedding rectangles inside squares, not inside rectangles
                if (imageHeight > baseHeight) {
                    var ratio2 = baseHeight / imageHeight;
                    imageHeight *= ratio2;
                    imageWidth *= ratio2;
                }

                var excessWidth = baseWidth - imageWidth;
                var excessHeight = baseHeight - imageHeight;

                var borderWidth = 10;

                var topLevelCanvas = $('<canvas></canvas>')[0];
                topLevelCanvas.width = baseWidth + 2*borderWidth;
                topLevelCanvas.height = topLevelCanvas.width;

                var rotatedCanvas = $('<canvas></canvas>')[0];
                rotatedCanvas.width = baseWidth + 2*borderWidth;
                rotatedCanvas.height = rotatedCanvas.width;

                var adj = baseHeight * 0.05;

                var rotatedContext = rotatedCanvas.getContext('2d');
                rotatedContext.globalAlpha=0.4;
                rotatedContext.rotate(-0.1);
                rotatedContext.lineWidth = 1;
                rotatedContext.strokeStyle = 'red';
                rotatedContext.rect((borderWidth + excessWidth / 2)-adj, (borderWidth + excessHeight / 2)+adj, imageWidth, imageHeight);
                rotatedContext.drawImage(image, (borderWidth + excessWidth / 2)-adj, (borderWidth + excessHeight / 2)+adj, imageWidth-1, imageHeight-1);
                rotatedContext.stroke();
                rotatedContext.globalAlpha=1.0;

                debugger;
                var imageData = rotatedContext.getImageData(0, 0, rotatedCanvas.width, rotatedCanvas.height);

                // draw topLevelCanvas background
                var topLevelContext = topLevelCanvas.getContext('2d');
                topLevelContext.fillStyle="blue";
                topLevelContext.fillRect(0,0, baseWidth, baseHeight); //Draw the title bar

                topLevelContext.putImageData(imageData, 0,0);
                topLevelContext.drawImage(image, borderWidth + excessWidth / 2, borderWidth + excessHeight / 2, imageWidth, imageHeight);
                topLevelContext.lineWidth = 1;
                topLevelContext.strokeStyle = 'red';
                topLevelContext.rect((borderWidth + excessWidth / 2), (borderWidth + excessHeight / 2), imageWidth, imageHeight);
                topLevelContext.stroke();

                return topLevelCanvas.toDataURL("image/jpeg");
            }

            var firstImg = imgContainerDom.find("img").first();
            return makeStaticSlide(firstImg[0]);
        }

    });
})();;window.GalleryListItemView = Backbone.View.extend({
    events:{
    },

    initialize:function () {
    },

    render:function () {
        var gallery = this.model;

        $(this.el).html(
            $(_.template(this.options.container.getTemplate('#GalleryListItem'), {
                "title" : gallery.get("title"),
                "galleryID" : gallery.get("id"),
                "listSrc" : gallery.get("list")
            } ) )
        );

        return this.el;
    },

    createNewGallery : function() {
        Backbone.history.navigate('gallery-create', true);
        return false;
    }

});
;window.GalleryListView = Backbone.View.extend({
    events:{
        "click #btn_create_an_album"             : "createNewGallery"
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

    renderGallery: function( gallery ) {

        var galleryListItemView = new GalleryListItemView( {model: gallery, container: this.options.container } );
        var galleryListItemDom = galleryListItemView.render();
        $(galleryListItemDom).attr("name", gallery.get('created'));

        var dom = $(this.el);
        var container = dom.find("#listcontent");
        var galleries = dom.find("#listcontent > .j-album-display");

        if (galleries.length <= 0) {
            container.append( galleryListItemDom );
        }
        else { //Insert in order
            var wasInserted = false;
            for (var i = 0; i < galleries.length; i++) {
                if ($(galleries[i]).attr("name") > gallery.get('created')) {
                    $(galleries[i]).before(galleryListItemDom);
                    wasInserted = true;
                    break;
                }
            }
            if (! wasInserted ) {
                container.append(galleryListItemDom);
            }

        }

        return this.el;
    }

});
;window.GalleryEditView = Backbone.View.extend({

    didNotChangeImages: true,

    events:{
        "click  #uploadbtn"             : "triggerUpload",
        "click  #link_save"             : "saveGallery",
        "click  #link_cancel"           : "cancelEdit",
        "change #upload"                : "uploadFiles",
        "drop #result"                  : "uploadFiles"
    },

    initialize:function (options) {
        this.render();
        this.imageProcessor = new ImageProcessor();
    },

    render:function () {
        var dom = $(this.el);
        var resultDom = dom.find("#result");
        dom.html(_.template(this.options.container.getTemplate('#GalleryEdit')));
        resultDom.sortable().disableSelection();
    },

    deactivateIE: function() {
        var dom = $(this.el);
        var ieUploadButton = dom.find("#ieUpload");
        ieUploadButton.hide();
    },

    setupIE: function() {
        debugger;
        var dom = $(this.el);
        var ieUploadButton = dom.find("#ieUpload");

        dom.find("#upload-files").hide();

        var base = gadgets.util.getUrlParameters()["url"].replace("/app.xml", "");
        var imageto46 = gadgets.io.getProxyUrl(base + "/flashupload/bin/flashupload.swf?cachebust=" + Math.random());
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
                swfobject.embedSWF(imageto46, uploadId, width, height, version, expressInstall, flashvars, params, attributes);
            });
        };
        $.fn.addFlashUpload.id = 1;


        // handle the uploads and use jQuery's events to notify listeners of this button's upload
        window.processBase64Encodings = function( fileName, fileData, uploadId ) {
            $( "[data-uploadid=" + uploadId + "]" ).trigger( "upload", [ fileName, fileData ] );
        };

        //
        ieUploadButton.addFlashUpload().bind( "upload", function( event, fileName, fileData ) {
            var mime = fileName.split(".").pop();
            if (mime === "jpg") mime = "jpeg";

            var container = this.options.container;
            var successCallback = function(imgData ) {
                var galleryEntryView = new GalleryEntryView({ container: container });
                var imgDom = galleryEntryView.render(imgData);

                imgDom.prependTo("#result")
                    .hide()
                    .css({ 'z-index':self.zindex++ })
                    .show();

                $("#link_save").show();
            };
            this.imageProcessor.buildImage( fileName,  "data:image/" + mime + ";base64," + fileData, successCallback );
        });
    },

    renderGallery: function( gallery ) {
        var dom = $(this.el);

        var title = gallery.get("title");
        if ( title ) {
            dom.find("#gallery_title").val(title);
        } else {
            dom.find("#gallery_title").val(this.prettyDate(new Date()) );
        }

        // load images
        var ids = gallery.get("imgIDs");

        if ( !ids || ids.length < 1 ) {
            // nothing else to do if there are no images
            return;
        }

        console.log("Prepping image id manifest", ids);

        var galleryEntryMap = {};
        var container = this.options.container;

        // pre-seed the gallery entry doms
        $.each( ids, function() {
            var imageId = this;

            var model = new GalleryEntry({id: imageId});
            var view = new GalleryEntryView({model: model, container: container });
            galleryEntryMap[imageId] = { view: view, model: model };

            var entryDom = view.render();
            dom.find("#result").append( entryDom );
        });

        // now load
        $.each( ids, function() {
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

        var that = this;

        $(this.el).find("#result").sortable();
        $(this.el).find("#result img").draggable();

//        $(this.el).find("#trashcan_img").droppable({
//            //accept: "#result img",
//            tolerance: "touch",
//            drop: function(event, ui) {
//                //remove image from the DOM. Upon saving it will be removed
//                ui.draggable.remove();
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

    triggerUpload: function() {
        $("#upload").click();
    },

    saveGallery: function() {
        var dom = $(this.el);
        var gallery = this.model;

        var images = dom.find("#result img");
        if ( images.length < 1 ) {
            console.log("Nothing to save");
            return;
        }

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
            var previewView = new GalleryPreviewView({ container: container });

            $.each( images, function() {
                var i = $(this);
                var t = $("<img>").attr("src", i.attr("data-fullsrc"));
                $("#secret").append(t);
            });

            window.setTimeout( function() {

                var previewSrc = previewView.generatePreview($("#secret"), title, images.length);
                var listSrc = previewView.generateListEntry($("#secret"));

                gallery.set( {
                    "title": title,
                    "imgIDs": imageIDs,
                    "preview": previewSrc,
                    "list": listSrc
                } );

                // tell the gallery model to save itself
                gallery.save();

            }, 150);
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

                var galleryEntryModel = new GalleryEntry();
                galleryEntryModel.save( data, callback ); //Callback = delete imgs in toDelete
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
            $("#link_save").hide();
        };

        var successCallback = function(file, imgData ) {

            var galleryEntryView = new GalleryEntryView({ container: self.options.container });
            var imgDom = galleryEntryView.render(imgData);

            imgDom.prependTo("#result")
                .hide()
                .css({ 'z-index':self.zindex++ })
                .show();

            $("#link_save").show();
        };

        var errorCallback = function(file, error) {
            alert(error);
        };

        if(files && typeof FileReader !== "undefined") {
            //process each files only if browser is supported
            for(var i=0; i<files.length; i++) {
                this.imageProcessor.readFile(
                    files[i],
                    startedCallback,
                    successCallback,
                    errorCallback
                );
            }
        } else {
            // hmm??
            // xxx todo -- a good error!
            debugger;
        }
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
    }
});
;window.GalleryEntryView = Backbone.View.extend({
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
            this.imgDom = $(this.el).find("img");
        } else {
            // render according to imgData
            this.imgDom = $(_.template(this.options.container.getTemplate('#GalleryEntry'), imgData ));
            $(this.el).html( this.imgDom );
        }

        return this.imgDom;
    },

    renderThumbnail: function( thumb ) {
        var previewSrc = thumb.get("src");
        var width = thumb.get("width");
        var height = thumb.get("height");
        this.imgDom.attr("src", previewSrc);
        this.imgDom.attr("data-width", width);
        this.imgDom.attr("data-height", height);

        return this.imgDom;
    },

    attachFullImageSource: function( fullImage ) {
        var fullSrc = fullImage.get("src");
        this.imgDom.attr("data-fullsrc", fullSrc);
    }

});
;window.GalleryViewer = Backbone.View.extend({
    events:{
        "click  #close"             : "close"
    },

    initialize:function () {
    },

    close: function() {
        osapi.jive.core.container.closeApp();
    },

    render:function () {

        var gallery = this.model;

        var dom = $(this.el);
        dom.html(_.template(this.options.container.getTemplate('#GalleryViewer'), {
            "title": gallery.get("title")
        } ) );

        var ids = gallery.get("imgIDs");

        var sourceToProcessQueue = new Array();
        var loadCount = 0;

        var loaded = function( loadCount) {
            if  ( loadCount < ids.length ) {
                return;
            }
            console.log(loadCount, "versus", ids.length );

            console.log("Loaded " + loadCount++);
            $(".j-loading").hide();
            $(".slideshow").show();

            gadgets.window.adjustWidth();

            $('.slideshow').cycle({
                next : "#next",         // JQuery selector for "next" control
                pause: 1,               // Pause transitions when mouse is over the image
                prev : "#previous",     // JQuery selector for "previous" control
                speed: 100,            // Time to complete a cycle (ms)
                timeout: 5000,           // Time between cycles (ms)
                pager: "#pager",
                pagerAnchorBuilder: function(idx, slide) {
                    // return selector string for existing anchor
                    return '#pager li:eq(' + idx + ') a';
                }

            });

            window.setTimeout( function() {
                $.each( sourceToProcessQueue, function() {
                    var fn = this;
                    fn();
                });
            }, 2000 );

        };


        console.log("Prepping image id manifest", ids);

        var galleryEntryMap = {};

        var containerHeight = dom.find(".slideshow").css("height").replace('px','');
        var containerWidth = dom.find(".slideshow").css("width").replace('px','');

        // pre-seed the gallery entry doms
        var container = this.options.container;
        $.each( ids, function() {
            var imageId = this;

            var model = new GalleryEntry({id: imageId });
            var view = new GalleryEntryView({model: model, container: container });
            galleryEntryMap[imageId] = { view: view, model: model };

            var entryDom = view.render();
            entryDom.hide();
            var thumb  = entryDom.clone().css("width",50).css("height", 50).show();

            dom.find(".slideshow").append( entryDom );



            var li = $("<li></li>");
            var a = $("<a href='#'></a>");

            li.append( a.append(  thumb ) );
            dom.find("#pager").append( li );
        });

        // now load
        $.each( ids, function() {
            var imageId = this;
            console.log("loading image id " + imageId );

            var galleryEntry = galleryEntryMap[imageId];

            var model = galleryEntry.model;
            var view =  galleryEntry.view;

            model.fetchThumb( function(thumbImage) {
                var dom = view.renderThumbnail(thumbImage);

                $("#pager img[data-id=" + imageId + "]")
                    .attr("src", thumbImage.get("src"));

                dom.css("width", thumbImage.get("width") * 1.5 );
                dom.css("height", thumbImage.get("height") * 1.5 );

                var containerHeight = $(".slideshow").css("height").replace('px','');
                var containerWidth = $(".slideshow").css("width").replace('px','');

                var imgWidth = dom.css("width").replace('px','');
                var imgHeight = dom.css("height").replace('px','');
                var deltaWidth = containerWidth - imgWidth;
                var deltaHeight = containerHeight - imgHeight;
                dom.css("margin-left", deltaWidth / 2);
                dom.css("margin-top", deltaHeight / 2);

                loadCount++;
                loaded(loadCount);

                sourceToProcessQueue.push( function() {
                    model.fetchSource( function( source ) {
                        console.log("loaded image id " + imageId );
                        var fullSrc = source.get("src");
                        var imgDom = $(".slideshow img[data-id=" + imageId + "]");
                        imgDom.show();
                        imgDom.attr("src", fullSrc);

                    });
                });
            });
        });


        return this.el;
    }

});;function Container() {
    return {

        mostRecentSize:{ width:0, height:0 },

        props: {},

        appContext: {},

        getValue:function (object, prop) {
            if (!(object && object[prop])) return null;
            return _.isFunction(object[prop]) ? object[prop]() : object[prop];
        },

        sync:function (method, model, options) {
            if (model.useAppData /* && model.appDataKey && model.appDataFields */) {
                // Ensure that we have the appropriate request data.
                if (!options.data && model && (method == 'create' || method == 'update')) {
                    var data = model.toJSON();
                    var key = model.appDataKey();

                    var obj = {};
                    obj[key] = JSON.stringify(data);
                    osapi.appdata.update({
                        data:obj,
                        userId:'@me',
                        escapeType:opensocial.EscapeType.NONE
                    }).execute(function (response) {
                            if (response.error) {
                                console.log("update error", response.error);
                                if (options.error) {
                                    options.error( response.error);
                                }
                            } else {
                                console.log("update response", response);
                                model.set('id', key);
                                if (options.postSuccess) {
                                    options.postSuccess(model);
                                }
                                model.trigger("saved");
                            }
                        });
                } else if (method == 'read') {
                    var payload = {
                        userId:'@me',
                        fields:model.appDataFields(),
                        escapeType:opensocial.EscapeType.NONE
                    };

                    osapi.appdata.get(payload).execute(function (response) {
                        if (response.error) {
                            console.log("fetch error", response.error);
                            if (options.error) {
                                options.error( response.error );
                            }
                        }
                        else {
                            model.parse(response);
                            if (options.postSuccess) {
                                options.postSuccess(model);
                            }
                        }
                    });
                } else if (method == 'delete') {
                    var payload = {
                        keys:model.appDataFields(),
                        userId:'@me'
                    };
                    console.log("to remove", payload);
                    osapi.appdata['delete'](payload).execute(function (response) {
                        if (response.error) {
                            console.log("delete error", response.error);
                            if (options.error) {
                                options.error(response.error);
                            }
                        }
                        else {
                            if (options.postSuccess) {
                                options.postSuccess(model);
                            }
                            model.trigger("deleted");
                        }
                    });
                }
            } else {
                // a call to some resource local to the app?

                var base = gadgets.util.getUrlParameters()['url'];
                base = base.substring(0, base.lastIndexOf('/'));

                var href = base + this.getValue(model, 'url') + "?ts=" + new Date().getTime();
                var payload = { 'href':href, 'format':'json', 'authz':null }; // xxx AUTHZ is unsigned for now!!! REMOVE THIS HACK WHEN GOING AGAINST REAL SERVICE
                if (model.headers) {
                    payload.headers = this.getValue(model, 'headers');
                }
                payload.callback = function (data) {
                    if (data.status == 200 || data.status == 204) {
                        model.parse(data.content);
                        if (options.postSuccess) {
                            options.postSuccess(model, data);
                        }
                    } else {
                        var resp;
                        if (data.content && data.content.jiveFault) {
                            resp = data.content;
                        } else {
                            resp = {"jiveFault":{"stackTrace":"", "errorMessage":data.status, "errorCode":"UNKNOWN_ERROR", "requestId":"", "blocking":false}};
                        }
                        options.error(model, resp);
                    }
                };

                if ((method == "read" && model.postForRead) || method == 'create') {
                    osapi.http.post(payload).execute(payload.callback);
                } else if (method == "read") {
                    osapi.http.get(payload).execute(payload.callback);
                } else {
                    alert('Unsupported method');
                }
            }

        },

        loadExperience:function () {
	        var container = this;
	        $.get(gadgets.io.getProxyUrl(gadgets.util.getUrlParameters()['url'].replace(/(\/app.xml)|(\/gadget.xml)/, '/templates.html')) + "&nocache=1",
		          function(templates) {
		              container.$templates = $(templates);
		              $('body').append(templates);
		              var experience = container.appContext.defaultRoute || 'main';
		              Backbone.history.navigate( experience, true );
		          });
        },

	    getTemplate: function(selector) {
	        return this.$templates.filter(selector).html();
	    },

        httpPost:function (options) {

            var base = gadgets.util.getUrlParameters()['url'];
            base = base.substring(0, base.lastIndexOf('/'));

            var payload = {
                'href':base + this.getValue(options, 'url'),
                'format':'json',
                'authz':'signed'
            };

            if (options.headers) {
                payload.headers = this.getValue(options, 'headers');
            }

            if (options.data) {
                payload.body = JSON.stringify(this.getValue(options, 'data'));
            }

            osapi.http.post(payload).execute(function (data) {
                if (data.status == 200 || data.status == 204) {
                    options.success(data.content);
                } else {
                    var resp;
                    if (data.content && data.content.jiveFault) {
                        resp = data.content;
                    } else {
                        resp = {"jiveFault":{"stackTrace":"", "errorMessage":data.status, "errorCode":"UNKNOWN_ERROR", "requestId":"", "blocking":false}};
                    }
                    //TODO: Generic Error Handling
                    if (options.error) {
                        options.error(resp);
                    }
                }
            });

        },

        httpGet:function (options) {

            var base = gadgets.util.getUrlParameters()['url'];
            base = base.substring(0, base.lastIndexOf('/'));

            var payload = {
                'href':base + this.getValue(options, 'url'),
                'format':'json',
                'authz':'signed'
            };

            if (options.headers) {
                payload.headers = this.getValue(options, 'headers');
            }

            osapi.http.get(payload).execute(function (data) {
                if (data.status == 200 || data.status == 204) {
                    options.success(data.content);
                } else {
                    var resp;
                    if (data.content && data.content.jiveFault) {
                        resp = data.content;
                    } else {
                        resp = {"jiveFault":{"stackTrace":"", "errorMessage":data.status, "errorCode":"UNKNOWN_ERROR", "requestId":"", "blocking":false}};
                    }
                    //TODO: Generic Error Handling
                    if (options.error) {
                        options.error(resp);
                    }
                }
            });

        },

        getProxyUrl:function (url) {
            return gadgets.io.getProxyUrl(url) + "&nocache=" + gadgets.util.getUrlParameters()['nocache'];
        },

        close:function (closeEvents) {
            if (closeEvents) {
                osapi.jive.core.container.closeApp({data:{events:closeEvents}});
            } else {
                osapi.jive.core.container.closeApp();
            }
        },

        getViewerId:function () {
            return opensocial.data.getDataContext().getDataSet('sbsContext').user.userID;
        },

        adjustSize:function () {
            this.adjustWidth();
            this.adjustHeight();
        },

        adjustWidth:function (opt_width) {
            if (gadgets.window.adjustWidth) {
                gadgets.window.adjustWidth(opt_width);
            }
        },

        adjustHeight:function (opt_height) {
            if (gadgets.window.adjustHeight) {
                gadgets.window.adjustHeight(opt_height);
            }
        },

        windowWidthHasChanged:function (opt_width) {

            var thisWidth = parseInt(opt_width || gadgets.window.getWidth(), 0);
            if (thisWidth == this.mostRecentSize.width)
                return false;

            this.mostRecentSize.width = thisWidth;
            return true;

        },

        windowHeightHasChanged:function (opt_height) {

            var thisHeight = parseInt(opt_height || gadgets.window.getHeight(), 0);
            if (thisHeight == this.mostRecentSize.height)
                return false;

            this.mostRecentSize.height = thisHeight;
            return true;

        },

        getUser:function (owner, callback) {
            osapi.people.get({"userId": owner}).execute(callback);
        },

        setProps: function( props ) {
            this.props = props;
        },

        getProps: function() {
            return this.props;
        },

        setAppContext: function( context ) {
            if ( context ) {
                this.appContext = context;
            }
        },

        getAppContext: function() {
            return this.appContext;
        }

    };
}
;window.GalleryController = function(container, viewManager) {

    this.viewManager = viewManager;
    this.container = container;

    this.galleryCreate = function () {
        var galleryModel = new GalleryModel();
        var galleryEditView = new GalleryEditView({model:galleryModel, container: this.container });

        if ( !$.browser.msie ) {
            galleryEditView.deactivateIE();
        }

        this.viewManager.showView(galleryEditView);
        if (  $.browser.msie ) {
            galleryEditView.setupIE();
        }

        galleryModel.bind("saved", function () {

            var galleryID = galleryModel.get("id");
            var galleryListModel = new GalleryList();
            galleryListModel.bind("saved", function () {
                Backbone.history.navigate('gallery-saved/' + galleryID, true);
            });
            galleryListModel.bind("parsed", function () {
                galleryListModel.add(galleryID);
                galleryListModel.save();
            });

            galleryListModel.fetch();
        });

        galleryEditView.renderGallery(galleryModel);
    };

    this.galleryEdit = function (galleryID) {

        var galleryModel = new GalleryModel({id:galleryID});
        var galleryEditView = new GalleryEditView({model:galleryModel, container: this.container });

        if ( !$.browser.msie ) {
            galleryEditView.deactivateIE();
        }

        viewManager.showView(galleryEditView);
        if (  $.browser.msie ) {
            galleryEditView.setupIE();
        }

        galleryModel.bind('parsed', function (gallery) {
            galleryEditView.renderGallery(gallery);
        });

        galleryModel.bind("saved", function () {
            var galleryListModel = new GalleryList();
            galleryListModel.bind("saved", function () {
                Backbone.history.navigate('gallery-saved/' + galleryID, true);
            });
            galleryListModel.bind("parsed", function () {
                galleryListModel.add(galleryID);
                galleryListModel.save();
            });

            galleryListModel.fetch();
        });

        galleryModel.fetch();
    };

    this.galleryDelete = function (galleryID) {
        var galleryModel = new GalleryModel({id:galleryID});
        galleryModel.bind("deleted", function () {
            var galleryListModel = new GalleryList();
            galleryListModel.bind("saved", function () {
                Backbone.history.navigate('main', true);
            });
            galleryListModel.bind("parsed", function () {
                galleryListModel.subtract(galleryID);
                galleryListModel.save();
            });

            galleryListModel.fetch();
        });

        
        galleryModel.fetch( {
            postSuccess: function(model) {
                model.destroy();
            },
            error: function(model, response) {
                console.log("Error fetching Gallery Model to be deleted", response);
            }
        });
    };

    this.galleryDrop = function (galleryID) {
        var model = new GalleryModel({id:galleryID});
        model.fetch({postSuccess:function () {

            // xxxx todo move this

            function getImageUrl(relativeUrl, proxied) {
                var gadgetURL = _args()["url"];
                var baseURL = gadgetURL.replace(/[a-zA-Z0-9_]+\.xml(\?.*)?/, "");
                return proxied ? gadgets.io.getProxyUrl(baseURL + relativeUrl) : baseURL + relativeUrl;
            }

            osapi.jive.corev3.people.get({id:"@me"}).execute(function (result) {
                var id = result.id;
                var outgoing = {
                    display:{
                        "type":"image",
                        "previewImage":getImageUrl("images/1x1.GIF")
                    },
                    target:{
                        "type":"embed",
                        "view":"show",
                        "context":{
                            "galleryID":galleryID
                        }
                    }
                };

                osapi.jive.version.getVersionInfo().execute(function (data) {
                    osapi.jive.core.container.artifacts.create(outgoing, 'com.jivesoftware.inline.gallery.show',
                                                               function (markupResponse) {
                                                                   var artifactMarkup = markupResponse.markup, error = markupResponse.error;
                                                                   var artifactDom = $('<span>' + artifactMarkup + '</span>');
                                                                   artifactDom.find('a').html('<img src="' + model.get("preview") + '"/>');
                                                                   var html = artifactDom.html() + "<div>" + artifactMarkup + "</div>";
                                                                   osapi.jive.core.container.editor().insert(html);
                                                               }, false, true);
                });
            });
        }});


    };

    this.galleryView = function( galleryID ) {

        var gallery = new GalleryModel({id:galleryID});
        var view = new GalleryViewer({model: gallery, container: this.container });

        var viewManager = this.viewManager;
        gallery.bind("parsed", function(gallery) {
            view.render();
            viewManager.showView(view);
        });

        gallery.fetch();
    };

}
;window.GalleryListController = function(container, viewManager) {

    this.viewManager = viewManager;
    this.container = container;

    this.galleryList = function () {
        var galleryListModel = new GalleryList();
        var galleryListView = new GalleryListView({ container: this.container });

        galleryListModel.bind('parsed', function (galleryIDs) {

            if (!galleryIDs || galleryIDs.length < 1) {
                galleryListView.renderNoGalleries();
            }
            else {
                galleryListView.renderGalleries();

                $.each(galleryIDs, function () {
                    var galleryID = this;

                    var gallery = new GalleryModel({id:galleryID});
                    gallery.bind('parsed', function (gallery) {
                        galleryListView.renderGallery(gallery);
                    });

                    gallery.fetch();
                });
            }

        });

        galleryListView.render();
        this.viewManager.showView(galleryListView);

        galleryListModel.fetch();
    }
}
;function Router() {

    var defaultRoutes = {
            'main'                  :         'showMain',
            'gallery-create'        :         'galleryCreate',
            'gallery-edit/:id'      :         'galleryEdit',
            'gallery-edit-cancel'   :         'galleryEditCancel',
            'gallery-delete/:id'    :         'galleryDelete',
            'gallery-drop/:id'      :         'galleryDrop',
            'gallery-select/:id'      :       'galleryDrop',
            'gallery-view/:id'      :         'galleryView',
            'gallery-saved/:id'     :         'gallerySaved',
            'close'                 :         'close',
            '*actions'              :         'defaultAction'
    };

    var container;
    var AppRouter = Backbone.Router.extend({


        showMain:function () {
            this.galleryList();
        },

        galleryList: function() {
            this.galleryListController.galleryList();
        },

        galleryCreate:function () {
            this.galleryController.galleryCreate();
        },

        galleryEdit:function (galleryID) {
            this.galleryController.galleryEdit(galleryID);
        },

        galleryEditCancel:function (galleryID) {
            this.showMain();
        },

        galleryDelete:function (galleryID) {
            this.galleryController.galleryDelete(galleryID);
        },

        gallerySaved:function (galleryID) {
            this.showMain();
        },

        galleryDrop:function (galleryID) {
            this.galleryController.galleryDrop(galleryID);
        },

        galleryView:function(galleryID ) {
            this.galleryController.galleryView(galleryID);
        },

        close: function() {
            osapi.jive.core.container.closeApp();
        },

        defaultAction:function () {
            container.loadExperience();
        }

    });

    var initialize = function (appContainer) {

        var routes = defaultRoutes;
	    container = appContainer;

        // override any routes according to context
        var appContext = container.getAppContext();
        if ( appContext ) {
            var routeOverrides = appContext.routes;
            if ( routeOverrides ) {
                for (var key in routeOverrides) {
                    if (routeOverrides.hasOwnProperty(key)) {
                        var val = routeOverrides[key];
                        if ( val ) {
                            routes[key] = val;
                        }
                    }
                }
            }
        }
        var app_router = new AppRouter( {
            routes: routes
        });

        var viewManager = new ViewManager();
        app_router.galleryListController = new GalleryListController(container, viewManager);
        app_router.galleryController = new GalleryController(container, viewManager);

        Backbone.history.start();
    };

    return {
        initialize:initialize
    };
}
;function App() {

    var container = new Container();
    var initialize = function ( context ) {
        if ( context ) {
            container.setAppContext( context );
        }
        if ( container.initialize) {
            container.initialize();
        }
        var router = new Router();
        router.initialize(container);
    };

    Backbone.sync = function (method, model, options) {
        container.sync(method, model, options);
    };

    Backbone.View.prototype.close = function () {
        this.remove();
        this.unbind();
        if (this.onClose) {
            this.onClose();
        }
    };

    return {
        initialize: initialize,

        getAbsoluteUrl: function(path) {
            return gadgets.util.getUrlParameters()['url'].replace(/(\/app.xml)|(\/gadget.xml)/, path);
        },
            
        getProxiedUrl: function(path) {
            return gadgets.io.getProxyUrl(gadgets.util.getUrlParameters()['url'].replace(/(\/app.xml)|(\/gadget.xml)/, path)) + "&nocache=1";
        }
    };
};var jigPersistence = function( userId ) {

    userId = userId || '@me';

    var fetch = function( fields, success, error ) {
        if ( fields.length < 1 ) {
            var options = {
                userId: userId,
                escapeType: opensocial.EscapeType.NONE
            };
        } else {
            var options = {
                fields : fields,
                userId: userId,
                escapeType: opensocial.EscapeType.NONE
            };
        }

        osapi.appdata.get( options ).execute(function(response) {
            if (response.error) {
                console.log( "fetch error", response.error );
                if ( error ) error();
            }
            else {
                if ( success ) success(response);
            }
        });
    };

    var remove = function( fields, success, error ) {
        var options = {
            keys : fields,
            userId: '@me'
        };
        console.log( "to remove", options );
        osapi.appdata['delete']( options ).execute(function(response) {
            if (response.error) {
                console.log( "delete error", response.error );
                if ( error ) error();
            }
            else {
                if ( success ) success(response);
            }
        });
    };

    var update = function( key, value, success, error ) {
        var obj = {};
        obj[key] = value;
        osapi.appdata.update({
            data : obj,
            userId: '@me',
            escapeType: opensocial.EscapeType.NONE
        }).execute(function(response) {
                if (response.error) {
                    console.log( "update error", response.error );
                    if ( error ) error();
                } else {
                    console.log( "update response", response );
                    if ( success ) success();
                }
            });
    };

    this.save = function ( json, success, key ) {
        update( key || "jig", json, success );
    };

    this.load = function( success, key) {
        fetch( [key], function( response ) {

            // get data for the first user (should be only one anyway)
            var theData;
            for( var user in response ) {
                if(response.hasOwnProperty(user)) {
                    theData = response[user];
                    break;
                }
            }

            for( var id in theData ) {
                console.log( theData );
                if (theData.hasOwnProperty(id) ) {
                    var raw = theData[key || "jig"];
                    if ( raw ) {
                        var json = JSON.parse( raw );
                        success( json );
                        return;
                    }
                }
            }

            success(null);

        });
    };

};
;gadgets.util.registerOnLoadHandler(function() {

    window.app = new App();

    // register a listener for embedded experience context
    opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function (key) {
        var embeddedContext = opensocial.data.getDataContext().getDataSet(key);

        console.log("==== registerListener ====");
        console.log("embedded context:", embeddedContext);

        if (!window.console){console={log:function(s){}}};
        var appContext = {
            embedded: embeddedContext,
            defaultRoute: 'gallery-view/' + embeddedContext.target.context.galleryID
        };
        
        window.app.initialize(appContext);
    });
});
;gadgets.util.registerOnLoadHandler(function() {

    var didNotChangeImages = true;
    var playGraphic = new Image();

    $(document).ready(function() {

        playGraphic.src = app.getProxiedUrl("/images/play-graphic.png");

        /*****************************
         Variables
         *****************************/
        var imgWidth = 90,
            imgHeight = 90,
            zindex = 0;

            dropzone = $('#result'),
            uploadBtn = $('#uploadbtn'),
            defaultUploadBtn = $('#upload');


        /*****************************
         Events Handler
         *****************************/
        dropzone.on('dragover', function() {
            //add hover class when drag over
            dropzone.addClass('hover');
            return false;
        });
        dropzone.on('dragleave', function() {
            //remove hover class when drag out
            dropzone.removeClass('hover');
            return false;
        });
        dropzone.on('drop', function(e) {
            //prevent browser from open the file when drop off
            e.stopPropagation();
            e.preventDefault();
            dropzone.removeClass('hover');

            //retrieve uploaded files data
            var files = e.originalEvent.dataTransfer.files;
            didNotChangeImages = false;
            processFiles(files);

            return false;
        });

        uploadBtn.on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            //trigger default file upload button
            defaultUploadBtn.click();
        });
        defaultUploadBtn.on('change', function() {
            //retrieve selected uploaded files data
            var files = $(this)[0].files;
            didNotChangeImages = false;
            processFiles(files);

            return false;
        });

        $("#link_save").click( saveGallery );
        $("#link_clear").click( clearGallery );
        $("#link_load").click( loadGallery );

        $("#result").sortable();
        $( "#result" ).disableSelection();

        loadGallery();

        /*****************************
         internal functions
         *****************************/

        function clearGallery() {
            didNotChangeImages = false;
            $("#result img").remove();
        }

        function loadGallery() {
            clearGallery();
            didNotChangeImages = true;

            var persistence = new jigPersistence();

            // pre-seed the gallery
            persistence.load( function(ids) {
                console.log("Loaded image id manifest", ids);


                if ( !ids ) {
                    return;
                }

                // pre seed the gallery dom
                $.each( ids.images, function() {
                    var imageId = this;
                    var imgDom = $(document.createElement("img"));
                    imgDom.attr("src","http://apphosting.jivesoftware.com/apps/dev/jigtest/images/ajax_loader_large.gif").attr("data-id", imageId );
                    $("#result").append(imgDom);
                });

                console.log("Loaded image id manifest", ids);

                $.each( ids.images, function() {
                    var imageId = this;
                    console.log("loading image id " + imageId );

                    persistence.load( function( thumb ) {
                        var imgDom = $("#result img[data-id=" + imageId + "]");
                        var previewSrc = thumb.imageSrc;
                        var width = thumb.width;
                        var height = thumb.height;
                        imgDom.attr("src", previewSrc);
                        imgDom.attr("data-width", width);
                        imgDom.attr("data-height", height);

                        // load source now
                        persistence.load( function( source ) {
                            var fullSrc = source.imageSrc;
                            imgDom.attr("data-fullsrc", fullSrc);
                        }, "jig_src_" + imageId );

                    }, "jig_thumb_" + imageId );

                });

            }, "jig_ids" );
        }

        function saveGallery() {
            debugger;
            var images = $("#result").find("img");
            if ( images.length < 1 ) {
                alert("Nothing to save");
                return;
            }


            var persistence = new jigPersistence();
            var savedCount = 0;

            var saveManifest = function() {
                // gather the ids

                var galleryIdsJson = {
                    "images": []
                };

                $.each( images, function() {
                    var image = $(this);
                    var imageId = image.attr("data-id") || randomNum();
                    galleryIdsJson.images.push( imageId );
                });

                persistence.save( galleryIdsJson, function() {
                    console.log("Saved gallery image IDs");
                }, "jig_ids");

            };

            var saved = function() {
                if ( savedCount == images.length ) {
                    saveManifest();

                    alert("Done saving " + savedCount);
                }
            };

            if ( didNotChangeImages ) {
                saveManifest();

                alert("Did not change images, maybe just order. Saving that.");
                // did not change images, only persist the order
                return;
            }

            $.each( images, function() {
                var image = $(this);
                var previewSrc = image.attr("src");
                var fullSrc = image.attr("data-fullsrc");
                var width = image.attr("data-width");
                var height = image.attr("data-height");

                var imageId = image.attr("data-id") || randomNum();

                var thumbJson = {
                    "imageSrc": previewSrc,
                    "width": width,
                    "height": height
                };

                var fullJson = {
                    "imageSrc": fullSrc,
                    "width": width,
                    "height": height
                };

                persistence.save(thumbJson , function() {
                    console.log("Saved image id " + imageId + " thumb");

                    persistence.save(fullJson , function() {
                        console.log("Saved image id " + imageId + " source");
                        savedCount++;
                        saved();
                    }, "jig_src_" + imageId);


                }, "jig_thumb_" + imageId);
            });

        }

            //Bytes to KiloBytes conversion
        function convertToKBytes(number) {
            return (number / 1024).toFixed(1);
        }

        function compareWidthHeight(width, height) {
            var diff = [];
            if(width > height) {
                diff[0] = width - height;
                diff[1] = 0;
            } else {
                diff[0] = 0;
                diff[1] = height - width;
            }
            return diff;
        }

        //convert datauri to blob
        function dataURItoBlob(dataURI) {
            var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.BlobBuilder;

            //skip if browser doesn't support BlobBuilder object
            if(typeof BlobBuilder === "undefined") {
                $('#err').html('Ops! There have some limited with your browser! <br/>New image produced from canvas can\'t be upload to the server...');
                return dataURI;
            }

            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            var bb = new BlobBuilder();
            bb.append(ab);
            return bb.getBlob(mimeString);
        }

        /*****************************
         canvas filter function
         *****************************/
            //Black & White image effect
            //by Marco Lisci - http://badsharkco.com/
        var grayscale = function(context) {
            var imgd = context.getImageData(0, 0, imgWidth, imgHeight);
            var pix = imgd.data;
            for (var i = 0, n = pix.length; i < n; i += 4) {
                var grayscale = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
                pix[i  ] = grayscale;
                pix[i+1] = grayscale;
                pix[i+2] = grayscale;
            }
            context.putImageData(imgd, 0, 0);
        }

        //canvas-blur effect
        //by Matt Riggott - http://www.flother.com/
        var blurry = function(context, image, diff) {
            var i, x, y,
                blureffect = 4;

            context.globalAlpha = 0.1;
            for (i = 1; i <= blureffect; i++) {
                for (y = -blureffect/2; y <= blureffect/2; y++) {
                    for (x = -blureffect/2; x <= blureffect/2; x++) {
                        context.drawImage(image, diff[0]/2, diff[1]/2, image.width-diff[0], image.height-diff[1], x, y, imgWidth, imgHeight);
                    }
                }
            }
            context.globalAlpha = 1.0;
        }



        /*****************************
         Process FileList
         *****************************/
        var processFiles = function(files) {
            if(files && typeof FileReader !== "undefined") {
                //process each files only if browser is supported
                for(var i=0; i<files.length; i++) {
                    readFile(files[i]);
                }
            } else {

            }
        }


        /*****************************
         Read the File Object
         *****************************/
        var readFile = function(file) {
            if( (/image/i).test(file.type) ) {
                //define FileReader object
                var reader = new FileReader();

                $("#link_save").hide();

                //init reader onload event handlers
                reader.onload = function(e) {
                    var image = $('<img/>')
                        .load(function() {
                            //when image fully loaded
                            var preview = getPreviewImage(this);
                            var src = getSourceImage(this);
                            console.log(preview, src);
                            createPreview(file, preview.url, src.url, src.width, src.height );
                        })
                        .attr('src', e.target.result);

                    $("#link_save").show();

                };

                //begin reader read operation
                reader.readAsDataURL(file);

                $('#err').text('');
            } else {
                //some message for wrong file format
                $('#err').text('*Selected file format not supported!');
            }
        }

        var mkImage = function(image, width, height, effect, croping ) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');

            //default resize variable
            var diff = [0, 0];
            if(croping == 'crop') {
                //get resized width and height
                diff = compareWidthHeight(image.width, image.height);
            }

            //draw canvas image
            ctx.drawImage(image, diff[0]/2, diff[1]/2, image.width-diff[0], image.height-diff[1], 0, 0, width, height);

            //apply effects if any
            if(effect == 'grayscale') {
                grayscale(ctx);
            } else if(effect == 'blurry') {
                blurry(ctx, image, diff);
            } else {}

            return canvas.toDataURL("image/jpeg");
        }

        /*****************************
         Get New Canvas Image URL
         *****************************/

        var getDimensions = function(maxWidth, maxHeight, width, height ) {
            var neww, newh = 0;
            var rw = width / maxWidth; // width and height are maximum thumbnail's bounds
            var rh = height / maxHeight;

            if (rw > rh)
            {
                newh = height / rw;
                neww = maxWidth;
            }
            else
            {
                neww = width / rh;
                newh = maxHeight;
            }

            return {
                width: neww,
                height: newh
            };
        }

        var getPreviewImage = function(image) {
            var effect = $('input[name=effect]:checked').val();
            var croping = $('input[name=croping]:checked').val();
            var dimensions = getDimensions(90, 90, image.width, image.height );

            return {
                width: dimensions.width,
                height: dimensions.height,
                url: mkImage(image, dimensions.width, dimensions.height, effect, croping )
            };
        }

        var getSourceImage = function(image) {
            var effect = $('input[name=effect]:checked').val();
            var croping = $('input[name=croping]:checked').val();
            var dimensions = getDimensions(500, 500, image.width, image.height );

            return {
                width: dimensions.width,
                height: dimensions.height,
                url: mkImage(image, dimensions.width, dimensions.height, effect, croping )
            };
        }


        /*****************************
         Draw Image Preview
         *****************************/
        var createPreview = function(file, newURL, srcURL, width, height ) {
            //populate jQuery Template binding object
            var imageObj = {};
            imageObj.imageId = randomNum();
            imageObj.filePath = newURL;
            imageObj.fullSrc = srcURL;
            imageObj.imageWidth = width;
            imageObj.imageHeight = height;
            imageObj.fileName = file.name.substr(0, file.name.lastIndexOf('.')); //subtract file extension
            imageObj.fileOriSize = convertToKBytes(file.size);
            imageObj.fileUploadSize = convertToKBytes(dataURItoBlob(newURL).size); //convert new image URL to blob to get file.size

            //extend filename
            var effect = $('input[name=effect]:checked').val();
            if(effect == 'grayscale') {
                imageObj.fileName += " (Grayscale)";
            } else if(effect == 'blurry') {
                imageObj.fileName += " (Blurry)";
            }

            //append new image through jQuery Template
            var randvalue = Math.floor(Math.random()*31)-15;  //random number
            var img = $("#imageTemplate").tmpl(imageObj).prependTo("#result")
                .hide()
                .css({
                    'z-index': zindex++
                })
                .show();

            if(isNaN(imageObj.fileUploadSize)) {
                $('.imageholder span').last().hide();
            }
        }

        //file upload via original byte sequence
        var processFileInIE = function(file) {

            var imageObj = {};
            var extension = ['jpg', 'jpeg', 'gif', 'png'];
            var filepath = file.value;
            if (filepath) {
                //get file name
                var startIndex = (filepath.indexOf('\\') >= 0 ? filepath.lastIndexOf('\\') : filepath.lastIndexOf('/'));
                var filedetail = filepath.substring(startIndex);
                if (filedetail.indexOf('\\') === 0 || filedetail.indexOf('/') === 0) {
                    filedetail = filedetail.substring(1);
                }
                var filename = filedetail.substr(0, filedetail.lastIndexOf('.'));
                var fileext = filedetail.slice(filedetail.lastIndexOf(".")+1).toLowerCase();

                //check file extension
                if($.inArray(fileext, extension) > -1) {
                    //append using template
                    $('#err').text('');
                    imageObj.filepath = filepath;
                    imageObj.filename = filename;
                    var randvalue = Math.floor(Math.random()*31)-15;
                    $("#imageTemplate").tmpl(imageObj).prependTo( "#result" )
                        .hide()
                        .css({
                            'z-index': zindex++
                        })
                        .show();
                    $('#result').find('figcaption span').hide();
                } else {
                    $('#err').text('*Selected file format not supported!');
                }
            }
        }

    });

    function randomNum(maxVal) {
        var maxRandomVal = maxVal ? maxVal : 1000000;

        return Math.floor(Math.random()*maxRandomVal);
    }

});
;function ViewManager() {
    return {

        showView:function (view) {

            if (!this.currentView || view != this.currentView) {

                if (this.currentView)
                    this.currentView.close();

                this.currentView = view;
                // console.log("view", view.el );
                $("#main-content").html(this.currentView.el);
            }

        }

    };
}