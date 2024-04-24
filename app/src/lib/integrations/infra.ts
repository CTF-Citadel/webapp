import { getConfig } from '../config';

const CONFIG = await getConfig();

class Infra {
    #DOMAIN: string;
    #INFRA_URL: string;
    #INFRA_HEADERS: { [key: string]: string };
    constructor() {
        this.#DOMAIN = String(CONFIG.infra.host);
        this.#INFRA_URL = `https://${this.#DOMAIN}`;
        this.#INFRA_HEADERS = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${String(CONFIG.infra.psk)}`
        };
    }

    /**
     * #### Infallible ####
     * Request a new container deployment
     * @returns Deployed data if success, False if not
     */
    async deploy(name: string, flag: string): Promise<{ id: string; flag: string; host: string } | false> {
        try {
            const RESP = await fetch(`${this.#INFRA_URL}/challenge`, {
                method: 'POST',
                headers: this.#INFRA_HEADERS,
                body: JSON.stringify({
                    challenge: name,
                    environment_variables: JSON.stringify({
                        FLAG: flag
                    })
                }),
                signal: AbortSignal.timeout(120000)
            });
            if (RESP.ok === true) {
                const DATA = await RESP.json();
                return {
                    id: DATA.instance_id,
                    flag: DATA.details.FLAG,
                    host: `${DATA.instance_id}.${this.#DOMAIN}`
                };
            }
            return false;
        } catch (e: any) {
            console.error(e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Request a container shutdown
     * @returns True if success, False if not
     */
    async shutdown(id: string): Promise<Boolean> {
        try {
            const RESP = await fetch(`${this.#INFRA_URL}/container?container_id=${id}`, {
                method: 'DELETE',
                headers: this.#INFRA_HEADERS,
                signal: AbortSignal.timeout(20000)
            });
            return RESP.ok;
        } catch (e: any) {
            console.error(e);
            return false;
        }
    }

    /**
     * #### Infallible ####
     * Request a container shutdown
     * @returns 'healthy' if running, false if not
     */
    async status(id: string): Promise<'healthy' | false> {
        try {
            const RESP = await fetch(`${this.#INFRA_URL}/container?container_id=${id}`, {
                method: 'GET',
                headers: this.#INFRA_HEADERS,
                signal: AbortSignal.timeout(20000)
            });
            return RESP.ok === true ? 'healthy' : false;
        } catch (e: any) {
            console.error(e);
            return false;
        }
    }
}

export default Infra;
