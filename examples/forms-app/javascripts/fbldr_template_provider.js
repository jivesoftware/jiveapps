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
    
};