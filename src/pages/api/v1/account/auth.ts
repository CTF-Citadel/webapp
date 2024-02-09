import type { APIRoute } from "astro";
import { isValidEmail } from '../../../../lib/lucia-email';
import { lucia } from '../../../../lib/lucia';
import { Argon2id } from 'oslo/password';
import { DB_ADAPTER } from '../../../../lib/db';
import { users } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async (context) => {
    let redirect = false;
    let errorMessage = 'None';
    let respStatus = 200;
	const DATA = await context.request.json();
    const email = DATA.email;
    const password = DATA.password;
    const validPassword = typeof password === 'string' && password.length >= 1 && password.length <= 255;

    if (isValidEmail(email) && validPassword) {
        try {
            const EXISTING_USER = await DB_ADAPTER.select().from(users).where(eq(users.email, email));
            const VALID = await new Argon2id().verify(EXISTING_USER[0].hashed_password || '', password);
            if (!VALID) throw Error('AUTH_INVALID_PASSWORD');
            const SESSION = await lucia.createSession(EXISTING_USER[0].id, {});
            const COOKIE = lucia.createSessionCookie(SESSION.id);
            context.cookies.set(COOKIE.name, COOKIE.value, COOKIE.attributes);
            redirect = true;
        } catch (e: any) {
            if (e.message === 'AUTH_INVALID_PASSWORD') {
                errorMessage = 'Wrong Email or Password';
            } else {
                console.log(e);
                errorMessage = 'Unknown Error';
            }
        }
    } else {
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
