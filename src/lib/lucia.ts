import { Lucia, TimeSpan } from "lucia";
import { LUCIA_ADAPTER } from "./db";

export const lucia = new Lucia(LUCIA_ADAPTER, {
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			email: attributes.email,
			user_role: attributes.user_role,
			user_team_id: attributes.user_team_id,
			is_blocked: attributes.is_blocked,
			is_verified: attributes.is_verified
		};
	},
	sessionExpiresIn: new TimeSpan(30, "d"),
	sessionCookie: {
		name: "session",
		expires: false,
		attributes: {
			secure: true,
			sameSite: "lax"
		}
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	id: string;
	username: string;
	email: string;
	user_role: string;
	user_team_id: string;
	is_blocked: boolean;
	is_verified: boolean;
}
