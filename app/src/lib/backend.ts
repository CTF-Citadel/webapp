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
            case 'single-event':
                response = await HANLDER.getSingleEvents(json.data.eventID);
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
