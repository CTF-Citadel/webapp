import { PRISMA_CONNECTION, auth } from './lucia';

class DatabaseActions {
    constructor() { }

    async getAllUsers() {
        const RES = await PRISMA_CONNECTION.user.findMany();
        if (RES.length > 0) {
            return RES;
        } else {
            return [];
        }
    };

    async getAllTeams() {
        const RES = await PRISMA_CONNECTION.teams.findMany();
        if (RES.length > 0) {
            return RES;
        } else {
            return [];
        }
    };

    async getAllEvents() {
        const RES = await PRISMA_CONNECTION.events.findMany();
        if (RES.length > 0) {
            return RES;
        } else {
            return [];
        }
    };

    async getAllChallenges() {
        const RES = await PRISMA_CONNECTION.challenges.findMany();
        if (RES.length > 0) {
            return RES;
        } else {
            return [];
        }
    };

    async getTeamEvents(id: string) {
        let allEvents = [];
        // @TODO: For Testing only!
        const RES = await PRISMA_CONNECTION.events.findMany();
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
                const EVENT = await PRISMA_CONNECTION.events.findFirst({
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

    async getEventChallenges(id: string) {
        const RES = await PRISMA_CONNECTION.challenges.findMany({
            where: {
                event_id: id
            }
        });
        if (RES.length > 0) {
            return RES;
        } else {
            return [];
        }
    };

    async createChallenge(
        name: string,
        desc: string,
        diff: string,
        isContainer: boolean,
        filePath: string,
        fileURL: string,
        toEvent: string
    ) {
        await PRISMA_CONNECTION.challenges.create({
            data: {
                id: crypto.randomUUID().toString(),
                event_id: toEvent,
                challenge_name: name,
                challenge_description: desc,
                challenge_diff: diff,
                needs_container: isContainer,
                container_file: filePath,
                static_file_url: fileURL
            }
        });
    };

    async deployTeamChallenge(id: string) {
        const GENERATED_UUID = crypto.randomUUID();
        // ! @TODO: Awaiting proper request format from backend
    };

    async createEvent(name: string, desc: string) {
        await PRISMA_CONNECTION.events.create({
            data: {
                id: crypto.randomUUID().toString(),
                event_name: name,
                event_description: desc
            }
        });
    };

    async createTeam(name: string, desc: string, country: string) {
        await PRISMA_CONNECTION.teams.create({
            data: {
                id: crypto.randomUUID().toString(),
                team_name: name,
                team_description: desc,
                team_country_code: country
            }
        });
    };

    async updateEvent(id: string, name: string, desc: string) {
        await PRISMA_CONNECTION.events.update({
            where: {
                id: id
            },
            data: {
                event_name: name,
                event_description: desc
            }
        });
    };

    async updateChallenge(id: string, name: string, desc: string, diff: string, event: string) {
        await PRISMA_CONNECTION.challenges.update({
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

    async deleteTeam(id: string) {
        await PRISMA_CONNECTION.teams.delete({
            where: {
                id: id
            }
        });
    };

    async deleteUser(id: string) {
        await auth.invalidateAllUserSessions(id);
        await auth.deleteUser(id);
    };

    async deleteChallenge(id: string) {
        await PRISMA_CONNECTION.challenges.delete({
            where: {
                id: id
            }
        });
    };

    async deleteEvent(id: string) {
        await PRISMA_CONNECTION.events.delete({
            where: {
                id: id
            }
        });
    };
}

export default DatabaseActions;
