import { getConfig } from "../config";

const CONFIG = await getConfig();

class F1rstbl00d {
    #ENABLED: boolean;
    #F1RSTBL00D_URL: string;
    #F1RSTBL00D_HEADERS: { [key: string]: string };
    constructor() {
        this.#ENABLED = Boolean(CONFIG.f1rstbl00d.enable);
        this.#F1RSTBL00D_URL = `http://${String(CONFIG.f1rstbl00d.host)}:${String(CONFIG.f1rstbl00d.port)}`;
        this.#F1RSTBL00D_HEADERS = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${String(CONFIG.f1rstbl00d.psk)}`
        };
    }

    /**
     * #### Infallible ####
     * Submit a firstblood solve to f1rstbl00d
     * @returns -1 if disabled
     * @returns true if success, false if not
     */
    async solve(userName: string, eventID: string, challengeID: string, challengeName: string, challengeCategory: string, challengeDifficulty: string, timestamp: number): Promise<-1 | boolean> {
        if (!this.#ENABLED) return -1;
        try {
            let RESP = await fetch(`${this.#F1RSTBL00D_URL}/firstbloods/add/`, {
                method: 'POST',
                headers: this.#F1RSTBL00D_HEADERS,
                body: JSON.stringify({
                    username: userName,
                    event_id: eventID,
                    challenge_id: challengeID,
                    challenge_name: challengeName,
                    challenge_category: challengeCategory,
                    challenge_difficulty: challengeDifficulty
                })
            });
            return RESP.ok;
        } catch (e: any) {
            console.error(e)
            return false;
        }
    }
}

export default F1rstbl00d;
