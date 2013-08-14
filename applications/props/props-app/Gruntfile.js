//
// Copyright 2013 Jive Software
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        concat: {
            vendor: {
                src: [
                    'vendor/jquery-1.7.2/jquery.min.js',
                    'vendor/underscore-1.3.3/underscore.min.js',
                    'vendor/backbone-0.9.2/backbone.min.js',
                    'vendor/jive-proxy-url/jive-proxy-url.js',
                    'vendor/jquery-timeago/jquery-timeago.js',
                    'vendor/bootstrap/bootstrap.min.js',
                    'vendor/bootstrap/bootstrap-typeahead-custom-ajax.js',
                    'vendor/bootstrap/bootstrap-alert.js',
                    'vendor/bootstrap/bootstrap-modal.js',
                    'vendor/bootstrap/bootstrap-tooltip.js',
                    'vendor/bootstrap/bootstrap-popover.js',
                    'vendor/bootstrap/bootstrap-dropdown.js'
                ],
                dest: 'dist/vendor.js',
                separator: ';'
            },

            props: {
                src: [
                    'js/init.js',
                    'js/osapi_http_sync.js',
                    'js/models/person.js',
                    'js/models/prop.js',
                    'js/models/prop_type.js',
                    'js/collections/people.js',
                    'js/collections/props.js',
                    'js/collections/prop_types.js',
                    'js/views/sidebar_view.js',
                    'js/views/sidebar_item_view.js',
                    'js/views/sidebar_list_view.js',
                    'js/views/activity_stream_view.js',
                    'js/views/activity_entry_view.js',
                    'js/views/find_trophy_case_view.js',
                    'js/views/trophy_display_view.js',
                    'js/views/trophy_sidebar_view.js',
                    'js/views/give_props_wizard_view.js',
                    'js/main.js'
                ],
                dest: 'dist/props.js',
                separator: ';'
            },

            admin: {
                src: [
                    'vendor/jquery-1.7.2/jquery.min.js',
                    'vendor/bootstrap/bootstrap-dropdown.js',
                    'js/init.js',
                    'js/make_http_request.js',
                    'js/admin_main.js'
                ],
                dest: 'dist/admin.js',
                separator: ';'
            }

        },

        uglify: {
            options: {
            },
            admin: {
                files: {
                    'dist/admin.min.js':['dist/admin.js']
                }
            },
            dist: {
                files: {
                    'dist/all.min.js' : ['dist/vendor.js', 'dist/props.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat:vendor', 'concat:props', 'concat:admin', 'uglify:dist', 'uglify:admin']);

};
