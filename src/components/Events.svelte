<script lang="ts">
    import { Card, Button, Spinner } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    import { requestWrapper } from '../lib/helpers';
    import { onMount } from 'svelte';
    import type { EventsType } from '../lib/schema';

    export let userSession: any = {};

    let loading: boolean = true;
    let events: EventsType[] = [];

    onMount(async () => {
        await refreshEvents();
        loading = false;
    });

    async function refreshEvents() {
        const DATA = await requestWrapper(false, { type: 'events', data: { id: userSession.user_team } });
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
                img="/img/scoreboard.webp"
                class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
            >
                <div class="mb-6">
                    <p>Name: {event.event_name}</p>
                    <p>Start: {formatToDate(event.event_start)}</p>
                    <p>End: {formatToDate(event.event_end)}</p>
                </div>
                <Button class="p-0" disabled={validTimerange(event.event_start, event.event_end) != 0}>
                    {#if validTimerange(event.event_start, event.event_end) == 0}
                        <a class="p-3" href="/events/{event.id}">Challenges</a>
                        <ArrowRightOutline class="w-5 h-5 mr-2 text-white" />
                    {:else}
                        <p class="p-3">
                            {validTimerange(event.event_start, event.event_end) == 1 ? 'Upcoming' : 'Expired'}
                        </p>
                    {/if}
                </Button>
            </Card>
        {/each}
    {/if}
</div>
