import { Lucia, TimeSpan } from "lucia";
import { Mysql2Adapter } from "@lucia-auth/adapter-mysql";
import mysql from 'mysql2/promise';

// read from env
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

// init drizzle
const LUCIA_CONN = mysql.createPool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS
});
const LUCIA_ADAPTER = new Mysql2Adapter(LUCIA_CONN, {
	user: "user",
	session: "session"
});

export const lucia = new Lucia(LUCIA_ADAPTER, {
	sessionExpiresIn: new TimeSpan(30, "d"),
	sessionCookie: {
		expires: false,
		attributes: {
			secure: import.meta.env.PROD,
			sameSite: "lax"
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			email: attributes.email,
			user_role: attributes.user_role,
			user_team_id: attributes.user_team_id,
			is_blocked: attributes.is_blocked,
			is_verified: attributes.is_verified
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			email: string;
			user_role: string;
			user_team_id: string;
			is_blocked: boolean;
			is_verified: boolean;
		};
	}
}
