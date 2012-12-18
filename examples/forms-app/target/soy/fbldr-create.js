// This file was automatically generated from fbldr-create.soy.
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


jive.fbldr.create.soy.field = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li><div class="fbldr-create-field"><input type="hidden" value="', soy.$$escapeHtml(opt_data.json), '"/><span class="fbldr-create-field-id">', soy.$$escapeHtml(opt_data.field.id), '</span><span class="fbldr-create-field-label" ', (opt_data.field.desc) ? 'title="' + soy.$$escapeHtml(opt_data.field.desc) + '"' : '', '>', soy.$$escapeHtml(opt_data.field.label), '</span><a class="fbldr-field-link fbldr-field-del" href="#" title="Remove Field"><span class="jive-icon-med jive-icon-delete"></span></a><a class="fbldr-field-link fbldr-field-down" href="#" title="Move Field Down"><span class="jive-icon-med jive-icon-arrow-down"></a><a class="fbldr-field-link fbldr-field-up" href="#" title="Move Field Up"><span class="jive-icon-med jive-icon-arrow-up"></a></div></li>');
  return opt_sb ? '' : output.toString();
};


jive.fbldr.create.soy.headingText = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="fbldr-create-preview-text"><p>Use the panels on the right to enter the template and field information, which will automatically render the form preview below.</p><p>&nbsp;</p><p>Once the form has been successfully created, you may either fill out the form and preview the content in the Content Preview tab, or copy the generated form template from the Form Source tab and store in a Jive document to be used by the Forms App.</p></div>');
  return opt_sb ? '' : output.toString();
};
