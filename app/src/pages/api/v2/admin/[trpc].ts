import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { APIRoute } from 'astro';
import { createContext } from '../../../../lib/trpc/context';
import { TRPC_ROUTER } from '../../../../lib/trpc/admin';
import { DUMMY_SESSION } from '../../../../lib/helpers';
import { lucia } from '../../../../lib/lucia';
import { Logger } from '../../../../lib/logger';

export const ALL: APIRoute = async (context) => {
    let session = DUMMY_SESSION;

    if (!import.meta.env.DEV) {
        if (!context.locals.user) return context.redirect('/login');
        if (context.locals.user.is_blocked) {
            await lucia.invalidateUserSessions(context.locals.user.id);
            return context.redirect('/login?blocked=true');
        }
        if (!context.locals.user.is_verified) {
            return context.redirect('/verify/email');
        }
        if (context.request.headers.has('Session')) {
            context.request.headers.set('Session', context.locals.session.id);
        } else {
            context.request.headers.append('Session', context.locals.session.id);
        }
        session = { ...context.locals.user };
    }

    if (session.role !== 'admin') {
        return new Response('Forbidden', { status: 403 });
    } else {
        return fetchRequestHandler({
            endpoint: '/api/v2/admin',
            req: context.request,
            router: TRPC_ROUTER,
            createContext,
            onError(opts) {
                const { error } = opts;
                Logger.error('tRCP-Admin:', error.message);
            },
        });
    }
};
