import Actions from './actions';

const HANLDER = new Actions();

export type WrapperFormat = {
    type: string;
    data?: any | undefined;
};

/**
 * Wrapper for unrestricted user backend actions
 * @return
 * ```
 * body: {
 *    data: any{} | string
 *    error: boolean
 * }
 * ```
 */
export async function normalWrapper(request: Request): Promise<Response> {
    let json: WrapperFormat;
    let response: any = '';
    let errorStatus: boolean = false;

    try {
        json = (await request.json()) as WrapperFormat;
    } catch (e: unknown) {
        errorStatus = true;
        if (e instanceof Error) {
            response = e.message;
        } else {
            response = (e as Error).message;
        }
        return new Response(
            JSON.stringify({
                data: response,
                error: errorStatus
            })
        );
    }

    try {
        switch (json.type) {
            case 'teams':
                response = await HANLDER.getTeamLisitng();
                break;
            case 'events':
                response = await HANLDER.getAllEvents();
                break;
            case 'user-profile':
                response = await HANLDER.getUserProfile(json.data.userID);
                break;
            case 'team-profile':
                response = await HANLDER.getTeamProfile(json.data.teamID);
                break;
            case 'team-solves':
                response = await HANLDER.getTeamSolvesByEvent(json.data.eventID);
                break;
            case 'user-solves':
                response = await HANLDER.getUserSolvesByEvent(json.data.eventID);
                break;
            case 'team-scores':
                response = await HANLDER.getTeamPointsByEvent(json.data.eventID);
                break;
            case 'user-scores':
                response = await HANLDER.getUserPointsByEvent(json.data.eventID);
                break;
            case 'challenge-solves':
                response = await HANLDER.getChallengeSolvesByEvent(json.data.eventID);
                break;
            case 'team-events':
                response = await HANLDER.getTeamEvents(json.data.session);
                break;
            case 'challenges':
                response = await HANLDER.getEventChallenges(json.data.session, json.data.eventID);
                break;
            case 'solved-challenges':
                response = await HANLDER.getTeamSolvedChallenges(json.data.session);
                break;
            case 'deploy-challenge':
                response = await HANLDER.deployTeamChallenge(
                    json.data.session,
                    json.data.challengeID,
                    json.data.eventID
                );
                break;
            case 'get-deployed':
                response = await HANLDER.getDeployedChallenge(json.data.session, json.data.eventID);
                break;
            case 'team-info':
                response = await HANLDER.getTeamInfo(json.data.session);
                break;
            case 'team-members':
                response = await HANLDER.getTeamMembers(json.data.session);
                break;
            case 'reset-team-token':
                response = await HANLDER.resetTeamToken(json.data.session);
                break;
            case 'reset-password':
                response = await HANLDER.resetPassword(json.data.session, json.data.password);
                break;
            case 'update-userdata':
                response = await HANLDER.changeUserData(
                    json.data.session,
                    json.data.first,
                    json.data.last,
                    json.data.affiliation
                );
                break;
            case 'update-teamdata':
                response = await HANLDER.updateTeamData(
                    json.data.session,
                    json.data.teamID,
                    json.data.name,
                    json.data.description
                );
                break;
            case 'update-useravatar':
                response = await HANLDER.updateUserAvatar(json.data.session, json.data.avatar);
                break;
            case 'create-team':
                response = await HANLDER.createTeam(
                    json.data.session,
                    json.data.name,
                    json.data.description,
                    json.data.country
                );
                break;
            case 'join-team':
                response = await HANLDER.joinTeam(json.data.session, json.data.token);
                break;
            case 'check-leave':
                response = await HANLDER.checkTeamLeavable(json.data.session);
                break;
            case 'leave-team':
                response = await HANLDER.leaveTeam(json.data.session);
                break;
            case 'check-flag-static':
                response = await HANLDER.checkStaticChallengeFlag(
                    json.data.session,
                    json.data.eventID,
                    json.data.challengeID,
                    json.data.flag
                );
                const STATIC_CORRECT = response === true ? true : false;
                response = {
                    correct: STATIC_CORRECT
                };
                break;
            case 'check-flag-pool':
                response = await HANLDER.checkPoolChallengeFlag(
                    json.data.session,
                    json.data.eventID,
                    json.data.challengeID,
                    json.data.flag
                );
                const POOL_CORRECT = response === true ? true : false;
                response = {
                    correct: POOL_CORRECT
                };
                break;
            case 'check-flag-dynamic':
                response = await HANLDER.checkDynamicChallengeFlag(
                    json.data.session,
                    json.data.challengeID,
                    json.data.flag
                );
                const DYNAMIC_CORRECT = response === true ? true : false;
                response = {
                    correct: DYNAMIC_CORRECT
                };
                break;
        }
    } catch (e: unknown) {
        errorStatus = true;
        if (e instanceof Error) {
            response = e.message;
        } else {
            response = (e as Error).message;
        }
        console.error(response);
    }
    return new Response(
        JSON.stringify({
            data: response,
            error: errorStatus
        })
    );
}

/**
 * Wrapper for privileged backend actions
 * @return
 * ```
 * body: {
 *    data: any{} | string
 *    error: boolean
 * }
 * ```
 */
export async function privilegedWrapper(request: Request): Promise<Response> {
    let json: WrapperFormat;
    let response: any = '';
    let errorStatus: boolean = false;

    try {
        json = (await request.json()) as WrapperFormat;
    } catch (e: unknown) {
        errorStatus = true;
        if (e instanceof Error) {
            response = e.message;
        } else {
            response = (e as Error).message;
        }
        return new Response(
            JSON.stringify({
                data: response,
                error: errorStatus
            })
        );
    }

    try {
        switch (json.type) {
            case 'users':
                response = await HANLDER.getAllUsers();
                break;
            case 'teams':
                response = await HANLDER.getAllTeams();
                break;
            case 'events':
                response = await HANLDER.getAllEvents();
                break;
            case 'team-events':
                response = await HANLDER.getAllTeamEvents();
                break;
            case 'team-challenges':
                response = await HANLDER.getAllTeamChallenges();
                break;
            case 'challenges':
                response = await HANLDER.getAllChallenges();
                break;
            case 'create-challenge':
                response = await HANLDER.createChallenge(
                    json.data.name,
                    json.data.description,
                    json.data.category,
                    json.data.difficulty,
                    json.data.isContainer,
                    json.data.path,
                    json.data.fileURL,
                    json.data.event,
                    json.data.points,
                    json.data.dependsOn,
                    json.data.flagStatic,
                    json.data.staticFlag,
                    json.data.flagPool
                );
                break;
            case 'create-event':
                response = await HANLDER.createEvent(
                    json.data.name,
                    json.data.description,
                    json.data.start,
                    json.data.end
                );
                break;
            case 'assign-event':
                response = await HANLDER.createTeamEvent(json.data.id, json.data.teams);
                break;
            case 'unassign-event':
                response = await HANLDER.deleteTeamEvent(json.data.event, json.data.team);
                break;
            case 'update-challenge':
                response = await HANLDER.updateChallenge(
                    json.data.id,
                    json.data.name,
                    json.data.description,
                    json.data.category,
                    json.data.difficulty,
                    json.data.points,
                    json.data.event,
                    json.data.depends
                );
                break;
            case 'update-user':
                response = await HANLDER.updateUser(
                    json.data.id,
                    json.data.email,
                    json.data.verified,
                    json.data.role,
                    json.data.firstname,
                    json.data.lastname,
                    json.data.affiliation,
                    json.data.team
                );
                break;
            case 'update-event':
                response = await HANLDER.updateEvent(
                    json.data.id,
                    json.data.name,
                    json.data.description,
                    json.data.start,
                    json.data.end
                );
                break;
            case 'delete-event':
                response = await HANLDER.deleteEvent(json.data.id);
                break;
            case 'delete-challenge':
                response = await HANLDER.deleteChallenge(json.data.id);
                break;
            case 'delete-user':
                response = await HANLDER.deleteUser(json.data.id);
                break;
            case 'delete-team-challenge':
                response = await HANLDER.deleteTeamChallenge(
                    json.data.challengeID,
                    json.data.teamID,
                    json.data.eventID
                );
                break;
            case 'update-team-challenge':
                response = await HANLDER.updateTeamChallenge(
                    json.data.challengeID,
                    json.data.teamID,
                    json.data.eventID,
                    json.data.containerID,
                    json.data.containerHost,
                    json.data.containerFlag
                );
                break;
            case 'block-user':
                response = await HANLDER.toggleBlockUser(json.data.id);
                break;
            case 'update-team':
                response = await HANLDER.updateTeam(json.data.id, json.data.name, json.data.description);
                break;
            case 'delete-team':
                response = await HANLDER.deleteTeam(json.data.id);
                break;
            case 'get-ac-events':
                response = await HANLDER.getAntiCheatEvents();
                break;
            case 'get-ac-poisoned':
                response = await HANLDER.getAntiCheatPoisoned();
                break;
            case 'create-ac-poisoned':
                response = await HANLDER.createAntiCheatPoison(json.data.flags);
                break;
            case 'get-cert-users':
                response = await HANLDER.getValidCertUsers(json.data.eventID);
                break;
            case 'send-certs':
                response = await HANLDER.sendCertUserMails(json.data.list);
                break;
        }
    } catch (e: unknown) {
        errorStatus = true;
        if (e instanceof Error) {
            response = e.message;
        } else {
            response = (e as Error).message;
        }
        console.error(response);
    }
    return new Response(
        JSON.stringify({
            data: response,
            error: errorStatus
        })
    );
}
