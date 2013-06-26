CREATE TABLE call_record (
    callRecordId BIGINT NOT NULL AUTO_INCREMENT,
    roomEntityId VARCHAR(255) NOT NULL,
    callerExtension VARCHAR(255),
    callerName VARCHAR(255),
    participantCount INTEGER,
    participantExtensions VARCHAR(255),
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (callRecordId)
);
