import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
    let sessionId = req.headers.get('Session') ?? 'anonymous';
    return { req, resHeaders, sessionId };
}

export type TRPC_CONTEXT = Awaited<ReturnType<typeof createContext>>;
