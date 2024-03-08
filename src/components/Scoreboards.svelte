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
    import { requestWrapper } from '../lib/helpers';
    import type { EventsType } from '../lib/schema';
    import { onMount } from 'svelte';

    let loading: boolean = true;
    let events: EventsType[] = [];
    let teamScores: { id: string; name: string; points: number }[] = [];
    let userScores: { id: string; name: string; points: number }[] = [];
    let tabs = {
        users: false,
        teams: true
    };

    onMount(async () => {
        await refreshEvents();
        loading = false;
    });

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

    let points = [
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

    let seriesData: { x: number; y: number }[];
    let dataAggregator: { [key: string]: typeof seriesData } = {};
    let plotData: { name: string; data: typeof seriesData }[] = [];

    for (let entry of points) {
        if (entry.name in dataAggregator) {
            let currentData = dataAggregator[entry.name];
            currentData.push({
                x: entry.timestamp,
                y: entry.points_gained
            });
            dataAggregator[entry.name] = currentData;
        } else {
            dataAggregator[entry.name] = [
                {
                    x: entry.timestamp,
                    y: entry.points_gained
                }
            ];
        }
    }

    for (const [key, value] of Object.entries(dataAggregator)) {
        plotData.push({
            name: key,
            data: value
        });
    }

    let options: ApexCharts.ApexOptions = {
        series: plotData,
        chart: {
            height: 400,
            type: 'line',
            dropShadow: {
                enabled: false
            },
            toolbar: {
                show: false
            }
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
                colors: '#000'
            }
        },
        tooltip: {
            enabled: true
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            title: {
                text: 'Score',
                style: {
                    color: '#000'
                }
            },
            min: 0
        },
        theme: {
            mode: 'light'
        }
    };

    async function refreshEvents() {
        const DATA = await requestWrapper(false, { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
    }

    async function refreshTimeScores() {
        const DATA = await requestWrapper(false, { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
    }

    async function refreshScores() {
        const DATA = await requestWrapper(false, { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
    }
</script>

<div style="width: 80%;">
    {#if loading}
        <div class="text-center mt-10">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="bg-neutral-100 mt-10">
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
