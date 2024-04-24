import type { APIRoute } from 'astro';
import { sendPasswordResetLink } from '../../../../lib/lucia-email';
import { generatePasswordresetTokens, isRegisteredEmail } from '../../../../lib/lucia-db';

export const POST: APIRoute = async (context) => {
    let emailSent = false;
    let errorMessage = 'None';
    let respStatus = 200;
    const ORIGIN = context.url.origin;
    const DATA = await context.request.json();
    const EMAIL = DATA.email;
    const IS_REGISTERED = await isRegisteredEmail(EMAIL);

    if (IS_REGISTERED) {
        try {
            const TOKEN = await generatePasswordresetTokens(EMAIL);
            if (TOKEN) {
                await sendPasswordResetLink(ORIGIN, EMAIL, TOKEN);
                emailSent = true;
            }
        } catch (e: any) {
            console.error(e);
            errorMessage = 'An error occurred';
        }
    } else {
        errorMessage = 'Account does not exist!';
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
