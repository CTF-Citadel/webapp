import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { TRPC_CONTEXT } from './context';
import Actions from '../actions';

const HANLDER = new Actions();

export const TRPC = initTRPC.context<TRPC_CONTEXT>().create();
export const TRPC_ROUTER = TRPC.router({
    getAllEvents: TRPC.procedure.query(async () => {
        return await HANLDER.getAllEvents();
    }),
    getAllChallenges: TRPC.procedure.query(async () => {
        return await HANLDER.getAllChallenges();
    }),
    getAllUsers: TRPC.procedure.query(async () => {
        return await HANLDER.getAllUsers();
    }),
    getAllTeams: TRPC.procedure.query(async () => {
        return await HANLDER.getAllTeams();
    }),
    getAllTeamEvents: TRPC.procedure.query(async () => {
        return await HANLDER.getAllTeamEvents();
    }),
    getAllTeamChallenges: TRPC.procedure.query(async () => {
        return await HANLDER.getAllTeamChallenges();
    }),
    getAntiCheatEvents: TRPC.procedure.query(async () => {
        return await HANLDER.getAntiCheatEvents();
    }),
    getAntiCheatPoisons: TRPC.procedure.query(async () => {
        return await HANLDER.getAntiCheatPoisoned();
    }),
    getEventMailEligible: TRPC.procedure.input(z.string().uuid()).query(async (opts) => {
        return await HANLDER.getValidCertUsers(opts.input);
    }),
    queryBulkMail: TRPC.procedure.input(z.array(z.string())).query(async (opts) => {
        return await HANLDER.sendCertUserMails(opts.input);
    }),
    createChallenge: TRPC.procedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                category: z.string(),
                difficulty: z.string(),
                points: z.number(),
                staticFlag: z.string(),
                fileUrl: z.string(),
                containerPath: z.string(),
                assignTo: z.string().uuid(),
                dependsOn: z.string().uuid(),
                isFlagPool: z.boolean(),
                isStaticFlag: z.boolean(),
                isContainer: z.boolean(),
                isDependant: z.boolean()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    updateChallenge: TRPC.procedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string(),
                category: z.string(),
                difficulty: z.string(),
                points: z.number(),
                assignTo: z.string().uuid(),
                dependsOn: z.string().uuid()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    deleteChallenge: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            return true;
        } catch {
            return false;
        }
    }),
    createEvent: TRPC.procedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                start: z.number(),
                end: z.number()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    updateEvent: TRPC.procedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string(),
                start: z.number(),
                end: z.number()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    deleteEvent: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            return true;
        } catch {
            return false;
        }
    }),
    createTeamEvents: TRPC.procedure
        .input(
            z.object({
                eventId: z.string().uuid(),
                teamIdList: z.array(z.string().uuid())
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    deleteTeamEvent: TRPC.procedure
        .input(
            z.object({
                teamId: z.string().uuid(),
                eventId: z.string().uuid()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    updateSubmission: TRPC.procedure
        .input(
            z.object({
                challengeId: z.string().uuid(),
                teamId: z.string().uuid(),
                eventId: z.string().uuid(),
                containerId: z.string().uuid(),
                containerHost: z.string(),
                containerFlag: z.string()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    deleteSubmission: TRPC.procedure
        .input(
            z.object({
                challengeId: z.string().uuid(),
                teamId: z.string().uuid(),
                eventId: z.string().uuid()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    updateUser: TRPC.procedure
        .input(
            z.object({
                id: z.string().uuid(),
                email: z.string(),
                role: z.string(),
                firstName: z.string(),
                lastName: z.string(),
                affiliation: z.string(),
                teamId: z.string().uuid(),
                isVerified: z.boolean()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    toggleBlockUser: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            return true;
        } catch {
            return false;
        }
    }),
    deleteUser: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            return true;
        } catch {
            return false;
        }
    }),
    updateTeam: TRPC.procedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string()
            })
        )
        .mutation(async (opts) => {
            try {
                return true;
            } catch {
                return false;
            }
        }),
    deleteTeam: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            return true;
        } catch {
            return false;
        }
    })
});

export type AdminRouter = typeof TRPC_ROUTER;
