<!--
  @component
  ## Props
  @prop export let uuid: string = '';
-->

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
    import type { EventsType } from '../../../lib/schema';
    import { onMount } from 'svelte';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { UserRouter } from '../../../lib/trpc/user';

    // from parent
    export let uuid: string = '';

    const CLIENT = createTRPCClient<UserRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/user'
            })
        ]
    });

    let loading: boolean = true;
    let thisEvent: EventsType | null = null;
    let teamSolves: { id: string; name: string; timestamp: number; points_gained: number }[] = [];
    let teamPoints: { id: string; name: string; avg_time: number; total_points: number }[] = [];
    let userPoints: { id: string; name: string; avg_time: number; total_points: number }[] = [];
    let seriesData: { x: number; y: number }[];
    let dataAggregator: { [key: string]: typeof seriesData } = {};
    let plotData: { name: string; data: typeof seriesData }[] = [];
    let tabs = {
        users: false,
        teams: true
    };

    onMount(async () => {
        await refreshEvent().finally(async () => {
            if (thisEvent !== null) {
                await refreshEventScoring(thisEvent.id).finally(async () => {
                    if (thisEvent !== null) {
                        prepareForPlot(thisEvent.start);
                    }
                });
            }
        });
        loading = false;
    });

    function prepareForPlot(start: number) {
        // sort and sum
        let actualSolves: { id: string; name: string; timestamp: number; points: number }[] = [];
        teamSolves.sort((a, b) => a.timestamp - b.timestamp);
        let prevPoints: { [id: string]: { points: number; name: string } } = {};
        teamSolves.forEach((entry, _) => {
            const POINTS =
                (Object.hasOwn(prevPoints, entry.id) ? prevPoints[entry.id].points : 0) + entry.points_gained;
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
        actualSolves.sort((a, b) => a.timestamp - b.timestamp);

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
            show: true,
            borderColor: '#555'
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

    async function refreshEvent() {
        thisEvent = await CLIENT.getEvent.query(uuid);
    }

    async function refreshEventScoring(id: string) {
        teamSolves = await CLIENT.getTeamSolves.query(id);
        userPoints = await CLIENT.getUserPoints.query(id);
        teamPoints = await CLIENT.getTeamPoints.query(id);
    }

    function msToHMS(unix: number) {
        let date = new Date(unix);
        let hours = date.getUTCHours();
        let minutes = date.getUTCMinutes();
        let seconds = date.getUTCSeconds();
        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
</script>

<div class="flex-1 max-w-screen-2xl px-4">
    {#if loading}
        <div class="text-center mt-10">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="bg-neutral-200 dark:bg-neutral-900 mt-10">
            <Chart bind:options></Chart>
        </div>
        <div class="my-10">
            <Tabs
                divider={false}
                defaultClass="flex flex-wrap flex-row justify-center items-center space-x-2 mb-4 border-b-2 border-neutral-300 dark:border-neutral-800"
                contentClass=""
                activeClasses="px-4 py-2 bg-neutral-300 dark:bg-neutral-800 font-bold text-primary-200"
                inactiveClasses="px-4 py-2 bg-neutral-300 dark:bg-neutral-800 text-neutral-500"
            >
                <TabItem title="Teams" bind:open={tabs.teams}>
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                        hoverable
                    >
                        <TableHead>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Points</TableHeadCell>
                            <TableHeadCell>Average TTS</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each teamPoints as entry}
                                <TableBodyRow
                                    color="custom"
                                    class="hover:bg-neutral-500"
                                    on:click={() => {
                                        window.location.href = `/teams/${entry.id}`;
                                    }}
                                >
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.name}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.total_points}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {msToHMS(entry.avg_time)}
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                </TabItem>
                <TabItem title="Users" bind:open={tabs.users}>
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                        hoverable
                    >
                        <TableHead>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Points</TableHeadCell>
                            <TableHeadCell>Average TTS</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each userPoints as entry}
                                <TableBodyRow
                                    color="custom"
                                    class="hover:bg-neutral-500"
                                    on:click={() => {
                                        window.location.href = `/users/${entry.id}`;
                                    }}
                                >
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.name}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.total_points}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {msToHMS(entry.avg_time)}
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
