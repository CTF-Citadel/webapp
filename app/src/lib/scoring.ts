import { getConfig } from "./config";

const CONFIG = await getConfig();

/**
 * Adjust points based on number of solves
 * @returns Number
 */
function dynDeductor(points: number, solves: number) {
    return Math.floor(Math.max(points / 10, Number(points * Math.min(1, Number(CONFIG.webapp.dynamic_k) / (Number(CONFIG.webapp.dynamic_k) + solves - 1)) ** Number(CONFIG.webapp.dynamic_p))));
}

/**
 * Get average of number array
 * @returns Average Number
 */
function calculateAverage(numbers: number[]) {
    if (numbers.length === 0) return 0;
    let sum = 0;
    for (var i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    return sum / numbers.length;
}

/**
 * Get Average time of solves
 * @returns Adjusted Solve Data
 */
function getAvgTime(data: { id: string; name: string; timestamp: number; points_gained: number }[], start: number) {
    let temp: { id: string; name: string; avg_time: number; points_gained: number }[] = [];
    for (let entry of data) {
        const DATA = data
            .filter((key) => key.id === entry.id)
            .map((key) => {
                return key.timestamp - start;
            });
        const AVG = calculateAverage(DATA);
        temp.push({
            id: entry.id,
            name: entry.name,
            avg_time: AVG,
            points_gained: entry.points_gained
        })
    }
    return temp;
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
export function getTotalByName(
    data: { id: string; name: string; timestamp: number; points_gained: number }[],
    start: number
) {
    const TIME_ADJUSTED = getAvgTime(data, start);
    const DATA = TIME_ADJUSTED.reduce<{ id: string; name: string; avg_time: number; total_points: number }[]>((acc, curr) => {
        const { id, name, avg_time, points_gained } = curr;
        const existingEntry = acc.find((entry) => entry.id === id && entry.name === name);
        if (existingEntry) {
            existingEntry.total_points += points_gained;
        } else {
            acc.push({ id, name, avg_time, total_points: points_gained });
        }
        return acc;
    }, []);
    return DATA.sort((a, b) => b.total_points !== a.total_points ? b.total_points - a.total_points : a.avg_time - b.avg_time );
}

/**
 * Add teams or users who have not scored yet
 * @returns Sorted and Adjusted Points
 */
export function backFillTotal(
    data: { id: string; name: string; avg_time: number; total_points: number }[],
    backfillData: { id: string; name: string }[]
) {
    for (let entry of backfillData) {
        if (data.find((key) => key.id === entry.id) === undefined) {
            data.push({
                id: entry.id,
                name: entry.name,
                avg_time: 0,
                total_points: 0
            });
        }
    }
    return data;
}
