import { promises as fs } from 'fs';
import { getConfig } from './config';

const CONFIG = await getConfig();

export async function checkLocalPoolMatch(input: string) {
    const FILE = (await fs.readFile(`${String(CONFIG.webapp.data).replace(/\/$/, '')}/pool.txt`)).toString();
    let lines = FILE.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().includes(input)) {
            lines[i] = `# ${input}`;
            const NEW_FILE = lines.join('\n');
            await fs.writeFile(`${String(CONFIG.webapp.data)}/pool.txt`, NEW_FILE);
            return true;
        }
    }
    return false;
}
