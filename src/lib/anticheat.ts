// read from env
const AC_HOST = process.env.M0N1T0R_HOST;
const AC_PORT = process.env.M0N1T0R_PORT;

class AntiCheat {
    #AC_URL: string;
    constructor() {
        this.#AC_URL = `http://${AC_HOST}:${AC_PORT}`;
    }

    /**
     * Submit a challenge initiation to the AC
     * @return True if success, False if not
     */
    async flagInitial(flag: string, teamID: string, challengeID: string, initTime: number): Promise<boolean> {
        try {
            let RESP = await fetch(`${this.#AC_URL}/initiate_flag`, {
                body: JSON.stringify({
                    flag: flag,
                    team_id: teamID,
                    challenge_id: challengeID,
                    initiation_time: initTime
                })
            });
            return RESP.status === 200 ? true : false;
        } catch {
            return false;
        }
    }

    /**
     * Submit a flag submition to the AC
     * @return True if success, False if not
     */
    async flagSubmit(
        flag: string,
        teamID: string,
        userID: string,
        challengeID: string,
        initTime: number
    ): Promise<boolean> {
        try {
            let RESP = await fetch(`${this.#AC_URL}/initiate_flag`, {
                body: JSON.stringify({
                    flag: flag,
                    team_id: teamID,
                    user_id: userID,
                    challenge_id: challengeID,
                    initiation_time: initTime
                })
            });
            return RESP.status === 200 ? true : false;
        } catch {
            return false;
        }
    }

    /**
     * Connect to the live AC stream
     * @return WebSocket connection
     */
    liveStream(): WebSocket {
        return new WebSocket(`${this.#AC_URL}/live`);
    }
}

export default AntiCheat;
