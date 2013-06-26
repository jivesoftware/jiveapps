package com.jivesoftware.it.vidyo;

import org.apache.log4j.Logger;

public class AuthContext {
    private static final Logger logger = Logger.getLogger(AuthContext.class);

    private String username;
    private String password;

    public AuthContext(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Parse a http basic auth header and create a new instance with the parsed username and password
     * @throws com.jivesoftware.it.vidyo.InvalidCredentialsException
     */
    public static AuthContext createFromHeader(String authHeader) throws InvalidCredentialsException {
        String username = null, password = null;
        int prefixCount = "Basic ".length();
        if (authHeader != null && authHeader.length() > prefixCount) {
            authHeader = authHeader.substring(prefixCount);

            String decodedAuth = new String(org.apache.commons.codec.binary.Base64.decodeBase64(authHeader));
            int firstColon = decodedAuth.indexOf(':');
            if (firstColon < 0 || decodedAuth.length() <= firstColon+1) {
                // header did not match the expected format of username:password
                logger.error("Could not parse username and password from basic auth header");
            }
            else {
                username = decodedAuth.substring(0, firstColon);
                password = decodedAuth.substring(firstColon+1);
            }
        }
        if (username == null || password == null) {
            throw new InvalidCredentialsException("Credentials missing");
        }
        return new AuthContext(username, password);
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