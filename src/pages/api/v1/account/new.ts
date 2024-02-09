import type { APIRoute } from "astro";
import { generateEmailverificationTokens, isInitialUser } from '../../../../lib/lucia-db';
import { isValidEmail, sendVerificationLink } from '../../../../lib/lucia-email';
import { lucia } from '../../../../lib/lucia';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { DB_ADAPTER } from '../../../../lib/db';
import { users } from '../../../../lib/schema';

export const POST: APIRoute = async (context) => {
    let errorMessage = 'None';
    let respStatus = 200;
    let emailSent = false;
    const ORIGIN = context.url.origin;
    const DATA = await context.request.json();
    const email = DATA.email;
    const username = DATA.username;
    const password = DATA.password;
    const validPassword = typeof password === 'string' && password.length >= 6 && password.length <= 255;
    if (isValidEmail(email) && validPassword) {
        try {
            const IS_INITIAL = await isInitialUser();
            const USER_ID = generateId(32);
            const HASH_PASS = await new Argon2id().hash(password);

            await DB_ADAPTER.insert(users).values({
                id: USER_ID,
                hashed_password: HASH_PASS,
                username: username,
                user_role: String(IS_INITIAL ? 'admin' : 'participant'),
                user_team_id: '',
                email: email,
                is_verified: false,
                is_blocked: false
            });

            const SESSION = await lucia.createSession(USER_ID, {});
            const COOKIE = lucia.createSessionCookie(SESSION.id);
            context.cookies.set(COOKIE.name, COOKIE.value, COOKIE.attributes);
            const TOKEN = await generateEmailverificationTokens(USER_ID);
            sendVerificationLink(ORIGIN, email, TOKEN);
            emailSent = true;
        } catch (e: any) {
            console.log(e);
            if (e.code == 'ER_DUP_ENTRY') {
                errorMessage = 'User already exists';
            } else {
                errorMessage = 'An error occurred';
            }
        }
    } else {
        errorMessage = 'Invalid Input';
    }
    return new Response(
        JSON.stringify({
            status: respStatus,
            error: errorMessage,
            verifySent: emailSent
        }),
        {
            status: respStatus
        }
    );
};
