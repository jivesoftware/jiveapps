package com.jivesoftware.it.vidyo;

import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Properties;

public class ApplicationProperties {
    private static final Logger logger = Logger.getLogger(ApplicationProperties.class);
    private static Properties properties;
    public static final ApplicationProperties INSTANCE = new ApplicationProperties();

    private ApplicationProperties() {
        init();
    }

    private void init() {
        InputStream is = null;
        try {
            is = this.getClass().getClassLoader().getResourceAsStream("application.properties");
            if (is == null) {
                throw new RuntimeException("Could not find application.properties file.");
            }
            properties = new Properties();
            properties.load(is);
        }
        catch (IOException e) {
            logger.error("Failed to load properties", e);
            throw new RuntimeException("Failed to load properties");
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

    public String getUserApiUrl() {
        return properties.getProperty("vidyo.user.url");
    }

    public String getAdminApiUrl() {
        return properties.getProperty("vidyo.admin.url");
    }

    public String getAdminUsername() {
        return properties.getProperty("vidyo.admin.username");
    }

    public String getAdminPassword() {
        return properties.getProperty("vidyo.admin.password");
    }

    public String getRoomGroup() {
        return properties.getProperty("vidyo.room.group");
    }

    public String getDatabaseConnUrl() {
        return properties.getProperty("db.conn.url");
    }

    public String getDatabaseUsername() {
        return properties.getProperty("db.username");
    }

    public String getDatabasePassword() {
        return properties.getProperty("db.password");
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