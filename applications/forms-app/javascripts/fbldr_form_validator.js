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
