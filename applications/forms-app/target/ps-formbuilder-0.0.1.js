// Some things are using array.indexOf, which IE7 and IE8 don't support, so add it
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

/*
 * Copyright 2008 Google Inc.
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

// Utility functions and classes for Soy.
//
// The top portion of this file contains utilities for Soy users:
//   + soy.StringBuilder: Compatible with the 'stringbuilder' code style.
//   + soy.renderElement: Render template and set as innerHTML of an element.
//   + soy.renderAsFragment: Render template and return as HTML fragment.
//
// The bottom portion of this file contains utilities that should only be called
// by Soy-generated JS code. Please do not use these functions directly from
// your hand-writen code. Their names all start with '$$'.

/**
 * Base name for the soy utilities, when used outside of Closure Library.
 * Check to see soy is already defined in the current scope before asigning to
 * prevent clobbering if soyutils.js is loaded more than once.
 * @type {Object}
 */
var soy = soy || {};


// Just enough browser detection for this file.
(function() {
  var ua = navigator.userAgent;
  var isOpera = ua.indexOf('Opera') == 0;
  /**
   * @type {boolean}
   * @private
   */
  soy.IS_OPERA_ = isOpera;
  /**
   * @type {boolean}
   * @private
   */
  soy.IS_IE_ = !isOpera && ua.indexOf('MSIE') != -1;
  /**
   * @type {boolean}
   * @private
   */
  soy.IS_WEBKIT_ = !isOpera && ua.indexOf('WebKit') != -1;
})();


// -----------------------------------------------------------------------------
// StringBuilder (compatible with the 'stringbuilder' code style).


/**
 * Utility class to facilitate much faster string concatenation in IE,
 * using Array.join() rather than the '+' operator.  For other browsers
 * we simply use the '+' operator.
 *
 * @param {Object|number|string|boolean} opt_a1 Optional first initial item
 *     to append.
 * @param {Object|number|string|boolean} var_args Other initial items to
 *     append, e.g., new soy.StringBuilder('foo', 'bar').
 * @constructor
 */
soy.StringBuilder = function(opt_a1, var_args) {

  /**
   * Internal buffer for the string to be concatenated.
   * @type {string|Array}
   * @private
   */
  this.buffer_ = soy.IS_IE_ ? [] : '';

  if (opt_a1 != null) {
    this.append.apply(this, arguments);
  }
};


/**
 * Length of internal buffer (faster than calling buffer_.length).
 * Only used for IE.
 * @type {number}
 * @private
 */
soy.StringBuilder.prototype.bufferLength_ = 0;


/**
 * Appends one or more items to the string.
 *
 * Calling this with null, undefined, or empty arguments is an error.
 *
 * @param {Object|number|string|boolean} a1 Required first string.
 * @param {Object|number|string|boolean} opt_a2 Optional second string.
 * @param {Object|number|string|boolean} var_args Other items to append,
 *     e.g., sb.append('foo', 'bar', 'baz').
 * @return {soy.StringBuilder} This same StringBuilder object.
 */
soy.StringBuilder.prototype.append = function(a1, opt_a2, var_args) {

  if (soy.IS_IE_) {
    if (opt_a2 == null) {  // no second argument (note: undefined == null)
      // Array assignment is 2x faster than Array push.  Also, use a1
      // directly to avoid arguments instantiation, another 2x improvement.
      this.buffer_[this.bufferLength_++] = a1;
    } else {
      this.buffer_.push.apply(this.buffer_, arguments);
      this.bufferLength_ = this.buffer_.length;
    }

  } else {

    // Use a1 directly to avoid arguments instantiation for single-arg case.
    this.buffer_ += a1;
    if (opt_a2 != null) {  // no second argument (note: undefined == null)
      for (var i = 1; i < arguments.length; i++) {
        this.buffer_ += arguments[i];
      }
    }
  }

  return this;
};


/**
 * Clears the string.
 */
soy.StringBuilder.prototype.clear = function() {

  if (soy.IS_IE_) {
     this.buffer_.length = 0;  // reuse array to avoid creating new object
     this.bufferLength_ = 0;

   } else {
     this.buffer_ = '';
   }
};


/**
 * Returns the concatenated string.
 *
 * @return {string} The concatenated string.
 */
soy.StringBuilder.prototype.toString = function() {

  if (soy.IS_IE_) {
    var str = this.buffer_.join('');
    // Given a string with the entire contents, simplify the StringBuilder by
    // setting its contents to only be this string, rather than many fragments.
    this.clear();
    if (str) {
      this.append(str);
    }
    return str;

  } else {
    return /** @type {string} */ (this.buffer_);
  }
};


// -----------------------------------------------------------------------------
// Public utilities.


/**
 * Helper function to render a Soy template and then set the output string as
 * the innerHTML of an element. It is recommended to use this helper function
 * instead of directly setting innerHTML in your hand-written code, so that it
 * will be easier to audit the code for cross-site scripting vulnerabilities.
 *
 * @param {Element} element The element whose content we are rendering.
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object} opt_templateData The data for the template.
 */
soy.renderElement = function(element, template, opt_templateData) {
  element.innerHTML = template(opt_templateData);
};


/**
 * Helper function to render a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned. Otherwise a document fragment is returned containing the
 * rendered nodes.
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object} opt_templateData The data for the template.
 * @return {Node} The resulting node or document fragment.
 */
soy.renderAsFragment = function(template, opt_templateData) {

  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = template(opt_templateData);
  if (tempDiv.childNodes.length == 1) {
    return tempDiv.firstChild;
  } else {
    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


// -----------------------------------------------------------------------------
// Below are private utilities to be used by Soy-generated code only.


/**
 * Builds an augmented data object to be passed when a template calls another,
 * and needs to pass both original data and additional params. The returned
 * object will contain both the original data and the additional params. If the
 * same key appears in both, then the value from the additional params will be
 * visible, while the value from the original data will be hidden. The original
 * data object will be used, but not modified.
 *
 * @param {!Object} origData The original data to pass.
 * @param {Object} additionalParams The additional params to pass.
 * @return {Object} An augmented data object containing both the original data
 *     and the additional params.
 */
soy.$$augmentData = function(origData, additionalParams) {

  // Create a new object whose '__proto__' field is set to origData.
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = origData;
  var newData = new tempCtor();

  // Add the additional params to the new object.
  for (var key in additionalParams) {
    newData[key] = additionalParams[key];
  }

  return newData;
};


/**
 * Escapes HTML special characters in a string. Escapes double quote '"' in
 * addition to '&', '<', and '>' so that a string can be included in an HTML
 * tag attribute value within double quotes.
 *
 * @param {*} str The string to be escaped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} An escaped copy of the string.
*/
soy.$$escapeHtml = function(str) {

  str = String(str);

  // This quick test helps in the case when there are no chars to replace, in
  // the worst case this makes barely a difference to the time taken.
  if (!soy.$$EscapeHtmlRe_.ALL_SPECIAL_CHARS.test(str)) {
    return str;
  }

  // Since we're only checking one char at a time, we use String.indexOf(),
  // which is faster than RegExp.test(). Important: Must replace '&' first!
  if (str.indexOf('&') != -1) {
    str = str.replace(soy.$$EscapeHtmlRe_.AMP, '&amp;');
  }
  if (str.indexOf('<') != -1) {
    str = str.replace(soy.$$EscapeHtmlRe_.LT, '&lt;');
  }
  if (str.indexOf('>') != -1) {
    str = str.replace(soy.$$EscapeHtmlRe_.GT, '&gt;');
  }
  if (str.indexOf('"') != -1) {
    str = str.replace(soy.$$EscapeHtmlRe_.QUOT, '&quot;');
  }
  return str;
};

/**
 * Regular expressions used within escapeHtml().
 * @enum {RegExp}
 * @private
 */
soy.$$EscapeHtmlRe_ = {
  ALL_SPECIAL_CHARS: /[&<>\"]/,
  AMP: /&/g,
  LT: /</g,
  GT: />/g,
  QUOT: /\"/g
};


/**
 * Escapes characters in the string to make it a valid content for a JS string literal.
 *
 * @param {*} s The string to be escaped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} An escaped copy of the string.
*/
soy.$$escapeJs = function(s) {
  s = String(s);
  var sb = [];
  for (var i = 0; i < s.length; i++) {
    sb[i] = soy.$$escapeChar(s.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
soy.$$escapeChar = function(c) {
  if (c in soy.$$escapeCharJs_) {
    return soy.$$escapeCharJs_[c];
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return soy.$$escapeCharJs_[c] = rv;
};

/**
 * Character mappings used internally for soy.$$escapeJs
 * @private
 * @type {Object}
 */
soy.$$escapeCharJs_ = {
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\'': '\\\'',
  '\\': '\\\\'
};


/**
 * Escapes a string so that it can be safely included in a URI.
 *
 * @param {*} str The string to be escaped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} An escaped copy of the string.
*/
soy.$$escapeUri = function(str) {

  str = String(str);

  // Checking if the search matches before calling encodeURIComponent avoids an
  // extra allocation in IE6. This adds about 10us time in FF and a similiar
  // over head in IE6 for lower working set apps, but for large working set
  // apps, it saves about 70us per call.
  if (!soy.$$ENCODE_URI_REGEXP_.test(str)) {
    return encodeURIComponent(str);
  } else {
    return str;
  }
};

/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
soy.$$ENCODE_URI_REGEXP_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;


/**
 * Inserts word breaks ('wbr' tags) into a HTML string at a given interval. The
 * counter is reset if a space is encountered. Word breaks aren't inserted into
 * HTML tags or entities. Entites count towards the character count; HTML tags
 * do not.
 *
 * @param {*} str The HTML string to insert word breaks into. Can be other
 *     types, but the value will be coerced to a string.
 * @param {number} maxCharsBetweenWordBreaks Maximum number of non-space
 *     characters to allow before adding a word break.
 * @return {string} The string including word breaks.
 */
soy.$$insertWordBreaks = function(str, maxCharsBetweenWordBreaks) {

  str = String(str);

  var resultArr = [];
  var resultArrLen = 0;

  // These variables keep track of important state while looping through str.
  var isInTag = false;  // whether we're inside an HTML tag
  var isMaybeInEntity = false;  // whether we might be inside an HTML entity
  var numCharsWithoutBreak = 0;  // number of characters since last word break
  var flushIndex = 0;  // index of first char not yet flushed to resultArr

  for (var i = 0, n = str.length; i < n; ++i) {
    var charCode = str.charCodeAt(i);

    // If hit maxCharsBetweenWordBreaks, and not space next, then add <wbr>.
    if (numCharsWithoutBreak >= maxCharsBetweenWordBreaks &&
        charCode != soy.$$CharCode_.SPACE) {
      resultArr[resultArrLen++] = str.substring(flushIndex, i);
      flushIndex = i;
      resultArr[resultArrLen++] = soy.WORD_BREAK_;
      numCharsWithoutBreak = 0;
    }

    if (isInTag) {
      // If inside an HTML tag and we see '>', it's the end of the tag.
      if (charCode == soy.$$CharCode_.GREATER_THAN) {
        isInTag = false;
      }

    } else if (isMaybeInEntity) {
      switch (charCode) {
        // If maybe inside an entity and we see ';', it's the end of the entity.
        // The entity that just ended counts as one char, so increment
        // numCharsWithoutBreak.
        case soy.$$CharCode_.SEMI_COLON:
          isMaybeInEntity = false;
          ++numCharsWithoutBreak;
          break;
        // If maybe inside an entity and we see '<', we weren't actually in an
        // entity. But now we're inside and HTML tag.
        case soy.$$CharCode_.LESS_THAN:
          isMaybeInEntity = false;
          isInTag = true;
          break;
        // If maybe inside an entity and we see ' ', we weren't actually in an
        // entity. Just correct the state and reset the numCharsWithoutBreak
        // since we just saw a space.
        case soy.$$CharCode_.SPACE:
          isMaybeInEntity = false;
          numCharsWithoutBreak = 0;
          break;
      }

    } else {  // !isInTag && !isInEntity
      switch (charCode) {
        // When not within a tag or an entity and we see '<', we're now inside
        // an HTML tag.
        case soy.$$CharCode_.LESS_THAN:
          isInTag = true;
          break;
        // When not within a tag or an entity and we see '&', we might be inside
        // an entity.
        case soy.$$CharCode_.AMPERSAND:
          isMaybeInEntity = true;
          break;
        // When we see a space, reset the numCharsWithoutBreak count.
        case soy.$$CharCode_.SPACE:
          numCharsWithoutBreak = 0;
          break;
        // When we see a non-space, increment the numCharsWithoutBreak.
        default:
          ++numCharsWithoutBreak;
          break;
      }
    }
  }

  // Flush the remaining chars at the end of the string.
  resultArr[resultArrLen++] = str.substring(flushIndex);

  return resultArr.join('');
};

/**
 * Special characters used within insertWordBreaks().
 * @enum {number}
 * @private
 */
soy.$$CharCode_ = {
  SPACE: 32,  // ' '.charCodeAt(0)
  AMPERSAND: 38,  // '&'.charCodeAt(0)
  SEMI_COLON: 59,  // ';'.charCodeAt(0)
  LESS_THAN: 60,  // '<'.charCodeAt(0)
  GREATER_THAN: 62  // '>'.charCodeAt(0)
};

/**
 * String inserted as a word break by insertWordBreaks(). Safari requires
 * <wbr></wbr>, Opera needs the 'shy' entity, though this will give a visible
 * hyphen at breaks. Other browsers just use <wbr>.
 * @type {string}
 * @private
 */
soy.WORD_BREAK_ =
    soy.IS_WEBKIT_ ? '<wbr></wbr>' : soy.IS_OPERA_ ? '&shy;' : '<wbr>';


/**
 * Converts \r\n, \r, and \n to <br>s
 * @param {*} str The string in which to convert newlines.
 * @return {string} A copy of {@code str} with converted newlines.
 */
soy.$$changeNewlineToBr = function(str) {

  str = String(str);

  // This quick test helps in the case when there are no chars to replace, in
  // the worst case this makes barely a difference to the time taken.
  if (!soy.$$CHANGE_NEWLINE_TO_BR_RE_.test(str)) {
    return str;
  }

  return str.replace(/(\r\n|\r|\n)/g, '<br>');
};

/**
 * Regular expression used within $$changeNewlineToBr().
 * @type {RegExp}
 * @private
 */
soy.$$CHANGE_NEWLINE_TO_BR_RE_ = /[\r\n]/;


/**
 * Estimate the overall directionality of text. If opt_isHtml, makes sure to
 * ignore the LTR nature of the mark-up and escapes in text, making the logic
 * suitable for HTML and HTML-escaped text.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {number} 1 if text is LTR, -1 if it is RTL, and 0 if it is neutral.
 */
soy.$$bidiTextDir = function(text, opt_isHtml) {
  text = soy.$$bidiStripHtmlIfNecessary_(text, opt_isHtml);
  if (!text) {
    return 0;
  }
  return soy.$$bidiDetectRtlDirectionality_(text) ? -1 : 1;
};


/**
 * Returns "dir=ltr" or "dir=rtl", depending on text's estimated
 * directionality, if it is not the same as bidiGlobalDir.
 * Otherwise, returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} "dir=rtl" for RTL text in non-RTL context; "dir=ltr" for LTR
 *     text in non-LTR context; else, the empty string.
 */
soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
  var dir = soy.$$bidiTextDir(text, opt_isHtml);
  if (dir != bidiGlobalDir) {
    return dir < 0 ? 'dir=rtl' : dir > 0 ? 'dir=ltr' : '';
  }
  return '';
};


/**
 * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
 * directionality or the exit directionality of text are opposite to
 * bidiGlobalDir. Otherwise returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching bidiGlobalDir, or
 *     the empty string when text's overall and exit directionalities both match
 *     bidiGlobalDir.
 */
soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
  var dir = soy.$$bidiTextDir(text, opt_isHtml);
  return soy.$$bidiMarkAfterKnownDir(bidiGlobalDir, dir, text, opt_isHtml);
};


/**
 * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
 * directionality or the exit directionality of text are opposite to
 * bidiGlobalDir. Otherwise returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {number} dir text's directionality: 1 if ltr, -1 if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching bidiGlobalDir, or
 *     the empty string when text's overall and exit directionalities both match
 *     bidiGlobalDir.
 */
soy.$$bidiMarkAfterKnownDir = function(bidiGlobalDir, dir, text, opt_isHtml) {
  return (
      bidiGlobalDir > 0 && (dir < 0 ||
          soy.$$bidiIsRtlExitText_(text, opt_isHtml)) ? '\u200E' : // LRM
      bidiGlobalDir < 0 && (dir > 0 ||
          soy.$$bidiIsLtrExitText_(text, opt_isHtml)) ? '\u200F' : // RLM
      '');
};


/**
 * Strips str of any HTML mark-up and escapes. Imprecise in several ways, but
 * precision is not very important, since the result is only meant to be used
 * for directionality detection.
 * @param {string} str The string to be stripped.
 * @param {boolean} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} The stripped string.
 * @private
 */
soy.$$bidiStripHtmlIfNecessary_ = function(str, opt_isHtml) {
  return opt_isHtml ? str.replace(soy.$$BIDI_HTML_SKIP_RE_, ' ') : str;
};


/**
 * Simplified regular expression for am HTML tag (opening or closing) or an HTML
 * escape - the things we want to skip over in order to ignore their ltr
 * characters.
 * @type {RegExp}
 * @private
 */
soy.$$BIDI_HTML_SKIP_RE_ = /<[^>]*>|&[^;]+;/g;


/**
 * Returns str wrapped in a <span dir=ltr|rtl> according to its directionality -
 * but only if that is neither neutral nor the same as the global context.
 * Otherwise, returns str unchanged.
 * Always treats str as HTML/HTML-escaped, i.e. ignores mark-up and escapes when
 * estimating str's directionality.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} str The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} The wrapped string.
 */
soy.$$bidiSpanWrap = function(bidiGlobalDir, str) {
  str = String(str);
  var textDir = soy.$$bidiTextDir(str, true);
  var reset = soy.$$bidiMarkAfterKnownDir(bidiGlobalDir, textDir, str, true);
  if (textDir > 0 && bidiGlobalDir <= 0) {
    str = '<span dir=ltr>' + str + '</span>';
  } else if (textDir < 0 && bidiGlobalDir >= 0) {
    str = '<span dir=rtl>' + str + '</span>';
  }
  return str + reset;
};


/**
 * Returns str wrapped in Unicode BiDi formatting characters according to its
 * directionality, i.e. either LRE or RLE at the beginning and PDF at the end -
 * but only if str's directionality is neither neutral nor the same as the
 * global context. Otherwise, returns str unchanged.
 * Always treats str as HTML/HTML-escaped, i.e. ignores mark-up and escapes when
 * estimating str's directionality.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} str The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} The wrapped string.
 */
soy.$$bidiUnicodeWrap = function(bidiGlobalDir, str) {
  str = String(str);
  var textDir = soy.$$bidiTextDir(str, true);
  var reset = soy.$$bidiMarkAfterKnownDir(bidiGlobalDir, textDir, str, true);
  if (textDir > 0 && bidiGlobalDir <= 0) {
    str = '\u202A' + str + '\u202C';
  } else if (textDir < 0 && bidiGlobalDir >= 0) {
    str = '\u202B' + str + '\u202C';
  }
  return str + reset;
};


/**
 * A practical pattern to identify strong LTR character. This pattern is not
 * theoretically correct according to unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
soy.$$bidiLtrChars_ =
    'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
    '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF';


/**
 * A practical pattern to identify strong neutral and weak character. This
 * pattern is not theoretically correct according to unicode standard. It is
 * simplified for performance and small code size.
 * @type {string}
 * @private
 */
soy.$$bidiNeutralChars_ =
    '\u0000-\u0020!-@[-`{-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF';


/**
 * A practical pattern to identify strong RTL character. This pattern is not
 * theoretically correct according to unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
soy.$$bidiRtlChars_ = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';


/**
 * Regular expressions to check if a piece of text is of RTL directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
soy.$$bidiRtlDirCheckRe_ = new RegExp(
    '^[^' + soy.$$bidiLtrChars_ + ']*[' + soy.$$bidiRtlChars_ + ']');


/**
 * Regular expressions to check if a piece of text is of neutral directionality.
 * Url are considered as neutral.
 * @type {RegExp}
 * @private
 */
soy.$$bidiNeutralDirCheckRe_ = new RegExp(
    '^[' + soy.$$bidiNeutralChars_ + ']*$|^http://');


/**
 * Check the directionality of the a piece of text based on the first character
 * with strong directionality.
 * @param {string} str string being checked.
 * @return {boolean} return true if rtl directionality is being detected.
 * @private
 */
soy.$$bidiIsRtlText_ = function(str) {
  return soy.$$bidiRtlDirCheckRe_.test(str);
};


/**
 * Check the directionality of the a piece of text based on the first character
 * with strong directionality.
 * @param {string} str string being checked.
 * @return {boolean} true if all characters have neutral directionality.
 * @private
 */
soy.$$bidiIsNeutralText_ = function(str) {
  return soy.$$bidiNeutralDirCheckRe_.test(str);
};


/**
 * This constant controls threshold of rtl directionality.
 * @type {number}
 * @private
 */
soy.$$bidiRtlDetectionThreshold_ = 0.40;


/**
 * Returns the RTL ratio based on word count.
 * @param {string} str the string that need to be checked.
 * @return {number} the ratio of RTL words among all words with directionality.
 * @private
 */
soy.$$bidiRtlWordRatio_ = function(str) {
  var rtlCount = 0;
  var totalCount = 0;
  var tokens = str.split(' ');
  for (var i = 0; i < tokens.length; i++) {
    if (soy.$$bidiIsRtlText_(tokens[i])) {
      rtlCount++;
      totalCount++;
    } else if (!soy.$$bidiIsNeutralText_(tokens[i])) {
      totalCount++;
    }
  }

  return totalCount == 0 ? 0 : rtlCount / totalCount;
};


/**
 * Check the directionality of a piece of text, return true if the piece of
 * text should be laid out in RTL direction.
 * @param {string} str The piece of text that need to be detected.
 * @return {boolean} true if this piece of text should be laid out in RTL.
 * @private
 */
soy.$$bidiDetectRtlDirectionality_ = function(str) {
  return soy.$$bidiRtlWordRatio_(str) >
    soy.$$bidiRtlDetectionThreshold_;
};


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is LTR.
 * @type {RegExp}
 * @private
 */
soy.$$bidiLtrExitDirCheckRe_ = new RegExp(
    '[' + soy.$$bidiLtrChars_ + '][^' + soy.$$bidiRtlChars_ + ']*$');


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is RTL.
 * @type {RegExp}
 * @private
 */
soy.$$bidiRtlExitDirCheckRe_ = new RegExp(
    '[' + soy.$$bidiRtlChars_ + '][^' + soy.$$bidiLtrChars_ + ']*$');


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str string being checked.
 * @param {boolean} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 * @private
 */
soy.$$bidiIsLtrExitText_ = function(str, opt_isHtml) {
  str = soy.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
  return soy.$$bidiLtrExitDirCheckRe_.test(str);
};


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str string being checked.
 * @param {boolean} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 * @private
 */
soy.$$bidiIsRtlExitText_ = function(str, opt_isHtml) {
  str = soy.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
  return soy.$$bidiRtlExitDirCheckRe_.test(str);
};// This file was automatically generated from fbldr-create.soy.
// Please don't edit this file by hand.

if (typeof jive == 'undefined') { var jive = {}; }
if (typeof jive.fbldr == 'undefined') { jive.fbldr = {}; }
if (typeof jive.fbldr.create == 'undefined') { jive.fbldr.create = {}; }
if (typeof jive.fbldr.create.soy == 'undefined') { jive.fbldr.create.soy = {}; }


jive.fbldr.create.soy.addField = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field"><label class="fbldr-label">Add Field</label><span class="fbldr-glyph fbldr-reqd">&nbsp;</span><button type="button" id="fbldr-field-add">Add Field</button></div><div id="fbldr-create-error-box" class="fbldr-error-box" style="display: none"><span class="jive-icon-med jive-icon-redalert"></span><span class="message"></span></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.create.soy.boilerplateHeader = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.v3) ? '<p><h4>Note: This template will be available to the Forms App as soon as the Jive search index has been updated to include this document. The default tag \'fbldr_template\' has been automatically added, which will make this template available to all users.  Edit the template\'s tags, as appropriate, if you would like to restrict this template to a specific set of users.</h4></p>' : '<p><h4>Note: This template will not be available to the Forms App until at least one of the proper tags is added to this document. Add either \'fbldr_template\' or \'fbldr_templates\' as a tag, if using the default app settings.</h4></p>', '<p>&nbsp;</p>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.create.soy.boilerplateFooter = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<p>&nbsp;</p><p><h4>Template generated by the Forms App Template Creator</h4></p>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.create.soy.field = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-create-field"><input type="hidden" name="fbldr-field-hidden-', soy.$$escapeHtml(opt_data.field.id), '" value="', soy.$$escapeHtml(opt_data.json), '"><span class="fbldr-create-field-id">', soy.$$escapeHtml(opt_data.field.id), '</span><span class="fbldr-create-field-label" ', (opt_data.field.desc) ? 'title="' + soy.$$escapeHtml(opt_data.field.desc) + '"' : '', '>', soy.$$escapeHtml(opt_data.field.label), '</span><a class="fbldr-field-link fbldr-field-del" href="#" title="Remove Field"><span class="jive-icon-med jive-icon-delete"></span></a><a class="fbldr-field-link fbldr-field-down" href="#" title="Move Field Down"><span class="jive-icon-med jive-icon-arrow-down"></span></a><a class="fbldr-field-link fbldr-field-up" href="#" title="Move Field Up"><span class="jive-icon-med jive-icon-arrow-up"></span></a></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.create.soy.headingText = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-create-preview-text"><p>Use the panels on the right to enter the template and field information, which will automatically render the form preview below.</p><p>&nbsp;</p><p>Once the form has been successfully created, you may either fill out the form and preview the content in the Content Preview tab, or copy the generated form template from the Form Source tab and store in a Jive document to be used by the Forms App.</p></div>');
  return opt_sb ? '' : output.toString();
};
// This file was automatically generated from fbldr.soy.
// Please don't edit this file by hand.

if (typeof jive == 'undefined') { var jive = {}; }
if (typeof jive.fbldr == 'undefined') { jive.fbldr = {}; }
if (typeof jive.fbldr.soy == 'undefined') { jive.fbldr.soy = {}; }


jive.fbldr.soy.attachments = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-attachments"><div class="fbldr-attach-head"><p>Use the following form to upload file attachments and, optionally, include a variable to reference the uploaded file in the form\'s HTML source.</p><p>Multiple files may be attached, but only one at a time.  Click "Finished" when all files have been attached.</p></div><div class="fbldr-attach-field"><label>Link to HTML Variable (optional) : </label></div><div class="fbldr-attach-field"><select id="fbldr-attach-link"><option value="" selected="selected">Select HTML variable...</option>');
  var optionList34 = opt_data.variables;
  var optionListLen34 = optionList34.length;
  for (var optionIndex34 = 0; optionIndex34 < optionListLen34; optionIndex34++) {
    var optionData34 = optionList34[optionIndex34];
    output.append('<option value="', soy.$$escapeHtml(optionData34), '">', soy.$$escapeHtml(optionData34), '</option>');
  }
  output.append('</select></div><div class="fbldr-attach-field"><button type="button" id="fbldr-attach-file">Upload File to Attach</button></div><div class="fbldr-attach-field"><label>Attached Files : </label><br/><ul id="fbldr-attach-files"></ul></div></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.attachFile = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li>', soy.$$escapeHtml(opt_data.attachment.name), ' ', (opt_data.linkTo) ? '<span class="fbldr-attach-link-to">(linked to \'' + soy.$$escapeHtml(opt_data.linkTo) + '\')</span>' : '', '</li>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.attachImage = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<img alt="', soy.$$escapeHtml(opt_data.filename), '" class="jive-image" src="/servlet/JiveServlet/download/', soy.$$escapeHtml(opt_data.docId), '-1-', soy.$$escapeHtml(opt_data.attachId), '/', soy.$$escapeHtml(opt_data.filename), '" />');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.attachLink = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a href="/servlet/JiveServlet/download/', soy.$$escapeHtml(opt_data.docId), '-1-', soy.$$escapeHtml(opt_data.attachId), '/', soy.$$escapeHtml(opt_data.filename), '">', soy.$$escapeHtml(opt_data.filename), '</a>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.checkbox = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<input type="checkbox" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-checkbox" ', (opt_data.field.value) ? 'checked="checked"' : '', ' ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '"' : '', ' /></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.divider = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-divider">&nbsp;</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.error = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<span id="fbldr-error-', soy.$$escapeHtml(opt_data.field.id), '" class="jive-icon-sml jive-icon-redalert fbldr-error" style="display: none;" title=""></span>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.form = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form id="', soy.$$escapeHtml(opt_data.id), '" class="fbldr-form"></form>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.header = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-header"><!-- <h2 class="fbldr-name">', soy.$$escapeHtml(opt_data.name), '</h2> -->', (opt_data.desc) ? '<span class="fbldr-desc">' + soy.$$escapeHtml(opt_data.desc) + '</span>' : '', '</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.heading = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-heading"><span class="fbldr-heading-index">', soy.$$escapeHtml(opt_data.index), '</span><span class="fbldr-heading-text">', soy.$$escapeHtml(opt_data.text), '</span></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.label = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.labelPosition == 'top') ? '<div class="fbldr-label-top"><span>' + soy.$$escapeHtml(opt_data.field.label) + ((opt_data.appendToLabel) ? ' ' + soy.$$escapeHtml(opt_data.appendToLabel) : '') + '</span><span class="fbldr-glyph-top fbldr-reqd">' + ((opt_data.field.required) ? '*' : '&nbsp;') + '</span></div>' : '<label class="fbldr-label">' + soy.$$escapeHtml(opt_data.field.label) + ((opt_data.appendToLabel) ? ' ' + soy.$$escapeHtml(opt_data.appendToLabel) : '') + '</label><span class="fbldr-glyph fbldr-reqd">' + ((opt_data.field.required) ? '*' : '&nbsp;') + '</span>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.link = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(soy.$$augmentData(opt_data, {appendToLabel: (opt_data.labelPosition == 'top') ? 'Label / URL' : 'Label'}), output);
  output.append('<input type="text" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '-text" class="fbldr-input" value="', (opt_data.field.value) ? soy.$$escapeHtml(opt_data.field.value) : '', '" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '-text"' : '', ' />');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('</div><div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">', (! (opt_data.labelPosition == 'top')) ? '<label class="fbldr-label">' + soy.$$escapeHtml(opt_data.field.label) + ' URL</label><span class="fbldr-glyph fbldr-reqd">&nbsp;</span>' : '', '<input type="text" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-input" value="" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '"' : '', ' /></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.list = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.ordered) ? '<ol' : '<ul', (opt_data.unstyled) ? ' style="list-style:none;"' : '', '>');
  var itemList205 = opt_data.items;
  var itemListLen205 = itemList205.length;
  for (var itemIndex205 = 0; itemIndex205 < itemListLen205; itemIndex205++) {
    var itemData205 = itemList205[itemIndex205];
    output.append('<li>', itemData205, '</li>');
  }
  output.append((opt_data.ordered) ? '</ol>' : '</ul>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.load = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="fbldr-load"><span class="fbldr-load-img"></span><span class="fbldr-load-msg">Loading templates...</span><div id="fbldr-load-progress"><div class="fbldr-progress-text"></div></div></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.options = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((! opt_data.multiple) ? '<option value="" class="fbldr-none">Select an option...</option>' : '');
  var optionList222 = opt_data.values;
  var optionListLen222 = optionList222.length;
  for (var optionIndex222 = 0; optionIndex222 < optionListLen222; optionIndex222++) {
    var optionData222 = optionList222[optionIndex222];
    output.append('<option class="fbldr-opt ', (optionData222.cssClass) ? soy.$$escapeHtml(optionData222.cssClass) : '', '" value="', soy.$$escapeHtml(optionData222.value), '" ', (optionData222.value == opt_data.value) ? ' selected="selected"' : '', '>', soy.$$escapeHtml(optionData222.label), '</option>');
  }
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.notes = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-notes"><div class="fbldr-note"><span class="fbldr-glyph fbldr-reqd">*</span> Indicates a required field.</div>', (opt_data.includeAttachment) ? '<div class="fbldr-note"><span class="fbldr-glyph fbldr-glyph-tall">+</span>File attachments will be included during form content submission.</div>' : '', '</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.radio = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(opt_data, output);
  jive.fbldr.soy.radioOptions(opt_data, output);
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.radioOptions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<ul class="fbldr-field-list">');
  var valueList256 = opt_data.field.values;
  var valueListLen256 = valueList256.length;
  for (var valueIndex256 = 0; valueIndex256 < valueListLen256; valueIndex256++) {
    var valueData256 = valueList256[valueIndex256];
    output.append('<li><input type="radio" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-radio" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '" value="' + soy.$$escapeHtml(valueData256.value) + '"' : '', (opt_data.field.value == valueData256.value) ? 'checked="checked"' : '', ' />', (valueData256.label) ? ' ' + soy.$$escapeHtml(valueData256.label) + ' ' : ' ' + soy.$$escapeHtml(valueData256.value) + ' ', '</li>');
  }
  output.append('</ul>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.select = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<select id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-input" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '"' : '', (opt_data.field.type == 'multi-select') ? 'multiple="multiple"' : '', ' >');
  jive.fbldr.soy.options({values: opt_data.field.values, value: opt_data.field.value, multiple: opt_data.field.type == 'multi-select'}, output);
  output.append('</select>');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.start = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="fbldr-start"><span class="fbldr-desc">You do not appear to have any forms currently available for use.</span><br /><div class="fbldr-text">In order to begin using the Forms App, there must be forms available in your community and your app must be proprely configured to locate those forms.  See the following help topics in the<span class="jive-icon-med jive-icon-question"></span>Forms App Help (upper-right) for further information:</div><ul><li><span class="jive-icon-med jive-icon-question"></span>Help Setting Up the App - See the "Configuring the App" help topic.<li><span class="jive-icon-med jive-icon-question"></span>Help Creating Custom Forms - See the "Getting Started" or "Additional Resources" help topics.</li></ul></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.submit = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="fbldr-submit" class="clearfix"><button type="button" id="fbldr-submit-btn">', (opt_data.label) ? soy.$$escapeHtml(opt_data.label) : 'Submit Form', '</button><div id="fbldr-submit-status"></div></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.submitStatus = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.iconSrc) ? '<img class="' + soy.$$escapeHtml(opt_data.iconCss) + '" src="' + soy.$$escapeHtml(opt_data.iconSrc) + '" />' : (opt_data.iconCss) ? '<span class="jive-icon jive-icon-med ' + soy.$$escapeHtml(opt_data.iconCss) + '"></span>' : '', '<span class="fbldr-submit-text">', opt_data.statusHtml, '</span>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.submitSuccess = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.content.href) ? '<a href="' + soy.$$escapeHtml(opt_data.content.href) + '" target="_blank" title="View ' + soy.$$escapeHtml(opt_data.content.contentType) + ': ' + soy.$$escapeHtml(opt_data.content.subject) + '">' + soy.$$escapeHtml(opt_data.text) + '</a>' : '<span class="fbldr-submit-success">' + soy.$$escapeHtml(opt_data.text) + '</span>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.text = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<input type="text" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-input" value="', (opt_data.field.value) ? soy.$$escapeHtml(opt_data.field.value) : '', '" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '"' : '', ' />');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.textarea = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<textarea id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-input" rows="4">', (opt_data.field.value) ? soy.$$escapeHtml(opt_data.field.value) : '', '</textarea>');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.title = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.field.title) ? '<span class="jive-icon-sml jive-icon-info fbldr-title" title="' + soy.$$escapeHtml(opt_data.field.title) + '"></span>' : '');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.userlink = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a __jive_macro_name="user" __default_attr="', soy.$$escapeHtml(opt_data.userId), '" class="jive_macro jive_macro_user" href="">', soy.$$escapeHtml(opt_data.name), '</a>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.userpicker = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field ', (opt_data.labelPosition == 'top') ? 'fbldr-field-top' : '', '">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<a href="#" id="fbldr-link-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-userpicker-link fbldr-input">select users</a>');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('<ul id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-userpicker-list ', (opt_data.labelPosition == 'top') ? 'fbldr-userpicker-list-top' : '', '"></ul></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.validationErrors = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-valid-errors">');
  var errorList425 = opt_data.errors;
  var errorListLen425 = errorList425.length;
  for (var errorIndex425 = 0; errorIndex425 < errorListLen425; errorIndex425++) {
    var errorData425 = errorList425[errorIndex425];
    output.append('<div class="fbldr-valid-error"><span class="jive-icon-sml jive-icon-redalert fbldr-error"></span>&nbsp;<span class="fbldr-valid-error-text">', soy.$$escapeHtml(errorData425), '</span></div>');
  }
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive = jive || {};
jive.fbldr = jive.fbldr || {};

$j = jQuery.noConflict();

jive.fbldr.dataFilter = function(data, type) {
    return type === 'json' ? $j.trim(data.replace(/^throw [^;]*;/, '')) : data;
};

jive.fbldr.isDebug = function() {
	if (gadgets) {
		var prefs = new gadgets.Prefs();
		return prefs.getBool("fbldr_debug");
	}
	else {
		return true;
	}
}

jive.fbldr.isEmbedded = function() {
    return ($j("body#fbldr-body-embed").length > 0);
}

jive.fbldr.isVer3 = function() {
    if (gadgets && gadgets.util) {
        return gadgets.util.hasFeature("jive-core-v3");
    }
    else {
        return false;
    }
}

jive.fbldr.errorMessage = function(msg) {
    var $p = $j('<p/>').html(msg);
    $j('<div title="Error"/>').append($p).dialog({modal: true}); 
};

jive.fbldr.successMessage = function(msg) {
    var $p = $j('<p/>').html(msg);
    $j('<div title="Success"/>').append($p).dialog({modal: true}); 
};

jive.fbldr.updateTags = function(postResponse, contentType, tags, callback) {
    if (!jive.fbldr.isVer3() || postResponse.error) {
        callback(postResponse);
        return;
    }
    
    var descriptor = (contentType == "document" ? "102" : "1")
        + "," + postResponse.content.id;

    osapi.jive.corev3.contents.get({ entityDescriptor: descriptor }).execute(function(response) {
        if (response.error) {
            callback(postResponse);
            return;
        }
        
        var content = response.list[0];
        content.tags = tags;
        
        // console.log("Updating tags on content", tags, content);
        
        content.update().execute(function(response) {
            if (response.error) {
                console.log("Error updating tags on content", postResponse, response);
            }
            callback(postResponse);
        });
    });
};

(function ($) {
    $.extend({      
        getQueryString: function (name) {           
            function parseParams() {
                try {
                    var params = {},
                        e,
                        a = /\+/g,  // Regex for replacing addition symbol with a space
                        r = /([^&=]+)=?([^&]*)/g,
                        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                        q = window.parent.location.search.substring(1);
    
                    while (e = r.exec(q))
                        params[d(e[1])] = d(e[2]);
    
                    return params;
                }
                catch(e) {
                    // handle security exception in case apps are not in same domain as site
                    return {};
                }
            }

            if (!this.queryStringParams)
                this.queryStringParams = parseParams(); 

            return this.queryStringParams[name];
        },
        getViewParam: function (name) {
            if (gadgets) {
                var viewParams = gadgets.views.getParams();
                return viewParams[name];
            }
            else {
                return null;
            }
        }
    });
})(jQuery);
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.ContentCreator = function(template, form) {
    
    var prefs = new gadgets.Prefs();
    
    var create = function(callback) {
    	var type = template.content.type;
        var title = parse(template.content.title);
        var body = parse(template.content.body);
        
        if (jive.fbldr.isEmbedded()) {
            osapi.jive.core.container.editor().insert(body);
        }
        else if (type == 'message') {
        	getUsers(function(users) {
        		if (users.error) {
        		    callback({ error: users.error });
        		}
        		else {
        			createMessage(users, { title: title, body: body }, callback);
        		}
        	});
        }
        else {
            var tags = getFormTags();
            
        	getContainer(function(container) {
        		if (container.error) {
        		    callback({ error: container.error });
        		}
        		else {
        			createContent(container, { title: title, body: body, tags: tags }, callback);
        		}
        	});
        }
    };
    
    var preview = function() {
        var title = parse(template.content.title);
        var body = parse(template.content.body);
        var tags = getFormTags();
        
        return {
            title: title,
            body: body,
            tags: tags
        }
    };
    
    var parse = function(text) {
        var replaced = text;
        for (var i = 0; i < template.fields.length; i++) {
            var field = template.fields[i];
            
            if (field.type == 'tags') {
                continue;
            }
            
            var value = getFieldValue(field);
            
            var elseRegex = new RegExp("\\{if \\$" + field.id + "\\}([\\\s\\\S]*?)\\{else\\}([\\\s\\\S]*?)\\{\\/if\\}", "g");
            var ifRegex   = new RegExp("\\{if \\$" + field.id + "\\}([\\\s\\\S]*?)\\{\\/if\\}", "g");
            var valueRegex = new RegExp("\\{\\$" + field.id + "\\}", "g");
            var labelRegex = new RegExp("\\{\\$" + field.id + "\\.label\\}", "g");
            
            if (!value) {
                replaced = replaced.replace(elseRegex, "$2");
                replaced = replaced.replace(ifRegex, "");
            }
            else {
                replaced = replaced.replace(elseRegex, "$1");
                replaced = replaced.replace(ifRegex, "$1");
            }
            
            replaced = replaced.replace(valueRegex, value);
            replaced = replaced.replace(labelRegex, field.label);
        }
        return replaced;
    };
    
    var getFieldValue = function(field) {
        var value;
        
        if (field.type == "link") {
            value = getLinkValue(field);
        }        
        else if (field.type == "list") {
            value = getListValues(field);
        }
        else if (field.type == "multi-select") {
            value = getMultiSelectValues(field);
        }
        else if (field.type == "userpicker") {
            value = getUserPickerValues(field);
        }
        else if (field.type == "userselect") {
            value = getUserSelectValues(field);
        }
        else {
            value = getSafeValue(field);
        }
        
        return value;
    };
    
    var convertItemsToList = function(field, items) {
        var style = field.listStyle;
        
        if (!items) {
            return '';
        }
        else if (style == 'comma') {
            return items.join(', ');
        }
        else {
            return jive.fbldr.soy.list({
               items: items,
               ordered: (style == 'ordered'),
               unstyled: (style == 'none')
            });
        }
    }

    var getLinkValue = function(field) {
        var href = getSafeValue(field) || '';
        var label = getSafeValue({ id: field.id + '-text' }) || '';
        
        if (href.length > 0 && label.length <= 0) {
            return '<a href="' + href + '">' + href + '</a>';
        }
        else if (href.length <= 0 && label.length > 0) {
            return label;
        }
        else if (href.length > 0 && label.length > 0) {
            return '<a href="' + href + '">' + label + '</a>';
        }
        else {
            return '';
        }
    };
    
    var getListValues = function(field) {
        var items = splitValues(field);
        return convertItemsToList(field, items);
    };
    
    var splitValues = function(field, separator) {
        if (!separator) {
            separator = ',';
        }
        
        var items = new Array();
        var values = getSafeValue(field, true).split(separator);
        for (var i = 0; i < values.length; i++) {
            var value = $j.trim(values[i]);
            if (value) {
                items.push(value);
            }
        }
        return items;
    };

    var getMultiSelectValues = function(field) {
        var items = $j(form).find("#fbldr-field-" + field.id).val();
        return convertItemsToList(field, items);
    };
    
    var getUserPickerValues = function(field) {
        var userLinks = new Array();
        var users = $j(form).find("#fbldr-field-" + field.id).find('li');
        for (var i = 0; i < users.length; i++) {
            var id = $j(users[i]).attr('userid');
            var name = $j(users[i]).attr('username');
            userLinks.push(jive.fbldr.soy.userlink({ userId: id, name: name }));
        }
        return convertItemsToList(field, userLinks);
    };

    var getUserSelectValues = function(field) {
        // TODO: This doesn't work with !app, and we don't currently have names
        var userLinks = new Array();
        var userIds = $j(form).find("#fbldr-field-" + field.id).val().split(",");
        for (var i = 0; i < userIds.length; i++) {
            var id = $j.trim(userIds[i]);
            userLinks.push(jive.fbldr.soy.userlink({ userId: id, name: '' }));
        }
        return convertItemsToList(field, userLinks);
    };
    
    var getSafeValue = function(field, clearNewlines) {
    	return sanitizeValue($j(form).find("#fbldr-field-" + field.id), clearNewlines);
    };
    
    var sanitizeValue = function(element, clearNewlines) {
        if (clearNewlines == null) {
            clearNewlines = false;
        }
        
        var value = $j(element).val();
        value = $j.trim(value);
        value = $j('<div/>').text(value).html(); // escapes html tags, etc.
        value = value.replace(/\n/g, clearNewlines ? '' : '<br/>');
        return value;    	
    };
    
    var getFormTags = function() {
        // Get the tags included with the template
        var tags = template.content.tags || [];
        
        // Get any user-entered tags
        for (var i = 0; i < template.fields.length; i++) {
            var field = template.fields[i];
            
            if (field.type == 'tags') {
                var items = splitValues(field, /[\s,]+/);
                if (items && items.length > 0) {
                    tags = tags.concat(items);
                }
            }
        }
        
        return tags;
    };
    
    var createMessage = function(users, content, callback) {
    	if (jive.fbldr.isDebug()) {
    		console.log("Create message for users: ", users);
    		console.log("Content title: ", content.title);
    		console.log("Content body: ", content.body);
    	}

    	var data = {
    	    html: '<p>' + content.title + '</p><p>' + content.body + '</p>',
    	    participant: []
    	};
    	
    	var baseUrl = getBaseUrl();

    	for (var i = 0; i < users.length; i++) {
    		var user = users[i];
    		data.participant.push(baseUrl + '/api/core/v2/users/' + user.id);
    	}

    	osapi.jive.core.directmessages.create(data).execute(function(response) {
            if (response.error) {
                callback({ error: response.error.message });
            }
            else {
                var message = response.data;
                message.contentType = "message";
                message.href = "/inbox/dm/" + response.data.id;
                message.subject = content.title;

                doActions(message, callback);
            }
    	});
    };    

    var createContent = function(container, content, callback) {
    	if (jive.fbldr.isDebug()) {
    		console.log("Create content in container: ", container);
    		console.log("Content title: ", content.title);
    		console.log("Content body: ", content.body);
    		console.log("Content tags: ", content.tags);
    	}
    	
        var containerType = container.containerType;
        var containerId = container.containerId;
        
        var contentType = template.content.type;
        var data = { subject: content.title, html: content.body }; 
        
        if (contentType == "document") {
            contentType = "document";
        }
        else if (contentType == "discussion" || contentType == "question") {
            data.question = (contentType == "question");
            contentType = "discussion";
        }
        else {
            var error = "Unable to create content of unknown type: " + contentType;
            callback({ error: error });
            return;
        }
        
        if (content.tags && content.tags.length > 0 && jive.fbldr.isVer3()) {
            var origCallback = callback;
            callback = function(response) {
                jive.fbldr.updateTags(response, contentType, content.tags, origCallback);
            };
        }
        
        if (containerType == "group") {
            postToGroup(containerId, contentType, data, callback);
        }
        else if (containerType == "project") {
            postToProject(containerId, contentType, data, callback);
        }
        else if (containerType == "space") {
            postToSpace(containerId, contentType, data, callback);
        }
    };
    
    var postToGroup = function(groupId, contentType, data, callback) {
        osapi.jive.core.groups.get({id: groupId}).execute(function(response) {
        	doPost(response, contentType, data, callback);
        });
    };

    var postToProject = function(projectId, contentType, data, callback) {
        osapi.jive.core.projects.get({id: projectId}).execute(function(response) {
        	doPost(response, contentType, data, callback);
        });
    };    

    var postToSpace = function(spaceId, contentType, data, callback) {
        osapi.jive.core.spaces.get({id: spaceId}).execute(function(response) {
            doPost(response, contentType, data, callback);
        });
    };
    
    var doPost = function(response, contentType, data, callback) {
        if (response.error) {
            callback({ error: response.error.message });
            return;
        }

        var container = response.data;
        
        if (contentType == "discussion") {
            postDiscussion(container, data, callback); 
        }
        else if (contentType == "document") {
            postDocument(container, data, callback);
        }
    };
    
    var postDiscussion = function(container, data, callback) {
        container.discussions.create(data).execute(function(response){
            if (response.error) {
                callback({ error: response.error.message });
            }
            else {
                var discussion = response.data;
                discussion.contentType = (data.question) ? "question" : "discussion";
                discussion.href = "/threads/" + response.data.id;
                discussion.subject = data.subject;
                
                /* 
                 * Currently cannot add attachments or images to discussions, at least
                 * not when using Jive Core API v2, revisit when moving to Core API v3
                 *
                if (template.content.includeAttachment) {
                	addAttachments(template, discussion, callback);
                }
                else {
                    doActions(discussion, callback);
                }
                 */
	
                doActions(discussion, callback);
            }
        });
    };

    var postDocument = function(container, data, callback) {
        container.documents.create(data).execute(function(response){
            if (response.error) {
                callback({ error: response.error.message });
            }
            else {
                var document = response.data;
                document.contentType = "document";
                document.href = "/docs/DOC-" + response.data.id;
                document.subject = data.subject;

                if (template.content.includeAttachment) {
                	addAttachments(template, document, callback);
                }
                else {
                    doActions(document, callback);
                }
            }
        });
    };
    
    var addAttachments = function(template, content, callback) {
        if (!content.attachments) {
            content.attachments = [];
        }
        
    	var dirty = false;
    	
        $j('#fbldr-dialog').html(jive.fbldr.soy.attachments({
        	variables: getHtmlVariables(content.content.text)
        })).dialog({
        	buttons: { 
        	    Finished: function() {
        		    $j(this).dialog("close");
        	    }
            },
        	closeOnEscape: false,
        	modal: true,
        	title: "Add Attachments",
        	close: function() {
            	if (dirty) {
            		content.update().execute(function(response) {
            			doActions(content, callback);
            		});
            	}
            	else {
            	    doActions(content, callback);
            	}
            }
        }); 
    	
        $j('#fbldr-attach-file').click(function() {
            $j("#fbldr-attach-file").attr("disabled", "disabled");
            $j("#fbldr-attach-link").attr("disabled", "disabled");
            
        	content.requestAttachmentUpload(function(attachment) {
        	    if (attachment && attachment.id) {
        	        handleAttachmentUpload(attachment);
        	    }
        	    else {
        	        content.get().execute(function(response) {
                        try {
            	            if (response.error) {
            	                handleAttachmentUpload();
            	            }
            	            else {
            	                handleAttachmentUpload(getNewAttachment(content, response.data));
            	            }
                        }
                        catch (e) {
                            console.log('Error adding attachment', e);
                        }
        	        });
        	    }
            }, {
                dialogTitle: "Form Attachment",
                instructionMsg: "Select a file to attach to the content being created by the form."
            });
        });
        
        var handleAttachmentUpload = function(attachment) {
            if (!attachment) {
                $j("#fbldr-attach-file").removeAttr("disabled");
                $j("#fbldr-attach-link").removeAttr("disabled");
                return;
            }

            console.log("Added attachment:", attachment);   
            content.attachments.push(attachment);
            
            var linkField = $j("#fbldr-attach-link");
            var linkTo = sanitizeValue(linkField);
            if (linkTo) {
                var parsedText = parseAttachment(linkTo, content, attachment);
                content.content.text = parsedText;
                $j('#fbldr-attach-link').find('option[value="' + linkTo + '"]').remove();
            }
            $j(linkField).val("");
            $j('#fbldr-attach-files').append(jive.fbldr.soy.attachFile({
                attachment: attachment,
                linkTo: linkTo
            }));
            
            $j("#fbldr-attach-file").removeAttr("disabled");
            $j("#fbldr-attach-link").removeAttr("disabled");
            
            dirty = true;
        };
        
        var getNewAttachment = function(oldContent, newContent) {
            if (!newContent || !newContent.attachments) {
                return null;
            }
            
            var oldAttaches = oldContent.attachments || [];
            var newAttaches = newContent.attachments || [];
            
            for (var i = 0; i < newAttaches.length; i++) {
                if (!containsAttach(oldAttaches, newAttaches[i])) {
                    return newAttaches[i];
                }
            }
            
            return null;
        };
        
        var containsAttach = function(oldAttaches, newAttach) {
            var contains = false;
            
            for (var i = 0; i < oldAttaches.length; i++) {
                if (newAttach.id == oldAttaches[i].id) {
                    contains = true;
                    break;
                }
            }
            
            return contains;
        };
    };
    
    var getHtmlVariables = function(text) {
    	var variables = [];
    	
    	var varRegex = new RegExp("\\{\\$(.*?)\\.(?:link|img)\\}", "g");
    	var match;
    	
    	while (match = varRegex.exec(text)) {
    		var variable = match[1];
    		if (variables.indexOf(variable) < 0) {
    			variables.push(variable);
    		}
    	}
    	
    	return variables.sort();
    };
    
    var parseAttachment = function(linkTo, content, attachment) {    	
        var replaced = content.content.text;
        
        var config = {
            filename: attachment.name,
            attachId: attachment.id,
            docId: content.id
        };
        
        var linkRegex = new RegExp("\\{\\$" + linkTo + "\\.link\\}", "g");
        replaced = replaced.replace(linkRegex, jive.fbldr.soy.attachLink(config));

        if (attachment.contentType && attachment.contentType.indexOf('image') == 0) {
            var imgRegex = new RegExp("\\{\\$" + linkTo + "\\.img\\}", "g");
            replaced = replaced.replace(imgRegex, jive.fbldr.soy.attachImage(config));
        }
        
        return replaced;
    };
    
    var doActions = function(content, callback) {
        content.href = getBaseUrl() + content.href;
        callback({ content: content, error: null });
    };

    var getBaseUrl = function() {
        if (gadgets && gadgets.util) {
            return gadgets.util.getUrlParameters().parent;    
        }

        var baseUrl =
            window.location.protocol + '//' +
            window.location.host +
            ((window.location.port) ? ':' + window.location.port : '');
        
        return baseUrl;
    };
    
    var getContainer = function(callback) {
    	var container = {
    	    containerType: $j.getViewParam('locationType'),
    	    containerId: parseInt($j.getViewParam('locationId'))
    	};
    	
    	if (isValidContainer(container)) {
    		console.log("Got place from URL: ",  container);    		
    		callback(container);
    	}
    	else {
    		var contentType = (template.content.type == "document") ? "document" : "discussion";
    		
    		osapi.jive.core.places.requestPicker({
                success: function(response) {
    			    if (!response.data) {
    			    	callback({ error: "Invalid place selected: must be a space, project, or group." });
    			    	return;
    			    }
    		
    			    var place = response.data;
    			
    			    console.log('Got place from chooser: ', place); 
    			    
    			    var uri = place.resources.self.ref;
    			    
    			    if (uri.indexOf('/spaces/') >= 0) {
    			    	container.containerType = "space";
    			    }
    			    else if (uri.indexOf('/groups/') >= 0) {
    			        container.containerType = "group";
    		        }
    			    else {
    			        container.containerType = "project";
    		        }
    		        
    		        container.containerId = place.id;
    			    
    		        if (isValidContainer(container)) {
    		            callback(container);
    		        }
    		        else {
    		        	callback({ error: "Invalid place selected: must be a space, project, or group." })
    		        }
                },
        	    error: function(response) {
                	callback({ error: response.message });
                },
                contentType: contentType
            });
    	}
    };
    
    var isValidContainer = function(container) {
    	if (!container) {
    		return false;
    	}
    	
    	var containerType = container.containerType;
    	var containerId = container.containerId;
    	
        if (!containerType || (containerType != "group" && containerType != "project" && containerType != "space")) {
            return false;
        }
        if (isNaN(containerId) || containerId <= 0) {
            return false;
        }
        return true;
    };
    
    var getUsers = function(callback) {
    	var user = {
    		id: parseInt($j.getViewParam('userId'))
    	};
    	
    	if (isValidUser(user)) {
    		console.log("Got user from URL: ",  user);    		
    		callback([ user ]);
    	}
    	else {
            osapi.jive.core.users.requestPicker({
                multiple : true,
                success : function(response) {
    			    if (!response.data) {
    			    	callback({ error: "Invalid user selected." });
    			    	return;
    			    }
            	
                    var users;
                    if ($j.isArray(response.data)) {
                        users = response.data;
                    } else {
                        users = new Array();
                        users.push(response.data);
                    }
                    
                    console.log('Got users from chooser: ', users);
                    
                    if (users.length > 0) {
                        callback(users);
                    }
                    else {
                    	callback({ error: 'No users selected.' });
                    }
                },
                error : function(error) {
                	callback({ error: response.message });
                }
            });
    	}
    };

    var isValidUser = function(user) {
    	if (!user) {
    		return false;
    	}
    	
    	var userId = user.id;
    	
        if (isNaN(userId) || userId <= 0) {
            return false;
        }
        return true;
    };
            
    return {
        create: create,
        preview: preview
    };
    
}
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.FormBuilder = function(options) {

    var containerId = options.containerId;
    var container = "#" + containerId;
    
    var prefs = new gadgets.Prefs();
    
    var handleCategoryChange = function() {
        var cat = $j(this).val();
        var templates = getTemplates(cat);

        $j(this).toggleClass("fbldr-none", (!cat));
        formRenderer.clear();
        $j("#fbldr-field-ctrl-tmplts").html('')
            .removeClass("fbldr-opt-error").addClass("fbldr-none")
            .append(jive.fbldr.soy.options({ values: templates.templateValues }));
    };
    
    var handleTemplateChange = function() {
        var cat = $j("#fbldr-field-ctrl-cats").val();
        var index = $j(this).val();

        if (cat && index) {
            var templates = templateProvider.getTemplates(cat);
            var template = templates[parseInt(index)];
            renderTemplate(template);
        }
        else {
            $j(this).removeClass("fbldr-opt-error").addClass("fbldr-none");
            formRenderer.clear();
        }        
    };
    
    var renderTemplate = function(template) {
        if (!template) return;

        var hasErrors = typeof(template.errors) != "undefined";           
        $j("#fbldr-field-ctrl-tmplts").removeClass("fbldr-none").toggleClass("fbldr-opt-error", hasErrors);
        formRenderer.render(template);
    };
    
    var init = function() {
        var categories = getCategories();
        var templates = getTemplates(categories.categoryValue);
        
        if (categories.categoryValues.length == 0) {
            renderGettingStarted();
            return;
        }
                
        $j(container).addClass("fbldr-main").html('')
            .append(jive.fbldr.soy.heading({ index: 1, text: "Select a Template Form" }))
            .append(jive.fbldr.soy.select({ field: { id: "ctrl-cats", label: "Category", values: categories.categoryValues, value: categories.categoryValue } }))
            .append(jive.fbldr.soy.select({ field: { id: "ctrl-tmplts", label: "Template", values: templates.templateValues, value: templates.templateValue } }))
            .append('<div id="fbldr-container"></div>');
            
        $j("#fbldr-field-ctrl-cats").toggleClass("fbldr-none", (!categories.categoryValue)).change(handleCategoryChange);
        $j("#fbldr-field-ctrl-tmplts").toggleClass("fbldr-none", (!templates.template)).change(handleTemplateChange);
        
        renderTemplate(templates.template);
    };
    
    var renderGettingStarted = function() {
        $j(container).addClass("fbldr-main").html('')
            .append(jive.fbldr.soy.heading({ index: 1, text: "Getting Started with Forms" }))
            .append(jive.fbldr.soy.start());
    };
    
    var getCategories = function() {
        var categories = templateProvider.getCategories();
        var categoryValue = getCategoryValue(categories);
        var categoryValues = [];
        
        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            categoryValues.push({ value: category, label: category });
            
            if (!categoryValue && (prefs.getString('fbldr_category') == category)) {
                categoryValue = category;
            }
        }
        
        return { categoryValues: categoryValues, categoryValue: categoryValue };
    };
    
    var getCategoryValue = function(categories) {
        var category = $j.getViewParam('category');
        
        for (var i = 0; i < categories.length; i++) {
            if (categories[i] == category) {
                return category;
            }
        }
        
        if (categories.length == 1) {
            return categories[0];
        }
        
        return null;
    };
    
    var getTemplates = function(cat) {
        if (!cat) return { templateValues: [], templateValue: null };
        
        var templates = templateProvider.getTemplates(cat);
        var templateMeta = getTemplateValue(templates);
        var templateIndex = templateMeta.templateIndex;
        var templateValue = templateMeta.templateValue;
        var templateValues = [];
        
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            var name = template.name;
            var cssClass = '';
            
            if (template.errors && template.errors.length > 0) {
                name += ' (!)';
                cssClass = 'fbldr-opt-error';
            }
            
            templateValues.push({ value: i, label: name, cssClass: cssClass });
            
            if (!templateValue && (prefs.getString('fbldr_template') == name)) {
                templateValue = template;
                templateIndex = i;
            }
        }
        
        return { templateValues: templateValues, templateValue: templateIndex, template: templateValue };
    };
    
    var getTemplateValue = function(templates) {
        var template = $j.getViewParam('template');
        
        for (var i = 0; i < templates.length; i++) {
            if (templates[i].name == template) {
                return { templateValue: templates[i], templateIndex: i };
            }
        }
        
        if (templates.length == 1) {
            return { templateValue: templates[0], templateIndex: 0 };
        }
        
        return { templateValue: null, templateIndex: -1 };
    };
    
    var templateProvider = new jive.fbldr.TemplateProvider(options, { onLoad: init });
    var formRenderer = new jive.fbldr.FormRenderer(options);
    
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.FormCreator = function(options) {
    
    options.preview = function(content) {
        renderContentPreview(content);
    };
    
    var rebuildDelay = 750;
    var rebuildTimeout = null;
    
    var formRenderer = new jive.fbldr.FormRenderer(options);
    
    var prefs = new gadgets.Prefs();

    var addField = function() {
        var field = {};
        
        $j('#fbldr-field-form input, #fbldr-field-form select').each(function() {
            var name = $j(this).attr('name');
            var value = null;
            
            if ($j(this).attr('type') == 'checkbox') {
                value = $j(this).is(':checked');
            }
            else {
                value = $j(this).val();
            }
            
            if (name == 'id') {
                value = value.replace(/\s+/g, '');
            }
            else if (name == 'patterns' || name == 'values') {            	
                var values = [];
                
                if (value) {
                    var parts = value.split(',');
                    
                    for (var i = 0; i < parts.length; i++) {
                        values.push($j.trim(parts[i]));
                    }
                }

                if (values.length > 0) {
                    value = values;
                }
            }
            
            // Do not assign an empty array if nothing was specified
        	if (value != null) {
        		field[name] = value;
        	}   
        });
        
        if (!field.id || !field.label) {
            $j('#fbldr-create-error-box').find('span.message').html("Error: field ID and label are required.");
            $j('#fbldr-create-error-box').show();
            return false;
        }
        
        var hasDuplicate = false;
        
        $j('#fbldr-fields input[type="hidden"]').each(function() {
            var value = unescape($j(this).val());
            var otherField = JSON.parse(value);
            if (field.id == otherField.id) {
                $j('#fbldr-create-error-box').find('span.message').html("Error: '" + field.id + "' is aleady defined.");
                $j('#fbldr-create-error-box').show();
                hasDuplicate = true;
            }
        });
        
        if (hasDuplicate) {
            return false;
        }
        
        $j('#fbldr-fields').append(jive.fbldr.create.soy.field({
            field: field,
            json: escape(JSON.stringify(field))
        }));
        
        $j('#fbldr-field-fbldr-field-listStyle').attr('disabled', 'disabled');
        $j('#fbldr-field-fbldr-field-listStyle').closest('div.fbldr-field').hide();
        
        $j('#fbldr-field-fbldr-field-values').attr('disabled', 'disabled');
        $j('#fbldr-field-fbldr-field-values').closest('div.fbldr-field').hide();
        
        $j('#fbldr-create-error-box').hide();
        $j('#fbldr-field-form').get(0).reset();
        
        return true;
    };
    
    var buildCreateForm = function() {
        $j('#fbldr-create-form')
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-category', label: 'Category', name: 'category', required: true, value: 'My Category',
            	    title: 'The category of the template, under which the template will appear under when selecting from the list of available templates in the app.' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-name', label: 'Name', name: 'name', required: true, value: 'My Template',
            	    title: 'The name of the template, which again will appear when selecting the template from the list of available templates in the app.' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-desc', label: 'Description', name: 'desc', required: true, value: 'My Template Description',
            	    title: 'A more verbose description of the template, and its intended use / purpose.  This will display above the template form, once the template is selected in the app.' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-date', label: 'Date Format', name: 'dateFormat', required: false, value: 'mm/dd/yy',
                    title: 'Date format to use for any date fields contained within the form.' }
            }))
            .append(jive.fbldr.soy.select({
                field : { id: 'fbldr-form-label-position', label: 'Label Position', name: 'labelPosition', required: true, value: 'left',
            	    title: 'Position of field label, with respect to the input field, within the rendered form.',
                    values : [ { value: 'left', label: 'Left' }, { value: 'top', label: 'Top' } ]
                }
            }))
            .append(jive.fbldr.soy.select({
                field : { id: 'fbldr-form-type', label: 'Content Type', name: 'content.type', required: true, value: 'document',
            	    title: 'What type of content to create (Document, Discussion, etc.) when using the template to post from the home / canvas app view.',
                    values : [ { value: 'document', label: 'Document' }, { value: 'discussion', label: 'Discussion' }, { value: 'message', label: 'Private Message' }, { value: 'question', label: 'Question' } ]
                }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-tags', label: 'Content Tags', name: 'content.tags', required: false, value: '',
                    title: 'Tags to automatically apply to any content created by the form.' }
            }))
            .append(jive.fbldr.soy.checkbox({
                field : { id: 'fbldr-form-attach', label: 'Attachments', name: 'content.includeAttachment',
            	    title: 'If checked, the user will be allowed to add file and image attachments to the piece of content, after the form has been successfully posted to Jive.' }
            }))
            .append(jive.fbldr.soy.divider(
            ))
            .append(jive.fbldr.soy.radio({
                field : { id: 'fbldr-form-body-type', label: 'HTML Source', name: 'form.contentSource', value: 'document',
                    values : [ { value: 'document', label: 'Another Jive Document' }, { value: 'template', label: 'Within This Template' } ]
                }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-doc-id', label: 'HTML Doc ID', name: 'content.docId', required: true, value: "0" }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-title', label: 'HMTL Title', name: 'content.title', required: true }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-form-body', label: 'HTML Body', name: 'content.body', required: true }
            }));
        
        renderContentSource();
    };
    
    var buildFieldForm = function() {
        $j('#fbldr-field-form')
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-id', label: 'ID', name: 'id', required: true,
            	    title: 'The unique identifier for the field.  All whitespace will be removed from the ID field, and only alphanumeric, "-", and "_" characters should be used.' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-label', label: 'Label', name: 'label', required: true,
            	    title: 'The user-friendly label for the field, which will show next to the field when rendered in the form.' }
            }))
            .append(jive.fbldr.soy.select({
                field : { id: 'fbldr-field-type', label: 'Type', name: 'type', required: true, value: 'text',
            	    title: 'The data / UI entry type of the field, Text Field, Date, etc.',
                    values : [ { value: 'text', label: 'Text Field'}, { value: 'textarea', label: 'Text Area' },
                               { value: 'boolean', label: 'Checkbox' }, { value: 'date', label: 'Date Field' },
                               { value: 'link', label: 'Link / URL' }, { value: 'list', label: 'List of Values' },
                               { value: 'multi-select', label: 'Select Multiple Options' }, { value: 'select', label: 'Select Single Option' },
                               { value: 'tags', label: 'Tags for Content' }, { value: 'userpicker', label: 'User Picker' } ]
                }
            }))
            .append(jive.fbldr.soy.select({
                field : { id: 'fbldr-field-listStyle', label: 'List Style', name: 'listStyle', required: false, value: 'comma',
                    title: 'For list and user fields, how to render the list of items.',
                    values : [ { value: 'comma', label: 'Comma-Delimited List'},
                               { value: 'none', label: 'No List Icon' },
                               { value: 'ordered', label: 'Numbered List Icon' },
                               { value: 'unordered', label: 'Bulleted List Icon' } ]
                }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-values', label: 'Values', name: 'values', required: true,
            	    title: 'Options to choose from the select list.  Enter as comma-delimited list (e.g. value1, value2, value3)' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-value', label: 'Default Value', name: 'value',
            	    title: 'For text fields, and select fields, provides the default value that will be placed in the form when it first loads (does not apply to all field types)' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-title', label: 'Tooltip', name: 'title',
            	    title: 'A more verbose, descriptive text describing the use or format of the field, which is displayed when the user hovers over the "i" info icon to the right of the form field.' }
            }))
            .append(jive.fbldr.soy.checkbox({
                field : { id: 'fbldr-field-required', label: 'Required', name: 'required',
            	    title: 'If checked, the user will be required to provide a value for this form field, and will not be allowed to submit the form successfully until a value is provided.' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-patterns', label: 'Patterns', name: 'patterns',
            	    title: 'A list of regular expressions which can be used to validate the value entered for the field.  Enter as comma-delimited list (e.g. pattern1, pattern2, pattern3)' }
            }))
            .append(jive.fbldr.soy.text({
                field : { id: 'fbldr-field-pattern-error', label: 'Pattern Error', name: 'patternError',
            	    title: 'A more user-friendly, human readable error to display when a regular expression is provided for validation and the value does not match.' }
            }))
            .append(jive.fbldr.create.soy.addField())
            .append(jive.fbldr.soy.divider(
            ));
        
        renderFieldValues();
    };
    
    var buildEmptyTemplate = function() {
        return {
            category : "",
            name : "",
            desc : "",
            fields : [],
            content : {
                type : "",
                docId : "",
                title : "",
                body : "",
                tags : [],
                includeAttachment : false
            }
        };
    };
    
    var createTemplate = function(container) {
        if (!container) return;
        
        var isVer3 = jive.fbldr.isVer3();
        
        var title = "Forms Template: " + $j.trim($j('#fbldr-field-fbldr-form-name').val());
        
        var body = $j('<div />').html(jive.fbldr.create.soy.boilerplateHeader({ v3: isVer3 })).html() 
                 + $j('#fbldr-create-text').val()
                 + $j('<div />').html(jive.fbldr.create.soy.boilerplateFooter()).html();
        
        var data = { subject: title, html: body }
        
        container.documents.create(data).execute(function(response){
            if (response.error) {
            	console.log('Error creating template: ' + response.error.message);
            	jive.fbldr.errorMessage(response.error.message);
            }
            else {
                var location = "/docs/DOC-" + response.data.id;
                var payload = { content: response.data, error: null };
                
                jive.fbldr.updateTags(payload, "document", [ "fbldr_template" ], function() {
                    // console.log("Redirect to new template: " + location);
                    setTimeout(function() {
                        window.parent.location = location;
                    }, 500);                    
                });
            }
        });

    };
    
    var handleFormInputs = function() {
        $j('#fbldr-create-form input').keyup(function(event) {
            if (event.which != 9 && event.which != 13) {
                clearTimeout(rebuildTimeout);
                rebuildTimeout = setTimeout(rebuildViews, rebuildDelay);
            }
            return true;
        });
        
        $j('#fbldr-create-form input[type="checkbox"],#fbldr-create-form select').change(function() {
            rebuildViews();
            return true;
        });
        
        $j('#fbldr-create-form input[type="radio"]').change(renderContentSource);        
    };
    
    var handleFieldInputs = function() {
        $j('#fbldr-field-form select[name="type"]').change(renderFieldValues);
        
        $j('#fbldr-field-add').click(function() {
            if (addField()) {
                rebuildViews();
            }
        });
        
        $j('#fbldr-fields').on('click', 'a.fbldr-field-del', function() {
            $j(this).closest('div').remove();
            rebuildViews();
            return false;
        });
        
        $j('#fbldr-fields').on('click', 'a.fbldr-field-down', function() {
            var listItem = $j(this).closest('div');
            var index = listItem.index();
            var last = $j('#fbldr-fields').children('div').length - 1;
            
            if (index != last) {
                listItem.next().after(listItem);
                rebuildViews();    
            }
            
            return false;
        });

        $j('#fbldr-fields').on('click', 'a.fbldr-field-up', function() {
            var listItem = $j(this).closest('div');
            var index = listItem.index();
            
            if (index != 0) {
                listItem.prev().before(listItem);
                rebuildViews();    
            }
            
            return false;
        });
    };
    
    var handleSourceInputs = function() {
        $j('#fbldr-create-template-btn').click(function() {
    		osapi.jive.core.places.requestPicker({
                success: function(response) {
    			    if (!response.data) {
    			    	return;
    			    }
    		
    			    createTemplate(response.data);
                },
        	    error: function(response) {
                	console.log('Error retrieving place: ' + response.message);
                },
                contentType: 'document'
            });

        });
    };
    
    var rebuildViews = function() {
        var data = rebuildTemplate();
        rebuildPreview(data);
        rebuildSource(data);                
    };
    
    var rebuildTemplate = function() {
        var template = buildEmptyTemplate();
        
        $j('#fbldr-create-form input,#fbldr-create-form select').each(function() {
            var names = $j(this).attr('name').split('.');
            
            if (names[0] == 'form') {
                return;
            }
            
            var value = null;

            if ($j(this).attr('name') == 'content.tags') {
                value = splitValues($j(this));
            }
            else if ($j(this).attr('type') == 'checkbox') {
                value = $j(this).is(':checked');
            }
            else {
                value = $j(this).val();
            }
            
            var obj = template;
            for (var i = 0; i < names.length - 1; i++) {
                obj = obj[names[i]];
            }
            
            if ($j(this).is(':disabled')) {
                delete obj[names[names.length - 1]];
            }
            else {
                obj[names[names.length - 1]] = value;
            }
        });
        
        $j('#fbldr-fields input[type="hidden"]').each(function() {
            var value = unescape($j(this).val());
            var field = JSON.parse(value);
            template['fields'].push(field);
        });
        
        return template;
    };
    
    var splitValues = function(element) {
        var items = new Array();
        
        if (!element) {
            return items;
        }
        
        var value = $j(element).val();
        
        if (!value) {
            return items;
        }
        
        var values = value.split(/[\s,]+/);
        for (var i = 0; i < values.length; i++) {
            items.push($j.trim(values[i]));
        }
        
        return items;
    };
    
    var rebuildPreview = function(data) {
        new jive.fbldr.TemplateValidator(data, function() {
            formRenderer.render(data);
            rebuildCreate(data);            
        });
    };
    
    var rebuildCreate = function(data) {
    	if (data.errors) {
        	$j('#fbldr-create-template-status').show();
        	$j('#fbldr-create-template-btn').attr('disabled', 'disabled');
        }
        else {
        	$j('#fbldr-create-template-status').hide();
        	$j('#fbldr-create-template-btn').removeAttr('disabled');
        }
    };
    
    var rebuildSource = function(data) {
        var json = JSON.stringify(data, null, 4);
        json = $j('<div />').text(json).html();
        var source = '<pre>\n' + json + '\n</pre>\n';
        $j('#fbldr-create-text').val(source);    
    };
    
    var renderContentPreview = function(content) {
        $j('#fbldr-content-preview-head').html('Title : ' + content.title);
        $j('#fbldr-content-preview-container').html(content.body);
        $j('#fbldr-content-preview-tags').html('Tags (' + content.tags.length + ') : ' + content.tags.join(', '));
        
        $j('#fbldr-create-views').tabs( "option", "disabled", [] );
        $j('#fbldr-create-views').tabs( "option", "selected", 2 );
    };
    
    var renderContentSource = function() {
        var value = $j('#fbldr-create-form input[type="radio"]:checked').val();
        var showDoc = (value == 'document');

        $j('#fbldr-field-fbldr-form-doc-id').attr('disabled', showDoc ? null : 'disabled');
        $j('#fbldr-field-fbldr-form-title').attr('disabled', showDoc ? 'disabled' : null);
        $j('#fbldr-field-fbldr-form-body').attr('disabled', showDoc ? 'disabled' : null);
        
        $j('#fbldr-field-fbldr-form-doc-id').closest('div.fbldr-field').toggle(showDoc);
        $j('#fbldr-field-fbldr-form-title').closest('div.fbldr-field').toggle(!showDoc);
        $j('#fbldr-field-fbldr-form-body').closest('div.fbldr-field').toggle(!showDoc);
        
        rebuildViews();
    };

    var renderFieldValues = function() {
        var value = $j('#fbldr-field-form select[name="type"]').val();
        var showStyles = (value == 'list' || value == 'multi-select' || value == 'userpicker' || value == 'userselect');
        var showValues = (value == 'multi-select' || value == 'select');

        $j('#fbldr-field-fbldr-field-listStyle').attr('disabled', showStyles ? null : 'disabled');
        $j('#fbldr-field-fbldr-field-listStyle').closest('div.fbldr-field').toggle(showStyles);
        
        $j('#fbldr-field-fbldr-field-values').attr('disabled', showValues ? null : 'disabled');
        $j('#fbldr-field-fbldr-field-values').closest('div.fbldr-field').toggle(showValues);
    };
    
    var renderPreviewHeader = function() {
        $j('#fbldr-create-preview-head')
        .append(jive.fbldr.soy.heading({ index: 1, text: "Enter Template and Field Information" }))
        .append(jive.fbldr.create.soy.headingText());
    };
    
    var init = function() {
        renderPreviewHeader();

        buildCreateForm();
        buildFieldForm();
        
        handleFormInputs();
        handleFieldInputs();
        handleSourceInputs();
        rebuildViews();        
        
        $j('#fbldr-menu-create').hide();
        $j('#fbldr-menu-help').show();
        $j('#fbldr-menu-forms').show();
        
        $j('#fbldr-create-views').tabs({ disabled: [ 2 ] });
        $j('#fbldr-create-controls').tabs();
        
        $j('#fbldr-menu').fadeIn();
        $j("#fbldr-create").fadeIn();
    };
    
    init();
    
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.FormHelp = function(options) {
     
    var prefs = new gadgets.Prefs();
    
    var init = function() {
        $j('#fbldr-menu-create').show();
        $j('#fbldr-menu-help').hide();
        $j('#fbldr-menu-forms').show();
        
        $j('#fbldr-help').tabs();
        
        $j('#fbldr-menu').fadeIn();
        $j("#fbldr-help").fadeIn();
    };
 
    init();
    
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.FormRenderer = function(options) {
    
    var containerId = "fbldr-container";
    var container = "#" + containerId;
    var formId = "fbldr-form";
    var form = "#" + formId;
    
    var delay = 500;
    
    var prefs = new gadgets.Prefs();
    
    var clear = function(callback, params) {
        $j(container).fadeOut(delay, function() {
            $j('#fbldr-submit-status').toggleClass('fbldr-submit-error', false).html('').hide();
            $j(this).html('');
            if (!callback) callback = handleResize;
            callback(params);
        });
    };
    
    var render = function(template) {
        if (!template) return;
        
        var callback = (template.errors) ? showErrors : createForm;
        clear(callback, { template: template });
    };

    var showErrors = function(params) {
        var template = params.template;
        
        $j(container)
            .append(jive.fbldr.soy.heading({ index: 2, text: "Address Template Errors" }))
            .append(jive.fbldr.soy.validationErrors({ errors: template.errors }))
            .fadeIn(delay, handleResize);
    };
    
    var createForm = function(params) {
        var template = params.template;
    
        $j(container)
            .append(jive.fbldr.soy.heading({ index: 2, text: "Fill Out Template Form" }))
            .append(jive.fbldr.soy.header({ name: template.name, desc: template.desc }))
            .append(jive.fbldr.soy.form({ id: formId }));

        for (var i = 0; i < template.fields.length; i++) {
            renderField(template.fields[i], template);
        }
        
        $j(form)
            .append(jive.fbldr.soy.notes({ 
            	includeAttachment: (template.content.type == 'document' && template.content.includeAttachment)
            }))
            .append(jive.fbldr.soy.heading({ index: 3, text: "Submit Template Form" }))
            .append(jive.fbldr.soy.submit({ label: getSubmitLabel(template) }));
        
        handleSubmit(template);
        
        $j(container).fadeIn(delay, handleResize);
    };
    
    var getSubmitLabel = function(template) {
       var contentType = template.content.type;
       var label = "Submit Form";

       if (options.preview) {
    	   label = "Preview Content";
       }
       else if (jive.fbldr.isEmbedded()) {
           label = "Insert Form Content"; 
       }
       else if (contentType == "doc" || contentType == "document") {
           label = "Create Document";
       }
       else if (contentType == "discussion" || contentType == "thread") {
           label = "Post Discussion";
       }
       else if (contentType == "message") {
    	   label = "Send Message";
       }
       else if (contentType == "question") {
           label = "Post Question";
       }
       
       return label;
    };
    
    var handleResize = function() {
        if (typeof(gadgets) != "undefined") {
            // gadgets.window.adjustHeight();
        }
    };
    
    var handleSubmit = function(template) {
        $j("#fbldr-submit-btn").click(function() {
            var form = $j(this).closest("form");
            var valid = new jive.fbldr.FormValidator(template,form).isValid();
            if (valid) {
                if (options.preview) {
                    renderStatus('submit');
                    
                    var creator = new jive.fbldr.ContentCreator(template, form);
                    var content = creator.preview();
                    
                    setTimeout(function() {
                        renderStatus('success', null);
                        options.preview(content);
                    }, delay);
                }
                else {
                    renderStatus('submit');
                    var creator = new jive.fbldr.ContentCreator(template, form);
                    creator.create(handleCreated);
                }
            }
            else {
                renderStatus('error');
            }            
        });
    };
    
    var handleCreated = function(response) {
        if (response.error) {
            var msg = 'Error creating content: ' + response.error;
            jive.fbldr.errorMessage(msg);
            console.log(msg);
            renderStatus('failure');
        }
        else {
            // var msg = 'Succesfully created ' + response.content.contentType + ': ' + response.content.subject;
            // jive.fbldr.successMessage(msg);
            // console.log(msg);            
            renderStatus('success', response.content);
        }
    };
    
    var renderField = function(field, template) {
    	var data = {
    		field: field,
    		labelPosition: template.labelPosition
    	};
    	
        if (field.type == "boolean") {
            $j(form).append(jive.fbldr.soy.checkbox(data));
        }
        else if (field.type == "date") {
            $j(form).append(jive.fbldr.soy.text(data));
            $j("#fbldr-field-" + field.id).datepicker({
                showOn: "both",
                buttonImage: $j("#fbldr-cal-icon").attr("src"),
                buttonImageOnly: true,
                dateFormat: template.dateFormat
            });
        }
        else if (field.type == "link") {
            $j(form).append(jive.fbldr.soy.link(data));
        }
        else if (field.type == "multi-select") {
            $j(form).append(jive.fbldr.soy.select(data));
        }
        else if (field.type == "select" || field.type == "userselect") {
            $j(form).append(jive.fbldr.soy.select(data));
            $j("#fbldr-field-" + field.id).toggleClass("fbldr-none", !$j("#fbldr-field-" + field.id).val()).change(function() {
                $j(this).toggleClass('fbldr-none', !$j(this).val());
            });
        }
        else if (field.type == "tags" || field.type == "text") {
            $j(form).append(jive.fbldr.soy.text(data));
        }
        else if (field.type == "textarea" || field.type == "list") {
            $j(form).append(jive.fbldr.soy.textarea(data));
        }
        else if (field.type == "userpicker") {
        	data.multiple = true;
            $j(form).append(jive.fbldr.soy.userpicker(data));
            var userpicker = new jive.fbldr.UserPicker(data);
        }
        else {
            console.log("Unhandled field type: " + field.type + " (" + field.id + ")");
        }
    };
    
    var renderStatus = function(status, content) {
        var isError = (status == 'error' || status == 'failure');
        $j('#fbldr-submit-status').toggleClass('fbldr-submit-error', isError);
        
        var statusOptions = { statusHtml: 'Status unknown', iconCss: 'jive-icon-redalert' };
        
        if (status == 'error') {
            statusOptions.statusHtml = 'Form contains errors.';
        }
        else if (status == 'failure') {
            statusOptions.statusHtml = 'Error creating content.';
        }
        else if (status == 'submit') {
            statusOptions.statusHtml = 'Creating content...';
            statusOptions.iconCss = 'fbldr-submit-load';
            statusOptions.iconSrc = $j('#fbldr-load-icon').attr('src');
        }
        else if (status == 'success') {
            statusOptions.iconCss = 'jive-icon-check';
            
            var text = (options.preview) ? 'Preview success.' : 'Content created.';
            
            if (content) {
                statusOptions.statusHtml = jive.fbldr.soy.submitSuccess({ content: content, text: text });
                if (content.href && isRedirect()) {
                    setTimeout(function() {
                        window.parent.location = content.href;
                    }, delay);
                }
            }
            else {
                statusOptions.statusHtml = text;
            }
        }
        
        $j('#fbldr-submit-status').html(jive.fbldr.soy.submitStatus(statusOptions)).show();
    };
    
    var isRedirect = function() {
        var urlRedirect = ($j.getViewParam("redirect") == "true");
        var prefRedirect = prefs.getBool("fbldr_redirect"); 
        return ( urlRedirect || prefRedirect );
    };
    
    return {
        clear: clear,
        render: render
    };
    
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.FormValidator = function(template, form) {
    
    var isValid = function() {
        var hasError = false;
        
        for (var tIdx = 0; tIdx < template.fields.length; tIdx++) {
            var fieldError = false;
            var field = template.fields[tIdx];
            var value = getFieldValue(field);
            
            if (field.required && !value) {
                displayError(field, "'" + field.label + "' is a required field");
                fieldError = true;
            }
            else if (value && value.length > 0 && field.patterns && field.patterns.length > 0) {
                var matches = false;
                for (var pIdx = 0; pIdx < field.patterns.length; pIdx++) {
                    var pattern = field.patterns[pIdx];
                    if (value.match(new RegExp(pattern))) {
                        matches = true;
                        break;
                    }
                }
                
                if (!matches) {
                    var msg = getErrorMessage(field);
                    displayError(field, msg);
                    fieldError = true;
                }
            }
            
            if (fieldError) {
                hasError = true;
            }
            else {
                clearError(field);
            }
        }
        
        return !hasError;
    };
    
    var getErrorMessage = function(field) {
        var msg = "'" + field.label + "' does not match "
        
        if (field.patternError) {
            msg += field.patternError;
        }
        else if (field.patterns.length == 1) {
            msg += "the specified pattern '" + field.patterns[0] + "'";
        }
        else {
            msg += "any of the specified patterns";
        }
        
        return msg;
    }
    
    var clearError = function(field) {
        getErrorElement(field).attr("title", "").hide();
        getFieldElement(field).toggleClass("fbldr-input-error", false);        
    };
    
    var displayError = function(field, msg) {
        getErrorElement(field).attr("title", msg).show();
        getFieldElement(field).toggleClass("fbldr-input-error", true);
    };

    var getErrorElement = function(field) {
        return $j(form).find("#fbldr-error-" + field.id);
    };
    
    var getFieldElement = function(field) {
        return $j(form).find("#fbldr-field-" + field.id);
    };
    
    var getFieldValue = function(field) {
        if (field.type == "userpicker") {
            var userIds = new Array();
            var users = getFieldElement(field).find('li');
            for (var i = 0; i < users.length; i++) {
                var id = $j(users[i]).attr('userid');
                if (id)
                    userIds.push(id);
            }
            return (userIds.length > 0) ? userIds : null;
        }
        else {
            var value = getFieldElement(field).val();
            return (value) ? $j.trim(value) : "";
        }
    };
            
    return {
        isValid: isValid
    };
    
}
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.TemplateProvider = function(options, handlers) {

    var categories = [];
    var templateMap = {};
    
    var getCategories = function() {
        return categories;
    };
    
    var getTemplates = function(category) {
        return templateMap[category];
    };

    var categorizeTemplates = function(templates) {      
        categories = [];
        templateMap = {};
        
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            var category = templateMap[template.category];
            
            if (typeof(category) == "undefined") {
                templateMap[template.category] = [];
                category = templateMap[template.category];
                categories.push(template.category);
            }
            category.push(template);
        }
        
        categories.sort();
        
        for (var i = 0; i < templateMap.length; i++) {
            templateMap[i].sort(templateComparator);
        }
        
        if (handlers.onLoad) {
            handlers.onLoad();
        }
    };
    
    var templateComparator = function(t1, t2) {
        if (t1.name > t2.name) {
            return 1;
        }
        else if (t1.name < t2.name) {
            return -1;
        }
        else {
            return 0;
        }
    };

    var init = function() {
        var sourceOptions = options;
        
        sourceOptions.onLoad = function(templates) {
            categorizeTemplates(templates);
        };
        
    	new jive.fbldr.JiveTemplateSource(sourceOptions).loadTemplates();
    };
        
    init();
    
    return {
        getCategories: getCategories,
        getTemplates: getTemplates
    };
    
};/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.JiveTemplateSource = function(options) {
    
    var infoId = options.infoId;
    var info = "#" + infoId;
    var loadId = "fbldr-load";
    var load = "#" + loadId;
    var menuId = "fbldr-menu";
    var menu = "#" + menuId;
    var progId = "fbldr-load-progress";
    var prog = "#" + progId;
    
    var onLoad = options.onLoad;
    
    var prefs = new gadgets.Prefs();
    
    var templates = [];
    var docsFound = 0;
    var docsLoaded = 0;

    var loadTemplates = function() {
        templates = [];
        docsFound = 0;
        docsLoaded = 0;
        
        showLoading();
        updateProgress(0);
        searchDocuments();
	};
	
	var searchDocuments = function() {
	    var docs = prefs.getString('fbldr_docs').replace(/\s+/g, '').replace(/DOC-/gi, '').split(",");
        var tags = prefs.getString('fbldr_tags').replace(/\s*,\s*/g, ' OR ');
        
        var request = osapi.jive.core.searches.searchContent({query: tags, limit: 100, type: ['document']});
        request.execute(function(response) {
            var results = response.data || [];
            
            for (var i = 0; i < results.length; i++) {
                var doc = results[i];
                var docRef = doc.resources.self.ref; 
                var docId = docRef.substring(docRef.lastIndexOf("/") + 1);
                
                if ($j.inArray(docId, docs) < 0) {
                    docs.push(docId);
                }
            }
            
            getDocuments(docs);
        });
	};
	
	var checkComplete = function(forceComplete) {
	    if (!forceComplete && (docsFound != docsLoaded)) {
	        return;
	    }
	    
	    if (forceComplete) {
	        updateProgress(100);
	    }
	    
	    // Let the progress bar sit full for a brief moment
        setTimeout(complete, 250);
	};
	
	var complete = function() {
        hideLoading();
        showMenu();
        
        if (onLoad) {
            onLoad(templates);
        }
        else {
            console.log('Error: no onLoad callback specified for template source');
        }
	}
	
    var docLoaded = function(forceLoad) {
        docsLoaded++;
        updateProgress(Math.round(docsLoaded / docsFound * 100));
        checkComplete();
    };
	
	var getDocuments = function(docs) {
		docsFound = docs.length;
		
		if (docsFound == 0) {
		    checkComplete(true);
		    return;
		}

		for (var docIndex = 0; docIndex < docs.length; docIndex++) {
			var docId = docs[docIndex];

			var request = osapi.jive.core.documents.get({id: docId});
			request.execute(function(response) {
			    if (!response.data) {
			        docLoaded();
			        return;
			    }

			    var document = response.data;
                var text = $j("<div/>").html(document.content.text).html()
                text = text.replace(/\n/g,'').replace(/&nbsp;/g,' ');
                
                var regex = /<pre.*?>(.*?)<\/pre>/gi;
                var match = regex.exec(text);
                
                // if no template content, we're done with this doc
                if (match == null) {
                    docLoaded();
                    return;
                }
                
                var matches = [];
                
                while (match != null) {
                    matches.push(match[1]);
                    match = regex.exec(text);
                }
                
                parseTemplates(matches, document.subject);
			});
		}
	};
	
	var parseTemplates = function(unparsedTemplates, defaultCategory) {
	    var parsedTemplates = [];
	    
	    var handleParsedTemplate = function(template) {
	        parsedTemplates.push(template);
	        if (parsedTemplates.length == unparsedTemplates.length) {
	            handledParsedTemplates(parsedTemplates);
	        }
	    };
	    
	    for (var i = 0; i < unparsedTemplates.length; i++) {
	        parseTemplate(unparsedTemplates[i], defaultCategory, handleParsedTemplate);
	    }
	};
	
	var parseTemplate = function(text, defaultCategory, callback) {
	    var template = null;
        
        try {
            text = $j("<div/>").html(text).text();
            template = $j.parseJSON(text);
            template.defaultCategory = defaultCategory;

            var validator = new jive.fbldr.TemplateValidator(template, function() {
                callback(template);
            });
        }
        catch (error) {
        	if (!template) {
        		template = {};
        	}
        	
            var msg = 'Error validating template: ' + error.message + '\n' + text;
            console.log(msg);
            template.errors = [ msg ];
            callback(template);
        }  
	}
	
	var handledParsedTemplates = function(parsedTemplates) {
	    for (var i = 0; i < parsedTemplates.length; i++) {
	        templates.push(parsedTemplates[i]);
	    }
        docLoaded();
	};
	
	var getLoading = function() {
	    var loading = $j(info).find(load);
	    if (loading.length == 0) {
	        loading = $j(info).append(jive.fbldr.soy.load()).find(load);
	    }
	    return loading;
	};
	
	var updateProgress = function(value) {
	    var $progressbar = $j(info).find(prog);
	    $progressbar.find('.fbldr-progress-text').html( value + '%');
	    return $progressbar.progressbar({value : value});
	};
	
	var hideLoading = function() {
	    getLoading().hide();
	};
	
	var showLoading = function() {
	    getLoading().show();
	};
	
	var showMenu = function() {
        $j(menu + '-create').show();
        $j(menu + '-help').show();
        $j(menu + '-forms').hide();
	    
	    $j(menu).fadeIn();
	};
	
	return {
		loadTemplates: loadTemplates
	};
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.TemplateValidator = function(template, onLoad) {
    
    var structure = {
        template: {
            required: ['category', 'name', 'desc', 'fields', 'content'],
            optional: ['dateFormat', 'defaultCategory', 'labelPosition']
        },
        field: {
            required: ['type', 'id', 'label'],
            optional: ['listStyle', 'required', 'patterns', 'patternError', 'title', 'value', 'values']
        },
        value: {
            required: ['value', 'label'],
            optional: []
        },
        content: {
            required: ['type'],
            optional: ['docId', 'title', 'body', 'includeAttachment', 'tags']
        },
        contentBody: {
            required: ['type', 'title', 'body'],
            optional: ['includeAttachment', 'tags']
        }
    };
    
    var validContentTypes = ['document', 'discussion', 'message', 'question'];
    var validFieldTypes = ['boolean', 'date', 'link', 'list', 'multi-select', 'select', 'tags', 'text', 'textarea', 'userpicker', 'userselect'];
    var validListFieldTypes = ['list', 'multi-select', 'userpicker', 'userselect'];
    var validListStyles = ['comma', 'none', 'ordered', 'unordered'];
    
    var self = this;
    
    var valid = false;
    var errors = [];
    
    var isValid = function() {
        return errors.length == 0;
    };
    
    var getValidationErrors = function() {
        return errors;
    };
    
    var init = function() {
        validateTemplate();
        validateFields();
        validateContent();
    };
    
    var validateTemplate = function() {
        if (!template.category && template.defaultCategory) {
            template.category = template.defaultCategory;
        }
        validateStructure(template, 'template');
        normalizeLabelPosition();
    };
    
    var normalizeLabelPosition = function() {
    	var position = template.labelPosition;
    	if (!position)  {
    		position = "left";
    	}
    	else if (position != "left" && position != "top") {
    		position = "left";
    	}
    	template.labelPosition = position;
    };
    
    var validateFields = function() {
        if (!template.fields) return;
        
        var fields = template.fields;
        if (!$j.isArray(fields)) {
            var objType = Object.prototype.toString.call(fields);
            errors.push("Expected array of fields but found '" + objType + "' instead");
            return;
        }
        else if (fields.length == 0) {
            errors.push("No fields are defined for template, at least one is required");
            return;
        }
        
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            validateStructure(field, 'field');
            validateFieldType(field);
            normalizeListStyle(field);
            normalizeRequired(field);
            validatePatterns(field);
            normalizeValues(field);
        }
    };
    
    var validateFieldType = function(field) {
        if (!field.type) return;
        
        var type = field.type;
        
        if ($j.inArray(type, validFieldTypes) < 0) {
            errors.push("Invalid field type '" + type + "' specified for field '" + field.id + "'");
        }
    };

    var normalizeListStyle = function(field) {
        if (!field.listStyle) return;

        if ($j.inArray(field.type, validListFieldTypes) < 0) {
            delete field.listStyle;
        }                
        else if ($j.inArray(field.listStyle, validListStyles) < 0) {
            field.listStyle = "comma";
        }    
    };
    
    var normalizeRequired = function(field) {
        field.required = field.required
            && (field.required == true || field.required == "true");
    };
    
    var validatePatterns = function(field) {
        if (!field.patterns) return;
        
        if (!$j.isArray(field.patterns)) {
            var objType = Object.prototype.toString.call(values);
            errors.push("Expected array of string patterns but found '" + objType + "' instead");
        }
    };
    
    var normalizeValues = function(field) {
        if  (!field.values) return;
        
        var values = field.values;
        if (!$j.isArray(values)) {
            var objType = Object.prototype.toString.call(values);
            errors.push("Expected array of values but found '" + objType + "' instead");
            return;
        }
        
        var normalized = [];
        
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            if (typeof(value) == "object") {
                validateStructure(value, 'value');
                normalized.push(value);
            }
            else {
                normalized.push({ value: value, label: value });
            }
        }

        field.values = normalized;
    };
    
    var validateContent = function() {
        if (!template.content) return;
        
        validateStructure(template.content, 'content');
        normalizeAttachment();
        validateContentBody();
    };
    
    var normalizeAttachment = function() {
        template.content.includeAttachment = template.content.includeAttachment
            && (template.content.includeAttachment == true || template.content.includeAttachment == "true");
    };

    var validateContentBody = function() {
        validateTags();
        
        if (!template.content.docId) {
            validateStructure(template.content, 'contentBody');
            normalizeBody();
            finalizeValidation();
        }
        else {
            var id = parseInt(template.content.docId);
            
            if (isNaN(id) || id <= 0) {
                errors.push("Unable to load template content body from doc ID '" + template.content.docId + "'");
                finalizeValidation();
            }
            else {
                loadContentBody();
            }
        }
    };
    
    var normalizeBody = function() {
        if (!template.content.body) return;
        
        template.content.body = template.content.body.replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    };
    
    var finalizeValidation = function() {
        validateContentType();
        
        if (!isValid()) {
            template.errors = getValidationErrors(); 
        }
        
        onLoad();
    }
    
    var loadContentBody = function() {
        var request = osapi.jive.core.documents.get({id: template.content.docId});
        request.execute(function(response) {
            if (!response.data) {
                errors.push("Unable to load template content body from doc ID '" + template.content.docId + "'");
            }
            else {
                var document = response.data;
                // Escaping the HTML this way is broken in IE, do NOT do this, just use the raw content
                // template.content.title = $j("<div/>").html(document.subject).html();
                // template.content.body = $j("<div/>").html(document.content.text).html();
                template.content.title = document.subject;
                template.content.body = document.content.text;
            }
            
            finalizeValidation();
        });
    };
    
    var validateTags = function() {
        if (!template.content.tags) return;
        
        var tags = template.content.tags;
        
        if (!$j.isArray(tags)) {
            var objType = Object.prototype.toString.call(tags);
            errors.push("Expected array of tags but found '" + objType + "' instead");
        }
    };
        
    var validateContentType = function() {
        if (!template.content.type) return;
        
        var type = template.content.type;
        
        if ($j.inArray(type, validContentTypes) < 0) {
            errors.push("Invalid content type '" + type + "' specified");
        }
    };
    
    var validateStructure = function(object, parent) {
        var required = structure[parent].required;
        var optional = required.concat(structure[parent].optional);
        
        for (var i = 0; i < required.length; i++) {
            var child = required[i];
            if (!object[child]) {
                var msg = "Required value of '" + child + "' missing for " + parent;
                if (object.id) {
                    msg += " '" + object.id + "'";
                }
                errors.push(msg);
            }
        }
        
        for (var child in object) {
            if ($j.inArray(child, optional) < 0) {
                var msg = "Warning: unexpected value of '" + child + "' found for " + parent;
                if (object.id) {
                    msg += " '" + object.id + "'";
                }
                console.log(msg);
            }
        }
    };
    
    init();
    
    return {
        isValid: isValid,
        getValidationErrors: getValidationErrors
    }
}/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

jive.fbldr.UserPicker = function(options) {

    var isMultiple = (options.multiple) ? true : false;
    var field = options.field;
    
    var linkId = "fbldr-link-" + field.id;
    var link = "#" + linkId;
    var listId = "fbldr-field-" + field.id;
    var list = "#" + listId;

    var $userList = $j(list);
            
    $j(link).click(function() {
        osapi.jive.core.users.requestPicker({
            multiple : isMultiple,
            success : function(response) {
                // if multiple is true, response.data will be an array
                // of osapi.jive.core.User objects
                var users;
                if ($j.isArray(response.data)) {
                    users = response.data;
                } else {
                    users = new Array();
                    users.push(response.data);
                }

                $j.each(users, function() {
                    var user = this;
                    if (!isInUserList(user)) {
                        var $user = $j('<li title="Click to remove user"/>')
                            .html('<span class="fbldr-userpicker-remove">[x]</span> ' + user.name)
                            .attr('userid', user.id)
                            .attr('username', user.name);
                        $user.appendTo($userList);
                        $user.click(function() {
                            $j(this).remove();
                            // gadgets.window.adjustHeight();
                        });
                        // gadgets.window.adjustHeight();
                    }
                });
            },
            error : function(error) {
                console.log("An unexpected error has occurred while initializing userpicker");
            }
        });
    });

    var isInUserList = function(user) {
        var users = $userList.find('li');
        for ( var i = 0; i < users.length; i++) {
            if ($j(users[i]).attr('userid') == user.id)
                return true;
        }
        return false;
    }
    
}
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
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

// This command is only needed for doing local testing with plovr
// which uses the google closure library for dependencies
// goog.require('jive.fbldr.soy');

$j(document).ready(function() {

    $j('#fbldr-menu-create a').click(function() {
        displayView('create');
    });
    
    $j('#fbldr-menu-help a').click(function() {
        displayView('help');
    });
    
    $j('#fbldr-menu-forms a').click(function() {
        displayView('forms');
    });
    
    var displayView = function(displayName) {
        var canvas_view = new gadgets.views.View("canvas");
        gadgets.views.requestNavigateTo(canvas_view, { display: displayName });
        return false;
    };

    var viewParams = gadgets.views.getParams();

    if (viewParams['display'] == 'create') {
        var formCreator = new jive.fbldr.FormCreator({
        });        
    }
    else if (viewParams['display'] == 'help') {
        var formHelp = new jive.fbldr.FormHelp({
        });
    }
    else {
        var formBuilder = new jive.fbldr.FormBuilder({
            containerId: "fbldr-main",
            infoId: "fbldr-info"
        });
    }
});

if (typeof(gadgets) != "undefined") {
    gadgets.util.registerOnLoadHandler(function() {
        // gadgets.window.setTitle('Forms');
        // gadgets.window.adjustHeight();
    });
}