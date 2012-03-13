package com.jivesoftware.it;

import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * Servlet to return metadata about room locations. Current implementation only reads a config file and returns its
 * contents directly, but could be modified to read info from Exchange room lists or database.
 */
public class LocationServlet extends HttpServlet {
    private List<Location> locations = new ArrayList<Location>();
    private static final Logger logger = Logger.getLogger(LocationServlet.class);

    @Override
    public void init() throws ServletException {
        super.init();

        // read config file and parse into Location instances to be returned in doGet method
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = null;
        try {
            is = this.getClass().getClassLoader().getResourceAsStream("locations.json");
            if (is == null) {
                throw new RuntimeException("Could not find locations.json file.");
            }
            ArrayNode rootNode = mapper.readValue(is, ArrayNode.class);
            int i = 0;
            while (true) {
                JsonNode locNode = rootNode.get(i);
                if (locNode == null) break;

                Location loc = new Location();
                loc.setName(locNode.get("name").getValueAsText());
                loc.setLabel(locNode.get("label").getValueAsText());
                locations.add(loc);

                i++;
            }
        }
        catch (Exception e) {
            logger.error("Failed to load location metadata", e);
            throw new ServletException("Error when loading location metadata.");
        }
        finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    logger.error("Failed to close stream", e);
                }
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ObjectMapper mapper = new ObjectMapper();
        resp.setContentType("application/json");
        resp.setStatus(HttpServletResponse.SC_OK);
        mapper.writeValue(resp.getWriter(), locations);
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