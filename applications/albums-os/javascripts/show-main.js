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



function doLoad( userId ) {

    // do the default stuff
    $(".slideshow").hide();

    var persistence = new jigPersistence(userId);

    // load the image ID manifest
    persistence.load( function(ids) {
        console.log("Loaded image id manifest", ids);

        if ( !ids ) {
            return;
        }

        var sourceToProcessQueue = new Array();
        var loadCount = 0;
        var loaded = function() {
            if  ( loadCount < ids.images.length ) {
                return;
            }

            console.log("Loaded " + loadCount++);
            $(".j-loading").hide();
            $(".slideshow").show();

            gadgets.window.adjustWidth();

            $('.slideshow').cycle({
                fx: 'blindX,blindY,blindZ,shuffle,growX,growY',           // Selected transition style(s)
                next : "#next",         // JQuery selector for "next" control
                //                pager : "#pager",       // Element to contain pager controls
                pause: 1,               // Pause transitions when mouse is over the image
                prev : "#previous",     // JQuery selector for "previous" control
                speed: 1000,            // Time to complete a cycle (ms)
                timeout: 3000           // Time between cycles (ms)
            });

            window.setTimeout( function() {

                $.each( sourceToProcessQueue, function() {
                    var fn = this;
                    fn();
                });
            }, 1000 );

        };

        // build dom shims
        $.each( ids.images, function() {
            var imageId = this;
            var imgDom = $(document.createElement("img"));
            imgDom.attr("src", "http://apphosting.jivesoftware.com/apps/dev/jigtest/images/ajax_loader_large.gif").attr("data-id", imageId);
            $(".slideshow").append(imgDom );
        });

        // populate
        $.each( ids.images, function() {
            var imageId = this;
            console.log("loading image id " + imageId );

            persistence.load( function( thumb ) {
                var imgDom = $(".slideshow img[data-id=" + imageId + "]");
                var previewSrc = thumb.imageSrc;
                var width = thumb.width;
                var height = thumb.height;
                imgDom.attr("src", previewSrc);
                imgDom.css("width", width);
                imgDom.css("height", height);

                loadCount++;
                loaded();

                sourceToProcessQueue.push( function() {
                    // load source now
                    persistence.load( function( source ) {
                        console.log("loaded image id " + imageId );
                        var fullSrc = source.imageSrc;
                        var imgDom = $(".slideshow img[data-id=" + imageId + "]");
                        imgDom.attr("src", fullSrc);

                    }, "jig_src_" + imageId );
                });

            }, "jig_thumb_" + imageId );
        });


    }, "jig_ids" );
}

function getImageUrl(relativeUrl, proxied) {
    var gadgetURL = _args()["url"];
    var baseURL= gadgetURL.replace(/[a-zA-Z0-9_]+\.xml(\?.*)?/,"")
    return proxied ? gadgets.io.getProxyUrl(baseURL + relativeUrl) : baseURL + relativeUrl;
}

function show() {

    window.playGraphic = new Image();
    window.playGraphic.src = getImageUrl("images/play-graphic.png", true);

    // uses 3 canvases
    function makeStaticSlide(image, $thumbNails) {

        var borderWidth = 10;   /* pixels */
        var topLevelCanvas = $('<canvas></canvas>')[0];
        var imageCanvas = $('<canvas></canvas>')[0];
        var thumbnailCanvas = $('<canvas></canvas>')[0];

        var prefs = new gadgets.Prefs();
        topLevelCanvas.width = prefs.getInt('canvas_width');
        topLevelCanvas.height = prefs.getInt('canvas_height');

        imageCanvas.width = topLevelCanvas.width - (borderWidth * 2);
        imageCanvas.height = topLevelCanvas.height - prefs.getInt('thumbnail_height') - (borderWidth * 2);

        thumbnailCanvas.width = topLevelCanvas.width - (borderWidth * 2);
        thumbnailCanvas.height = prefs.getInt('thumbnail_height');

        // draw the main image
        var wd = image.width < imageCanvas.width ? image.width : imageCanvas.width;
        var ht = image.height < imageCanvas.height ? image.height : imageCanvas.height;
        var x = (imageCanvas.width - wd) / 2;
        var y = (imageCanvas.height - ht) / 2;
        imageContext = imageCanvas.getContext('2d');
        imageContext.drawImage(image, x, y, wd, ht);
        // superimpose play graphic
        imageContext.globalAlpha = 0.5;
        // context.drawImage(playGraphic, 0, 0, 60, 60);
        imageContext.drawImage(playGraphic, (imageCanvas.width - playGraphic.width) / 2, (imageCanvas.height - playGraphic.height) / 2)

        // draw thumbnails
        var thumbnailContext = thumbnailCanvas.getContext('2d');
        var tnLeft = 0;
        $thumbNails.each(function(index, thumbNailImg) {
            thumbnailContext.drawImage(thumbNailImg, tnLeft, 0, prefs.getInt('thumbnail_width'), prefs.getInt('thumbnail_height'));
            tnLeft += (prefs.getInt('thumbnail_width') + borderWidth);
        });

        // draw topLevelCanvas background
        var imageData = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);

        var topLevelContext = topLevelCanvas.getContext('2d');
        topLevelContext.putImageData(imageData, borderWidth, borderWidth);
        imageData = thumbnailContext.getImageData(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        topLevelContext.putImageData(imageData, borderWidth, borderWidth + imageCanvas.height);

        return topLevelCanvas.toDataURL("image/jpeg");
    }


    // register a listener for embedded experience context
    opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function (key) {
        var data = opensocial.data.getDataContext().getDataSet(key);

        console.log("==== registerListener ====");
        console.log("embedded context:", data);

        doLoad( data.target.context.userId);
    });

    gadgets.actions.updateAction({
        id:"com.jivesoftware.inline.gallery",
        callback:function(data) {
            doLoad();
        }
    });

    $("#dropGallery").click( function() {

        osapi.jive.corev3.people.get( {id:"@me"}).execute( function( result ) {
            var id = result.id;
            var outgoing = {
                display: {
                    "type": "text",
                    "label":"View JIG for user " + id
                },
                target: {
                    "type": "embed",
                    "view":"show",
                    "context":{
                        "userId":id
                    }
                }
            };

            osapi.jive.version.getVersionInfo().execute( function(data) {
                var jiveVersion = data.jiveVersion;
                var isRopeWalk = jiveVersion && jiveVersion.indexOf("6c4") > -1;
                if ( isRopeWalk ) {
                    osapi.jive.core.container.closeApp({data:outgoing});
                } else {

                    osapi.jive.core.container.artifacts.create(outgoing, 'com.jivesoftware.inline.gallery', function (markupResponse) {
                        var artifactMarkup = markupResponse.markup, error = markupResponse.error;

                        var firstImg = $(".slideshow img").first();
                        // var src = firstImg.attr("src");
                        var artifactDom = $('<span>' + artifactMarkup + '</span>');
                        artifactDom.find('a').html('<img src="' + makeStaticSlide(firstImg[0], $(".slideshow img").slice(1)) + '"/>');
                        var html = artifactDom.html() + "<div>" + artifactMarkup + "</div>";
                        osapi.jive.core.container.editor().insert( html );
                    }, false, true );
                }
            } );
        });
    });
}

gadgets.util.registerOnLoadHandler(show);

