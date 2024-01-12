import DatabaseActions from "./actions";

const HANLDER = new DatabaseActions()

export type WrapperFormat = {
    type: string;
    data?: any | undefined;
};

export async function normalWrapper(request: Request): Promise<Response> {
    let json: WrapperFormat;
    try {
        json = (await request.json()) as WrapperFormat;
    } catch {
        return new Response(
            JSON.stringify({
                data: [],
                error: true
            })
        );
    }
    let response: any = "";
    // match the request tyoe
    switch (json.type) {
        case 'events':
            response = await HANLDER.getTeamEvents(json.data.id);
            break;
        case 'challenges':
            response = await HANLDER.getEventChallenges(json.data.id);
            break;
        case 'deploy-challenge':
            response = await HANLDER.deployTeamChallenge(json.data.teamID, json.data.challengeID);
            break;
        case 'check-flag':
            response = await HANLDER.checkChallengeFlag(json.data.teamID, json.data.challengeID, json.data.flag);
            if (response == true) {
                response = {
                    correct: true
                }
            } else {
                response = {
                    correct: false
                }
            }
            break;
    }
    // formulate unifed response
    return new Response(
        JSON.stringify({
            data: response,
            error: false
        })
    );
}

export async function privilegedWrapper(request: Request): Promise<Response> {
    let json: WrapperFormat;
    try {
        json = (await request.json()) as WrapperFormat;
    } catch {
        return new Response(
            JSON.stringify({
                data: [],
                error: true
            })
        );
    }
    let response: any = "";
    // match the request tyoe
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
        case 'challenges':
            response = await HANLDER.getAllChallenges();
            break;
        case 'create-challenge':
            response = await HANLDER.createChallenge(
                json.data.name,
                json.data.description,
                json.data.difficulty,
                json.data.isContainer,
                json.data.filePath,
                json.data.fileURL,
                json.data.event
            );
            break;
        case 'create-team':
            response = await HANLDER.createTeam(
                json.data.name,
                json.data.description,
                json.data.country
            );
            break;
        case 'create-event':
            response = await HANLDER.createEvent(
                json.data.name,
                json.data.description
            );
            break;
        case 'update-challenge':
            response = await HANLDER.updateChallenge(
                json.data.id,
                json.data.name,
                json.data.description,
                json.data.difficulty,
                json.data.event
            );
            break;
        case 'update-event':
            response = await HANLDER.updateEvent(
                json.data.id,
                json.data.name,
                json.data.description
            );
            break;
        case 'delete-event':
            response = await HANLDER.deleteEvent(
                json.data.id
            );
            break;
        case 'delete-challenge':
            response = await HANLDER.deleteChallenge(
                json.data.id
            );
            break;
        case 'delete-user':
            response = await HANLDER.deleteUser(
                json.data.id
            );
            break;
        case 'block-user':
            response = await HANLDER.blockUser(
                json.data.id
            );
            break;
        case 'delete-team':
            response = await HANLDER.deleteTeam(
                json.data.id
            );
            break;
    }
    // formulate unifed response
    return new Response(
        JSON.stringify({
            data: response,
            error: false
        })
    );
}
