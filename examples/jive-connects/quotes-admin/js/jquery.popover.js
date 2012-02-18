/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
* $ popover
* By: Buck Wilson
* Version : 1.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


(function($) {

    $.fn.popover = function(options) {
        var opts = $.extend({}, $.fn.popover.defaults, options);
        if (opts.closeOtherPopovers === true) {
            $("BODY > .j-popover > *").trigger("close");
        }
        return this.each(function() {
            var
                bsSize,
                $context = opts.context,
                $self = $(this),
                viewport = { // calculate viewable area.
                             "left": $(window).scrollLeft() + 10,
                             "right": $(window).scrollLeft() + $(window).width() - 10,
                             "top": $(window).scrollTop() + 10,
                            "bottom": $(window).scrollTop() + $(window).height() - 10
                },
                arrowPosition,
                $popover = $('<div class="j-popover" />').addClass(opts.addClass),
                $arrow,
                arrowBackgroundPosition,
                $selfParent = $(this).parent();

            if($self.data("closePopover")){
                ($self.data("closePopover"))();
                $self.removeData("closePopover");
                return;
            }

            if (opts.darkPopover) {
                $popover.addClass('dark');
            }

            if(opts.returnPopover){
                $.extend(options,
                {
                    popOver: $popover,
                    closeFunc: removePopover
                });
            }

            if (!opts.container || opts.container.length === 0) {
                opts.container = $('body');
                opts.containerOffset = { top: 0, left: 0};
            } else {
                opts.containerOffset = opts.container.offset();
            }

            $popover.append($self.show());
            $popover.appendTo(opts.container).show().css('visibility', 'hidden');    /* get it in the DOM and hidden so I can reliably pull dimensions */

            function popoverPosition(pDims) {
                var belowArrowHeight = 13,
                    aboveArrowHeight = 16,
                    leftArrowWidth = 14,
                    rightArrowWidth = 14,
                    position;

                if (!pDims) {
                    pDims = {
                        "width": $popover.outerWidth(),
                        "height": $popover.outerHeight()
                    };

                    if(opts.position == "below") {
                        pDims.height = pDims.height + belowArrowHeight;
                    } else if (opts.position == "above") {
                        // no change
                    } else if (opts.position == "left") {
                        pDims.width = pDims.width + leftArrowWidth;
                    } else if (opts.position == "right") {
                        pDims.width = pDims.width + rightArrowWidth;
                    }
                }

                /* -- Set initial position --*/
                if(opts.position == "below") {
                    position = {
                        "top"   :   $context.offset().top + $context.outerHeight() + belowArrowHeight,
                        "left"  :   $context.offset().left - ((pDims.width - $context.outerWidth())/2)
                    };
                } else if (opts.position == "above") {
                    position = {
                        "top"   :   $context.offset().top - (pDims.height + aboveArrowHeight),
                        "left"  :   $context.offset().left - ((pDims.width - $context.outerWidth())/2)
                    };
                } else if (opts.position == "left") {
                    position = {
                        "top"   :   $context.offset().top - ((pDims.height - $context.outerHeight())/2),
                        "left"  :   $context.offset().left - pDims.width
                    };
                } else if (opts.position == "right") {
                    position = {
                        "top"   :   $context.offset().top - ((pDims.height - $context.outerHeight())/2),
                        "left"  :   $context.offset().left + $context.outerWidth() + rightArrowWidth
                    };
                } else {
                    position = {
                        "top"   :   $context.offset().top + $context.outerHeight(),
                        "left"  :   $context.offset().left - ((pDims.width - $context.outerWidth())/2)
                    };
                }

                if (opts.nudge.top) {
                    position.top = position.top + opts.nudge.top;
                }

                if (opts.nudge.left) {
                    var nl = Math.min(((pDims.width - $context.outerWidth())/2) - 20, opts.nudge.left);
                    position.left = position.left + nl;
                }

                /*-- adjust position and viewport dimensions based on container offset --*/

                position.left -= opts.containerOffset.left;
                position.top -= opts.containerOffset.top;

                viewport.left -= opts.containerOffset.left;
                viewport.right -= opts.containerOffset.left;
                viewport.top -= opts.containerOffset.top;
                viewport.bottom -= opts.containerOffset.top;

                if (opts.adjust) {
                    if (opts.position == "above" || opts.position == "below") {
                        // make sure it fits left/right in the viewport.
                        if (position.left < viewport.left) {
                            position.left = viewport.left;
                        } else if (position.left + $popover.outerWidth() > viewport.right) {
                            position.left = viewport.right - $popover.outerWidth();
                        }

                    }

                    if (opts.position == "left" || opts.position == "right") {
                        //make sure it fits top/bottom in the viewport.
                        if (position.top < viewport.top) {
                            position.top = viewport.top;
                        } else if (position.top + $popover.outerHeight() > viewport.bottom) {
                            position.top = viewport.bottom - $popover.outerHeight();
                        }
                    }
                }

                // Reset initial arrow position.
                arrowPosition = opts.position;

                if (opts.flip) {
                    if (opts.position == "above") {

                        if (
                            position.top < viewport.top &&
                            $context.offset().top + $context.outerHeight() + $popover.outerHeight() < viewport.bottom) {

                            position.top = $context.offset().top + $context.outerHeight() + belowArrowHeight - opts.containerOffset.top;
                            opts.flipCallback();
                            arrowPosition = "below";
                        }

                    } else if (opts.position == "below") {
                        if (position.top + $popover.outerHeight() > viewport.bottom && $context.offset().top - $popover.outerHeight() > viewport.top) {
                            position.top = $context.offset().top - (pDims.height + aboveArrowHeight) - opts.containerOffset.top;
                            opts.flipCallback();
                            arrowPosition = "above";
                        }
                    } else if (opts.position == "left") {
                        if (position.left < viewport.left && $context.offset().left + $context.outerWidth() + $popover.outerWidth()+rightArrowWidth < viewport.right) {
                            position.left = $context.offset().left+ $context.outerWidth() + rightArrowWidth - opts.containerOffset.left;
                            opts.flipCallback();
                            arrowPosition = "right";
                        }
                    } else if (opts.position == "right") {
                        if (position.left + $popover.outerWidth() > viewport.right && $context.offset().left - $popover.outerWidth()-leftArrowWidth > viewport.left) {
                            position.left = $context.offset().left - $popover.outerWidth() - leftArrowWidth - opts.containerOffset.left;
                            opts.flipCallback();
                            arrowPosition = "left";
                        }
                    }
                }

                // adjust the arrow if needed - arrowAdjust makes the arrow smaller by positioning the popover closer to the arrow
                if(opts.arrowAdjust && arrowPosition == "left"){
                    position.left += (opts.arrowAdjust*2 - 1);
                }else if(opts.arrowAdjust && arrowPosition == "right"){
                    position.left -= (opts.arrowAdjust*2 - 1);
                }

                return position;
            }




            function arrowProperties(position) {
                var props = {
                    top: '',
                    left: ''
                };
                var a, b;

                if (arrowPosition == "above" || arrowPosition == "below") {
                    a = $context.offset().left - position.left + (($context.outerWidth() - $arrow.outerWidth()) / 2);
                    b = opts.containerOffset.left + opts.arrowAdjust / 2;

                    props.left = Math.round(a - b);
                } else {
                    a = $context.offset().top - position.top + (($context.outerHeight() - $arrow.outerHeight()) / 2);
                    b = opts.containerOffset.top - opts.arrowAdjust / 2;

                    props.top = Math.round(a - b);
                }

                if (opts.arrowAdjust && arrowPosition == "left") {
                    props.left = props.left - opts.arrowAdjust;
                    //
                    // since the arrow is sprited, we also need to adjust the background position
                    var bp = arrowBackgroundPosition.split(' ');
                    bp[0] = parseFloat(bp[0]) - opts.arrowAdjust + "px";
                    props['background-position'] = bp.join(' ');
                } else if (opts.arrowAdjust && arrowPosition == "right") {
                    props.left = props.left + opts.arrowAdjust;
                }

                return props;
            }

            (function() {
                var position = popoverPosition();

                /*-- clear out all arrows if there are any (just in case)--*/
                $popover.find('span.pointer').remove();

                /*-- add the arrow and position the popover --*/
                $popover
                        .append($('<span class="' + arrowPosition + 'Arrow pointer"></span>'))
                        .addClass('popover').css({position: "absolute", top: position.top , left: position.left})
                        .appendTo(opts.container).css('visibility', 'visible');
                $popover.children().show();
                
                /* calculate arrow positioning */
                $arrow = $popover.find('.pointer');
                arrowBackgroundPosition = $arrow.css('background-position');  // record the initial background position of the arrow

                if(opts.arrowAdjust){
                    $arrow.width($arrow.width() - opts.arrowAdjust);
                    $arrow.height($arrow.height() - opts.arrowAdjust);
                }

                setArrowProperties($arrow, arrowProperties(position));
                opts.onLoad();
            })();


            function killPopover(e) {
                var isContained = $(e.target).parents().andSelf().toArray().reduce(function(isContained, parent) {
                    return isContained || parent == $popover[0];
                }, false);

                var isInDom =  $(e.target).parents('body').length > 0;

                if (!isContained && isInDom) {
                    $('body').unbind('click', killPopover);
                    $self.trigger('close');
                }
            }

            if (opts.closeOnClick) {
            jive.conc.nextTick(function() {
                if (opts.clickOverlay) {
                    $('iframe:visible').each(function() {
                        var me = $(this);
                        var position = me.position();
                        var css = {
                            "position": "absolute",
                            "padding": "0",
                            "marign": "0",
                            "z-index": "990",
                            "top": position.top + "px",
                            "left": position.left + "px",
                            "width": me.outerWidth() + "px",
                            "height": me.outerHeight() + "px"
                        };
                        $("<div/>").addClass("popover-iframe-interceptor").css(css).insertAfter(me);
                    });
                }

                // Bind body click event after a delay to prevent click that
                // initially caused the popover to open from causing it to
                // immediately close.
                $('body').click(killPopover);
            });
            }


            /*----------------------------------------------------
               Bind Events
            ---------------------------------------------------- */

            $self.bind('close', removePopover);
            if(opts.allowResize) $self.bind('popover.html', resizePopover);
            if(opts.allowResize) $self.bind('popover.resize', resizeWithoutContent);
            $self.bind('eject', ejectPopover);
            $(window).keyup(observeKeyPress);

            $self.delegate(opts.closeSelector, "click", removePopover);

            function ejectPopover() {
                $popover.before($self).remove();
            }

            function observeKeyPress(e) {
                if((e.keyCode == 27 || (e.DOM_VK_ESCAPE == 27 && e.which==0)) && opts.closeEsc) removePopover();
            }

            function removePopover(e) {
                opts.beforeClose();

                $(".popover-iframe-interceptor").remove();
                if (opts.destroyOnClose) {
                    $popover.remove();
                } else {
                    if (opts.putBack) {
                        $selfParent.append($self.hide());
                        $popover.remove();
                    }
                    $popover.hide();
                }

                $('body').unbind('click', killPopover);
                $self.unbind('close', removePopover);
                $self.unbind('popover.html', resizePopover);
                $self.unbind('popover.resize', resizeWithoutContent);
                $self.undelegate(opts.closeSelector, 'click', removePopover);
                $self.removeData("closePopover");

                if (!e || e.type != 'close') {
                    // In case any other listeners are bound to the close event
                    // and this invocation of removePopover() was triggered by
                    // a click event or something.
                    $self.trigger('close');
                }

                if (e && e.type == 'close') {
                    /* stops propagation of the "close" event, in case there are any other close events
                    * listening in...for example, the lightbox plugin!
                     */
                    e.stopPropagation();
                }

                if (e && e.type == 'click') {
                    e.preventDefault();
                }

                return opts.onClose();
            }

            $self.data("closePopover", removePopover);

            function resizeWithoutContent(event, options, callback) {
                return resizePopover(event, null, options, callback);
            }

            /**
             * Resizes the popover with some animation to fit the given
             * content.  If no content is given then resizes the popover to fit
             * whatever content is already in it.
             */
            function resizePopover(event, content, options, callback) {
                var newContent = $(content)
                  , startingWidth = $popover.width()
                  , startingHeight = $popover.height()
                  , finalWidth
                  , finalHeight
                  , position;

                if ($.isFunction(options)) {
                    callback = options;
                    options = null;
                }

                options = $.extend({}, opts, options);

                $popover.css({
                    width: 'auto',
                    height: 'auto'
                });

                withContent($self, newContent, function() {
                    // Add one pixel for IE to render correctly on.
                    finalWidth = $popover.width() + 1;
                    finalHeight = $popover.height();

                    position = popoverPosition({
                        width: $popover.outerWidth(),
                        height: $popover.outerHeight()
                    });
                });

                $popover.css({
                    width: startingWidth,
                    height: startingHeight
                });

                if (options.fade) {
                    // cross-fade
                    if (!$.browser.msie || parseFloat($.browser.version) > 8) {
                        $self.animate({
                            opacity: 0
                        }, options.duration / 2, function() {
                            if (content) {
                                $self.html(newContent);
                            }
                            $self.animate({
                                opacity: 1
                            }, options.duration / 2);
                        });

                    } else if (content) {
                        // IE does not handle this "fade" thing very well.
                        $self.children().detach();
                        setTimeout(function() {
                            $self.html(newContent);
                        }, options.duration);
                    }

                } else if (content) {
                    $self.html(newContent);
                }

                // Make sure that the arrow does not disappear during the animation.
                $popover.css('overflow', 'visible');

                // resize the popover
                $popover.animate({
                    left: position.left,
                    top: position.top,
                    width: finalWidth,
                    height: finalHeight
                }, options.duration, options.easing, function() {
                    if (typeof callback == 'function') {
                        callback.apply($self);
                    }
                });

                // Reset overflow.
                $popover.css('overflow', '');

                animateArrow(position, options);
            }

            function animateArrow(position, options) {
                var props = arrowProperties(position)
                  , backgroundPosition = props['background-position']
                  , otherProps = {};

                Object.keys(props).forEach(function(key) {
                    if (key != 'background-position' && !!props[key]) {
                        otherProps[key] = props[key];
                    }
                });

                $arrow.animate(otherProps, options.duration, options.easing);

                setTimeout(function() {
                    $arrow.removeClass().addClass(arrowPosition +'Arrow pointer');

                    try {
                        $arrow.css('background-position', backgroundPosition);
                    } catch(e) {
                        // if there's an error in a background position property,
                        // possibly from theming/old browser, we don't want it to
                        // completely kill the popover
                        console.error(e);
                    }
                }, options.duration / 2);
            }
        });

        // implement this later
        function calcBoxShadow($ele) {
            var bs = $ele.css("-moz-box-shadow") || $ele.css("-webkit-box-shadow");
            var bsSize;
            if (bs) {
                bs = bs.replace(/rgba?\([^)]+\)\s*(.+)\s*$/, "$1").split(' ');
                for (var i = 0; i < bs.length; i++) {
                    bs[i] = parseInt(bs[i], 10);
                }

                bsSize = {
                    "top": -bs[0] + bs[3] + bs[4],
                    "left": -bs[1] + bs[3] + bs[4],
                    "bottom": bs[0] + bs[3] + bs[4],
                    "right": bs[1] + bs[3]+ bs[4]
                };
            }

            return bsSize;
        }

        function setArrowProperties(arrow, props) {
            var backgroundPosition = props['background-position']
              , otherProps = {};

            Object.keys(props).filter(function(key) {
                return key != 'background-position' && !!props[key];
            }).forEach(function(key) {
                otherProps[key] = props[key];
            });

            arrow.css(otherProps);

            try {
                arrow.css('background-position', backgroundPosition);
            } catch(e) {
                // if there's an error in a background position property,
                // possibly from theming/old browser, we don't want it to
                // completely kill the popover
                console.error(e);
            }
        }

        /**
         * Temporarily replaces the content of the popover with the given
         * content.  After the given callback is called the original content is
         * replaced.  This is useful for calculating the final size of the
         * popover before beginning an animation.
         *
         * Returns the return value of the callback.
         */
        function withContent(parent, content, callback) {
            var origContent = parent.children(), ret;

            if (content && content.length > 0) {
                origContent.detach();
                content.appendTo(parent);
            }

            ret = callback();

            if (content && content.length > 0) {
                content.detach();
                origContent.appendTo(parent);
            }

            return ret;
        }
    };

    $.fn.popover.defaults = {
        context: $(),                       // the element the popover points to
        container: $('body'),               // the container the popover is inside & relative to

        // display
        position: "below",                  // default position
        nudge: {},                          // note: flip and adjust will override nudge
        adjust: true,                       // whether to adjust the popover to fit in the window
        flip: true,                         // whether to flip the popover to fit in the window
        arrowAdjust: 0,                     // adjusts the arrow inwards to shrink the arrow

        // callbacks
        flipCallback: function() {},
        beforeClose: function() {},
        onClose: function() {},
        onLoad: function() {},

        clickOverlay: true, // ??


        // behavior
        destroyOnClose: true,
        closeOtherPopovers: false,
        returnPopover: false,
        closeEsc: true,
        closeOnClick: true,
        closeSelector: '.close',
        putBack: false,


        darkPopover: false,                   // adds a dark popover class to the container.
        addClass: "",

        // resize animation options
        fade: true,
        duration: 400,
        easing: 'easeInOutQuint',
        allowResize: true
    };

})(jQuery);
