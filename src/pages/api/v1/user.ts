import { lucia } from "../../../lib/lucia";
import type { APIRoute } from "astro";
import { normalWrapper } from "../../../lib/backend";

export const POST: APIRoute = async (context) => {
    if (!import.meta.env.DEV) {
        if (!context.locals.user) return context.redirect('/login');
        if (context.locals.user.is_blocked) {
            await lucia.invalidateUserSessions(context.locals.user.id);
            return context.redirect('/login?blocked=true');
        }
        if (!context.locals.user.is_verified) {
            return context.redirect('/verify/email');
        }
    }

    return await normalWrapper(context.request);
};
