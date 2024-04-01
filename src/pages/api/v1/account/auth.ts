import type { APIRoute } from 'astro';
import { validEmail } from '../../../../lib/helpers';
import { safeVerifyUser } from '../../../../lib/lucia-db';

export const POST: APIRoute = async (context) => {
    let redirect = false;
    let errorMessage = 'None';
    let respStatus = 200;
    const DATA = await context.request.json();
    const email = DATA.email;
    const password = DATA.password;

    if (validEmail(email) && password !== undefined) {
        try {
            const { ID, COOKIE } = await safeVerifyUser(email, password);
            context.cookies.set(COOKIE.name, COOKIE.value, COOKIE.attributes);
            redirect = true;
        } catch (e: any) {
            if (e.message === 'AUTH_INVALID') {
                errorMessage = 'Wrong Username or Password';
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
