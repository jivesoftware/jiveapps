window.GalleryPreviewView = (function() {

    function getImageUrl(relativeUrl, proxied) {
        var gadgetURL = _args()["url"];
        var baseURL= gadgetURL.replace(/[a-zA-Z0-9_]+\.xml(\?.*)?/,"");
        return proxied ? gadgets.io.getProxyUrl(baseURL + relativeUrl) : baseURL + relativeUrl;
    }

    return Backbone.View.extend({
        events:{
        },

        _scaled: function(imgSrc, baseWidth, baseHeight) {
            var imgObj = new Image();//necessary to get actual height / width
            imgObj.src = imgSrc;

            var actualWidth = imgObj.width;
            var actualHeight = imgObj.height;
            imgObj = null; //To cleanup data from image.

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

            return {
                width: imageWidth,
                height: imageHeight,
                excessWidth: excessWidth,
                excessHeight: excessHeight
            };
        },

        generatePreview:function ( imgContainerDom, title, numImages, sizeScale ) {
            var that = this;

            function makeStaticSlide(image, $thumbNails, playIcon) {
                var titleAreaHeight = 40;
                var borderWidth = 10, thumbBorderWidth = 13;
                var thumbWidth = 50, thumbHeight = 50;
                var iconWidth = playIcon.width, iconHeight = playIcon.height;

                if ( !sizeScale ) {
                    sizeScale = 1;
                }
                var baseHeight = sizeScale * 180;
                if ( numImages == 1 ) {
                    baseHeight += borderWidth + thumbHeight;
                }
                var baseWidth = sizeScale * 240;

                var scaled = that._scaled($(image).attr("src"), baseWidth, baseHeight);

                var canvas = document.createElement('canvas');
                canvas.width = 2*borderWidth + baseWidth;
                canvas.height = numImages == 1 ?
                    2*borderWidth + baseHeight :
                    3*borderWidth + baseHeight + thumbHeight;

                var context = canvas.getContext('2d');
                context.font = 'bold 13px "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif';
                context.strokeStyle = "rgb(85, 85, 85)";  // equivalent to #555
                context.lineWidth = 1;

                // Enables higher-quality image scaling in certain
                // browsers.
                context.mozImageSmoothingEnabled = true;
                context.webkitImageSmoothingEnabled = true;
                context.imageSmoothingEnabled = true;

                // draw background
                context.save();
                context.fillStyle = "rgb(29, 29, 29)";  // equivalent to #1d1d1d
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.restore();

                // draw main image
                that._drawImage(context, image, scaled,
                        { width: baseWidth, height: baseHeight }, { left: borderWidth, top: borderWidth }, function() {
                    // draw title background
                    context.save();
                    context.translate(borderWidth, borderWidth + baseHeight - titleAreaHeight);
                    context.fillStyle = "rgba(0, 0, 0, 0.7)";
                    context.fillRect(0, 0, baseWidth, titleAreaHeight);
                    context.restore();
                });

                // draw thumbnails
                context.save();
                context.translate(borderWidth, (2 * borderWidth) + baseHeight);
                $thumbNails.each(function(i, thumbImg) {
                    if (i > 3) { return false; }  // Draw at most 4 images
                    var src = $(thumbImg).attr('src'),
                        scale = that._scaled(src, thumbWidth, thumbHeight);
                    that._drawImage(context, thumbImg, scale, { width: thumbWidth, height: thumbHeight },
                        { left: i * (thumbBorderWidth + thumbWidth), top: 0 });
                });
                context.restore();

                // draw title
                var text = that._clipTitle(18, 15, title) +" ("+ numImages +" "+ (numImages == 1 ? "photo" : "photos") +")";
                var textHeight = 13;
                var textPadding = (titleAreaHeight - textHeight) / 2;
                context.save();
                context.translate(borderWidth + textPadding, borderWidth + baseHeight - textPadding);
                context.fillStyle = "rgb(255, 255, 255)";
                context.fillText(text, 0, 0);
                context.restore();

                // draw "play" icon
                context.save();
                var iconPadding = (titleAreaHeight - iconHeight) / 2;
                context.translate(
                    borderWidth + baseWidth - iconWidth - iconPadding,
                    borderWidth + baseHeight - titleAreaHeight + iconPadding);
                context.drawImage(playIcon, 0, 0);
                context.restore();

                return canvas.toDataURL("image/jpeg");
            }

            var firstImg = imgContainerDom.find("img").first();
            var playIcon = new Image();
            playIcon.src = getImageUrl("images/icon-newWindow-16x16.png", true);
            var deferred = $.Deferred();

            function makeUri() {
                var uri = makeStaticSlide(firstImg[0], imgContainerDom.find("img").slice(1), playIcon);
                deferred.resolve(uri);
            }

            var timeout = setTimeout(makeUri, 1500);

            $(playIcon).on('load', function() {
                clearTimeout(timeout);
                makeUri();
            });

            return deferred.promise();
        },

        _drawImage: function(context, image, inner, outer, offset, callback) {
            context.save();
            context.translate(offset.left, offset.top);
            context.fillStyle = "rgb(0, 0, 0)";
            context.fillRect(0, 0, outer.width, outer.height);
            context.save();
            context.translate((outer.width - inner.width) / 2, (outer.height - inner.height) / 2);
            context.drawImage(image, 0, 0, inner.width, inner.height);
            context.restore();
            context.restore();

            if (callback) { callback(); }

            context.save();
            context.translate(offset.left, offset.top);
            context.lineWidth = 1;
            context.strokeRect(0, 0, outer.width, outer.height);
            context.restore();
        },

        _clipTitle: function(clipThreshold, clippedLength, text) {
            return text.length > clipThreshold ?
                text.slice(0, clippedLength) + "..." :
                text;
        }

    });
})();
