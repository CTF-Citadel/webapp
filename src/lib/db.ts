import { PrismaClient } from '@prisma/client';

// read from env
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

export type WrapperFormat = {
    type: string;
};

// db client
const PRISMA = new PrismaClient({
    datasources: {
        db: {
            url: `mysql://root:${DB_PASS}@${DB_HOST}:3306/${DB_NAME}`
        }
    }
});

export async function backendWrapper(request: Request): Promise<Response> {
    let data: WrapperFormat;
    try {
        data = (await request.json()) as WrapperFormat;
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
    switch (data.type) {
        case 'users':
            response = await getAllUsers();
            break;
        case 'teams':
            response = await getAllTeams();
            break;
        case 'events':
            response = await getAllEvents();
            break;
    }
    // formulate unifed response
    return new Response(
        JSON.stringify({
            data: response,
            error: true
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
