import { promises as fs } from 'fs';
import { parse as tomlparse } from 'toml';

// config formate
type CONFIG_FORMAT = {
    webapp: { [key: string]: string | number | boolean };
    email: { [key: string]: string | number | boolean };
    infra: { [key: string]: string | number | boolean };
    m0n1t0r: { [key: string]: string | number | boolean };
    f1rstbl00d: { [key: string]: string | number | boolean };
};

// config location
const CONFIG_DIR = process.env.CONFIG_DIR || '';

async function loadConfig(): Promise<CONFIG_FORMAT> {
    // empty buffer
    let raw_config: Buffer;
    // read in correct config
    try {
        raw_config = await fs.readFile(`${CONFIG_DIR.replace(/\/$/, '')}/config.toml`);
    } catch {
        try {
            raw_config = await fs.readFile(`${CONFIG_DIR.replace(/\/$/, '')}/default-config.toml`);
        } catch {
            throw Error('No valid config file found!');
        }
    }
    // parse the config
    try {
        // return the parse config
        return tomlparse(raw_config.toString());
    } catch {
        throw Error('Config not parseable!');
    }
}

/**
 * Request Config Parameters
 * @returns full configuration **!!uncensored!!**
 */
export async function getConfig() {
    return await loadConfig();
}
