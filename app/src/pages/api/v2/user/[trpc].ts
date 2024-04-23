import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { APIRoute } from 'astro';
import { createContext } from '../../../../lib/trpc/context';
import { TRPC_ROUTER } from '../../../../lib/trpc/user';
import { lucia } from "../../../../lib/lucia";

export const ALL: APIRoute = async (context) => {
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

    return fetchRequestHandler({
        endpoint: '/api/v2/user',
        req: context.request,
        router: TRPC_ROUTER,
        createContext,
    });
};
