import { DB_ADAPTER } from './db';
import { challenges, events, team_challenges, team_events, teams, users } from './schema';
import { and, eq, sql, gt, lt } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { lucia } from './lucia';
import { generateRandomString, validAlphanumeric, validPassword, validFlag, AVATARS } from './helpers';
import { checkLocalPoolMatch } from './storage';
import { adjustDynamic, getTotalByName, backFillTotal } from './scoring';
import { getConfig } from './config';
import type { ChallengesType } from './schema';
import type {
    ChallengeCreate,
    ChallengeUpdate,
    EventCreate,
    EventUpdate,
    SubmissionDelete,
    SubmissionUpdate,
    TeamEventCreate,
    TeamEventDelete,
    TeamUpdate,
    UserCheckFlag,
    UserCreateTeam,
    UserDeployChallenge,
    UserUpdate,
    UserUpdateData,
    UserUpdateTeam
} from './types';
import Infra from './integrations/infra';
import M0n1t0r from './integrations/m0n1t0r';
import F1rstbl00d from './integrations/f1rstbl00d';
import CertMailer from './integrations/certmailer';

const CONFIG = await getConfig();
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
            await DB_ADAPTER.select({ name: events.name, start: events.start, end: events.end })
                .from(events)
                .where(eq(events.id, eventID))
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
        const RES = (await DB_ADAPTER.select({ name: events.name }).from(events).where(eq(events.id, eventID))).at(0);
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
        const RES = (await DB_ADAPTER.select({ name: teams.name }).from(teams).where(eq(teams.id, teamID))).at(0);
        return RES === undefined ? false : RES.name;
    }

    /**
     * Validate if a team exists by name
     * @returns The team's ID if exists, False if it doesn't
     */
    async checkTeamNameExist(teamName: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.name, teamName));
        return RES.length === 0 ? false : RES[0].id;
    }

    /**
     * Validate if a team token is valid and corresponds to a team
     * @returns The team's ID if exists and valid, else false
     */
    async checkTeamToken(teamToken: string) {
        const RES = (await DB_ADAPTER.select().from(teams).where(eq(teams.join_token, teamToken))).at(0);
        if (RES !== undefined) {
            const MEMBERS = (await DB_ADAPTER.select().from(users).where(eq(users.team_id, RES.id))).length;
            return MEMBERS < 4 ? RES.id : false;
        }
        return false;
    }

    /**
     * Validate if a user has created a team
     * @returns True if the user has, false if he hasn't
     */
    async checkHasCreatedTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.creator_id, userID));
        return RES.length === 0 ? false : true;
    }

    /**
     * Validate if a user is currently in a team
     * @returns The team's ID if user is, false if he isn't
     */
    async checkUserInTeam(userID: string) {
        const RES = await DB_ADAPTER.select().from(users).where(eq(users.id, userID));
        if (RES.length === 0) return false;
        if (RES[0].team_id === '') return false;
        return RES[0].team_id;
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
                name: challenges.name,
                category: challenges.category,
                difficulty: challenges.difficulty,
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
        const RES = await DB_ADAPTER.select().from(teams).where(eq(teams.id, user.team_id));
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
                avatar: users.avatar,
                affiliation: users.affiliation,
                role: users.role,
                team_id: users.team_id,
                team_name: teams.name,
                team_country: teams.country_code
            })
                .from(users)
                .where(eq(users.id, userID))
                .innerJoin(teams, eq(users.team_id, teams.id))
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
                name: teams.name,
                description: teams.description,
                country: teams.country_code
            })
                .from(teams)
                .where(eq(teams.id, teamID))
        ).at(0);
        const MEMBERS = await DB_ADAPTER.select({
            id: users.id,
            username: users.username,
            avatar: users.avatar
        })
            .from(users)
            .where(eq(users.team_id, teamID));
        if (MEMBERS.length > 0 && TEAM !== undefined) {
            return { ...TEAM, members: MEMBERS };
        }
        return null;
    }

    /**
     * Fetches sanitized Teams
     * @returns List sanitized of Teams
     */
    async getTeamListing() {
        const RES = await DB_ADAPTER.select({
            id: teams.id,
            team_name: teams.name,
            team_description: teams.description,
            team_country_code: teams.country_code
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
            user_avatar: users.avatar,
            user_affiliation: users.affiliation
        })
            .from(users)
            .where(eq(users.team_id, user.team_id));
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
     * Fetches Event by id
     * @returns Events or null
     */
    async getSingleEvents(eventID: string) {
        const RES = (await DB_ADAPTER.select().from(events).where(eq(events.id, eventID))).at(0);
        return RES !== undefined ? RES : null;
    }

    /**
     * Fetches all Assigned Events
     * @returns List of Events
     */
    async getAllTeamEvents() {
        const RES = await DB_ADAPTER.select({
            event_id: events.id,
            team_id: teams.id,
            team_name: teams.name,
            event_name: events.name
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
            .where(eq(team_events.team_id, user.team_id));
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
            .where(and(eq(team_challenges.team_id, user.team_id), eq(team_challenges.is_solved, true)));
        return RES.length > 0 ? RES : [];
    }

    /**
     * Fetches Challenges assigned to Event ID
     * @returns List of Challenges
     */
    async getEventChallenges(sessionID: string, eventID: string) {
        const VALID = await this.checkValidEventExist(eventID);
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null || VALID === false) return [];
        const RES_CHALLS = await DB_ADAPTER.select().from(challenges).where(eq(challenges.event_id, eventID));
        const RES_SOLVED = await DB_ADAPTER.select({ id: team_challenges.challenge_id })
            .from(team_challenges)
            .where(and(eq(team_challenges.team_id, user.team_id), eq(team_challenges.is_solved, true)));
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
            name: teams.name
        })
            .from(team_events)
            .innerJoin(teams, eq(teams.id, team_events.team_id))
            .where(eq(team_events.event_id, eventID));
        const EVENT_START = (
            await DB_ADAPTER.select({
                start: events.start
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
            .innerJoin(users, eq(users.team_id, team_events.team_id))
            .where(eq(team_events.event_id, eventID));
        const EVENT_START = (
            await DB_ADAPTER.select({
                start: events.start
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
            name: teams.name,
            challenge_id: challenges.id,
            timestamp: team_challenges.solved_at,
            points_gained: challenges.points
        })
            .from(team_challenges)
            .innerJoin(challenges, eq(team_challenges.challenge_id, challenges.id))
            .innerJoin(teams, eq(team_challenges.team_id, teams.id))
            .where(and(eq(team_challenges.event_id, eventID), eq(team_challenges.is_solved, true)))
            .groupBy(team_challenges.team_id, teams.name, challenges.id, team_challenges.solved_at);
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
            points_gained: challenges.points
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
            points: sql<number>`cast(sum(${challenges.points}) as int)`
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
    async changeUserData(sessionID: string, schema: UserUpdateData) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user && validAlphanumeric(schema.firstName, 30) && validAlphanumeric(schema.lastName, 30)) {
            await DB_ADAPTER.update(users)
                .set({
                    firstname: schema.firstName,
                    lastname: schema.lastName,
                    affiliation: schema.affiliation
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
    async createChallenge(schema: ChallengeCreate) {
        await DB_ADAPTER.insert(challenges).values({
            id: crypto.randomUUID(),
            event_id: schema.assignTo,
            name: schema.name,
            description: schema.description,
            category: schema.category,
            difficulty: schema.difficulty,
            container_file: schema.containerPath,
            file_url: schema.fileUrl,
            points: schema.points,
            depends_on: schema.dependsOn,
            static_flag: schema.staticFlag,
            needs_depend: schema.isDependant,
            needs_file: schema.fileUrl === '' ? false : true,
            needs_static: schema.isStaticFlag,
            needs_container: schema.isContainer,
            needs_pool: schema.isFlagPool
        });
    }

    /**
     * Get all currently deployed or initiated Challenges per Event and Team ID
     * @returns List of cut down info, zero length if no found
     */
    async getDeployedChallenges(sessionID: string, eventID: string) {
        const VALID = await this.checkValidEventExist(eventID);
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null || VALID === false) return [];
        const RES = await DB_ADAPTER.select({
            challenge_id: team_challenges.challenge_id,
            challenge_host: team_challenges.container_host,
            challenge_port: team_challenges.container_port,
            is_running: team_challenges.is_running
        })
            .from(team_challenges)
            .where(
                and(
                    eq(team_challenges.team_id, user.team_id),
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
    async deployTeamChallenge(sessionID: string, schema: UserDeployChallenge): Promise<boolean> {
        const VALID = await this.checkValidEventExist(schema.eventId);
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null || VALID === false) return false;
        const GEN_FLAG = crypto.randomUUID();
        const TIMESTAMP = new Date().getTime();
        const NOT_DEPLOYED =
            (
                await DB_ADAPTER.select()
                    .from(team_challenges)
                    .where(
                        and(
                            eq(team_challenges.challenge_id, schema.challengeId),
                            eq(team_challenges.team_id, user.team_id),
                            eq(team_challenges.event_id, schema.eventId)
                        )
                    )
            ).length === 0;
        const RES = (await DB_ADAPTER.select().from(challenges).where(eq(challenges.id, schema.challengeId))).at(0);
        if (RES !== undefined && NOT_DEPLOYED === true) {
            // note deployment
            await DB_ADAPTER.insert(team_challenges).values({
                team_id: user.team_id,
                challenge_id: schema.challengeId,
                event_id: schema.eventId,
                solved_by: '',
                solved_at: 0,
                container_id: '',
                container_flag: '',
                container_host: '',
                container_port: '',
                is_container: true,
                is_running: false,
                is_solved: false
            });
            INFRA.deploy(RES.container_file, GEN_FLAG).then(async (data) => {
                // on success update the challenge
                if (data !== false) {
                    await DB_ADAPTER.update(team_challenges)
                        .set({
                            container_id: data.id,
                            container_flag: data.flag,
                            container_host: data.host,
                            is_running: true
                        })
                        .where(
                            and(
                                eq(team_challenges.team_id, user.team_id),
                                eq(team_challenges.event_id, schema.eventId),
                                eq(team_challenges.challenge_id, schema.challengeId)
                            )
                        );
                    // notify anti cheat
                    await MONITOR.initiation(data.flag, user.team_id, schema.challengeId, TIMESTAMP);
                } else {
                    // on fail, remove the entry
                    await DB_ADAPTER.delete(team_challenges).where(
                        and(
                            eq(team_challenges.team_id, user.team_id),
                            eq(team_challenges.event_id, schema.eventId),
                            eq(team_challenges.challenge_id, schema.challengeId)
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
    async checkDynamicChallengeFlag(sessionID: string, schema: UserCheckFlag): Promise<boolean> {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const RES = (
            await DB_ADAPTER.select()
                .from(team_challenges)
                .where(
                    and(eq(team_challenges.team_id, user.team_id), eq(team_challenges.challenge_id, schema.challengeId))
                )
        ).at(0);
        if (RES !== undefined && validFlag(schema.flag, String(CONFIG.webapp.prefix)) && RES.is_running === true) {
            const EXTRACTED_FLAG = schema.flag.slice(schema.flag.indexOf('{') + 1, schema.flag.indexOf('}'));
            const VALID = await this.checkValidEventExist(RES.event_id);
            if (RES.container_flag === EXTRACTED_FLAG && VALID !== false) {
                await DB_ADAPTER.update(team_challenges)
                    .set({
                        solved_by: user.id,
                        solved_at: TIMESTAMP,
                        is_solved: true
                    })
                    .where(
                        and(
                            eq(team_challenges.team_id, user.team_id),
                            eq(team_challenges.challenge_id, schema.challengeId)
                        )
                    );
                // shut down the container
                INFRA.shutdown(RES.container_id).then(async (ok) => {
                    if (ok === true) {
                        await DB_ADAPTER.update(team_challenges)
                            .set({
                                is_running: false
                            })
                            .where(
                                and(
                                    eq(team_challenges.team_id, user.team_id),
                                    eq(team_challenges.challenge_id, schema.challengeId)
                                )
                            );
                    }
                });
                // notify anti cheat
                await MONITOR.solve(EXTRACTED_FLAG, user.team_id, schema.challengeId, false, TIMESTAMP);
                // check notify reporter
                if ((await this.checkInitialSolve(schema.challengeId)) === true) {
                    const DATA = await this.getFirstbloodData(schema.challengeId);
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
                await MONITOR.submission(EXTRACTED_FLAG, user.team_id, schema.challengeId, user.id, false, TIMESTAMP);
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
    async checkStaticChallengeFlag(sessionID: string, schema: UserCheckFlag): Promise<boolean> {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const RES = (
            await DB_ADAPTER.select()
                .from(challenges)
                .where(and(eq(challenges.id, schema.challengeId), eq(challenges.event_id, schema.eventId)))
        ).at(0);
        if (RES !== undefined && validFlag(schema.flag, String(CONFIG.webapp.prefix)) && RES.needs_static === true) {
            const EXTRACTED_FLAG = schema.flag.slice(schema.flag.indexOf('{') + 1, schema.flag.indexOf('}'));
            const VALID = await this.checkValidEventExist(RES.event_id);
            if (RES.static_flag === EXTRACTED_FLAG && VALID !== false) {
                await DB_ADAPTER.insert(team_challenges).values({
                    team_id: user.team_id,
                    challenge_id: schema.challengeId,
                    event_id: schema.eventId,
                    solved_by: user.id,
                    solved_at: TIMESTAMP,
                    container_id: '',
                    container_flag: EXTRACTED_FLAG,
                    container_host: '',
                    container_port: '',
                    is_container: false,
                    is_running: false,
                    is_solved: true
                });
                // notify anti cheat
                await MONITOR.solve(EXTRACTED_FLAG, user.team_id, schema.challengeId, true, TIMESTAMP);
                // check notify reporter
                if ((await this.checkInitialSolve(schema.challengeId)) === true) {
                    const DATA = await this.getFirstbloodData(schema.challengeId);
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
                await MONITOR.submission(EXTRACTED_FLAG, user.team_id, schema.challengeId, user.id, true, TIMESTAMP);
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
    async checkPoolChallengeFlag(sessionID: string, schema: UserCheckFlag): Promise<boolean> {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const TIMESTAMP = new Date().getTime();
        const RES = (
            await DB_ADAPTER.select()
                .from(challenges)
                .where(and(eq(challenges.id, schema.challengeId), eq(challenges.event_id, schema.eventId)))
        ).at(0);
        if (RES !== undefined && validFlag(schema.flag, String(CONFIG.webapp.prefix)) && RES.needs_pool === true) {
            const EXTRACTED_FLAG = schema.flag.slice(schema.flag.indexOf('{') + 1, schema.flag.indexOf('}'));
            const VALID = await this.checkValidEventExist(RES.event_id);
            if ((await checkLocalPoolMatch(EXTRACTED_FLAG)) === true && VALID !== false) {
                await DB_ADAPTER.insert(team_challenges).values({
                    team_id: user.team_id,
                    challenge_id: schema.challengeId,
                    event_id: schema.eventId,
                    solved_by: user.id,
                    solved_at: TIMESTAMP,
                    container_id: '',
                    container_flag: EXTRACTED_FLAG,
                    container_host: '',
                    container_port: '',
                    is_container: false,
                    is_running: false,
                    is_solved: true
                });
                // notify anti cheat
                await MONITOR.solve(EXTRACTED_FLAG, user.team_id, schema.challengeId, true, TIMESTAMP);
                // check notify reporter
                if ((await this.checkInitialSolve(schema.challengeId)) === true) {
                    const DATA = await this.getFirstbloodData(schema.challengeId);
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
                await MONITOR.submission(EXTRACTED_FLAG, user.team_id, schema.challengeId, user.id, true, TIMESTAMP);
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
    async createEvent(schema: EventCreate) {
        await DB_ADAPTER.insert(events).values({
            id: crypto.randomUUID(),
            name: schema.name,
            description: schema.description,
            start: schema.start,
            end: schema.end
        });
    }

    /**
     * Assigns an event per ID to a list of Teams
     * @returns void
     */
    async createTeamEvent(schema: TeamEventCreate) {
        for (let team of schema.teamIdList) {
            await DB_ADAPTER.insert(team_events).values({
                team_id: team,
                event_id: schema.eventId
            });
        }
    }

    /**
     * Creates a new Team
     * @returns void
     */
    async createTeam(sessionID: string, schema: UserCreateTeam) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return false;
        const HAS_CREATED = await this.checkHasCreatedTeam(user.id);
        const TEAMS_WITH_NAME = (await DB_ADAPTER.select().from(teams).where(eq(teams.name, schema.name))).length;
        // only create if name is unique
        if (TEAMS_WITH_NAME === 0 && HAS_CREATED === false) {
            const GEN_ID = crypto.randomUUID();
            const TEAM_TOKEN = 'CTD-' + generateRandomString(16).toUpperCase();
            await DB_ADAPTER.insert(teams)
                .values({
                    id: GEN_ID,
                    creator_id: user.id,
                    join_token: TEAM_TOKEN,
                    name: schema.name,
                    description: schema.description,
                    country_code: schema.country
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
                    and(eq(team_events.team_id, user.team_id), lt(events.start, TIMESTAMP), gt(events.end, TIMESTAMP))
                )
        ).length;
        const POINTS_ADDED = (
            await DB_ADAPTER.select()
                .from(team_challenges)
                .where(and(eq(team_challenges.team_id, user.team_id), eq(team_challenges.solved_by, user.id)))
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
                    team_id: TOKEN
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
            if (TEAM.creator_id === user.id) {
                await DB_ADAPTER.update(teams)
                    .set({
                        join_token: 'CTD-' + generateRandomString(16).toUpperCase()
                    })
                    .where(eq(teams.id, user.team_id));
            }
        }
    }

    /**
     * Update a team's data token by ID
     * @returns void
     */
    async updateTeamData(sessionID: string, schema: UserUpdateTeam) {
        const { session, user } = await lucia.validateSession(sessionID);
        if (user === null) return;
        const TEAM = await this.getTeamInfo(sessionID);
        const TEAMS_WITH_NAME = (await DB_ADAPTER.select().from(teams).where(eq(teams.name, schema.name))).length;
        if (user && TEAM !== null && (TEAMS_WITH_NAME === 0 || TEAM.name === schema.name)) {
            if (TEAM.creator_id === user.id) {
                await DB_ADAPTER.update(teams)
                    .set({
                        name: schema.name,
                        description: schema.description
                    })
                    .where(eq(teams.id, user.team_id));
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
                    avatar: avatar
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
            if ((TEAM.creator_id !== user.id && IS_ABLE === true) || (MEMBERS.length === 1 && IS_ABLE === true)) {
                await DB_ADAPTER.update(users)
                    .set({
                        team_id: ''
                    })
                    .where(eq(users.id, user.id));
                // yeet the team if creator is the last one to leave
                if (TEAM.creator_id === user.id && MEMBERS.length === 1) {
                    await DB_ADAPTER.delete(teams).where(eq(teams.id, user.team_id));
                }
            }
        }
    }

    /**
     * Updates an Event's properties
     * @returns void
     */
    async updateEvent(schema: EventUpdate) {
        await DB_ADAPTER.update(events)
            .set({
                name: schema.name,
                description: schema.description,
                start: schema.start,
                end: schema.end
            })
            .where(eq(events.id, schema.id));
    }

    /**
     * Updates a Challenge's properties
     * @returns void
     */
    async updateChallenge(schema: ChallengeUpdate) {
        await DB_ADAPTER.update(challenges)
            .set({
                name: schema.name,
                description: schema.description,
                category: schema.category,
                difficulty: schema.difficulty,
                points: schema.points,
                event_id: schema.assignTo,
                depends_on: schema.dependsOn
            })
            .where(eq(challenges.id, schema.id));
    }

    /**
     * Updates a Users properties
     * @returns void
     */
    async updateUser(schema: UserUpdate) {
        await DB_ADAPTER.update(users)
            .set({
                email: schema.email,
                is_verified: schema.isVerified,
                role: schema.role,
                firstname: schema.firstName,
                lastname: schema.lastName,
                affiliation: schema.affiliation,
                team_id: schema.teamId
            })
            .where(eq(users.id, schema.id));
    }

    /**
     * Updates a Team per ID
     * @returns void
     */
    async updateTeam(schema: TeamUpdate) {
        await DB_ADAPTER.update(teams)
            .set({
                name: schema.name,
                description: schema.description
            })
            .where(eq(teams.id, schema.id));
    }

    /**
     * Deletes a Team Event per ID
     * @returns void
     */
    async deleteTeamEvent(schema: TeamEventDelete) {
        await DB_ADAPTER.delete(team_events).where(
            and(eq(team_events.event_id, schema.eventId), eq(team_events.team_id, schema.teamId))
        );
    }

    /**
     * Deletes a Team per ID
     * @returns void
     */
    async deleteTeam(teamID: string) {
        await DB_ADAPTER.delete(teams).where(eq(teams.id, teamID));
        const REF_USERS = await DB_ADAPTER.select().from(users).where(eq(users.team_id, teamID));
        REF_USERS.forEach(async (user) => {
            await DB_ADAPTER.update(users)
                .set({
                    team_id: ''
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
    async deleteTeamChallenge(schema: SubmissionDelete) {
        await DB_ADAPTER.delete(team_challenges).where(
            and(
                eq(team_challenges.challenge_id, schema.challengeId),
                eq(team_challenges.event_id, schema.eventId),
                eq(team_challenges.team_id, schema.teamId)
            )
        );
    }

    /**
     * Updates a Team Challenge per ID
     * @returns void
     */
    async updateTeamChallenge(schema: SubmissionUpdate) {
        await DB_ADAPTER.update(team_challenges)
            .set({
                container_flag: schema.containerFlag,
                container_id: schema.containerId,
                container_host: schema.containerHost
            })
            .where(
                and(
                    eq(team_challenges.challenge_id, schema.challengeId),
                    eq(team_challenges.event_id, schema.eventId),
                    eq(team_challenges.team_id, schema.teamId)
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
            first_name: users.firstname,
            last_name: users.lastname
        })
            .from(team_events)
            .innerJoin(users, eq(team_events.team_id, users.team_id))
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
