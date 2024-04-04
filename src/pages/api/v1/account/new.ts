import type { APIRoute } from 'astro';
import { generateEmailverificationTokens } from '../../../../lib/lucia-db';
import { sendVerificationLink } from '../../../../lib/lucia-email';
import { validEmail, validPassword, validUsername } from '../../../../lib/helpers';
import { safeCreateUser } from '../../../../lib/lucia-db';

// check for enforce flags
const DISABLE_EMAIL_VERIFY = Boolean(process.env.DISABLE_EMAIL_VERIFY || false);
const ENFORCE_EMAIL_DOMAIN = Boolean(process.env.ENFORCE_EMAIL_DOMAIN || false);
const ENFORCE_DOMAIN = process.env.ENFORCE_DOMAIN || '';

export const POST: APIRoute = async (context) => {
    let errorMessage = 'None';
    let respStatus = 200;
    let success = false;
    let redirect = false;
    const ORIGIN = context.url.origin;
    const DATA = await context.request.json();
    const email = DATA.email;
    const username = DATA.username;
    const password = DATA.password;
    if (validEmail(email, ENFORCE_EMAIL_DOMAIN, ENFORCE_DOMAIN) && validPassword(password) && validUsername(username)) {
        try {
            const { ID, COOKIE } = await safeCreateUser(username, email, password);
            context.cookies.set(COOKIE.name, COOKIE.value, COOKIE.attributes);
            if (DISABLE_EMAIL_VERIFY) {
                success = true;
                redirect = true;
            } else {
                const TOKEN = await generateEmailverificationTokens(ID);
                await sendVerificationLink(ORIGIN, email, TOKEN);
                success = true;
            }
        } catch (e: any) {
            if (e.message === 'AUTH_NAME_EXISTS') {
                errorMessage = 'Username already registered';
            } else if (e.message === 'AUTH_EMAIL_EXISTS') {
                errorMessage = 'Email already registered';
            } else if (e.message === 'AUTH_EMAIL_ENFORCE') {
                errorMessage = 'Email not allowed';
            }else {
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
            success,
            redirect
        }),
        {
            status: respStatus
        }
    );
};
