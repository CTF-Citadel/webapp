import { DB_ADAPTER } from './db';
import { events, teams, team_events, team_challenges, users, challenges } from './schema';
import { eq, and } from 'drizzle-orm';
import { lucia } from './lucia';
import { generateRandomString } from './helpers';

// read from env
const BACKEND_HOST = process.env.BACKEND_HOST;
const BACKEND_PORT = process.env.BACKEND_PORT;

class DatabaseActions {
    #BACKEND_URL: string;
    constructor() {
        this.#BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`
    }

    /**
     * Validate if an event exists by id
     * @return True if it exists, False if it doesn't
    */
    async checkEventExist(event_id: string) {
        const RES = await DB_ADAPTER.select().from(events).where(eq(events.id, event_id))
        return RES.length == 0 ? false : true;
    };

    /**
     * Validate if an event exists by username and email
     * @return True if it exists, False if it doesn't
    */
    async checkUserExist(userName: string, userEmail: string) {
        const RES_NAME = await DB_ADAPTER.select().from(users).where(eq(users.id, userName))
        if (RES_NAME.length == 0) return false;
        const RES_EMAIL = await DB_ADAPTER.select().from(users).where(eq(users.email, userEmail))
        return RES_EMAIL.length == 0 ? false : true;
    };

    /**
     * Validate if a team exists by name
     * @return The team's ID if exists, False if it doesn't
    */
    async checkTeamNameExist(teamName: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_name, teamName))
        return RES.length == 0 ? false : RES[0].id;
    };

    /**
     * Validate if a team token is valid and corresponds to a team
     * @return The team's ID if exists and valid, else false
    */
    async checkTeamToken(token: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_join_token, token))
        return RES.length == 0 ? false : RES[0].id;
    };

    /**
     * Validate if a user has created a team
     * @return True if the user has, false if he hasn't
    */
    async checkHasCreatedTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_creator, userID))
        return RES.length == 0 ? false : true;
    };

    /**
     * Validate if a user is currently in a team
     * @return The team's ID if user is, false if he isn't
    */
    async checkUserInTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(users).where(eq(users.id, userID))
        if (RES.length == 0) return false;
        if (RES[0].user_team_id == '') return false;
        return RES[0].user_team_id;
    };

    async getAllUsers() {
        const RES = await DB_ADAPTER.select().from(users);
        return RES.length > 0 ? RES : [];
    };

    async getAllTeams(redacted: boolean = false) {
        const RES = await DB_ADAPTER.select().from(teams);
        return RES.length > 0 ? redacted ? RES : RES : [];
    };

    async getTeamInfo(teamID: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.id, teamID));
        return RES.length > 0 ? RES[0] : {};
    };

    async getAllEvents() {
        const RES = await DB_ADAPTER.select().from(events);
        return RES.length > 0 ? RES : [];
    };

    async getAllChallenges() {
        const RES = await DB_ADAPTER.select().from(challenges);
        return RES.length > 0 ? RES : [];
    };

    async getTeamEvents(teamID: string) {
        // @TODO: For Testing only!
        const EVENTS = await DB_ADAPTER.select().from(events);
        //const EVENTS = await DB_ADAPTER.select().from(events).where(eq(team_events.team_id, teamID);
        return EVENTS.length > 0 ? EVENTS : [];
    };

    async getEventChallenges(id: string) {
        const RES = await DB_ADAPTER.select().from(challenges).where(eq(challenges.event_id, id));
        return RES.length > 0 ? RES : [];
    };

    async createChallenge(
        name: string,
        desc: string,
        cat: string,
        diff: string,
        isContainer: boolean,
        filePath: string,
        fileURL: string,
        toEvent: string
    ) {
        await DB_ADAPTER.insert(challenges).values({
            id: crypto.randomUUID(),
            event_id: toEvent,
            challenge_name: name,
            challenge_description: desc,
            challenge_category: cat,
            challenge_difficulty: diff,
            needs_container: isContainer,
            container_file: filePath,
            static_file_url: fileURL
        });
    };

    async deployTeamChallenge(team_id: string, challenge_id: string) {
        const RES = await DB_ADAPTER.select().from(challenges).where(eq(challenges.id, challenge_id));
        if (RES.length > 0) {
            const REQ: Response = await fetch(this.#BACKEND_URL + "/challenge", {
                body: JSON.stringify({
                    challenge: RES[0].container_file,
                    environment_variables: {
                        FLAG: crypto.randomUUID()
                    }
                })
            })
            try {
                const DEPLOY_DATA = await REQ.json();
                await DB_ADAPTER.insert(team_challenges).values({
                    team_id: team_id,
                    challenge_id: challenge_id,
                    challenge_uuid: DEPLOY_DATA.instance_id,
                    challenge_flag: DEPLOY_DATA.details.FLAG,
                    challenge_host: DEPLOY_DATA.details.IP,
                    challenge_port: DEPLOY_DATA.details.PORT,
                    is_running: true,
                    is_solved: false
                });
            } catch {
                return false;
            }
        }
    };

    async checkChallengeFlag(teamID: string, challengeID: string, flag: string): Promise<boolean> {
        const RES = await DB_ADAPTER.select().from(team_challenges).where(
            and(eq(team_challenges.team_id, teamID), eq(team_challenges.challenge_id, challengeID))
        );
        if (RES.length > 0 && RES[0].challenge_flag === flag) {
            // @TODO: Maybe close the container here
            // fetch(BACKEND) ...
            await DB_ADAPTER.update(team_challenges).set({
                is_solved: true
            }).where(
                and(eq(team_challenges.team_id, teamID), eq(team_challenges.challenge_id, challengeID))
            );
            return true;
        }
        return false;
    }

    async createEvent(name: string, desc: string, start: number, end: number) {
        await DB_ADAPTER.insert(events).values({
            id: crypto.randomUUID(),
            event_name: name,
            event_description: desc,
            event_start: start,
            event_end: end
        });
    };

    async createTeam(userID: string, name: string, desc: string, country: string) {
        await DB_ADAPTER.insert(teams).values({
            id: crypto.randomUUID(),
            team_creator: userID,
            team_join_token: generateRandomString(16),
            team_name: name,
            team_description: desc,
            team_country_code: country
        });
    };

    async joinTeam(sessionID: string, teamID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user) {
            await DB_ADAPTER.update(users).set({
                user_team_id: teamID
            }).where(eq(users.id, user.id))
        }
    };

    async leaveTeam(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user) {
            await DB_ADAPTER.update(users).set({
                user_team_id: ''
            }).where(eq(users.id, user.id))
        }
    };

    async updateEvent(id: string, name: string, desc: string) {
        await DB_ADAPTER.update(events).set({
            event_name: name,
            event_description: desc
        }).where(eq(events.id, id))
    };

    async updateChallenge(id: string, name: string, desc: string, cat: string, diff: string, event: string) {
        await DB_ADAPTER.update(challenges).set({
            challenge_name: name,
            challenge_description: desc,
            challenge_category: cat,
            challenge_difficulty: diff,
            event_id: event,
        }).where(eq(challenges.id, id))
    };

    async deleteTeam(id: string) {
        await DB_ADAPTER.delete(teams).where(eq(teams.id, id))
        const REF_USERS = await DB_ADAPTER.select().from(users).where(eq(users.user_team_id, id))
        REF_USERS.forEach(async user => {
            await lucia.invalidateUserSessions(user.id);
            await DB_ADAPTER.update(users).set({
                user_team_id: ''
            }).where(eq(users.id, user.id));
        })
    };

    async deleteUser(id: string) {
        await lucia.invalidateUserSessions(id);
        await DB_ADAPTER.delete(users).where(eq(users.id, id));
        await lucia.deleteExpiredSessions();
    };

    async deleteChallenge(id: string) {
        await DB_ADAPTER.delete(challenges).where(eq(challenges.id, id))
        // @TODO: Think about if we need this or not
        // Would make handling deletion in active events a lot easier
        // because we might count points by checking what we have in here:
        //
        // await DB_ADAPTER.delete(team_challenges).where(eq(team_challenges.challenge_id, id))
    };

    async blockUser(id: string) {
        const RES = await DB_ADAPTER.select().from(users).where(eq(users.id, id));
        await lucia.invalidateUserSessions(id);
        if (RES[0].is_blocked) {
            await DB_ADAPTER.update(users).set({
                is_blocked: false
            }).where(eq(users.id, id));
        } else {
            await DB_ADAPTER.update(users).set({
                is_blocked: true
            }).where(eq(users.id, id));
        }
    }

    async deleteEvent(id: string) {
        await DB_ADAPTER.delete(events).where(eq(events.id, id));
        // @TODO: Event Deletion should prune:
        // team_challenges since it could contain
        // refs to old events
        // We also need to delete any other event
        // referenced data here
    };
}

export default DatabaseActions;
