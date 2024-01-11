/// <reference types="lucia" />
declare namespace Lucia { }

/// <reference types="astro/client" />
declare namespace Lucia {
	type Auth = import("./lib/lucia").Auth;
	type DatabaseUserAttributes = {
		username: string;
		user_role: string,
		user_team: string,
		email: string,
		email_verified: boolean,
		has_created_team: boolean,
		is_blocked: boolean
	};
	type DatabaseSessionAttributes = {};
}
