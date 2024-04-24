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
    QUERY_BULK_MAIL,
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
    queryBulkMail: TRPC.procedure.input(QUERY_BULK_MAIL).mutation(async (opts) => {
        return await HANLDER.sendCertUserMails(opts.input);
    }),
    createAntiCheatPoison: TRPC.procedure.input(z.array(z.string())).mutation(async (opts) => {
        return await HANLDER.createAntiCheatPoison(opts.input);
    }),
    createChallenge: TRPC.procedure.input(CREATE_CHALLENGE).mutation(async (opts) => {
        return await HANLDER.createChallenge(opts.input);
    }),
    updateChallenge: TRPC.procedure.input(UPDATE_CHALLENGE).mutation(async (opts) => {
        return await HANLDER.updateChallenge(opts.input);
    }),
    deleteChallenge: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        return await HANLDER.deleteChallenge(opts.input);
    }),
    createEvent: TRPC.procedure.input(CREATE_EVENT).mutation(async (opts) => {
        return await HANLDER.createEvent(opts.input);
    }),
    updateEvent: TRPC.procedure.input(UPDATE_EVENT).mutation(async (opts) => {
        return await HANLDER.updateEvent(opts.input);
    }),
    deleteEvent: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        return await HANLDER.deleteEvent(opts.input);
    }),
    createTeamEvents: TRPC.procedure.input(CREATE_TEAM_EVENT).mutation(async (opts) => {
        return await HANLDER.createTeamEvent(opts.input);
    }),
    deleteTeamEvent: TRPC.procedure.input(DELETE_TEAM_EVENT).mutation(async (opts) => {
        return await HANLDER.deleteTeamEvent(opts.input);
    }),
    updateSubmission: TRPC.procedure.input(UPDATE_SUBMISSION).mutation(async (opts) => {
        return await HANLDER.updateTeamChallenge(opts.input);
    }),
    deleteSubmission: TRPC.procedure.input(DELETE_SUBMISSION).mutation(async (opts) => {
        return await HANLDER.deleteTeamChallenge(opts.input);
    }),
    updateUser: TRPC.procedure.input(UPDATE_USER).mutation(async (opts) => {
        return await HANLDER.updateUser(opts.input);
    }),
    toggleBlockUser: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        return await HANLDER.toggleBlockUser(opts.input);
    }),
    deleteUser: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        return await HANLDER.deleteUser(opts.input);
    }),
    updateTeam: TRPC.procedure.input(UPDATE_TEAM).mutation(async (opts) => {
        return await HANLDER.updateTeam(opts.input);
    }),
    deleteTeam: TRPC.procedure.input(z.string().uuid()).mutation(async (opts) => {
        return await HANLDER.deleteTeam(opts.input);
    })
});

export type AdminRouter = typeof TRPC_ROUTER;
