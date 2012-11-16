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

gadgets.util.registerOnLoadHandler(function() {

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
