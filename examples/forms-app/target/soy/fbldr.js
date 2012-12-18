// This file was automatically generated from fbldr.soy.
// Please don't edit this file by hand.

if (typeof jive == 'undefined') { var jive = {}; }
if (typeof jive.fbldr == 'undefined') { jive.fbldr = {}; }
if (typeof jive.fbldr.soy == 'undefined') { jive.fbldr.soy = {}; }


jive.fbldr.soy.attachments = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-attachments"><div class="fbldr-attach-head"><p>Use the following form to upload file attachments and, optionally, include a variable to reference the uploaded file in the form\'s HTML source.</p><p>Multiple files may be attached, but only one at a time.  Click "Finished" when all files have been attached.</p></div><div class="fbldr-attach-field"><label>Link to HTML Variable (optional) : </label></div><div class="fbldr-attach-field"><select id="fbldr-attach-link"><option value="" selected="selected">Select HTML variable...</option>');
  var optionList23 = opt_data.variables;
  var optionListLen23 = optionList23.length;
  for (var optionIndex23 = 0; optionIndex23 < optionListLen23; optionIndex23++) {
    var optionData23 = optionList23[optionIndex23];
    output.append('<option value="', soy.$$escapeHtml(optionData23), '">', soy.$$escapeHtml(optionData23), '</option>');
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
  output.append('<div class="fbldr-field">');
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
  output.append('<label class="fbldr-label">', soy.$$escapeHtml(opt_data.field.label), '</label><span class="fbldr-glyph fbldr-reqd">', (opt_data.field.required) ? '*' : '&nbsp;', '</span>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.load = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="fbldr-load"><span class="fbldr-load-img"></span><span class="fbldr-load-msg">Loading templates...</span><div id="fbldr-load-progress"><div class="fbldr-progress-text"></div></div></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.options = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<option value="" class="fbldr-none">Select an option...</option>');
  var optionList117 = opt_data.values;
  var optionListLen117 = optionList117.length;
  for (var optionIndex117 = 0; optionIndex117 < optionListLen117; optionIndex117++) {
    var optionData117 = optionList117[optionIndex117];
    output.append('<option class="fbldr-opt ', (optionData117.cssClass) ? soy.$$escapeHtml(optionData117.cssClass) : '', '" value="', soy.$$escapeHtml(optionData117.value), '" ', (optionData117.value == opt_data.value) ? ' selected="selected"' : '', '>', soy.$$escapeHtml(optionData117.label), '</option>');
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
  output.append('<div class="fbldr-field">');
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
  var valueList147 = opt_data.field.values;
  var valueListLen147 = valueList147.length;
  for (var valueIndex147 = 0; valueIndex147 < valueListLen147; valueIndex147++) {
    var valueData147 = valueList147[valueIndex147];
    output.append('<li><input type="radio" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-radio" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '" value="' + soy.$$escapeHtml(valueData147.value) + '"' : '', (opt_data.field.value == valueData147.value) ? 'checked="checked"' : '', ' />', (valueData147.label) ? ' ' + soy.$$escapeHtml(valueData147.label) + ' ' : ' ' + soy.$$escapeHtml(valueData147.value) + ' ', '</li>');
  }
  output.append('</ul>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.select = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<select id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-input" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '"' : '', '>');
  jive.fbldr.soy.options({values: opt_data.field.values, value: opt_data.field.value}, output);
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
  output.append('<div class="fbldr-field">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<input type="text" id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-input" value="', (opt_data.field.value) ? soy.$$escapeHtml(opt_data.field.value) : '', '" ', (opt_data.field.name) ? 'name="' + soy.$$escapeHtml(opt_data.field.name) + '"' : '', ' />');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.textarea = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-field">');
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
  output.append('<div class="fbldr-field">');
  jive.fbldr.soy.label(opt_data, output);
  output.append('<a href="#" id="fbldr-link-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-userpicker-link fbldr-input">select users</a>');
  jive.fbldr.soy.error(opt_data, output);
  jive.fbldr.soy.title(opt_data, output);
  output.append('<ul id="fbldr-field-', soy.$$escapeHtml(opt_data.field.id), '" class="fbldr-userpicker-list"></ul></div>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.soy.validationErrors = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-valid-errors">');
  var errorList292 = opt_data.errors;
  var errorListLen292 = errorList292.length;
  for (var errorIndex292 = 0; errorIndex292 < errorListLen292; errorIndex292++) {
    var errorData292 = errorList292[errorIndex292];
    output.append('<div class="fbldr-valid-error"><span class="jive-icon-sml jive-icon-redalert fbldr-error"></span>&nbsp;<span class="fbldr-valid-error-text">', soy.$$escapeHtml(errorData292), '</span></div>');
  }
  output.append('</div>');
  return opt_sb ? '' : output.toString();
};
