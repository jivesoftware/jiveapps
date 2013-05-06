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
}