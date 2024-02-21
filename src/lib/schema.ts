import type { InferSelectModel } from 'drizzle-orm';
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
        precision: 6,
        withTimezone: true,
        mode: 'date'
    }).notNull()
});

export const resetTokens = pgTable('password_reset_tokens', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    expires: bigint('expires', {
        mode: 'number'
    }).notNull()
});

export const verificationTokens = pgTable('email_verification_tokens', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    expires: bigint('expires', {
        mode: 'number'
    }).notNull()
});

export const events = pgTable('events', {
    id: text('id').primaryKey(),
    event_name: text('event_name').notNull(),
    event_description: text('event_description').notNull(),
    event_start: bigint('event_start', {
        mode: 'number'
    }).notNull(),
    event_end: bigint('event_end', {
        mode: 'number'
    }).notNull()
});

export const challenges = pgTable('challenges', {
    id: text('id').primaryKey(),
    event_id: text('event_id')
        .references(() => events.id)
        .notNull(),
    challenge_name: text('challenge_name').unique().notNull(),
    challenge_category: text('challenge_category').notNull(),
    challenge_difficulty: text('challenge_difficulty').notNull(),
    challenge_description: text('challenge_description').notNull(),
    container_file: text('container_file').notNull(),
    static_file_url: text('static_file_url').notNull(),
    needs_container: boolean('needs_container').notNull()
});

export const teams = pgTable('teams', {
    id: text('id').primaryKey(),
    team_creator: text('team_creator')
        .references(() => users.id)
        .notNull(),
    team_name: text('team_name').unique().notNull(),
    team_join_token: text('team_join_token').notNull(),
    team_country_code: text('team_country_code').notNull(),
    team_description: text('team_description').notNull()
});

export const team_events = pgTable('team_events', {
    team_id: text('team_id')
        .references(() => teams.id)
        .primaryKey(),
    event_id: text('event_id')
        .references(() => events.id)
        .notNull(),
    team_points: bigint('team_points', {
        mode: 'number'
    }).notNull()
});

export const team_challenges = pgTable('team_challenges', {
    team_id: text('team_id')
        .references(() => teams.id)
        .primaryKey(),
    challenge_id: text('challenge_id')
        .references(() => challenges.id)
        .notNull(),
    solved_by: text('solved_by').notNull(),
    challenge_uuid: text('challenge_uuid').notNull(),
    challenge_flag: text('challenge_flag').notNull(),
    challenge_host: text('challenge_host').notNull(),
    challenge_port: text('challenge_port').notNull(),
    is_solved: boolean('is_solved').notNull(),
    is_running: boolean('is_running').notNull()
});

export type UsersType = InferSelectModel<typeof users>;
export type EventsType = InferSelectModel<typeof events>;
export type ChallengesType = InferSelectModel<typeof challenges>;
export type TeamsType = InferSelectModel<typeof teams>;
export type TeamChallengesType = InferSelectModel<typeof team_challenges>;
export type TeamEventsType = InferSelectModel<typeof team_events>;
