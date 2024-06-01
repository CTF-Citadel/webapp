import type { InferSelectModel } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, bigint, integer, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    team_id: text('team_id').notNull(),
    username: text('username').unique().notNull(),
    hashed_password: text('hashed_password').notNull(),
    email: text('email').unique().notNull(),
    role: text('role').notNull(),
    avatar: text('avatar').notNull(),
    affiliation: text('affiliation').notNull(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    is_verified: boolean('is_verified').notNull(),
    is_blocked: boolean('is_blocked').notNull()
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
    name: text('name').notNull(),
    description: text('description').notNull(),
    start: bigint('start', {
        mode: 'number'
    }).notNull(),
    end: bigint('end', {
        mode: 'number'
    }).notNull()
});

export const challenges = pgTable('challenges', {
    id: text('id').primaryKey(),
    event_id: text('event_id')
        .references(() => events.id)
        .notNull(),
    name: text('name').unique().notNull(),
    category: text('category').notNull(),
    difficulty: text('difficulty').notNull(),
    description: text('description').notNull(),
    points: integer('points').notNull(),
    container_file: text('container_file').notNull(),
    file_url: text('file_url').notNull(),
    static_flag: text('static_flag').notNull(),
    depends_on: text('depends_on').notNull(),
    needs_file: boolean('needs_file').notNull(),
    needs_depend: boolean('needs_depend').notNull(),
    needs_container: boolean('needs_container').notNull(),
    needs_static: boolean('needs_static').notNull(),
    needs_pool: boolean('needs_pool').notNull()
});

export const teams = pgTable('teams', {
    id: text('id').primaryKey(),
    creator_id: text('creator_id')
        .references(() => users.id)
        .notNull(),
    name: text('name').unique().notNull(),
    join_token: text('join_token').notNull(),
    country_code: text('country_code').notNull(),
    description: text('description').notNull()
});

export const team_events = pgTable(
    'team_events',
    {
        team_id: text('team_id')
            .references(() => teams.id)
            .notNull(),
        event_id: text('event_id')
            .references(() => events.id)
            .notNull()
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.team_id, table.event_id] })
        };
    }
);

export const team_challenges = pgTable(
    'team_challenges',
    {
        team_id: text('team_id')
            .references(() => teams.id)
            .notNull(),
        challenge_id: text('challenge_id')
            .references(() => challenges.id)
            .notNull(),
        event_id: text('event_id')
            .references(() => events.id)
            .notNull(),
        container_id: text('container_id').notNull(),
        container_flag: text('container_flag').notNull(),
        container_host: text('container_host').notNull(),
        container_port: text('container_port').notNull(),
        solved_by: text('solved_by').notNull(),
        solved_at: bigint('solved_at', {
            mode: 'number'
        }).notNull(),
        is_container: boolean('is_container').notNull(),
        is_solved: boolean('is_solved').notNull(),
        is_running: boolean('is_running').notNull()
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.team_id, table.challenge_id, table.event_id] })
        };
    }
);

export type UsersType = InferSelectModel<typeof users>;
export type EventsType = InferSelectModel<typeof events>;
export type ChallengesType = InferSelectModel<typeof challenges>;
export type TeamsType = InferSelectModel<typeof teams>;
export type TeamChallengesType = InferSelectModel<typeof team_challenges>;
export type TeamEventsType = InferSelectModel<typeof team_events>;
