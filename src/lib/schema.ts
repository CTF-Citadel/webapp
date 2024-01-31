import { mysqlTable, varchar, datetime, boolean, bigint } from "drizzle-orm/mysql-core";

export const userTable = mysqlTable("user", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
    username: varchar("username", {
        length: 255
    }).unique(),
    hashed_password: varchar("hashed_password", {
        length: 255
    }),
    user_role: varchar("user_role", {
        length: 255
    }),
    user_team_id: varchar("user_team_id", {
        length: 255
    }),
    email: varchar("email", {
        length: 255
    }),
    is_verified: boolean("is_verified"),
    is_blocked: boolean("is_blocked")
});

export const sessionTable = mysqlTable("session", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 255
	})
		.notNull()
		.references(() => userTable.id),
	expiresAt: datetime("expires_at").notNull()
});

export const resetToken = mysqlTable("password_reset_token", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
    user_id: varchar("user_id", {
        length: 255
    }),
    expires: bigint('expires', {
        mode: 'number'
    })
});

export const verificationToken = mysqlTable("email_verification_token", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
    user_id: varchar("user_id", {
        length: 255
    }),
    expires: bigint('expires', {
        mode: 'number'
    })
});
