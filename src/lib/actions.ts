import { DB_ADAPTER } from './db';
import { challenges, events, team_challenges, team_events, teams, users } from './schema';
import { and, eq, sql, gt, lt } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { lucia } from './lucia';
import { generateRandomString, validAlphanumeric, validPassword, AVATARS } from './helpers';
import { checkLocalPoolMatch } from './storage';
import { adjustDynamic, getTotalByName, backFillTotal } from './scoring';
import type { ChallengesType } from './schema';
import Infra from './integrations/infra';
import M0n1t0r from './integrations/m0n1t0r';
import F1rstbl00d from './integrations/f1rstbl00d';
import CertMailer from './integrations/certmailer';

const INFRA = new Infra();
const MONITOR = new M0n1t0r();
const FIRSTBLOOD = new F1rstbl00d();
const MAILER = new CertMailer();

/**
 * Handler for Database related actions
 */
class Actions {
    /**
     * Validate if an event exists in timerange by id
     * @returns Event Name if it exists, False if it doesn't
     */
    async checkValidEventExist(eventID: string) {
        const CURRENT_DATE = new Date().getTime();
        const RES = (
            await DB_ADAPTER.select({ name: events.event_name, start: events.event_start, end: events.event_end }).from(events).where(eq(events.id, eventID))
        ).at(0);
        if (RES !== undefined) {
            return CURRENT_DATE >= RES.start && CURRENT_DATE <= RES.end ? RES.name : false;
        }
        return false;
    }

    /**
     * Validate if an event exists by id
     * @returns Event Name if it exists, False if it doesn't
     */
    async checkEventExist(eventID: string) {
        const RES = (
            await DB_ADAPTER.select({ name: events.event_name }).from(events).where(eq(events.id, eventID))
        ).at(0);
        return RES === undefined ? false : RES.name;
    }

    /**
     * Validate if a user exists by id
     * @returns User Name if he exists, False if he doesn't
     */
    async checkUserExist(userID: string) {
        const RES = (await DB_ADAPTER.select({ name: users.username }).from(users).where(eq(users.id, userID))).at(0);
        return RES === undefined ? false : RES.name;
    }

    /**
     * Validate if a team exists by id
     * @returns Team Name if it exists, False if it doesn't
     */
    async checkTeamExist(teamID: string) {
        const RES = (await DB_ADAPTER.select({ name: teams.team_name }).from(teams).where(eq(teams.id, teamID))).at(0);
        return RES === undefined ? false : RES.name;
    }

    /**
     * Validate if a team exists by name
     * @returns The team's ID if exists, False if it doesn't
     */
    async checkTeamNameExist(teamName: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_name, teamName));
        return RES.length === 0 ? false : RES[0].id;
    }

    /**
     * Validate if a team token is valid and corresponds to a team
     * @returns The team's ID if exists and valid, else false
     */
    async checkTeamToken(teamToken: string) {
        const RES = (await DB_ADAPTER.select().from(teams).where(eq(teams.team_join_token, teamToken))).at(0);
        if (RES !== undefined) {
            const MEMBERS = (await DB_ADAPTER.select().from(users).where(eq(users.user_team_id, RES.id))).length;
            return MEMBERS < 4 ? RES.id : false;
        }
        return false;
    }

    /**
     * Validate if a user has created a team
     * @returns True if the user has, false if he hasn't
     */
    async checkHasCreatedTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.team_creator, userID));
        return RES.length === 0 ? false : true;
    }

    /**
     * Validate if a user is currently in a team
     * @returns The team's ID if user is, false if he isn't
     */
    async checkUserInTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(users).where(eq(users.id, userID));
        if (RES.length === 0) return false;
        if (RES[0].user_team_id === '') return false;
        return RES[0].user_team_id;
    }

    /**
     * Validate if challenge is solved initially
     * @returns True if its the first solve, false if not
     */
    async checkInitialSolve(challengeID: string) {
        const RES = await DB_ADAPTER.select()
            .from(team_challenges)
            .where(eq(team_challenges.challenge_id, challengeID));
        return RES.length === 1 ? true : false;
    }

    /**
     * Fetches info needed for firstblood notify
     * @returns Firstblood Info Dict
     */
    async getFirstbloodData(challengeID: string) {
        const RES = (
            await DB_ADAPTER.select({
                id: team_challenges.challenge_id,
                event: team_challenges.event_id,
                name: challenges.challenge_name,
                category: challenges.challenge_category,
                difficulty: challenges.challenge_difficulty,
                solver: users.username
            })
                .from(team_challenges)
                .where(eq(team_challenges.challenge_id, challengeID))
                .innerJoin(users, eq(users.id, team_challenges.solved_by))
                .innerJoin(challenges, eq(challenges.id, team_challenges.challenge_id))
        ).at(0);
        return RES !== undefined ? RES : null;
    }

    /**
     * Fetches all Users
     * @returns List of Users
     */
    async getAllUsers() {
        const RES = await DB_ADAPTER.select().from(users);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Teams
     * @returns List of Teams
     */
    async getAllTeams() {
        const RES = await DB_ADAPTER.select().from(teams);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Team Info with specific ID
     * @returns Team Dict if found, else null
     */
    async getTeamInfo(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return null;
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.id, user.user_team_id));
        return RES.length > 0 ? RES[0] : null;
    }

    /**
     * Fetches User Profile Info with specific ID
     * @returns User Info if found, else null
     */
    async getUserProfile(userID: string) {
        const RES = (
            await DB_ADAPTER.select({
                username: users.username,
                avatar: users.user_avatar,
                affiliation: users.user_affiliation,
                role: users.user_role,
                team_id: users.user_team_id,
                team_name: teams.team_name,
                team_country: teams.team_country_code
            })
                .from(users)
                .where(eq(users.id, userID))
                .innerJoin(teams, eq(users.user_team_id, teams.id))
        ).at(0);
        return RES === undefined ? null : RES;
    }

    /**
     * Fetches Team Profile Info with specific ID
     * @returns User Info if found, else null
     */
    async getTeamProfile(teamID: string) {
        const TEAM = (
            await DB_ADAPTER.select({
                name: teams.team_name,
                description: teams.team_description,
                country: teams.team_country_code
            })
                .from(teams)
                .where(eq(teams.id, teamID))
        ).at(0);
        const MEMBERS = await DB_ADAPTER.select({
            id: users.id,
            username: users.username,
            avatar: users.user_avatar
        })
            .from(users)
            .where(eq(users.user_team_id, teamID));
        if (MEMBERS.length > 0 && TEAM !== undefined) {
            return { ...TEAM, members: MEMBERS };
        }
        return null;
    }

    /**
     * Fetches sanitized Teams
     * @returns List sanitized of Teams
     */
    async getTeamLisitng() {
        const RES = await DB_ADAPTER.select({
            id: teams.id,
            team_name: teams.team_name,
            team_description: teams.team_description,
            team_country_code: teams.team_country_code
        }).from(teams);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Team Members of Team with ID
     * @returns List of Team Members
     */
    async getTeamMembers(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return [];
        const RES = await DB_ADAPTER.select({
            id: users.id,
            username: users.username,
            user_avatar: users.user_avatar,
            user_affiliation: users.user_affiliation
        })
            .from(users)
            .where(eq(users.user_team_id, user.user_team_id));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Events
     * @returns List of Events
     */
    async getAllEvents() {
        const RES = await DB_ADAPTER.select().from(events);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Assigned Events
     * @returns List of Events
     */
    async getAllTeamEvents() {
        const RES = await DB_ADAPTER.select({
            event_id: events.id,
            team_id: teams.id,
            team_name: teams.team_name,
            event_name: events.event_name
        })
            .from(team_events)
            .innerJoin(events, eq(team_events.event_id, events.id))
            .innerJoin(teams, eq(team_events.team_id, teams.id));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Team Challenges
     * @returns List of Events
     */
    async getAllTeamChallenges() {
        const RES = await DB_ADAPTER.select()
            .from(team_challenges)
            .innerJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .innerJoin(teams, eq(team_challenges.team_id, teams.id));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches all Challenges
     * @returns List of Challenges
     */
    async getAllChallenges() {
        const RES = await DB_ADAPTER.select().from(challenges);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Events assigned to a Team ID
     * @returns List of Events
     */
    async getTeamEvents(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return [];
        const EVENTS = await DB_ADAPTER.select()
            .from(team_events)
            .innerJoin(events, eq(team_events.event_id, events.id))
            .where(eq(team_events.team_id, user.user_team_id));
        return EVENTS.length > 0 ? EVENTS : [];
    }

    /**
     * Fetches solved Challenges assigned to a Team ID
     * @returns List of Challenge ID's
     */
    async getTeamSolvedChallenges(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return [];
        const RES = await DB_ADAPTER.select({
            id: team_challenges.challenge_id
        })
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, user.user_team_id), eq(team_challenges.is_solved, true)));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Challenges assigned to Event ID
     * @returns List of Challenges
     */
    async getEventChallenges(sessionID: string, eventID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return [];
        const RES_CHALLS = await DB_ADAPTER.select().from(challenges).where(eq(challenges.event_id, eventID));
        const RES_SOLVED = await DB_ADAPTER.select({ id: team_challenges.challenge_id })
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, user.user_team_id), eq(team_challenges.is_solved, true)));
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
        } else {
            resSanitized = resSanitized.filter((challenge) => challenge.depends_on === '');
        }
        return resSanitized.length > 0 ? resSanitized : [];
    }

    /**
     * Fetches Points per Team based on Event ID
     */
    async getTeamPointsByEvent(eventID: string) {
        const TEAMS = await DB_ADAPTER.select({
            id: teams.id,
            name: teams.team_name
        })
            .from(team_events)
            .innerJoin(teams, eq(teams.id, team_events.team_id))
            .where(eq(team_events.event_id, eventID));
        const EVENT_START = (
            await DB_ADAPTER.select({
                start: events.event_start
            })
                .from(events)
                .where(eq(events.id, eventID))
        ).at(0);
        if (EVENT_START === undefined) return [];
        const RES = await this.getTeamSolvesByEvent(eventID);
        const ADJUSTED = backFillTotal(getTotalByName(RES, EVENT_START.start), TEAMS);
        return ADJUSTED.length > 0 ? ADJUSTED : [];
    }

    /**
     * Fetches Points per User based on Event ID
     */
    async getUserPointsByEvent(eventID: string) {
        const USERS = await DB_ADAPTER.select({
            id: users.id,
            name: users.username
        })
            .from(team_events)
            .innerJoin(users, eq(users.user_team_id, team_events.team_id))
            .where(eq(team_events.event_id, eventID));
        const EVENT_START = (
            await DB_ADAPTER.select({
                start: events.event_start
            })
                .from(events)
                .where(eq(events.id, eventID))
        ).at(0);
        if (EVENT_START === undefined) return [];
        const RES = await this.getUserSolvesByEvent(eventID);
        const ADJUSTED = backFillTotal(getTotalByName(RES, EVENT_START.start), USERS);
        return ADJUSTED.length > 0 ? ADJUSTED : [];
    }

    /**
     * Fetches Number of solves for all challenges in event
     */
    async getChallengeSolvesByEvent(eventID: string) {
        const RES = await DB_ADAPTER.select({
            id: team_challenges.challenge_id,
            solves: sql<number>`cast(count(${team_challenges.challenge_id}) as int)`
        })
            .from(team_challenges)
            .where(and(eq(team_challenges.event_id, eventID), eq(team_challenges.is_solved, true)))
            .groupBy(team_challenges.challenge_id);
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Solves per Team based on Event ID
     */
    async getTeamSolvesByEvent(eventID: string) {
        const SOLVES = await this.getChallengeSolvesByEvent(eventID);
        const DATA = await DB_ADAPTER.select({
            id: team_challenges.team_id,
            name: teams.team_name,
            challenge_id: challenges.id,
            timestamp: team_challenges.solved_at,
            points_gained: challenges.base_points
        })
            .from(team_challenges)
            .innerJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .innerJoin(teams, eq(team_challenges.team_id, teams.id))
            .where(and(eq(team_challenges.event_id, eventID), eq(team_challenges.is_solved, true)))
            .groupBy(team_challenges.team_id, teams.team_name, challenges.id, team_challenges.solved_at);
        if (DATA.length > 0 && SOLVES.length > 0) {
            return adjustDynamic(DATA, SOLVES);
        }
        return [];
    }

    /**
     * Fetches Solves per User based on Event ID
     */
    async getUserSolvesByEvent(eventID: string) {
        const SOLVES = await this.getChallengeSolvesByEvent(eventID);
        const DATA = await DB_ADAPTER.select({
            id: users.id,
            name: users.username,
            challenge_id: challenges.id,
            timestamp: team_challenges.solved_at,
            points_gained: challenges.base_points
        })
            .from(team_challenges)
            .innerJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .innerJoin(users, eq(team_challenges.solved_by, users.id))
            .where(and(eq(team_challenges.event_id, eventID), eq(team_challenges.is_solved, true)))
            .groupBy(users.id, challenges.id, team_challenges.solved_at);
        if (DATA.length > 0 && SOLVES.length > 0) {
            return adjustDynamic(DATA, SOLVES);
        }
        return [];
    }

    /**
     * Fetches Points for a single Team based on Event ID
     * @returns Number of points or zero
     */
    async getSingleTeamPointsByEvent(teamID: string, eventID: string) {
        const RES = await DB_ADAPTER.select({
            points: sql<number>`cast(sum(${challenges.base_points}) as int)`
        })
            .from(team_challenges)
            .innerJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .where(
                and(
                    eq(team_challenges.event_id, eventID),
                    eq(team_challenges.team_id, teamID),
                    eq(team_challenges.is_solved, true)
                )
            )
            .groupBy(team_challenges.team_id);
        return RES.length > 0 ? RES[0].points : 0;
    }

    /**
     * Reset a users password
     * @returns true if success, false if not
     */
    async resetPassword(sessionID: string, password: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user && validPassword(password)) {
            const PASSWORD_HASH = await new Argon2id().hash(password);
            await DB_ADAPTER.update(users)
                .set({
                    hashed_password: PASSWORD_HASH
                })
                .where(eq(users.id, user.id));
            return true;
        }
        return false;
    }

    /**
     * Changes a users first and lastname
     * @returns true if success, false if not
     */
    async changeUserData(sessionID: string, firstName: string, lastName: string, affiliation: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user && validAlphanumeric(firstName, 30) && validAlphanumeric(lastName, 30)) {
            await DB_ADAPTER.update(users)
                .set({
                    user_firstname: firstName,
                    user_lastname: lastName,
                    user_affiliation: affiliation
                })
                .where(eq(users.id, user.id));
            return true;
        }
        return false;
    }

    /**
     * Creates a new Challenge
     * @returns void
     */
    async createChallenge(
        name: string,
        desc: string,
        cat: string,
        diff: string,
        isContainer: boolean,
        containerFile: string,
        fileURL: string,
        toEvent: string,
        points: number,
        dependOn: string,
        needsStatic: boolean,
        staticFlag: string,
        needsFlagPool: boolean
    ) {
        await DB_ADAPTER.insert(challenges).values({
            id: crypto.randomUUID(),
            event_id: toEvent,
            challenge_name: name,
            challenge_description: desc,
            challenge_category: cat,
            challenge_difficulty: diff,
            needs_container: isContainer,
            container_file: containerFile,
            static_file_url: fileURL,
            base_points: points,
            depends_on: dependOn,
            flag_static: needsStatic,
            static_flag: staticFlag,
            needs_flag_pool: needsFlagPool
        });
    }

    /**
     * Get all currently deployed or initiated Challenges per Event and Team ID
     * @returns List of cut down info, zero length if no found
     */
    async getDeployedChallenge(sessionID: string, eventID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return [];
        const RES = await DB_ADAPTER.select({
            challenge_id: team_challenges.challenge_id,
            challenge_host: team_challenges.challenge_host,
            challenge_port: team_challenges.challenge_port,
            is_running: team_challenges.is_running
        })
            .from(team_challenges)
            .where(
                and(
                    eq(team_challenges.team_id, user.user_team_id),
                    eq(team_challenges.event_id, eventID),
                    eq(team_challenges.is_container, true),
                    eq(team_challenges.is_solved, false)
                )
            );
        return RES.length > 0 ? RES : [];
    }

    /**
     * Deploys a new Challenge
     * @returns true if queued, false if not
     */
    async deployTeamChallenge(sessionID: string, challengeID: string, eventID: string): Promise<boolean> {
        const VALID = await this.checkValidEventExist(eventID);
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null && VALID !== false) return false;
        const GEN_FLAG = crypto.randomUUID();
        const TIMESTAMP = new Date().getTime();
        const RES = (await DB_ADAPTER.select().from(challenges).where(eq(challenges.id, challengeID))).at(0);
        if (RES !== undefined) {
            // note deployment
            await DB_ADAPTER.insert(team_challenges).values({
                team_id: user.user_team_id,
                challenge_id: challengeID,
                event_id: eventID,
                solved_by: '',
                solved_at: 0,
                challenge_uuid: '',
                challenge_flag: '',
                challenge_host: '',
                challenge_port: '',
                is_container: true,
                is_running: false,
                is_solved: false
            });
            INFRA.deploy(RES.container_file, GEN_FLAG).then(async (data) => {
                // on success update the challenge
                if (data !== false) {
                    await DB_ADAPTER.update(team_challenges)
                        .set({
                            challenge_uuid: data.id,
                            challenge_flag: data.flag,
                            challenge_host: data.host,
                            is_running: true
                        })
                        .where(
                            and(
                                eq(team_challenges.team_id, user.user_team_id),
                                eq(team_challenges.event_id, eventID),
                                eq(team_challenges.challenge_id, challengeID)
                            )
                        );
                    // notify anti cheat
                    await MONITOR.initiation(data.flag, user.user_team_id, challengeID, TIMESTAMP);
                } else {
                    // on fail, remove the entry
                    await DB_ADAPTER.delete(team_challenges).where(
                        and(
                            eq(team_challenges.team_id, user.user_team_id),
                            eq(team_challenges.event_id, eventID),
                            eq(team_challenges.challenge_id, challengeID)
                        )
                    );
                }
            });
            // challenge is queued
            return true;
        }
        return false;
    }

    /**
     * Checks a Flag for its validity
     * @returns true if the flag matches, false if it doesnt
     */
    async checkDynamicChallengeFlag(sessionID: string, challengeID: string, flag: string): Promise<boolean> {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const EXTRACTED_FLAG = flag.slice(flag.indexOf('{') + 1, flag.indexOf('}'));
        const RES = (
            await DB_ADAPTER.select()
                .from(team_challenges)
                .where(
                    and(eq(team_challenges.team_id, user.user_team_id), eq(team_challenges.challenge_id, challengeID))
                )
        ).at(0);
        if (RES !== undefined && /^TH{.*}$/.test(flag) && RES.is_running === true) {
            const VALID = await this.checkValidEventExist(RES.event_id);
            if (RES.challenge_flag === EXTRACTED_FLAG && VALID !== false) {
                await DB_ADAPTER.update(team_challenges)
                    .set({
                        solved_by: user.id,
                        solved_at: TIMESTAMP,
                        is_solved: true
                    })
                    .where(
                        and(
                            eq(team_challenges.team_id, user.user_team_id),
                            eq(team_challenges.challenge_id, challengeID)
                        )
                    );
                // shut down the container
                INFRA.shutdown(RES.challenge_uuid).then(async (ok) => {
                    if (ok === true) {
                        await DB_ADAPTER.update(team_challenges)
                            .set({
                                is_running: false
                            })
                            .where(
                                and(
                                    eq(team_challenges.team_id, user.user_team_id),
                                    eq(team_challenges.challenge_id, challengeID)
                                )
                            );
                    }
                });
                // notify anti cheat
                await MONITOR.solve(EXTRACTED_FLAG, user.user_team_id, challengeID, false, TIMESTAMP);
                // check notify reporter
                if ((await this.checkInitialSolve(challengeID)) === true) {
                    const DATA = await this.getFirstbloodData(challengeID);
                    if (DATA !== null) {
                        await FIRSTBLOOD.solve(
                            DATA.solver || '',
                            DATA.event || '',
                            DATA.id || '',
                            DATA.name || '',
                            DATA.category || '',
                            DATA.difficulty || '',
                            TIMESTAMP
                        );
                    }
                }
                // flag is valid
                return true;
            } else {
                // notify anti cheat
                await MONITOR.submission(EXTRACTED_FLAG, user.user_team_id, challengeID, user.id, false, TIMESTAMP);
                // flag is incorrect
                return false;
            }
        }
        // flag is not valid
        return false;
    }

    /**
     * Checks a static Flag for its validity
     * @returns true if the flag matches, false if it doesnt
     */
    async checkStaticChallengeFlag(
        sessionID: string,
        eventID: string,
        challengeID: string,
        flag: string
    ): Promise<boolean> {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const EXTRACTED_FLAG = flag.slice(flag.indexOf('{') + 1, flag.indexOf('}'));
        const RES = (
            await DB_ADAPTER.select()
                .from(challenges)
                .where(and(eq(challenges.id, challengeID), eq(challenges.event_id, eventID)))
        ).at(0);
        if (RES !== undefined && /^TH{.*}$/.test(flag) && RES.flag_static === true) {
            const VALID = await this.checkValidEventExist(RES.event_id);
            if (RES.static_flag === EXTRACTED_FLAG && VALID !== false) {
                await DB_ADAPTER.insert(team_challenges).values({
                    team_id: user.user_team_id,
                    challenge_id: challengeID,
                    event_id: eventID,
                    solved_by: user.id,
                    solved_at: TIMESTAMP,
                    challenge_uuid: '',
                    challenge_flag: EXTRACTED_FLAG,
                    challenge_host: '',
                    challenge_port: '',
                    is_container: false,
                    is_running: false,
                    is_solved: true
                });
                // notify anti cheat
                await MONITOR.solve(EXTRACTED_FLAG, user.user_team_id, challengeID, true, TIMESTAMP);
                // check notify reporter
                if ((await this.checkInitialSolve(challengeID)) === true) {
                    const DATA = await this.getFirstbloodData(challengeID);
                    if (DATA !== null) {
                        await FIRSTBLOOD.solve(
                            DATA.solver || '',
                            DATA.event || '',
                            DATA.id || '',
                            DATA.name || '',
                            DATA.category || '',
                            DATA.difficulty || '',
                            TIMESTAMP
                        );
                    }
                }
                // flag is valid
                return true;
            } else {
                // notify anti cheat
                await MONITOR.submission(EXTRACTED_FLAG, user.user_team_id, challengeID, user.id, true, TIMESTAMP);
                // flag is incorrect
                return false;
            }
        }
        // flag is not valid
        return false;
    }

    /**
     * Checks a pool Flag for its validity
     * @returns true if the flag matches, false if it doesnt
     */
    async checkPoolChallengeFlag(
        sessionID: string,
        eventID: string,
        challengeID: string,
        flag: string
    ): Promise<boolean> {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const EXTRACTED_FLAG = flag.slice(flag.indexOf('{') + 1, flag.indexOf('}'));
        const RES = (
            await DB_ADAPTER.select()
                .from(challenges)
                .where(and(eq(challenges.id, challengeID), eq(challenges.event_id, eventID)))
        ).at(0);
        if (RES !== undefined && /^TH{.*}$/.test(flag) && RES.needs_flag_pool === true) {
            const VALID = await this.checkValidEventExist(RES.event_id);
            if ((await checkLocalPoolMatch(EXTRACTED_FLAG)) === true &&  VALID !== false) {
                await DB_ADAPTER.insert(team_challenges).values({
                    team_id: user.user_team_id,
                    challenge_id: challengeID,
                    event_id: eventID,
                    solved_by: user.id,
                    solved_at: TIMESTAMP,
                    challenge_uuid: '',
                    challenge_flag: EXTRACTED_FLAG,
                    challenge_host: '',
                    challenge_port: '',
                    is_container: false,
                    is_running: false,
                    is_solved: true
                });
                // notify anti cheat
                await MONITOR.solve(EXTRACTED_FLAG, user.user_team_id, challengeID, true, TIMESTAMP);
                // check notify reporter
                if ((await this.checkInitialSolve(challengeID)) === true) {
                    const DATA = await this.getFirstbloodData(challengeID);
                    if (DATA !== null) {
                        await FIRSTBLOOD.solve(
                            DATA.solver || '',
                            DATA.event || '',
                            DATA.id || '',
                            DATA.name || '',
                            DATA.category || '',
                            DATA.difficulty || '',
                            TIMESTAMP
                        );
                    }
                }
                // flag is valid
                return true;
            } else {
                // notify anti cheat
                await MONITOR.submission(EXTRACTED_FLAG, user.user_team_id, challengeID, user.id, true, TIMESTAMP);
                // flag is incorrect
                return false;
            }
        }
        // flag is not valid
        return false;
    }

    /**
     * Creates a new event
     * @returns void
     */
    async createEvent(eventName: string, eventDesc: string, eventStart: number, eventEnd: number) {
        await DB_ADAPTER.insert(events).values({
            id: crypto.randomUUID(),
            event_name: eventName,
            event_description: eventDesc,
            event_start: eventStart,
            event_end: eventEnd
        });
    }

    /**
     * Assigns an event per ID to a list of Teams
     * @returns void
     */
    async createTeamEvent(eventID: string, teamsList: string[]) {
        for (let team of teamsList) {
            await DB_ADAPTER.insert(team_events).values({
                team_id: team,
                event_id: eventID
            });
        }
    }

    /**
     * Creates a new Team
     * @returns void
     */
    async createTeam(sessionID: string, teamName: string, teamDesc: string, teamCountry: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const HAS_CREATED = await this.checkHasCreatedTeam(user.id);
        const TEAMS_WITH_NAME = (await DB_ADAPTER.select().from(teams).where(eq(teams.team_name, teamName))).length;
        // only create if name is unique
        if (TEAMS_WITH_NAME === 0 && HAS_CREATED === false) {
            const GEN_ID = crypto.randomUUID();
            const TEAM_TOKEN = 'CTD-' + generateRandomString(16).toUpperCase();
            await DB_ADAPTER.insert(teams)
                .values({
                    id: GEN_ID,
                    team_creator: user.id,
                    team_join_token: TEAM_TOKEN,
                    team_name: teamName,
                    team_description: teamDesc,
                    team_country_code: teamCountry
                })
                .then(async () => {
                    await this.joinTeam(sessionID, TEAM_TOKEN);
                });
        }
    }

    /**
     * Checks if a user is able to leave the team
     * @returns boolean
     */
    async checkTeamLeavable(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const ONGOING_EVENTS = (
            await DB_ADAPTER.select()
                .from(team_events)
                .innerJoin(events, eq(team_events.event_id, events.id))
                .where(
                    and(
                        eq(team_events.team_id, user.user_team_id),
                        lt(events.event_start, TIMESTAMP),
                        gt(events.event_end, TIMESTAMP)
                    )
                )
        ).length;
        const POINTS_ADDED = (
            await DB_ADAPTER.select()
                .from(team_challenges)
                .where(and(eq(team_challenges.team_id, user.user_team_id), eq(team_challenges.solved_by, user.id)))
        ).length;
        return ONGOING_EVENTS === 0 && POINTS_ADDED === 0;
    }

    /**
     * Validates and adds a user to a team
     * @returns void
     */
    async joinTeam(sessionID: string, token: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TOKEN = await this.checkTeamToken(token);
        if (TOKEN !== false) {
            await DB_ADAPTER.update(users)
                .set({
                    user_team_id: TOKEN
                })
                .where(eq(users.id, user.id));
        }
    }

    /**
     * Resets a team's join token by ID
     * @returns void
     */
    async resetTeamToken(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TEAM = await this.getTeamInfo(sessionID);
        if (user && TEAM !== null) {
            if (TEAM.team_creator === user.id) {
                await DB_ADAPTER.update(teams)
                    .set({
                        team_join_token: 'CTD-' + generateRandomString(16).toUpperCase()
                    })
                    .where(eq(teams.id, user.user_team_id));
            }
        }
    }

    /**
     * Update a team's data token by ID
     * @returns void
     */
    async updateTeamData(sessionID: string, name: string, description: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return;
        const TEAM = await this.getTeamInfo(sessionID);
        const TEAMS_WITH_NAME = (await DB_ADAPTER.select().from(teams).where(eq(teams.team_name, name))).length;
        if (user && TEAM !== null && (TEAMS_WITH_NAME === 0 || TEAM.team_name === name)) {
            if (TEAM.team_creator === user.id) {
                await DB_ADAPTER.update(teams)
                    .set({
                        team_name: name,
                        team_description: description
                    })
                    .where(eq(teams.id, user.user_team_id));
            }
        }
    }

    /**
     * Update a users avatar by ID
     * @returns void
     */
    async updateUserAvatar(sessionID: string, avatar: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user && AVATARS.find((entry) => entry.title === avatar) !== undefined) {
            await DB_ADAPTER.update(users)
                .set({
                    user_avatar: avatar
                })
                .where(eq(users.id, user.id));
        }
    }

    /**
     * Validates and removes a user from his team
     * @returns void
     */
    async leaveTeam(sessionID: string) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return;
        const TEAM = await this.getTeamInfo(sessionID);
        const MEMBERS = await this.getTeamMembers(sessionID);
        if (user && TEAM !== null && MEMBERS.length > 0) {
            const IS_ABLE = await this.checkTeamLeavable(sessionID);
            if ((TEAM.team_creator !== user.id && IS_ABLE === true) || (MEMBERS.length === 1 && IS_ABLE === true)) {
                await DB_ADAPTER.update(users)
                    .set({
                        user_team_id: ''
                    })
                    .where(eq(users.id, user.id));
                // yeet the team if creator is the last one to leave
                if (TEAM.team_creator === user.id && MEMBERS.length === 1) {
                    await DB_ADAPTER.delete(teams).where(eq(teams.id, user.user_team_id));
                }
            }
        }
    }

    /**
     * Updates an Event's properties
     * @returns void
     */
    async updateEvent(eventID: string, eventName: string, eventDesc: string, start: number, end: number) {
        await DB_ADAPTER.update(events)
            .set({
                event_name: eventName,
                event_description: eventDesc,
                event_start: start,
                event_end: end
            })
            .where(eq(events.id, eventID));
    }

    /**
     * Updates a Challenge's properties
     * @returns void
     */
    async updateChallenge(
        id: string,
        name: string,
        desc: string,
        cat: string,
        diff: string,
        points: number,
        event: string,
        depends: string
    ) {
        await DB_ADAPTER.update(challenges)
            .set({
                challenge_name: name,
                challenge_description: desc,
                challenge_category: cat,
                challenge_difficulty: diff,
                base_points: points,
                event_id: event,
                depends_on: depends
            })
            .where(eq(challenges.id, id));
    }

    /**
     * Updates a Users properties
     * @returns void
     */
    async updateUser(
        userID: string,
        userEmail: string,
        isVerified: boolean,
        role: string,
        firstName: string,
        lastName: string,
        affiliation: string,
        team: string
    ) {
        await DB_ADAPTER.update(users)
            .set({
                email: userEmail,
                is_verified: isVerified,
                user_role: role,
                user_firstname: firstName,
                user_lastname: lastName,
                user_affiliation: affiliation,
                user_team_id: team
            })
            .where(eq(users.id, userID));
    }

    /**
     * Updates a Team per ID
     * @returns void
     */
    async updateTeam(teamID: string, name: string, description: string) {
        await DB_ADAPTER.update(teams)
            .set({
                team_name: name,
                team_description: description
            })
            .where(eq(teams.id, teamID));
    }

    /**
     * Deletes a Team Event per ID
     * @returns void
     */
    async deleteTeamEvent(eventID: string, teamID: string) {
        await DB_ADAPTER.delete(team_events).where(
            and(eq(team_events.event_id, eventID), eq(team_events.team_id, teamID))
        );
    }

    /**
     * Deletes a Team per ID
     * @returns void
     */
    async deleteTeam(teamID: string) {
        await DB_ADAPTER.delete(teams).where(eq(teams.id, teamID));
        const REF_USERS = await DB_ADAPTER.select().from(users).where(eq(users.user_team_id, teamID));
        REF_USERS.forEach(async (user) => {
            await DB_ADAPTER.update(users)
                .set({
                    user_team_id: ''
                })
                .where(eq(users.id, user.id));
        });
    }

    /**
     * Deletes a User per ID
     * @returns void
     */
    async deleteUser(userID: string) {
        // remove user data
        await lucia.invalidateUserSessions(userID);
        await DB_ADAPTER.delete(users).where(eq(users.id, userID));
        await lucia.deleteExpiredSessions();
    }

    /**
     * Deletes a Challenge per ID
     * @returns void
     */
    async deleteChallenge(challengeID: string) {
        const CHALLENGE = (await DB_ADAPTER.select().from(challenges).where(eq(challenges.id, challengeID))).at(0);
        const ACTIVE_CHALLENGES = (
            await DB_ADAPTER.select().from(team_challenges).where(eq(team_challenges.challenge_id, challengeID))
        ).length;
        // only allow deletion if challenge is not bound
        if (CHALLENGE !== undefined && ACTIVE_CHALLENGES === 0) {
            await DB_ADAPTER.delete(challenges).where(eq(challenges.id, CHALLENGE.id));
        }
    }

    /**
     * Deletes a Team Challenge per ID
     * @returns void
     */
    async deleteTeamChallenge(challengeID: string, teamID: string, eventID: string) {
        await DB_ADAPTER.delete(team_challenges).where(
            and(
                eq(team_challenges.challenge_id, challengeID),
                eq(team_challenges.event_id, eventID),
                eq(team_challenges.team_id, teamID)
            )
        );
    }

    /**
     * Updates a Team Challenge per ID
     * @returns void
     */
    async updateTeamChallenge(
        challengeID: string,
        teamID: string,
        eventID: string,
        containerID: string,
        containerHost: string,
        containerFlag: string
    ) {
        await DB_ADAPTER.update(team_challenges)
            .set({
                challenge_flag: containerFlag,
                challenge_uuid: containerID,
                challenge_host: containerHost
            })
            .where(
                and(
                    eq(team_challenges.challenge_id, challengeID),
                    eq(team_challenges.event_id, eventID),
                    eq(team_challenges.team_id, teamID)
                )
            );
    }

    /**
     * Toggles Blocking of a user per ID
     * @returns void
     */
    async toggleBlockUser(userID: string) {
        const RES = (await DB_ADAPTER.select().from(users).where(eq(users.id, userID))).at(0);
        await lucia.invalidateUserSessions(userID);
        if (RES !== undefined) {
            if (RES.is_blocked) {
                await DB_ADAPTER.update(users)
                    .set({
                        is_blocked: false
                    })
                    .where(eq(users.id, RES.id));
            } else {
                await DB_ADAPTER.update(users)
                    .set({
                        is_blocked: true
                    })
                    .where(eq(users.id, RES.id));
            }
        }
    }

    /**
     * Deletes an event per ID
     * @returns void
     */
    async deleteEvent(eventID: string) {
        const ACTIVE_CHALLENGES = (
            await DB_ADAPTER.select().from(team_challenges).where(eq(team_challenges.event_id, eventID))
        ).length;
        const PASSIVE_CHALLENGES = (await DB_ADAPTER.select().from(challenges).where(eq(challenges.event_id, eventID)))
            .length;
        // allow deletion only if the event is bound to nothing
        if (ACTIVE_CHALLENGES === 0 && PASSIVE_CHALLENGES === 0) {
            await DB_ADAPTER.delete(events).where(eq(events.id, eventID));
        }
    }

    /**
     * Get all Anti Cheat events
     * @returns Data List or zero length list
     */
    async getAntiCheatEvents() {
        const DATA = await MONITOR.flagged();
        if (DATA !== -1 && DATA !== false) {
            return DATA.length > 0 ? DATA : [];
        }
        return [];
    }

    /**
     * Get all Anti Cheat poisoned flags
     * @returns Data List or zero length list
     */
    async getAntiCheatPoisoned() {
        const DATA = await MONITOR.poisons();
        if (DATA !== -1 && DATA !== false) {
            return DATA.length > 0 ? DATA : [];
        }
        return [];
    }

    /**
     * Get all Anti Cheat poisoned flags
     * @returns void
     */
    async createAntiCheatPoison(list: string[]) {
        await MONITOR.infect(list);
    }

    /**
     * Get eligible users for cert email
     * @returns void
     */
    async getValidCertUsers(eventID: string) {
        const RES = await DB_ADAPTER.select({
            email: users.email,
            first_name: users.user_firstname,
            last_name: users.user_lastname
        })
            .from(team_events)
            .innerJoin(users, eq(team_events.team_id, users.user_team_id))
            .where(and(eq(team_events.event_id, eventID), eq(users.is_verified, true)));
        if (RES.length > 0) {
            return RES.map((entry) => {
                return {
                    email: entry.email,
                    fullName: `${entry.last_name.toUpperCase()} ${entry.first_name}`
                };
            });
        }
        return [];
    }

    /**
     * Send cert mail to users
     * @returns void
     */
    async sendCertUserMails(list: any[]) {
        MAILER.batchSendAttendance(list).then((res) => {
            if (res === true) {
                console.log(list.length + ' Emails Sent.');
            }
        });
    }
}

export default Actions;
