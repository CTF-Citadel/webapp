import { pgTable, text, timestamp, boolean, bigint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    username: text('username').unique(),
    hashed_password: text('hashed_password'),
    user_role: text('user_role'),
    user_team_id: text('user_team_id'),
    email: text('email').unique(),
    is_verified: boolean('is_verified'),
    is_blocked: boolean('is_blocked')
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date'
    }).notNull()
});

export const resetTokens = pgTable('password_reset_tokens', {
    id: text('id').primaryKey(),
    user_id: text('user_id'),
    expires: bigint('expires', {
        mode: 'number'
    })
});

export const verificationTokens = pgTable('email_verification_tokens', {
    id: text('id').primaryKey(),
    user_id: text('user_id'),
    expires: bigint('expires', {
        mode: 'number'
    })
});

export const events = pgTable('events', {
    id: text('id').primaryKey(),
    event_name: text('event_name'),
    event_description: text('event_description'),
    event_start: bigint('event_start', {
        mode: 'number'
    }),
    event_end: bigint('event_end', {
        mode: 'number'
    })
});

export const challenges = pgTable('challenges', {
    id: text('id').primaryKey(),
    event_id: text('event_id')
        .references(() => events.id),
    challenge_name: text('challenge_name').unique(),
    challenge_category: text('challenge_category'),
    challenge_difficulty: text('challenge_difficulty'),
    challenge_description: text('challenge_description'),
    container_file: text('container_file'),
    static_file_url: text('static_file_url'),
    needs_container: boolean('needs_container')
});

export const teams = pgTable('teams', {
    id: text('id').primaryKey(),
    team_creator: text('team_creator').references(() => users.id),
    team_name: text('team_name').unique(),
    team_join_token: text('team_join_token'),
    team_country_code: text('team_country_code'),
    team_description: text('team_description')
});

export const team_events = pgTable('team_events', {
    team_id: text('team_id')
        .references(() => teams.id)
        .primaryKey(),
    event_id: text('event_id')
        .references(() => events.id)
        .unique()
});

export const team_challenges = pgTable('team_challenges', {
    team_id: text('team_id')
        .references(() => teams.id)
        .primaryKey(),
    challenge_id: text('challenge_id')
        .references(() => challenges.id)
        .unique(),
    solved_by: text('solved_by'),
    challenge_uuid: text('challenge_uuid'),
    challenge_flag: text('challenge_flag'),
    challenge_host: text('challenge_host'),
    challenge_port: text('challenge_port'),
    is_solved: boolean('is_solved'),
    is_running: boolean('is_running')
});
