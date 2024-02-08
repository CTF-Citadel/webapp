import { mysqlTable, varchar, datetime, boolean, bigint, int } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: varchar("id", {
		length: 64
	}).primaryKey(),
    username: varchar("username", {
        length: 64
    }).unique(),
    hashed_password: varchar("hashed_password", {
        length: 128
    }),
    user_role: varchar("user_role", {
        length: 64
    }),
    user_team_id: varchar("user_team_id", {
        length: 64
    }),
    email: varchar("email", {
        length: 64
    }).unique(),
    is_verified: boolean("is_verified"),
    is_blocked: boolean("is_blocked")
});

export const sessions = mysqlTable("sessions", {
	id: varchar("id", {
		length: 64
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 64
	})
		.notNull()
		.references(() => users.id),
	expiresAt: datetime("expires_at").notNull()
});

export const resetTokens = mysqlTable("password_reset_tokens", {
	id: varchar("id", {
		length: 64
	}).primaryKey(),
    user_id: varchar("user_id", {
        length: 64
    }),
    expires: bigint('expires', {
        mode: 'number'
    })
});

export const verificationTokens = mysqlTable("email_verification_tokens", {
	id: varchar("id", {
		length: 64
	}).primaryKey(),
    user_id: varchar("user_id", {
        length: 64
    }),
    expires: bigint('expires', {
        mode: 'number'
    })
});

export const events = mysqlTable("events", {
    id: varchar("id", {
		length: 64
	}).primaryKey(),
    event_name: varchar("event_name", {
		length: 64
	}),
    event_description: varchar("event_description", {
		length: 256
	}),
    event_start: int("event_start"),
    event_end: int("event_end")
});

export const challenges = mysqlTable("challenges", {
    id: varchar("id", {
		length: 64
	}).primaryKey(),
    event_id: varchar("event_id", {
		length: 64
	}).references(() => events.id).primaryKey(),
    challenge_name: varchar("challenge_name", {
		length: 64
	}).unique(),
    challenge_category: varchar("challenge_category", {
		length: 64
	}),
    challenge_difficulty: varchar("challenge_difficulty", {
		length: 64
	}),
    challenge_description: varchar("challenge_description", {
		length: 256
	}),
    container_file: varchar("container_file", {
		length: 128
	}),
    static_file_url: varchar("static_file_url", {
		length: 256
	}),
    needs_container: boolean("needs_container"),
});

export const teams = mysqlTable("teams", {
    id: varchar("id", {
		length: 64
	}).primaryKey(),
    team_creator: varchar("team_creator", {
		length: 64
	}).references(() => users.id),
    team_name: varchar("team_name", {
		length: 64
	}).unique(),
    team_join_token: varchar("team_join_token", {
		length: 128
	}),
    team_country_code: varchar("team_country_code", {
		length: 4
	}),
    team_description: varchar("team_description", {
		length: 256
	}),
});

export const team_events = mysqlTable("team_events", {
    team_id: varchar("team_id", {
		length: 64
	}).references(() => teams.id).primaryKey(),
    event_id: varchar("event_id", {
		length: 64
	}).references(() => events.id).primaryKey()
});

export const team_challenges = mysqlTable("team_challenges", {
    team_id: varchar("team_id", {
		length: 64
	}).references(() => teams.id).primaryKey(),
    challenge_id: varchar("challenge_id", {
		length: 64
	}).references(() => challenges.id).primaryKey(),
    solved_by: varchar("solved_by", {
		length: 64
	}),
    challenge_uuid: varchar("challenge_uuid", {
		length: 64
	}),
    challenge_flag: varchar("challenge_flag", {
		length: 64
	}),
    challenge_host: varchar("challenge_host", {
		length: 64
	}),
    challenge_port: varchar("challenge_port", {
		length: 32
	}),
    is_solved: boolean("is_solved"),
    is_running: boolean("is_running"),
});
