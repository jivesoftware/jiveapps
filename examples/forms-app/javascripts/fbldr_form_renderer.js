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
            renderField(template.fields[i]);
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

       if (jive.fbldr.isEmbedded()) {
           label = "Insert Form Content"; 
       }
       else if (contentType == "doc" || contentType == "document") {
           label = "Create Document";
       }
       else if (contentType == "discussion" || contentType == "thread") {
           label = "Post Discussion";
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
            var msg = 'Succesfully created ' + response.content.contentType + ': ' + response.content.subject;
            // jive.fbldr.successMessage(msg);
            // console.log(msg);            
            renderStatus('success', response.content);
        }
    };
    
    var renderField = function(field) {
        if (field.type == "boolean") {
            $j(form).append(jive.fbldr.soy.checkbox({ field: field }));
        }
        else if (field.type == "date") {
            $j(form).append(jive.fbldr.soy.text({ field: field }));
            $j("#fbldr-field-" + field.id).datepicker({
                showOn: "both",
                buttonImage: $j("#fbldr-cal-icon").attr("src"),
                buttonImageOnly: true
            });
        }
        else if (field.type == "select" || field.type == "userselect") {
            $j(form).append(jive.fbldr.soy.select({ field: field }));
            $j("#fbldr-field-" + field.id).toggleClass("fbldr-none", !$j("#fbldr-field-" + field.id).val()).change(function() {
                $j(this).toggleClass('fbldr-none', !$j(this).val());
            });
        }
        else if (field.type == "text") {
            $j(form).append(jive.fbldr.soy.text({ field: field }));
        }
        else if (field.type == "textarea") {
            $j(form).append(jive.fbldr.soy.textarea({ field: field }));
        }
        else if (field.type == "userpicker") {
            var options = { field: field, multiple: true };
            $j(form).append(jive.fbldr.soy.userpicker(options));
            var userpicker = new jive.fbldr.UserPicker(options);
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
            
            var text = (options.preview) ? 'Form preview success.' : 'New content created.';
            
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
