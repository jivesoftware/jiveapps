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

function ImageProcessor() {

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
            var grayscale = pix[i] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
            pix[i] = grayscale;
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

        return canvas.toDataURL("image/jpeg");
    };

    var getPreviewImage = function(image) {
        var effect = $('input[name=effect]:checked').val();
        var croping = $('input[name=croping]:checked').val();
        var dimensions = getDimensions(250, 90, image.width, image.height );

        return {
            width: dimensions.width,
            height: dimensions.height,
            url: mkImage(image, dimensions.width, dimensions.height, effect, croping )
        };
    };

    var getSourceImage = function(image) {
        var effect = $('input[name=effect]:checked').val();
        var croping = $('input[name=croping]:checked').val();
        var dimensions = getDimensions(450, 450, image.width, image.height );

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

    var readFile = function(file, startedCallback) {
        if( (/image/i).test(file.type) ) {
            //define FileReader object
            var reader = new FileReader();
            var deferred = $.Deferred();

            startedCallback( file );

            //init reader onload event handlers
            reader.onload = function(e) {
                $('<img/>')
                    .load(function() {
                        //when image fully loaded
                        var thumb = getPreviewImage(this);
                        var full = getSourceImage(this);

                        var imgData = {};
                        imgData.imageId = randomNum();
                        imgData.thumbSrc = thumb.url;
                        imgData.fullSrc = full.url;
                        imgData.imageWidth = full.width;
                        imgData.imageHeight = full.height;
                        imgData.fileName = file.name.substr(0, file.name.lastIndexOf('.')); //subtract file extension
                        imgData.fileOriSize = convertToKBytes(file.size);
                        imgData.fileUploadSize = convertToKBytes(dataURItoBlob(thumb.url).size); //convert new image URL to blob to get file.size

                        deferred.resolve( file, imgData );
                    })
                    .attr('src', e.target.result);
            };

            //begin reader read operation
            reader.readAsDataURL(file);
        } else {
            //some message for wrong file format
            deferred.reject(file, '*Selected file format not supported!');
        }

        return deferred.promise();
    };

    return {
        readFile: readFile,
        buildImage: buildImage
    };

}
