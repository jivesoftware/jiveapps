package com.jivesoftware.it;

/**
 * Exception class to represent request parameter errors.
 */
public class RequestParameterException extends Exception {
    public RequestParameterException() {
    }

    public RequestParameterException(String s) {
        super(s);
    }

    public RequestParameterException(String s, Throwable throwable) {
        super(s, throwable);
    }
}

/*
Copyright 2012 Jive Software

Licensed under the Apache License, Version 2.0 (the "License");
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/