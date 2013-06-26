package com.jivesoftware.it.vidyo;

import org.apache.log4j.Logger;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Database class to create call record entries
 */
public class CallRecordService {
    private static final Logger logger = Logger.getLogger(CallRecordService.class);

    /**
     * Write one call record
     *
     * @param roomEntityId
     * @param callerName
     * @param participantCount
     * @return true if successful
     */
    public static boolean writeRecord(String roomEntityId, String callerName, String callerExtension,
                                      int participantCount, String participantExtensions) {
        Connection connection = null;
        Statement statement = null;

        String sql = "INSERT INTO call_record (" +
                "roomEntityId, callerExtension, callerName, participantCount, participantExtensions) VALUES (" +
                roomEntityId + ",'" + callerExtension + "','" + callerName + "'," + participantCount + ",'" + participantExtensions + "')";
        logger.debug(sql);

        try {
            connection = DriverManager.getConnection(
                    ApplicationProperties.INSTANCE.getDatabaseConnUrl(),
                    ApplicationProperties.INSTANCE.getDatabaseUsername(),
                    ApplicationProperties.INSTANCE.getDatabasePassword());
            statement = connection.createStatement();
            statement.executeUpdate(sql);
        }
        catch (SQLException e) {
            logger.error("Failed to write record, Error:" + e.getErrorCode() +
                    ", Message:" + e.getMessage() + ", SQL state:" + e.getSQLState());
            return false;
        }
        finally {
            try {
                if (statement != null) {
                    statement.close();
                }
                if (connection != null) {
                    connection.close();
                }
            }
            catch (Exception e) {
                logger.error("Failed to close connection", e);
            }
        }
        return true;
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