import { DB_ADAPTER } from './db';
import { challenges, events, team_challenges, team_events, teams, users } from './schema';
import { and, eq, sql } from 'drizzle-orm';
import { lucia } from './lucia';
import { generateRandomString } from './helpers';
import type { ChallengesType } from './schema';

// read from env
const BACKEND_HOST = process.env.BACKEND_HOST;
const BACKEND_PORT = process.env.BACKEND_PORT;

/**
 * Handler for Database related actions
 */
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
     * Fetches solved Challenges assigned to a Team ID
     * @return List of Challenge ID's
     */
    async getTeamSolvedChallenges(teamID: string) {
        const RES = await DB_ADAPTER.select({
            id: team_challenges.challenge_id
        })
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, teamID), eq(team_challenges.is_solved, true)));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Challenges assigned to Event ID
     * @return List of Challenges
     */
    async getEventChallenges(eventID: string, teamID: string) {
        const RES_CHALLS = await DB_ADAPTER.select().from(challenges).where(eq(challenges.event_id, eventID));
        const RES_SOLVED = await DB_ADAPTER.select({ id: team_challenges.challenge_id })
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, teamID), eq(team_challenges.is_solved, true)));
        let resSanitized: ChallengesType[] = [];
        if (RES_CHALLS.length > 0) {
            for (let challenge of RES_CHALLS) {
                challenge.static_flag = '';
                resSanitized.push(challenge);
            }
        }
        if (RES_SOLVED.length > 0) {
            resSanitized = resSanitized.filter(
                (challenge) =>
                    challenge.depends_on === '' || RES_SOLVED.map((chall) => chall.id).includes(challenge.depends_on)
            );
        }
        return resSanitized.length > 0 ? resSanitized : [];
    }

    /**
     * Fetches Points per Team based on Event ID
     * @return
     * ```
     * {
     *     id: string | null;
     *     name: string | null;
     *     points: number | null;
     * }[]
     * ```
     */
    async getTeamPointsByEvent(event_id: string) {
        const RES = await DB_ADAPTER.select({
            id: team_challenges.team_id,
            name: teams.team_name,
            points: sql<number>`cast(sum(${challenges.base_points}) as int)`
        })
            .from(team_challenges)
            .fullJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .fullJoin(teams, eq(team_challenges.team_id, teams.id))
            .where(and(eq(team_challenges.event_id, event_id), eq(team_challenges.is_solved, true)))
            .groupBy(team_challenges.team_id, teams.team_name);
        return RES.length > 0 ? RES.sort((a, b) => b.points - a.points) : [];
    }

    /**
     * Fetches Points per User based on Event ID
     * @return
     * ```
     * {
     *     id: string | null;
     *     name: string | null;
     *     points: number | null;
     * }[]
     * ```
     */
    async getUserPointsByEvent(event_id: string) {
        const RES = await DB_ADAPTER.select({
            id: users.id,
            name: users.username,
            points: sql<number>`cast(sum(${challenges.base_points}) as int)`
        })
            .from(team_challenges)
            .fullJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .fullJoin(users, eq(team_challenges.solved_by, users.id))
            .where(and(eq(team_challenges.event_id, event_id), eq(team_challenges.is_solved, true)))
            .groupBy(users.id);
        return RES.length > 0 ? RES.sort((a, b) => b.points - a.points) : [];
    }

    /**
     * Fetches Solves per Team based on Event ID
     * @return
     * ```
     * {
     *     id: string | null;
     *     name: string | null;
     *     timestamp: number | null;
     *     points_gained: number | null;
     * }[]
     * ```
     */
    async getAllSolvesByEvent(event_id: string) {
        const RES = await DB_ADAPTER.select({
            id: team_challenges.team_id,
            name: teams.team_name,
            timestamp: team_challenges.solved_at,
            points_gained: challenges.base_points,
            total_points: sql<number>`cast(sum(${challenges.base_points}) as int)`
        })
            .from(team_challenges)
            .fullJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .fullJoin(teams, eq(team_challenges.team_id, teams.id))
            .where(and(eq(team_challenges.event_id, event_id), eq(team_challenges.is_solved, true)))
            .groupBy(team_challenges.team_id, teams.team_name, challenges.base_points, team_challenges.solved_at);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Points for a single Team based on Event ID
     * @return Number of points or zero
     */
    async getSingleTeamPointsByEvent(team_id: string, event_id: string) {
        const RES = await DB_ADAPTER.select({
            points: sql<number>`cast(sum(${challenges.base_points}) as int)`
        })
            .from(team_challenges)
            .fullJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .where(
                and(
                    eq(team_challenges.event_id, event_id),
                    eq(team_challenges.team_id, team_id),
                    eq(team_challenges.is_solved, true)
                )
            )
            .groupBy(team_challenges.team_id);
        return RES.length > 0 ? RES[0].points : 0;
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
        toEvent: string,
        points: number,
        dependOn: string,
        needsStatic: boolean,
        staticFlag: string
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
            static_file_url: fileURL,
            base_points: points,
            depends_on: dependOn,
            flag_static: needsStatic,
            static_flag: staticFlag
        });
    }

    /**
     * Checks if a specific Challenge is deployed and running
     * @return true if deployed, false if not
     */
    async checkDeployedChallenge(team_id: string, challenge_id: string, event_id: string): Promise<boolean> {
        const RES = await DB_ADAPTER.select()
            .from(team_challenges)
            .where(
                and(
                    eq(team_challenges.challenge_id, challenge_id),
                    eq(team_challenges.team_id, team_id),
                    eq(team_challenges.event_id, event_id),
                    eq(team_challenges.is_running, true),
                    eq(team_challenges.is_solved, false)
                )
            );
        return RES.length > 0 ? true : false;
        // @TODO: Check if still running by fetching backend
        // fetch(BACKEND) ...
    }

    /**
     * Deploys a new Challenge
     * @return true if deployed, false if not
     */
    async deployTeamChallenge(
        genFlag: string,
        team_id: string,
        challenge_id: string,
        event_id: string
    ): Promise<boolean> {
        const RES = await DB_ADAPTER.select().from(challenges).where(eq(challenges.id, challenge_id));
        if (RES.length > 0) {
            const REQ: Response = await fetch(this.#BACKEND_URL + '/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challenge: RES[0].container_file,
                    environment_variables: JSON.stringify({
                        FLAG: genFlag
                    })
                })
            });
            const DEPLOY_DATA = await REQ.json();
            await DB_ADAPTER.insert(team_challenges).values({
                team_id: team_id,
                challenge_id: challenge_id,
                event_id: event_id,
                solved_by: '',
                solved_at: 0,
                challenge_uuid: DEPLOY_DATA.instance_id,
                challenge_flag: DEPLOY_DATA.details.FLAG,
                challenge_host: `${DEPLOY_DATA.instance_id}.${BACKEND_HOST}`, // @TODO: implement this correctly
                challenge_port: '0', // @TODO: implement this correctly
                is_running: true,
                is_solved: false
            });
            DEPLOY_DATA.details.IP = `${DEPLOY_DATA.instance_id}.${BACKEND_HOST}`;
            return DEPLOY_DATA;
        }
        return false;
    }

    /**
     * Checks a Flag for its validity
     * @return true if the flag matches, false if it doesnt
     */
    async checkChallengeFlag(
        teamID: string,
        challengeID: string,
        flag: string,
        userID: string,
        timestamp: number
    ): Promise<boolean> {
        const RES = await DB_ADAPTER.select()
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, teamID), eq(team_challenges.challenge_id, challengeID)));
        if (
            RES.length > 0 &&
            /^TH{.*}$/.test(flag) &&
            RES[0].is_running === true &&
            RES[0].challenge_flag === flag.slice(flag.indexOf('{') + 1, flag.indexOf('}'))
        ) {
            // @TODO: Maybe close the container here
            // fetch(BACKEND) ...
            await DB_ADAPTER.update(team_challenges)
                .set({
                    solved_by: userID,
                    solved_at: timestamp,
                    is_solved: true,
                    is_running: false
                })
                .where(and(eq(team_challenges.team_id, teamID), eq(team_challenges.challenge_id, challengeID)));
            return true;
        }
        return false;
    }

    /**
     * Checks a static Flag for its validity
     * @return true if the flag matches, false if it doesnt
     */
    async checkStaticChallengeFlag(
        teamID: string,
        eventID: string,
        challengeID: string,
        flag: string,
        userID: string,
        timestamp: number
    ): Promise<boolean> {
        const RES = await DB_ADAPTER.select()
            .from(challenges)
            .where(and(eq(challenges.id, challengeID), eq(challenges.event_id, eventID)));
        if (
            RES.length > 0 &&
            /^TH{.*}$/.test(flag) &&
            RES[0].flag_static === true &&
            RES[0].static_flag === flag.slice(flag.indexOf('{') + 1, flag.indexOf('}'))
        ) {
            // insert new since static
            await DB_ADAPTER.insert(team_challenges).values({
                team_id: teamID,
                challenge_id: challengeID,
                event_id: eventID,
                solved_by: userID,
                solved_at: timestamp,
                challenge_uuid: '',
                challenge_flag: flag,
                challenge_host: '',
                challenge_port: '',
                is_running: false,
                is_solved: true
            });
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
            team_join_token: 'CTD-' + generateRandomString(16).toUpperCase(),
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
    async updateChallenge(
        id: string,
        name: string,
        desc: string,
        cat: string,
        diff: string,
        points: number,
        event: string,
        children: string
    ) {
        await DB_ADAPTER.update(challenges)
            .set({
                challenge_name: name,
                challenge_description: desc,
                challenge_category: cat,
                challenge_difficulty: diff,
                base_points: points,
                event_id: event
            })
            .where(eq(challenges.id, id));
    }

    /**
     * Updates a Users properties
     * @return void
     */
    async updateUser(id: string, new_email: string, verified: boolean) {
        await DB_ADAPTER.update(users)
            .set({
                email: new_email,
                is_verified: verified
            })
            .where(eq(users.id, id));
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
        await DB_ADAPTER.delete(team_challenges).where(eq(team_challenges.challenge_id, id));
        await DB_ADAPTER.delete(challenges).where(eq(challenges.id, id));
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
