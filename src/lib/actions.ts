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
        this.#BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
    }

    /**
     * Validate if an event exists by id
     * @return True if it exists, False if it doesn't
     */
    async checkEventExist(event_id: string) {
        const RES = await DB_ADAPTER.select().from(events).where(eq(events.id, event_id));
        return RES.length == 0 ? false : true;
    }

    /**
     * Validate if an event exists by username and email
     * @return True if it exists, False if it doesn't
     */
    async checkUserExist(userName: string, userEmail: string) {
        const RES_NAME = await DB_ADAPTER.select().from(users).where(eq(users.id, userName));
        if (RES_NAME.length == 0) return false;
        const RES_EMAIL = await DB_ADAPTER.select().from(users).where(eq(users.email, userEmail));
        return RES_EMAIL.length == 0 ? false : true;
    }

    /**
     * Validate if a team exists by name
     * @return The team's ID if exists, False if it doesn't
     */
    async checkTeamNameExist(teamName: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_name, teamName));
        return RES.length == 0 ? false : RES[0].id;
    }

    /**
     * Validate if a team token is valid and corresponds to a team
     * @return The team's ID if exists and valid, else false
     */
    async checkTeamToken(token: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_join_token, token));
        return RES.length == 0 ? false : RES[0].id;
    }

    /**
     * Validate if a user has created a team
     * @return True if the user has, false if he hasn't
     */
    async checkHasCreatedTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_creator, userID));
        return RES.length == 0 ? false : true;
    }

    /**
     * Validate if a user is currently in a team
     * @return The team's ID if user is, false if he isn't
     */
    async checkUserInTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(users).where(eq(users.id, userID));
        if (RES.length == 0) return false;
        if (RES[0].user_team_id == '') return false;
        return RES[0].user_team_id;
    }

    /**
     * Fetches all Users
     * @return List of Users
     */
    async getAllUsers() {
        const RES = await DB_ADAPTER.select().from(users);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Teams
     * @return List of Teams
     */
    async getAllTeams(redacted: boolean = false) {
        const RES = await DB_ADAPTER.select().from(teams);
        return RES.length > 0 ? (redacted ? RES : RES) : [];
    }

    /**
     * Fetches Team Info with specific ID
     * @return Team Dict if found, else null
     */
    async getTeamInfo(teamID: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.id, teamID));
        return RES.length > 0 ? RES[0] : null;
    }

    /**
     * Fetches all Events
     * @return List of Events
     */
    async getAllEvents() {
        const RES = await DB_ADAPTER.select().from(events);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Assigned Events
     * @return List of Events
     */
    async getAllTeamEvents() {
        const RES = await DB_ADAPTER.select().from(team_events);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Challenges
     * @return List of Challenges
     */
    async getAllChallenges() {
        const RES = await DB_ADAPTER.select().from(challenges);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Events assigned to a Team ID
     * @return List of Events
     */
    async getTeamEvents(teamID: string) {
        const EVENTS = await DB_ADAPTER.select()
            .from(team_events)
            .fullJoin(events, eq(team_events.event_id, events.id))
            .where(eq(team_events.team_id, teamID));
        return EVENTS.length > 0 ? EVENTS : [];
    }

    /**
     * Fetches Challenges assigned to Event ID
     * @return List of Challenges
     */
    async getEventChallenges(id: string) {
        const RES = await DB_ADAPTER.select().from(challenges).where(eq(challenges.event_id, id));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Creates a new Challenge
     * @return void
     */
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
    }

    /**
     * Deploys a new Challenge
     * @return void
     */
    async deployTeamChallenge(team_id: string, challenge_id: string) {
        const RES = await DB_ADAPTER.select().from(challenges).where(eq(challenges.id, challenge_id));
        if (RES.length > 0) {
            const REQ: Response = await fetch(this.#BACKEND_URL + '/challenge', {
                body: JSON.stringify({
                    challenge: RES[0].container_file,
                    environment_variables: {
                        FLAG: crypto.randomUUID()
                    }
                })
            });
            try {
                const DEPLOY_DATA = await REQ.json();
                await DB_ADAPTER.insert(team_challenges).values({
                    team_id: team_id,
                    challenge_id: challenge_id,
                    solved_by: '',
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
    }

    /**
     * Checks a Flag for its validity
     * @return true if the flag matches, false if it doesnt
     */
    async checkChallengeFlag(teamID: string, challengeID: string, flag: string): Promise<boolean> {
        const RES = await DB_ADAPTER.select()
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, teamID), eq(team_challenges.challenge_id, challengeID)));
        if (RES.length > 0 && RES[0].challenge_flag === flag) {
            // @TODO: Maybe close the container here
            // fetch(BACKEND) ...
            await DB_ADAPTER.update(team_challenges)
                .set({
                    is_solved: true
                })
                .where(and(eq(team_challenges.team_id, teamID), eq(team_challenges.challenge_id, challengeID)));
            return true;
        }
        return false;
    }

    /**
     * Creates a new event
     * @return void
     */
    async createEvent(name: string, desc: string, start: number, end: number) {
        await DB_ADAPTER.insert(events).values({
            id: crypto.randomUUID(),
            event_name: name,
            event_description: desc,
            event_start: start,
            event_end: end
        });
    }

    /**
     * Assigns an event per ID to a list of Teams
     * @return void
     */
    async createTeamEvent(eventID: string, teams: string[]) {
        for (let team of teams) {
            await DB_ADAPTER.insert(team_events).values({
                team_id: team,
                event_id: eventID,
                team_points: 0
            });
        }
    }

    /**
     * Creates a new Team
     * @return void
     */
    async createTeam(userID: string, name: string, desc: string, country: string) {
        await DB_ADAPTER.insert(teams).values({
            id: crypto.randomUUID(),
            team_creator: userID,
            team_join_token: 'CTD-' + generateRandomString(16),
            team_name: name,
            team_description: desc,
            team_country_code: country
        });
    }

    /**
     * Validates and adds a user to a team
     * @return void
     */
    async joinTeam(sessionID: string, teamID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user) {
            await DB_ADAPTER.update(users)
                .set({
                    user_team_id: teamID
                })
                .where(eq(users.id, user.id));
        }
    }

    /**
     * Validates and removes a user from his team
     * @return void
     */
    async leaveTeam(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user) {
            await DB_ADAPTER.update(users)
                .set({
                    user_team_id: ''
                })
                .where(eq(users.id, user.id));
        }
    }

    /**
     * Updates an Event's properties
     * @return void
     */
    async updateEvent(id: string, name: string, desc: string) {
        await DB_ADAPTER.update(events)
            .set({
                event_name: name,
                event_description: desc
            })
            .where(eq(events.id, id));
    }

    /**
     * Updates a Challenge's properties
     * @return void
     */
    async updateChallenge(id: string, name: string, desc: string, cat: string, diff: string, event: string) {
        await DB_ADAPTER.update(challenges)
            .set({
                challenge_name: name,
                challenge_description: desc,
                challenge_category: cat,
                challenge_difficulty: diff,
                event_id: event
            })
            .where(eq(challenges.id, id));
    }

    /**
     * Deletes a Team Event per ID
     * @return void
     */
    async deleteTeamEvent(eventID: string, teamID: string) {
        await DB_ADAPTER.delete(team_events).where(
            and(eq(team_events.event_id, eventID), eq(team_events.team_id, teamID))
        );
    }

    /**
     * Deletes a Team per ID
     * @return void
     */
    async deleteTeam(id: string) {
        await DB_ADAPTER.delete(teams).where(eq(teams.id, id));
        const REF_USERS = await DB_ADAPTER.select().from(users).where(eq(users.user_team_id, id));
        REF_USERS.forEach(async (user) => {
            await lucia.invalidateUserSessions(user.id);
            await DB_ADAPTER.update(users)
                .set({
                    user_team_id: ''
                })
                .where(eq(users.id, user.id));
        });
        await lucia.deleteExpiredSessions();
    }

    /**
     * Deletes a User per ID
     * @return void
     */
    async deleteUser(id: string) {
        await lucia.invalidateUserSessions(id);
        await DB_ADAPTER.delete(users).where(eq(users.id, id));
        await lucia.deleteExpiredSessions();
    }

    /**
     * Deletes a Challenge per ID
     * @return void
     */
    async deleteChallenge(id: string) {
        await DB_ADAPTER.delete(challenges).where(eq(challenges.id, id));
        // @TODO: Think about if we need this or not
        // Would make handling deletion in active events a lot easier
        // because we might count points by checking what we have in here:
        //
        // await DB_ADAPTER.delete(team_challenges).where(eq(team_challenges.challenge_id, id))
    }

    /**
     * Blocks a user per ID
     * @return void
     */
    async blockUser(id: string) {
        const RES = await DB_ADAPTER.select().from(users).where(eq(users.id, id));
        await lucia.invalidateUserSessions(id);
        if (RES[0].is_blocked) {
            await DB_ADAPTER.update(users)
                .set({
                    is_blocked: false
                })
                .where(eq(users.id, id));
        } else {
            await DB_ADAPTER.update(users)
                .set({
                    is_blocked: true
                })
                .where(eq(users.id, id));
        }
    }

    /**
     * Deletes an event per ID
     * @return void
     */
    async deleteEvent(id: string) {
        await DB_ADAPTER.delete(events).where(eq(events.id, id));
        // @TODO: Event Deletion should prune:
        // team_challenges since it could contain
        // refs to old events
        // We also need to delete any other event
        // referenced data here
    }
}

export default DatabaseActions;
