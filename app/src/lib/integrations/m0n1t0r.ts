import { getConfig } from '../config';
import { Logger } from '../logger';

const CONFIG = await getConfig();

class M0n1t0r {
    #ENABLED: boolean;
    #M0N1T0R_URL: string;
    #M0N1T0R_HEADERS: { [key: string]: string };
    constructor() {
        this.#ENABLED = Boolean(CONFIG.m0n1t0r.enable);
        this.#M0N1T0R_URL = `http://${String(CONFIG.m0n1t0r.host)}:${String(CONFIG.m0n1t0r.port)}`;
        this.#M0N1T0R_HEADERS = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * #### Infallible ####
     * Fetch poisoned flags from m0n1t0r AntiCheat
     * @returns -1 if disabled
     * @returns List of flag strings if success
     * @returns false if error
     */
    async poisons(): Promise<-1 | string[] | false> {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#M0N1T0R_URL}/poisoned`, {
                method: 'GET',
                headers: this.#M0N1T0R_HEADERS
            });
            if (RESP.ok === true) {
                const DATA: string[] = await RESP.json();
                return DATA.length > 0 ? DATA : [];
            }
            return false;
        } catch (e: any) {
            Logger.error('M0n1t0r: ' + e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Fetch current flag data from m0n1t0r AntiCheat
     * @returns -1 if disabled
     * @returns Data List if success
     * @returns false if error
     */
    async flagged(): Promise<
        | -1
        | { team_id: string; suspicion_lvl: 1 | 2 | 3; marks: { flag_share_team: string; reason: string }[] }[]
        | false
    > {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#M0N1T0R_URL}/flagged`, {
                method: 'GET',
                headers: this.#M0N1T0R_HEADERS
            });
            if (RESP.ok === true) {
                const DATA: {
                    team_id: string;
                    suspicion_lvl: 1 | 2 | 3;
                    marks: { flag_share_team: string; reason: string }[];
                }[] = await RESP.json();
                return DATA.length > 0 ? DATA : [];
            }
            return false;
        } catch (e: any) {
            Logger.error('M0n1t0r: ' + e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Submit a poisoned flag to m0n1t0r AntiCheat
     * @returns -1 if disabled
     * @returns true if success, false if not
     */
    async infect(flagList: string[]): Promise<-1 | boolean> {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#M0N1T0R_URL}/poisoned`, {
                method: 'POST',
                headers: this.#M0N1T0R_HEADERS,
                body: JSON.stringify(flagList)
            });
            return RESP.ok;
        } catch (e: any) {
            Logger.error('M0n1t0r: ' + e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Submit a challenge initiation m0n1t0r AntiCheat
     * @returns -1 if disabled
     * @returns true if success, false if not
     */
    async initiation(flag: string, teamID: string, challengeID: string, timestamp: number): Promise<-1 | boolean> {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#M0N1T0R_URL}/initiate_flag`, {
                method: 'POST',
                headers: this.#M0N1T0R_HEADERS,
                body: JSON.stringify({
                    flag: flag,
                    team_id: teamID,
                    challenge_id: challengeID,
                    initiation_time: timestamp
                })
            });
            return RESP.ok;
        } catch (e: any) {
            Logger.error('M0n1t0r: ' + e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Submit a general submission to m0n1t0r AntiCheat
     * @returns -1 if disabled
     * @returns true if success, false if not
     */
    async submission(
        flag: string,
        teamID: string,
        challengeID: string,
        userID: string,
        isStatic: boolean,
        timestamp: number
    ): Promise<-1 | boolean> {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#M0N1T0R_URL}/submissions`, {
                method: 'POST',
                headers: this.#M0N1T0R_HEADERS,
                body: JSON.stringify({
                    flag: flag,
                    team_id: teamID,
                    challenge_id: challengeID,
                    user_id: userID,
                    submission_time: timestamp,
                    static: isStatic
                })
            });
            return RESP.ok;
        } catch (e: any) {
            Logger.error('M0n1t0r: ' + e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Submit a solve to m0n1t0r AntiCheat
     * @returns -1 if disabled
     * @returns true if success, false if not
     */
    async solve(
        flag: string,
        teamID: string,
        challengeID: string,
        isStatic: boolean,
        timestamp: number
    ): Promise<-1 | boolean> {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#M0N1T0R_URL}/solved`, {
                method: 'POST',
                headers: this.#M0N1T0R_HEADERS,
                body: JSON.stringify({
                    flag: flag,
                    team_id: teamID,
                    challenge_id: challengeID,
                    timestamp: timestamp,
                    static: isStatic
                })
            });
            return RESP.ok;
        } catch (e: any) {
            Logger.error('M0n1t0r: ' + e);
            return false;
        }
    }
}

export default M0n1t0r;
