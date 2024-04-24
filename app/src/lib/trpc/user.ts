import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { TRPC_CONTEXT } from './context';
import Actions from '../actions';
import { USER_CHECK_FLAG, USER_CREATE_TEAM, USER_DEPLOY_CHALLENGE, USER_UPDATE_DATA, USER_UPDATE_TEAM } from '../types';

const HANLDER = new Actions();

export const TRPC = initTRPC.context<TRPC_CONTEXT>().create();
export const TRPC_ROUTER = TRPC.router({
    getTeams: TRPC.procedure.query(async () => {
        return await HANLDER.getTeamListing();
    }),
    getEvent: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getSingleEvents(opts.input);
    }),
    getChallenges: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getEventChallenges(opts.ctx.sessionId, opts.input);
    }),
    getDeployedChallenges: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getDeployedChallenges(opts.ctx.sessionId, opts.input);
    }),
    getTeamEvents: TRPC.procedure.query(async (opts) => {
        return await HANLDER.getTeamEvents(opts.ctx.sessionId);
    }),
    getTeamSolved: TRPC.procedure.query(async (opts) => {
        return await HANLDER.getTeamSolvedChallenges(opts.ctx.sessionId);
    }),
    getUserProfile: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getUserProfile(opts.input);
    }),
    getTeamProfile: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getTeamProfile(opts.input);
    }),
    getTeamInfo: TRPC.procedure.query(async (opts) => {
        return await HANLDER.getTeamInfo(opts.ctx.sessionId);
    }),
    getTeamMembers: TRPC.procedure.query(async (opts) => {
        return await HANLDER.getTeamMembers(opts.ctx.sessionId);
    }),
    getTeamSolves: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getTeamSolvesByEvent(opts.input);
    }),
    getTeamPoints: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getTeamPointsByEvent(opts.input);
    }),
    getTeamLeaveStatus: TRPC.procedure.query(async (opts) => {
        return await HANLDER.checkTeamLeavable(opts.ctx.sessionId);
    }),
    getUserSolves: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getUserSolvesByEvent(opts.input);
    }),
    getUserPoints: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getUserPointsByEvent(opts.input);
    }),
    getChallengeSolves: TRPC.procedure.input(z.string()).query(async (opts) => {
        return await HANLDER.getChallengeSolvesByEvent(opts.input);
    }),
    updateUserData: TRPC.procedure.input(USER_UPDATE_DATA).mutation(async (opts) => {
        try {
            await HANLDER.changeUserData(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    updateUserAvatar: TRPC.procedure.input(z.string()).mutation(async (opts) => {
        try {
            await HANLDER.updateUserAvatar(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    updateUserPassword: TRPC.procedure.input(z.string()).mutation(async (opts) => {
        try {
            await HANLDER.resetPassword(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    createTeam: TRPC.procedure.input(USER_CREATE_TEAM).mutation(async (opts) => {
        try {
            await HANLDER.createTeam(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    joinTeam: TRPC.procedure.input(z.string()).mutation(async (opts) => {
        try {
            await HANLDER.joinTeam(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    leaveTeam: TRPC.procedure.mutation(async (opts) => {
        try {
            await HANLDER.leaveTeam(opts.ctx.sessionId);
            return true;
        } catch {
            return false;
        }
    }),
    updateTeam: TRPC.procedure.input(USER_UPDATE_TEAM).mutation(async (opts) => {
        try {
            await HANLDER.updateTeamData(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    updateTeamToken: TRPC.procedure.mutation(async (opts) => {
        try {
            await HANLDER.resetTeamToken(opts.ctx.sessionId);
            return true;
        } catch {
            return false;
        }
    }),
    deployChallenge: TRPC.procedure.input(USER_DEPLOY_CHALLENGE).mutation(async (opts) => {
        try {
            await HANLDER.deployTeamChallenge(opts.ctx.sessionId, opts.input);
            return true;
        } catch {
            return false;
        }
    }),
    checkStaticFlag: TRPC.procedure.input(USER_CHECK_FLAG).mutation(async (opts) => {
        try {
            return await HANLDER.checkStaticChallengeFlag(opts.ctx.sessionId, opts.input);
        } catch {
            return false;
        }
    }),
    checkPoolFlag: TRPC.procedure.input(USER_CHECK_FLAG).mutation(async (opts) => {
        try {
            return await HANLDER.checkPoolChallengeFlag(opts.ctx.sessionId, opts.input);
        } catch {
            return false;
        }
    }),
    checkDynamicFlag: TRPC.procedure.input(USER_CHECK_FLAG).mutation(async (opts) => {
        try {
            return await HANLDER.checkDynamicChallengeFlag(opts.ctx.sessionId, opts.input);
        } catch {
            return false;
        }
    })
});

export type UserRouter = typeof TRPC_ROUTER;
