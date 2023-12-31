/*
    LUCIA-AUTH
*/
CREATE TABLE user (
    id VARCHAR(16) PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    user_role VARCHAR(16),
    user_team VARCHAR(64),
    email VARCHAR(32) NOT NULL UNIQUE,
    email_verified BOOLEAN,
    has_created_team BOOLEAN
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
/*
    EVENTS
*/
CREATE TABLE events (
    id VARCHAR(16) PRIMARY KEY,
    event_name VARCHAR(32) NOT NULL UNIQUE,
    event_description VARCHAR(256)
);
/*
    TEAMS
*/
CREATE TABLE teams (
    id VARCHAR(16) PRIMARY KEY,
    team_name VARCHAR(32) NOT NULL UNIQUE,
    team_country_code VARCHAR(3) NOT NULL UNIQUE,
    team_description VARCHAR(256)
);
CREATE TABLE team_events (
    team_id VARCHAR(16),
    event_id VARCHAR(16),
    PRIMARY KEY (team_id, event_id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
/*
    CHALLENGES
*/
CREATE TABLE challenges (
    id VARCHAR(16) PRIMARY KEY,
    challenge_uuid VARCHAR(36) NOT NULL UNIQUE,
    challenge_name VARCHAR(32) NOT NULL UNIQUE,
    challenge_description VARCHAR(256),
    event_id VARCHAR(16),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
