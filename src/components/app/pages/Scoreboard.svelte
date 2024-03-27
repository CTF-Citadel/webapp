<script lang="ts">
    import {
        Tabs,
        TabItem,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Spinner
    } from 'flowbite-svelte';
    import Chart from 'flowbite-svelte/Chart.svelte';
    import type ApexCharts from 'apexcharts';
    import { requestWrapper } from '../../../lib/helpers';
    import type { EventsType } from '../../../lib/schema';
    import { onMount } from 'svelte';

    let loading: boolean = true;
    let events: EventsType[] = [];
    let sortedEvents: { value: EventsType, name: string }[];
    let teamSolves: { id: string; name: string; timestamp: number; points_gained: number; }[] = [];
    let teamScores: { id: string; name: string; points: number }[] = [];
    let userScores: { id: string; name: string; points: number }[] = [];
    let seriesData: { x: number; y: number }[];
    let dataAggregator: { [key: string]: typeof seriesData } = {};
    let plotData: { name: string; data: typeof seriesData }[] = [];
    let tabs = {
        users: false,
        teams: true
    };

    onMount(async () => {
        await refreshEvents().finally(async () => {
            console.log(events);
            await refreshEventScoring(sortedEvents[0].value.id).finally(async () => {
                prepareForPlot(sortedEvents[0].value.event_start);
            });
        });
        
        loading = false;
    });

    // BEGIN TEMP DATA
    /*
    teamScores = [
        {
            id: 'some-id-3',
            name: 'Team3',
            points: 1000
        },
        {
            id: 'some-id-2',
            name: 'Team2',
            points: 500
        },
        {
            id: 'some-id-1',
            name: 'Team1',
            points: 250
        }
    ];

    userScores = [
        {
            id: 'some-id-2',
            name: 'User2',
            points: 1000
        },
        {
            id: 'some-id-1',
            name: 'User1',
            points: 500
        },
        {
            id: 'some-id-3',
            name: 'User3',
            points: 250
        }
    ];

    teamSolves = [
        {
            id: 'some-id-1',
            name: 'Team1',
            timestamp: Date.now() + 3600000,
            points_gained: 250
        },
        {
            id: 'some-id-1',
            name: 'Team1',
            timestamp: Date.now() + 3600000 * 2,
            points_gained: 500
        },
        {
            id: 'some-id-1',
            name: 'Team1',
            timestamp: Date.now() + 3600000 * 3,
            points_gained: 1000
        },
        {
            id: 'some-id-2',
            name: 'Team2',
            timestamp: Date.now() + 3600000,
            points_gained: 1000
        },
        {
            id: 'some-id-2',
            name: 'Team2',
            timestamp: Date.now() + 3600000 * 2,
            points_gained: 250
        },
        {
            id: 'some-id-2',
            name: 'Team2',
            timestamp: Date.now() + 3600000 * 3,
            points_gained: 500
        },
        {
            id: 'some-id-3',
            name: 'Team3',
            timestamp: Date.now() + 3600000,
            points_gained: 500
        },
        {
            id: 'some-id-3',
            name: 'Team3',
            timestamp: Date.now() + 3600000 * 2,
            points_gained: 1000
        },
        {
            id: 'some-id-3',
            name: 'Team3',
            timestamp: Date.now() + 3600000 * 3,
            points_gained: 250
        }
    ];
    */
    // END TEMP DATA

    function prepareForPlot(start: number) {
        // sort and sum
        let actualSolves: { id: string; name: string; timestamp: number; points: number; }[] = [];
        teamSolves.sort((a, b) => a.timestamp - b.timestamp)
        let prevPoints: { [id: string]: { points: number; name: string; } } = {};
        teamSolves.forEach((entry, _) => {
            const POINTS = (Object.hasOwn(prevPoints, entry.id) ? prevPoints[entry.id].points : 0) + entry.points_gained;
            actualSolves.push({
                id: entry.id,
                name: entry.name,
                timestamp: entry.timestamp,
                points: POINTS
            });
            prevPoints[entry.id] = { points: POINTS, name: entry.name };
        });
        // append zero because yes
        for (const [key, value] of Object.entries(prevPoints)) {
            actualSolves.push({
                id: key,
                name: value.name,
                timestamp: start,
                points: 0
            });
        }
        actualSolves.sort((a, b) => a.timestamp - b.timestamp)

        // first aggregate Scores by entity
        for (let entry of actualSolves) {
            if (entry.name in dataAggregator) {
                let currentData = dataAggregator[entry.name];
                currentData.push({
                    x: entry.timestamp,
                    y: entry.points
                });
                dataAggregator[entry.name] = currentData;
            } else {
                dataAggregator[entry.name] = [
                    {
                        x: entry.timestamp,
                        y: entry.points
                    }
                ];
            }
        }

        // then push to plotData
        for (const [key, value] of Object.entries(dataAggregator)) {
            plotData.push({
                name: key,
                data: value
            });
        }
    }

    let options: ApexCharts.ApexOptions = {
        series: plotData,
        chart: {
            animations: {
                enabled: true,
                easing: 'easein',
                speed: 150,
                animateGradually: {
                    enabled: false
                },
                dynamicAnimation: {
                    enabled: false
                }
            },
            height: 400,
            type: 'line',
            dropShadow: {
                enabled: false
            },
            toolbar: {
                show: false
            },
            background: '#00000000'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        grid: {
            show: true
        },
        legend: {
            show: true,
            labels: {
                colors: '#555'
            }
        },
        tooltip: {
            enabled: true
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#555'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Score',
                style: {
                    color: '#555'
                }
            },
            min: 0,
            labels: {
                style: {
                    colors: '#555'
                }
            }
        },
        theme: {
            mode: 'light'
        }
    };

    async function refreshEvents() {
        const EVENTS = await requestWrapper(false, { type: 'events' });
        events = (await EVENTS.json()).data;
        sortedEvents = [];
        events.forEach((element) => {
            sortedEvents.push({ value: element, name: element.event_name });
        });
    }

    async function refreshEventScoring(id: string) {
        const SOLVES = await requestWrapper(false, { type: 'event-solves', data: { eventID: id } });
        teamSolves = (await SOLVES.json()).data;
        console.log(teamSolves)

        const USER = await requestWrapper(false, { type: 'user-scores', data: { eventID: id } });
        userScores = (await USER.json()).data;
        console.log(userScores)

        const TEAM = await requestWrapper(false, { type: 'team-scores', data: { eventID: id } });
        teamScores = (await TEAM.json()).data;
        console.log(teamScores)
    }
</script>

<div style="width: 80%;">
    {#if loading}
        <div class="text-center mt-10">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="bg-neutral-100 dark:bg-neutral-900 mt-10">
            <Chart bind:options></Chart>
        </div>
        <div class="my-10">
            <Tabs
                contentClass=""
                activeClasses="p-4 text-primary-600 bg-gray-100 dark:bg-gray-800 dark:text-primary-500"
                inactiveClasses="p-4 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
                <TabItem title="Teams" bind:open={tabs.teams}>
                    <Table>
                        <TableHead>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Points</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each teamScores as entry}
                                <TableBodyRow color="custom">
                                    <TableBodyCell>
                                        {entry.name}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.points}
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                </TabItem>
                <TabItem title="Users" bind:open={tabs.users}>
                    <Table>
                        <TableHead>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Points</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each userScores as entry}
                                <TableBodyRow color="custom">
                                    <TableBodyCell>
                                        {entry.name}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.points}
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                </TabItem>
            </Tabs>
        </div>
    {/if}
</div>
