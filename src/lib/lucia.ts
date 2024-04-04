import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { DB_ADAPTER } from "./db";
import { sessions, users } from "./schema";

// init drizzle
const LUCIA_ADAPTER = new DrizzlePostgreSQLAdapter(DB_ADAPTER, sessions, users);

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
			user_avatar: attributes.user_avatar,
    		user_affiliation: attributes.user_affiliation,
    		user_firstname: attributes.user_firstname,
    		user_lastname: attributes.user_lastname,
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
			user_avatar: string;
    		user_affiliation: string;
    		user_firstname: string;
    		user_lastname: string;
			is_blocked: boolean;
			is_verified: boolean;
		};
	}
}
