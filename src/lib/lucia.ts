import { lucia } from 'lucia';
import { astro } from 'lucia/middleware';
import { mysql2 } from "@lucia-auth/adapter-mysql";
import mysql from "mysql2/promise";

const connectionPool = mysql.createPool("");

export const auth = lucia({
	adapter: mysql2(connectionPool, {
		user: "auth_user",
		key: "user_key",
		session: "user_session"
	}),
    env: import.meta.env.DEV ? "DEV" : "PROD",
	middleware: astro(),
	getUserAttributes: (data) => {
		return {
			username: data.username
		};
	}
});

export type Auth = typeof auth;
