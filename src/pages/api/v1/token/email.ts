import type { APIRoute } from "astro";
import { sendVerificationLink } from '../../../../lib/lucia-email';
import { generateEmailverificationTokens } from "../../../../lib/lucia-db";

export const POST: APIRoute = async (context) => {
    let emailSent = false;
    let errorMessage = 'None';
    let respStatus = 200;
    const ORIGIN = context.url.origin;

    try {
        if (!context.locals.user) return context.redirect('/login');
        if (context.locals.user.is_blocked) return context.redirect('/login?blocked=true')
        if (!context.locals.user.is_verified) {
            const token = await generateEmailverificationTokens(context.locals.user.id);
            sendVerificationLink(ORIGIN, context.locals.user.email, token);
            emailSent = true;
        }
    } catch (e: any) {
        console.error(e);
        errorMessage = 'An error occurred';
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
