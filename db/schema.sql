CREATE TABLE user (
    id VARCHAR(16) PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    user_role VARCHAR(16),
    user_team VARCHAR(64),
    email VARCHAR(32) NOT NULL UNIQUE,
    email_verified BOOLEAN
);
CREATE TABLE user_key (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(16) NOT NULL,
    hashed_password VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE TABLE user_session (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(16) NOT NULL,
    active_expires BIGINT NOT NULL,
    idle_expires BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE TABLE email_verification_token (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    expires BIGINT NOT NULL
);
CREATE TABLE password_reset_token (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(16) NOT NULL,
    expires BIGINT NOT NULL
);