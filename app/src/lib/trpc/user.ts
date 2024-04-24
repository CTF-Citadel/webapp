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
        return await HANLDER.changeUserData(opts.ctx.sessionId, opts.input);
    }),
    updateUserAvatar: TRPC.procedure.input(z.string()).mutation(async (opts) => {
        return await HANLDER.updateUserAvatar(opts.ctx.sessionId, opts.input);
    }),
    updateUserPassword: TRPC.procedure.input(z.string()).mutation(async (opts) => {
        return await HANLDER.resetPassword(opts.ctx.sessionId, opts.input);
    }),
    createTeam: TRPC.procedure.input(USER_CREATE_TEAM).mutation(async (opts) => {
        return await HANLDER.createTeam(opts.ctx.sessionId, opts.input);
    }),
    joinTeam: TRPC.procedure.input(z.string()).mutation(async (opts) => {
        return await HANLDER.joinTeam(opts.ctx.sessionId, opts.input);
    }),
    leaveTeam: TRPC.procedure.mutation(async (opts) => {
        return await HANLDER.leaveTeam(opts.ctx.sessionId);
    }),
    updateTeam: TRPC.procedure.input(USER_UPDATE_TEAM).mutation(async (opts) => {
        return await HANLDER.updateTeamData(opts.ctx.sessionId, opts.input);
    }),
    updateTeamToken: TRPC.procedure.mutation(async (opts) => {
        return await HANLDER.resetTeamToken(opts.ctx.sessionId);
    }),
    deployChallenge: TRPC.procedure.input(USER_DEPLOY_CHALLENGE).mutation(async (opts) => {
        return await HANLDER.deployTeamChallenge(opts.ctx.sessionId, opts.input);
    }),
    checkStaticFlag: TRPC.procedure.input(USER_CHECK_FLAG).mutation(async (opts) => {
        return await HANLDER.checkStaticChallengeFlag(opts.ctx.sessionId, opts.input);
    }),
    checkPoolFlag: TRPC.procedure.input(USER_CHECK_FLAG).mutation(async (opts) => {
        return await HANLDER.checkPoolChallengeFlag(opts.ctx.sessionId, opts.input);
    }),
    checkDynamicFlag: TRPC.procedure.input(USER_CHECK_FLAG).mutation(async (opts) => {
        return await HANLDER.checkDynamicChallengeFlag(opts.ctx.sessionId, opts.input);
    })
});

export type UserRouter = typeof TRPC_ROUTER;
