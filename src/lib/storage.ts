import { promises as fs } from 'fs';

const PATH = process.env.DATA_FOLDER || '';

export async function checkLocalPoolMatch(input: string) {
    const FILE = (await fs.readFile(`${PATH.replace(/\/$/, '')}/pool.txt`)).toString();
    let lines = FILE.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().includes(input)) {
            lines[i] = `# ${input}`;
            const NEW_FILE = lines.join('\n');
            await fs.writeFile(`${PATH}/pool.txt`, NEW_FILE);
            return true;
        }
    }
    return false;
}
