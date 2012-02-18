/**
  Copyright 2012 Jive Software

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
package com.jivesoftware.rest.util;

import org.codehaus.jackson.jaxrs.JacksonJsonProvider;
import org.codehaus.jackson.jaxrs.MapperConfigurator;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig;
import org.codehaus.jackson.map.annotate.JsonSerialize;

import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

/**
 * Configures the {@link org.codehaus.jackson.map.ObjectMapper} which is used throughout the CXF services
 * to map Java beans to JSON,
 */
@Provider
@Consumes({MediaType.APPLICATION_JSON, "text/json"})
@Produces({MediaType.APPLICATION_JSON, "text/json"})
public class ObjectMapperContextResolver implements ContextResolver<ObjectMapper> {

    private ObjectMapper mapper;

    public void init() {
        MapperConfigurator configurator = new MapperConfigurator(null, JacksonJsonProvider.BASIC_ANNOTATIONS);

        this.mapper = configurator.getDefaultMapper();
        SerializationConfig serializationConfig = mapper.getSerializationConfig();
        initSerialization(serializationConfig);
    }

    private void initSerialization(SerializationConfig serializationConfig) {
        serializationConfig.set(SerializationConfig.Feature.INDENT_OUTPUT, true);
        serializationConfig.setSerializationInclusion(JsonSerialize.Inclusion.NON_NULL);
        serializationConfig.set(SerializationConfig.Feature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @Override
    public ObjectMapper getContext(Class<?> aClass) {
        return mapper;
    }
}
