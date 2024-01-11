/*
    EVENTS
*/
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    event_name VARCHAR(32) NOT NULL UNIQUE,
    event_description VARCHAR(256)
);
/*
    CHALLENGES
*/
CREATE TABLE challenges (
    id VARCHAR(36) PRIMARY KEY,
    challenge_name VARCHAR(32) NOT NULL UNIQUE,
    challenge_diff VARCHAR(32),
    challenge_description VARCHAR(256),
    needs_container BOOLEAN,
    container_file VARCHAR(256),
    static_file_url VARCHAR(256),
    event_id VARCHAR(36),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
/*
    TEAMS
*/
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    team_name VARCHAR(32) NOT NULL UNIQUE,
    team_country_code VARCHAR(3),
    team_description VARCHAR(256)
);
CREATE TABLE team_events (
    team_id VARCHAR(36),
    event_id VARCHAR(36),
    PRIMARY KEY (team_id, event_id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
CREATE TABLE team_challenges (
    team_id VARCHAR(36),
    challenge_id VARCHAR(36),
    challenge_uuid VARCHAR(36) NOT NULL,
    challenge_flag VARCHAR(36),
    challenge_host VARCHAR(36),
    challenge_port VARCHAR(36),
    PRIMARY KEY (team_id, challenge_id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);
/*
    LUCIA-AUTH
*/
CREATE TABLE user (
    id VARCHAR(16) PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    user_role VARCHAR(16) NOT NULL,
    user_team_id VARCHAR(36) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    email_verified BOOLEAN,
    is_blocked BOOLEAN,
    has_created_team BOOLEAN,
    FOREIGN KEY (user_team_id) REFERENCES teams(id)
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
    user_id VARCHAR(16) NOT NULL,
    expires BIGINT NOT NULL
);
CREATE TABLE password_reset_token (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(16) NOT NULL,
    expires BIGINT NOT NULL
);