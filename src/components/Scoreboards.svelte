<script>
    import Chart from 'flowbite-svelte/Chart.svelte';
    import Button from 'flowbite-svelte/Button.svelte';
    import FileLinesSolid from 'flowbite-svelte-icons/FileLinesSolid.svelte';
    import { onMount } from 'svelte';

    let uhrzeit = [
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00'
    ];

    let teams = [
        {
            name: 'Team A',
            data: [0, 200, 400, 500, 600, 700],
            color: '#ffff00'
        },
        {
            name: 'Team B',
            data: [0, 250, 350, 550, 650, 750],
            color: '#ff00ff'
        },
        {
            name: 'Team C',
            data: [0, 200, 250, 300, 400, 500],
            color: '#6600ff'
        },
        {
            name: 'Team D',
            data: [0, 200, 300, 320, 420, 520],
            color: '#00ffff'
        }
    ];

    let leader = [];
    onMount(() => {
        //Sorts for the Ranking
        leader = teams.sort((a, b) => b.data[b.data.length - 1] - a.data[a.data.length - 1]);
    });

    let options = {
        chart: {
            height: '100%',
            maxWidth: '100%',
            type: 'line',
            fontFamily: 'Inter, sans-serif',
            dropShadow: {
                enabled: true
            },
            toolbar: {
                show: false
            }
        },
        tooltip: {
            enabled: true,
            x: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 3
            //curve: 'smooth'
        },
        grid: {
            show: true,
            strokeDashArray: 4,
            padding: {
                left: 5,
                right: 2,
                top: -26
            }
        },
        series: teams,
        legend: {
            show: true
        },
        xaxis: {
            categories: uhrzeit,
            labels: {
                show: true,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                }
            },
            axisBorder: {
                show: true
            },
            axisTicks: {
                show: true
            }
        },
        yaxis: {
            show: true
        }
    };

    async function handleReportDownload() {
        //CHANGEME FOR lATER
        console.log('Output');
    }
</script>

<div style="width: 80%;">
    <div class="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
        <h1 class=" text-gray-800 font-bold">Scoreboard</h1>
    </div>

    <Chart {options} />
    <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-2.5">
        <div class="pt-5">
            <Button
                on:click={() => {
                    handleReportDownload();
                }}
                class="px-4 py-2.5 text-sm font-medium text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
                <FileLinesSolid class="w-3.5 h-3.5 text-white mr-2" />
                View full report
            </Button>
        </div>
    </div>

    <div class="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
        <h1 class=" text-gray-800 font-bold">Leaderboard</h1>
    </div>
    {#if leader}
        {#each leader as lead, index}
            <div style="margin-bottom: 2rem;">
                <h1>{index + 1}'s Team</h1>
                <div>Team Name: {lead.name}</div>
                <div>Team Points: {lead.data[lead.data.length - 1]}</div>
            </div>
        {/each}
    {/if}
</div>
