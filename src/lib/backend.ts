import Actions from './actions';
import AntiCheat from './anticheat';

const AC_ENABLE = Boolean(process.env.M0N1T0R_ENABLE) || false;
const AC = new AntiCheat();
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
            case 'event-solves':
                response = await HANLDER.getAllSolvesByEvent(json.data.eventID);
                break;
            case 'team-scores':
                response = await HANLDER.getTeamPointsByEvent(json.data.eventID);
                break;
            case 'user-scores':
                response = await HANLDER.getUserPointsByEvent(json.data.eventID);
                break;
            case 'team-events':
                response = await HANLDER.getTeamEvents(json.data.id);
                break;
            case 'challenges':
                response = await HANLDER.getEventChallenges(json.data.eventID, json.data.teamID);
                break;
            case 'solved-challenges':
                response = await HANLDER.getTeamSolvedChallenges(json.data.id);
                break;
            case 'deploy-challenge':
                const GEN_FLAG = crypto.randomUUID();
                response = await HANLDER.deployTeamChallenge(
                    GEN_FLAG,
                    json.data.teamID,
                    json.data.challengeID,
                    json.data.eventID
                );
                if (response !== false && AC_ENABLE === true) {
                    AC.flagInitial(GEN_FLAG, json.data.teamID, json.data.challengeID, Date.now());
                }
                break;
            case 'get-deployed':
                response = await HANLDER.getDeployedChallenge(json.data.teamID, json.data.eventID);
                break;
            case 'team-info':
                response = await HANLDER.getTeamInfo(json.data.id);
                break;
            case 'team-members':
                response = await HANLDER.getTeamMembers(json.data.id);
                break;
            case 'reset-team-token':
                response = await HANLDER.resetTeamToken(json.data.session, json.data.teamID);
                break;
            case 'create-team':
                const HAS_CREATED = await HANLDER.checkHasCreatedTeam(json.data.creator);
                if (!HAS_CREATED) {
                    response = await HANLDER.createTeam(
                        json.data.creator,
                        json.data.name,
                        json.data.description,
                        json.data.country
                    );
                    const TEAM_ID = await HANLDER.checkTeamNameExist(json.data.name);
                    if (TEAM_ID !== false) {
                        response = await HANLDER.joinTeam(json.data.session, TEAM_ID);
                    }
                }
                break;
            case 'join-team':
                const IS_JOINED = await HANLDER.checkUserInTeam(json.data.user);
                if (!IS_JOINED) {
                    const TEAM_ID = await HANLDER.checkTeamToken(json.data.token);
                    if (TEAM_ID !== false) {
                        response = await HANLDER.joinTeam(json.data.session, TEAM_ID);
                    }
                }
                break;
            case 'leave-team':
                response = await HANLDER.leaveTeam(json.data.session, json.data.teamID);
                break;
            case 'check-flag-static':
                const TIMESTAMP_STATIC = Date.now();
                response = await HANLDER.checkStaticChallengeFlag(
                    json.data.teamID,
                    json.data.eventID,
                    json.data.challengeID,
                    json.data.flag,
                    json.data.userID,
                    TIMESTAMP_STATIC
                );
                if (response) {
                    if (AC_ENABLE === true) {
                        AC.flagSubmit(
                            json.data.flag,
                            json.data.teamID,
                            json.data.userID,
                            json.data.challengeID,
                            TIMESTAMP_STATIC
                        );
                    }
                    response = {
                        correct: true
                    };
                } else {
                    response = {
                        correct: false
                    };
                }
                break;
            case 'check-flag':
                const TIMESTAMP = Date.now();
                response = await HANLDER.checkChallengeFlag(
                    json.data.teamID,
                    json.data.challengeID,
                    json.data.flag,
                    json.data.userID,
                    TIMESTAMP
                );
                if (response) {
                    if (AC_ENABLE === true) {
                        AC.flagSubmit(
                            json.data.flag,
                            json.data.teamID,
                            json.data.userID,
                            json.data.challengeID,
                            TIMESTAMP
                        );
                    }
                    response = {
                        correct: true
                    };
                } else {
                    response = {
                        correct: false
                    };
                }
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
                    json.data.dependon,
                    json.data.flagStatic,
                    json.data.staticFlag
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
                    json.data.children
                );
                break;
            case 'update-user':
                response = await HANLDER.updateUser(json.data.id, json.data.email, json.data.verified);
                break;
            case 'update-event':
                response = await HANLDER.updateEvent(json.data.id, json.data.name, json.data.description);
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
            case 'block-user':
                response = await HANLDER.toggleBlockUser(json.data.id);
                break;
            case 'delete-team':
                response = await HANLDER.deleteTeam(json.data.id);
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
