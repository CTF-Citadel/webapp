import type { APIRoute } from "astro";
import { validateEmailverificationTokens } from "../../lib/lucia-db";
import { lucia } from '../../lib/lucia';
import { DB_ADAPTER } from '../../lib/db';
import { users } from '../../lib/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async (context) => {
    const { id } = context.params;
    const USER_ID = await validateEmailverificationTokens(id || "");

    if (!USER_ID) {
        return new Response("Invalid or Expired Token!", {
            status: 401
        });
    }

    await lucia.invalidateUserSessions(USER_ID);
    context.cookies.delete(lucia.sessionCookieName);
    await DB_ADAPTER.update(users).set({
        is_verified: true
    }).where(eq(users.id, USER_ID));

    return context.redirect('/login?verified=true');
};
