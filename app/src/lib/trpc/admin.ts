import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { TRPC_CONTEXT } from './context';
import Actions from '../actions';
import {
    CREATE_CHALLENGE,
    CREATE_EVENT,
    CREATE_TEAM_EVENT,
    DELETE_SUBMISSION,
    DELETE_TEAM_EVENT,
    UPDATE_CHALLENGE,
    UPDATE_EVENT,
    UPDATE_SUBMISSION,
    UPDATE_TEAM,
    UPDATE_USER
} from '../types';

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
    queryBulkMail: TRPC.procedure
        .input(z.array(z.object({ email: z.string(), fullName: z.string() })))
        .mutation(async (opts) => {
            try {
                await HANLDER.sendCertUserMails(opts.input);
                return true;
            } catch (e) {
                console.error(e);
                return false;
            }
        }),
    createAntiCheatPoison: TRPC.procedure.input(z.array(z.string())).mutation(async (opts) => {
        try {
            await HANLDER.createAntiCheatPoison(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    createChallenge: TRPC.procedure.input(CREATE_CHALLENGE).mutation(async (opts) => {
        try {
            await HANLDER.createChallenge(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    updateChallenge: TRPC.procedure.input(UPDATE_CHALLENGE).mutation(async (opts) => {
        try {
            await HANLDER.updateChallenge(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    deleteChallenge: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            await HANLDER.deleteChallenge(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    createEvent: TRPC.procedure.input(CREATE_EVENT).mutation(async (opts) => {
        try {
            await HANLDER.createEvent(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    updateEvent: TRPC.procedure.input(UPDATE_EVENT).mutation(async (opts) => {
        try {
            await HANLDER.updateEvent(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    deleteEvent: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            await HANLDER.deleteEvent(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    createTeamEvents: TRPC.procedure.input(CREATE_TEAM_EVENT).mutation(async (opts) => {
        try {
            await HANLDER.createTeamEvent(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    deleteTeamEvent: TRPC.procedure.input(DELETE_TEAM_EVENT).mutation(async (opts) => {
        try {
            await HANLDER.deleteTeamEvent(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    updateSubmission: TRPC.procedure.input(UPDATE_SUBMISSION).mutation(async (opts) => {
        try {
            await HANLDER.updateTeamChallenge(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    deleteSubmission: TRPC.procedure.input(DELETE_SUBMISSION).mutation(async (opts) => {
        try {
            await HANLDER.deleteTeamChallenge(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    updateUser: TRPC.procedure.input(UPDATE_USER).mutation(async (opts) => {
        try {
            await HANLDER.updateUser(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    toggleBlockUser: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            await HANLDER.toggleBlockUser(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    deleteUser: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            await HANLDER.deleteUser(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    updateTeam: TRPC.procedure.input(UPDATE_TEAM).mutation(async (opts) => {
        try {
            await HANLDER.updateTeam(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }),
    deleteTeam: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        try {
            await HANLDER.deleteTeam(opts.input);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    })
});

export type AdminRouter = typeof TRPC_ROUTER;
