import { lucia } from 'lucia';
import { astro } from 'lucia/middleware';
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

// read from env
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

const CLIENT = new PrismaClient({
	datasources: {
		db: {
			url: `mysql://root:${DB_PASS}@${DB_HOST}:3306/${DB_NAME}`,
		},
	},
});

export const auth = lucia({
	adapter: prisma(CLIENT, {
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
			emailVerified: Boolean(data.email_verified),
			hasCreatedTeam: Boolean(data.has_created_team)
		};
	}
});

export type Auth = typeof auth;
