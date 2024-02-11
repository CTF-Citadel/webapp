import type { APIRoute } from "astro";
import { validatePasswordresetTokens } from "../../../../lib/lucia-db";
import { lucia } from '../../../../lib/lucia';
import { DB_ADAPTER } from '../../../../lib/db';
import { users } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { validPassword } from "../../../../lib/helpers";

export const POST: APIRoute = async (context) => {
    const { id } = context.params;
    let errorMessage = 'None';
    let respStatus = 200;
    const DATA = await context.request.json();
    const USER_ID = await validatePasswordresetTokens(id || "");

    if (!USER_ID) {
        return new Response("Invalid or Expired Token!", {
            status: 401
        });
    }

    const password = DATA.password;
    if (validPassword(password)) {
        await lucia.invalidateUserSessions(USER_ID);
        context.cookies.delete(lucia.sessionCookieName);
        const HASH_PASS = await new Argon2id().hash(password);
        await DB_ADAPTER.update(users).set({
            hashed_password: HASH_PASS
        }).where(eq(users.id, USER_ID));
    } else {
        respStatus = 400;
        errorMessage = 'Bad Password'
    }

    return new Response(
        JSON.stringify({
            status: respStatus,
            error: errorMessage
        }),
        {
            status: respStatus
        }
    );
};
