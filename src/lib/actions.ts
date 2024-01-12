import { PRISMA_CONNECTION, auth } from './lucia';

// read from env
const BACKEND_HOST = process.env.BACKEND_HOST;
const BACKEND_PORT = process.env.BACKEND_PORT;

class DatabaseActions {
    #BACKEND_URL: string;
    constructor() {
        this.#BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`
    }

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

    async getTeamEvents(team_id: string) {
        // @TODO: For Testing only!
        const EVENTS = await PRISMA_CONNECTION.events.findMany();
        /*
        const RES = await PRISMA.team_events.findMany({
            where: {
                team_id: id
            }
        });
        */
        if (EVENTS.length > 0) {
            return EVENTS;
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

    async deployTeamChallenge(team_id: string, challenge_id: string) {
        const GENERATED_UUID = crypto.randomUUID();
        const RES = await PRISMA_CONNECTION.challenges.findFirst({
            where: {
                id: challenge_id
            }
        });
        if (RES != null) {
            const REQ: Response = await fetch(this.#BACKEND_URL + "/challenge", {
                body: JSON.stringify({
                    challenge: RES.container_file,
                    environment_variables: {
                        FLAG: GENERATED_UUID
                    }
                })
            })
            try {
                const DEPLOY_DATA = await REQ.json();
                await PRISMA_CONNECTION.team_challenges.create({
                    data: {
                        team_id: team_id,
                        challenge_id: challenge_id,
                        challenge_uuid: DEPLOY_DATA.instance_id,
                        challenge_flag: DEPLOY_DATA.details.FLAG,
                        challenge_host: DEPLOY_DATA.details.IP,
                        challenge_port: DEPLOY_DATA.details.PORT,
                        is_running: true,
                        is_solved: false
                    }
                })
            } catch {
                return false;
            }
        }
    };

    async checkChallengeFlag(team_id: string, challenge_id: string, flag: string): Promise<boolean> {
        const RES = await PRISMA_CONNECTION.team_challenges.findFirst({
            where: {
                team_id: team_id,
                challenge_id: challenge_id
            }
        });
        if (RES != null && RES.challenge_flag === flag) {
            // @TODO: Maybe close the container here
            // fetch(BACKEND) ...
            await PRISMA_CONNECTION.team_challenges.update({
                where: {
                    team_id_challenge_id: {
                        team_id: team_id,
                        challenge_id: challenge_id
                    }
                },
                data: {
                    is_solved: true
                }
            })
            return true;
        }
        return false;
    }

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
        let REF_USERS = await PRISMA_CONNECTION.user.findMany({
            where: {
                user_team_id: id
            }
        })
        REF_USERS.forEach(async user => {
            await auth.invalidateAllUserSessions(user.id);
            await auth.updateUserAttributes(user.id, {
                user_team: ""
            })
        })
    };

    async deleteUser(id: string) {
        await auth.invalidateAllUserSessions(id);
        await auth.deleteUser(id);
    };

    async deleteChallenge(id: string) {
        // @TODO: Reference Checks for current challenge
        // Either delete all references or choose to keep
        // them if the event is still alive
        await PRISMA_CONNECTION.challenges.delete({
            where: {
                id: id
            }
        });
    };

    async blockUser(id: string) {
        let RES = await auth.getUser(id);
        await auth.invalidateAllUserSessions(id);
        if (RES.isBlocked) {
            await auth.updateUserAttributes(id, {
                is_blocked: false
            })
        } else {
            await auth.updateUserAttributes(id, {
                is_blocked: true
            })
        }
    }

    async deleteEvent(id: string) {
        // @TODO: Event Deletion should prune:
        // team_challenges since it could contain
        // refs to old events
        // We also need to delete any other event
        // referenced data here
        await PRISMA_CONNECTION.events.delete({
            where: {
                id: id
            }
        });
    };
}

export default DatabaseActions;