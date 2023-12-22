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
    let response: any;
    // match the request tyoe
    switch (json.type) {
        case 'events':
            response = await getTeamEvents(json.data.id);
            break;
        case 'challenges':
            response = await getEventChallenges(json.data.id);
            break;
        case 'deploy-challenge':
            // ! @TODO: Awaiting proper request format from backend
            /*
            const TEMP = await fetch(`http://172.31.35.112:8000/challenge?compose_file=FileNigma&environment_variables=%7B%22FLAG%22%3A%22${crypto.randomUUID().toString()}%22%7D`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            response = await TEMP.json()
            */
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
        case 'update-challenge':
            response = await updateChallenge(
                json.data.id,
                json.data.name,
                json.data.description,
                json.data.difficulty,
                json.data.event
            );
            break;
        case 'update-event':
            response = await updateEvent(
                json.data.id,
                json.data.name,
                json.data.description
            );
            break;
        case 'delete-event':
            response = await deleteEvent(
                json.data.id
            );
            break;
        case 'delete-challenge':
            response = await deleteChallenge(
                json.data.id
            );
            break;
        case 'delete-team':
            response = await deleteTeam(
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

export const getTeamEvents = async (id: string) => {
    let allEvents = [];
    // @TODO: For Testing only!
    const RES = await PRISMA.events.findMany();
    /*
    const RES = await PRISMA.team_events.findMany({
        where: {
            team_id: id
        }
    });
    */
    if (RES.length > 0) {
        for (const entry of RES) {
            // @TODO: For Testing only!
            const EVENT = await PRISMA.events.findFirst({
                where: {
                    id: entry.id
                }
            });
            /*
            const EVENT = await PRISMA.events.findFirst({
                where: {
                    id: entry.event_id
                }
            });
            */
            if (EVENT != null) {
                allEvents.push(EVENT)
            }
        }
        return allEvents;
    } else {
        return [];
    }
};

export const getEventChallenges = async (id: string) => {
    // @TODO: For Testing only!
    const RES = await PRISMA.challenges.findMany();
    /*
    const RES = await PRISMA.challenges.findMany({
        where: {
            event_id: id
        }
    });
    */
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

export const updateEvent = async (id: string, name: string, desc: string) => {
    await PRISMA.events.update({
        where: {
            id: id
        },
        data: {
            event_name: name,
            event_description: desc
        }
    });
};

export const updateChallenge = async (id: string, name: string, desc: string, diff: string, event: string) => {
    await PRISMA.challenges.update({
        where: {
            id: id
        },
        data: {
            challenge_name: name,
            challenge_description: desc,
            challenge_diff: diff,
            event_id: event,
        }
    });
};

export const deleteTeam = async (id: string) => {
    await PRISMA.teams.delete({
        where: {
            id: id
        }
    });
};

export const deleteChallenge = async (id: string) => {
    await PRISMA.challenges.delete({
        where: {
            id: id
        }
    });
};

export const deleteEvent = async (id: string) => {
    await PRISMA.events.delete({
        where: {
            id: id
        }
    });
};
