import { lucia } from 'lucia';
import { astro } from 'lucia/middleware';
import { mysql2 } from "@lucia-auth/adapter-mysql";
import mysql from "mysql2/promise";

// read from env
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

const MYSQL_CONNECTION = mysql.createPool({
	host: DB_HOST,
	user: 'root',
	password: DB_PASS,
	database: DB_NAME
});

export const auth = lucia({
	adapter: mysql2(MYSQL_CONNECTION, {
		user: "user",
		session: "user_session",
		key: "user_key"
	}),
    env: import.meta.env.DEV ? "DEV" : "PROD",
	middleware: astro(),
	getUserAttributes: (data: any) => {
		return {
			username: data.username,
			user_role: data.user_role,
			user_team: data.user_team,
			email: data.email,
			emailVerifyId: data.email_verify_id,
			emailVerified: Boolean(data.email_verified)
		};
	}
});

export type Auth = typeof auth;
