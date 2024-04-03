const DYN_E: number = parseFloat(process.env.SCORING_E || '1.2');
const DYN_K: number = parseInt(process.env.SCORING_K || '12');

/**
 * Adjust points based on number of solves
 * @returns Number
 */
function dynDeductor(points: number, solves: number) {
    return Math.max(points / 10, Number(points * Math.min(1, DYN_K / (DYN_K + solves - 1)) ** DYN_E));
}

/**
 * Dynamic Scoring adjustment function
 * @returns Adjusted Solve Data
 */
export function adjustDynamic(
    solveData: { id: string | null; name: string | null; challenge_id: string | null; timestamp: number | null; points_gained: number | null }[],
    challengeData: { id: string; solves: number }[]
) {
    const ACTUAL_SOLVES: { [id: string]: number } = challengeData.reduce<{ [id: string]: number }>((acc, curr) => {
        acc[curr.id] = curr.solves;
        return acc;
    }, {});
    let adjustedSolves: { id: string; name: string; timestamp: number; points_gained: number }[] = [];
    for (let entry of solveData) {
        adjustedSolves.push({
            id: entry.id || '',
            name: entry.name || '',
            timestamp: entry.timestamp || 0,
            points_gained: dynDeductor(entry.points_gained || 0, ACTUAL_SOLVES[entry.challenge_id || ''])
        });
    }
    return adjustedSolves;
}

/**
 * All up points aggregator
 * @returns Sorted and Adjusted Points
 */
export function getTotalByName(data: { id: string; name: string; timestamp: number; points_gained: number }[]) {
    const DATA = data.reduce<{ id: string; name: string; total_points: number }[]>((acc, curr) => {
        const { id, name, points_gained } = curr;
        const existingEntry = acc.find((entry) => entry.id === id && entry.name === name);
        if (existingEntry) {
            existingEntry.total_points += points_gained;
        } else {
            acc.push({ id, name, total_points: points_gained });
        }
        return acc;
    }, []);
    return DATA.sort((a, b) => b.total_points - a.total_points);
}
