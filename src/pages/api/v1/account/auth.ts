import type { APIRoute } from "astro";
import { validEmail } from "../../../../lib/helpers";
import { lucia } from '../../../../lib/lucia';
import { Argon2id } from 'oslo/password';
import { DB_ADAPTER } from '../../../../lib/db';
import { users } from '../../../../lib/schema';
import type { UsersType } from "../../../../lib/schema";
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
    let redirect = false;
    let errorMessage = 'None';
    let respStatus = 200;
	const DATA = await context.request.json();
    const email = DATA.email;
    const password = DATA.password;

    if (validEmail(email)) {
        try {
            const EXISTING_USER: UsersType[] = await DB_ADAPTER.select().from(users).where(eq(users.email, email));
            if (EXISTING_USER.length === 0) throw Error('AUTH_NON_EXISTENT');
            const VALID = await new Argon2id().verify(EXISTING_USER[0].hashed_password || '', password);
            if (!VALID) throw Error('AUTH_INVALID_PASSWORD');
            const SESSION = await lucia.createSession(EXISTING_USER[0].id, {});
            const COOKIE = lucia.createSessionCookie(SESSION.id);
            context.cookies.set(COOKIE.name, COOKIE.value, COOKIE.attributes);
            redirect = true;
        } catch (e: any) {
            if (e.message === 'AUTH_INVALID_PASSWORD') {
                errorMessage = 'Wrong Email or Password';
            } else if (e.message === 'AUTH_NON_EXISTENT') {
                errorMessage = 'User not found';
            } else {
                console.error(e);
                errorMessage = 'Unknown Error';
            }
        }
    } else {
        respStatus = 400;
        errorMessage = 'Invalid Input';
    }
    return new Response(
        JSON.stringify({
            status: respStatus,
            error: errorMessage,
            needsRedirect: redirect
        }),
        {
            status: respStatus
        }
    );
};
