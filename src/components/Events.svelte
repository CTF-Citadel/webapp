<script lang="ts">
    import { Card, Button, Spinner } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    import { requestWrapper } from '../lib/helpers';
    import { onMount } from 'svelte';

    export let userSession: any = {};

    let loading: boolean = true;
    let events: any[] = [];

    onMount(async () => {
        await refreshEvents();
        loading = false;
    });

    async function refreshEvents() {
        const DATA = await requestWrapper(false, { type: 'events', data: { id: userSession.user_team } });
        const JSON = await DATA.json();
        events = JSON.data;
    }
</script>

<div class="flex flex-col 2xl:flex-row">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        {#if events.length > 0}
            {#each events as event}
                <Card img="/img/scoreboard.webp" class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
                    <a href="/events/{event.id}">
                        <Button>
                            {event.event_name} <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
                        </Button>
                    </a>
                </Card>
            {/each}
        {/if}
    {/if}
</div>
