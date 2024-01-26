import { lucia } from 'lucia';
import { astro } from 'lucia/middleware';
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

// read from env
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

export const PRISMA_CONNECTION = new PrismaClient({
	datasources: {
		db: {
			url: `mysql://root:${DB_PASS}@${DB_HOST}:3306/${DB_NAME}`,
		},
	},
});

export const auth = lucia({
	adapter: prisma(PRISMA_CONNECTION, {
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
			user_team_id: data.user_team_id,
			email: data.email,
			emailVerified: Boolean(data.email_verified),
			isBlocked: Boolean(data.is_blocked)
		};
	}
});

export type Auth = typeof auth;
