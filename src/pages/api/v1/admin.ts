import type { APIRoute } from "astro";
import { DUMMY_SESSION } from "../../../lib/helpers";
import { lucia } from "../../../lib/lucia";
import { privilegedWrapper } from "../../../lib/backend";

export const POST: APIRoute = async (context) => {
	let session = DUMMY_SESSION;

    if (!import.meta.env.DEV) {
        if (!context.locals.user) return context.redirect('/login');
        if (context.locals.user.is_blocked) {
            await lucia.invalidateUserSessions(context.locals.user.id);
            return context.redirect('/login');
        }
        if (!context.locals.user.is_verified) {
            return context.redirect('/verify/email');
        }
        session = { ...context.locals.user };
    }

	if (session.user_role !== 'admin') {
        return new Response('Forbidden', { status: 403 });
    } else {
        return await privilegedWrapper(context.request);
    }
};
