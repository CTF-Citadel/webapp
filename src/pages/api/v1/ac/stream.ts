import type { APIRoute } from 'astro';
import { lucia } from '../../../../lib/lucia';
import events from 'events';
import { DUMMY_SESSION } from '../../../../lib/helpers';
import M0n1t0r from '../../../../lib/integrations/m0n1t0r';

const M0N1T0R_URL = `ws://${process.env.M0N1T0R_HOST}:9999`;
const MONITOR = new M0n1t0r();

export const GET: APIRoute = async (context) => {
    let session = DUMMY_SESSION;
    let listener: (data: any) => void;
    const EMITTER = new events.EventEmitter();
    const STREAM = new ReadableStream({
        start(controller) {
            listener = (data) => {
                const FMT = `data: ${JSON.stringify({ data })}\r\n\r\n`;
                controller.enqueue(FMT);
            };
            EMITTER.off('message', listener);
            EMITTER.on('message', listener);
        },
        cancel() {
            EMITTER.removeListener('count', listener);
        }
    });

    setInterval(() => {
        MONITOR.flagged().then((data) => {
            if (data !== false || -1) {
                EMITTER.emit('message', { msg: data });
            }
        });
    }, 10000);

    if (!import.meta.env.DEV) {
        if (!context.locals.user) return context.redirect('/login');
        if (context.locals.user.is_blocked) {
            await lucia.invalidateUserSessions(context.locals.user.id);
            return context.redirect('/login');
        }
        if (!context.locals.user.is_verified) {
            return context.redirect('/verify/email');
        }
        session = { ...context.locals.user };
    }

    if (session.user_role !== 'admin') {
        return new Response('Forbidden', { status: 403 });
    } else {
        return new Response(STREAM, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                Connection: 'keep-alive',
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        });
    }
};
