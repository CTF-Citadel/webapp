import { lucia } from "../lib/lucia";

import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
	if (!context.locals.user) {
		return new Response("Unauthorized", {
			status: 401
		});
	}
	await lucia.invalidateSession(context.locals.session.id);
	await lucia.deleteExpiredSessions();
	context.cookies.delete(lucia.sessionCookieName);
	return context.redirect("/login", 302);
};
