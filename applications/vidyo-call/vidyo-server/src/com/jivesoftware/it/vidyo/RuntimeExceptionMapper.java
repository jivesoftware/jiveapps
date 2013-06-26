package com.jivesoftware.it.vidyo;

import org.apache.log4j.Logger;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/**
 * This class is used by JAX-RS to map all RuntimeExceptions to 500 responses.
 * Without this, the default behavior would be to throw the exception to servlet
 * container which clutters the Tomcat log, and also the stack trace would be
 * sent to client.
 */
@Provider
public class RuntimeExceptionMapper implements ExceptionMapper<RuntimeException> {
    private static final Logger logger = Logger.getLogger(RuntimeExceptionMapper.class);
    public Response toResponse(RuntimeException e) {
        logger.error("Mapping to 500 response", e);
        ErrorInfo err = new ErrorInfo();
        err.setCode(ErrorInfo.CODE_SERVER_ERROR);
        err.setMessage("Internal server error");
        return Response.serverError().type(MediaType.APPLICATION_JSON).entity(err).build();
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