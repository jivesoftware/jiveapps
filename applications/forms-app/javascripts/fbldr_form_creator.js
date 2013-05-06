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
