<script lang="ts">
    import { Card, Button, Spinner } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    import Moon from 'flowbite-svelte-icons/MoonOutline.svelte';
    import { requestWrapper } from '../../../lib/helpers';
    import { onMount } from 'svelte';
    import type { EventsType, TeamEventsType } from '../../../lib/schema';

    export let userSession: any = {};

    let loading: boolean = true;
    let events: { events: EventsType; team_events: TeamEventsType }[] = [];

    onMount(async () => {
        await refreshEvents();
        loading = false;
    });

    async function refreshEvents() {
        const DATA = await requestWrapper(false, { type: 'team-events', data: { id: userSession.user_team_id } });
        const JSON = await DATA.json();
        events = JSON.data;
    }

    function validTimerange(from_unix: number, to_unix: number): -1 | 0 | 1 {
        const CURRENT_DATE = new Date().getTime();
        let state: -1 | 0 | 1 = 0;
        state = CURRENT_DATE >= from_unix ? state : 1;
        state = CURRENT_DATE <= to_unix ? state : -1;
        return state;
    }

    function formatToDate(unix: number): string {
        const DATE = new Date(unix);
        return DATE.toLocaleString('eu');
    }
</script>

<div class="flex flex-col 2xl:flex-row">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else if events.length > 0}
        {#each events as event}
            <Card
                img="/img/banners/04.webp"
                class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
            >
                <div class="mb-6">
                    <p>Name: {event.events.event_name}</p>
                    <p>Start: {formatToDate(event.events.event_start)}</p>
                    <p>End: {formatToDate(event.events.event_end)}</p>
                </div>
                <div class="flex flex-row space-x-4">
                    <Button
                        class="p-0"
                        disabled={validTimerange(event.events.event_start, event.events.event_end) !== 0}
                    >
                        {#if validTimerange(event.events.event_start, event.events.event_end) === 0}
                            <a class="p-3" href="/events/{event.events.id}">Challenges</a>
                            <ArrowRightOutline class="w-5 h-5 mr-2 text-white" />
                        {:else}
                            <p class="p-3">
                                {validTimerange(event.events.event_start, event.events.event_end) === 1
                                    ? 'Upcoming'
                                    : 'Expired'}
                            </p>
                        {/if}
                    </Button>
                    <Button
                        class="p-0"
                        disabled={validTimerange(event.events.event_start, event.events.event_end) !== 0}
                    >
                        <a class="p-3" href="/scores/{event.events.id}">Scoreboard</a>
                        <ArrowRightOutline class="w-5 h-5 mr-2 text-white" />
                    </Button>
                </div>
            </Card>
        {/each}
    {:else}
        <div class="text-center">
            <div>
                <Moon class="w-20 h-20 p-4 mx-auto text-neutral-900 dark:text-neutral-100" />
            </div>
            <h1 class="text-neutral-900 dark:text-neutral-100 font-bold italic">No Events found.</h1>
        </div>
    {/if}
</div>
