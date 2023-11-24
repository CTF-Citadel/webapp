import { PrismaClient } from '@prisma/client';

// read from env
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

export type WrapperFormat = {
    type: string;
    data?: any | undefined;
};

// db client
const PRISMA = new PrismaClient({
    datasources: {
        db: {
            url: `mysql://root:${DB_PASS}@${DB_HOST}:3306/${DB_NAME}`
        }
    }
});

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
    let response: any;
    // match the request tyoe
    switch (json.type) {
        case 'users':
            response = await getAllUsers();
            break;
        case 'teams':
            response = await getAllTeams();
            break;
        case 'events':
            response = await getAllEvents();
            break;
        case 'challenges':
            response = await getAllChallenges();
            break;
        case 'create-challenge':
            response = await createChallenge(
                json.data.name,
                json.data.description,
                json.data.difficulty,
                json.data.is_container,
                json.data.file,
                json.data.event
            );
            break;
        case 'create-team':
            response = await createTeam(
                json.data.name,
                json.data.description,
                json.data.country
            );
            break;
        case 'create-event':
            response = await createEvent(
                json.data.name,
                json.data.description
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

export const getAllUsers = async () => {
    const RES = await PRISMA.user.findMany();
    if (RES.length > 0) {
        return RES;
    } else {
        return [];
    }
};

export const getAllTeams = async () => {
    const RES = await PRISMA.teams.findMany();
    if (RES.length > 0) {
        return RES;
    } else {
        return [];
    }
};

export const getAllEvents = async () => {
    const RES = await PRISMA.events.findMany();
    if (RES.length > 0) {
        return RES;
    } else {
        return [];
    }
};

export const getAllChallenges = async () => {
    const RES = await PRISMA.challenges.findMany();
    if (RES.length > 0) {
        return RES;
    } else {
        return [];
    }
};

export const createChallenge = async (
    name: string,
    desc: string,
    diff: string,
    isContainer: boolean,
    filePath: string,
    toEvent: string
) => {
    await PRISMA.challenges.create({
        data: {
            id: crypto.randomUUID().toString(),
            event_id: toEvent,
            challenge_name: name,
            challenge_description: desc,
            challenge_diff: diff,
            needs_container: isContainer,
            container_file: filePath
        }
    });
};

export const createEvent = async (name: string, desc: string) => {
    await PRISMA.events.create({
        data: {
            id: crypto.randomUUID().toString(),
            event_name: name,
            event_description: desc
        }
    });
};

export const createTeam = async (name: string, desc: string, country: string) => {
    await PRISMA.teams.create({
        data: {
            id: crypto.randomUUID().toString(),
            team_name: name,
            team_description: desc,
            team_country_code: country
        }
    });
};
