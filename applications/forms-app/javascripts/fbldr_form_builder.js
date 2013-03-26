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
