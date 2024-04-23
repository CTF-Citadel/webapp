import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { TRPC_CONTEXT } from './context';

export const TRPC = initTRPC.context<TRPC_CONTEXT>().create();
export const TRPC_ROUTER = TRPC.router({});

export type UserRouter = typeof TRPC_ROUTER;
