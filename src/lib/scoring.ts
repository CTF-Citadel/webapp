const DYN_K: number = parseInt(process.env.SCORING_K || '24');

/**
 * Adjust points based on number of solves
 * @returns Number
 */
function dynDeductor(points: number, solves: number) {
    return Math.floor(Math.max(points / 10, Number(points * Math.min(1, DYN_K / (DYN_K + solves - 1)) ** 1.2)));
}

/**
 * Dynamic Scoring adjustment function
 * @returns Adjusted Solve Data
 */
export function adjustDynamic(
    solveData: { id: string; name: string; challenge_id: string; timestamp: number; points_gained: number }[],
    challengeData: { id: string; solves: number }[]
) {
    const ACTUAL_SOLVES: { [id: string]: number } = challengeData.reduce<{ [id: string]: number }>((acc, curr) => {
        acc[curr.id] = curr.solves;
        return acc;
    }, {});
    let adjustedSolves: { id: string; name: string; timestamp: number; points_gained: number }[] = [];
    for (let entry of solveData) {
        adjustedSolves.push({
            id: entry.id,
            name: entry.name,
            timestamp: entry.timestamp,
            points_gained: dynDeductor(entry.points_gained, ACTUAL_SOLVES[entry.challenge_id])
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

/**
 * Add teams or users who have not scored yet
 * @returns Sorted and Adjusted Points
 */
export function backFillTotal(
    data: { id: string; name: string; total_points: number }[],
    backfillData: { id: string; name: string }[]
) {
    for (let entry of backfillData) {
        if (data.find((key) => key.id === entry.id) === undefined) {
            data.push({
                id: entry.id,
                name: entry.name,
                total_points: 0
            });
        }
    }
    return data;
}
