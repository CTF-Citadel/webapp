<!--
  @component
-->

<script lang="ts">
    import { Card, Button, Spinner } from 'flowbite-svelte';
    import Moon from 'flowbite-svelte-icons/MoonOutline.svelte';
    import { onMount } from 'svelte';
    import type { EventsType, TeamEventsType } from '../../../lib/schema';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { UserRouter } from '../../../lib/trpc/user';

    let loading: boolean = true;
    let events: { events: EventsType; team_events: TeamEventsType }[] = [];

    const CLIENT = createTRPCClient<UserRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/user'
            })
        ]
    });

    onMount(async () => {
        await refreshEvents();
        loading = false;
    });

    async function refreshEvents() {
        events = await CLIENT.getTeamEvents.query();
    }

    function hasStarted(from_unix: number): boolean {
        const CURRENT_DATE = new Date().getTime();
        return CURRENT_DATE > from_unix ? true : false;
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

<div class="flex flex-col 2xl:flex-row max-w-screen-2xl px-4">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else if events.length > 0}
        <div class="flex flex-1 flex-col lg:flex-row">
            {#each events as event}
                <Card
                    img="/img/banners/04.webp"
                    class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <div class="mb-6 text-center">
                        <h1 class="text-lg font-bold">{event.events.name}</h1>
                        <p class="whitespace-pre-wrap">{event.events.description}</p>
                        <p>{formatToDate(event.events.start)} - {formatToDate(event.events.end)}</p>
                    </div>
                    <div class="flex flex-row justify-center space-x-4">
                        <Button class="p-0" disabled={validTimerange(event.events.start, event.events.end) !== 0}>
                            {#if validTimerange(event.events.start, event.events.end) === 0}
                                <a class="p-3" href="/events/{event.events.id}">Challenges</a>
                            {:else}
                                <p class="p-3">
                                    {validTimerange(event.events.start, event.events.end) === 1
                                        ? 'Upcoming'
                                        : 'Expired'}
                                </p>
                            {/if}
                        </Button>
                        <Button class="p-0" disabled={!hasStarted(event.events.start)}>
                            <a class="p-3" href="/scores/{event.events.id}">Scoreboard</a>
                        </Button>
                    </div>
                </Card>
            {/each}
        </div>
    {:else}
        <div class="text-center">
            <div>
                <Moon class="w-20 h-20 p-4 mx-auto text-neutral-900 dark:text-neutral-100" />
            </div>
            <h1 class="text-neutral-900 dark:text-neutral-100 font-bold italic">No Events found.</h1>
        </div>
    {/if}
</div>
