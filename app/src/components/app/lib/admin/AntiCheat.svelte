<!--
  @component
  @prop export let teams: TeamsType[] = [];
-->

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Spinner, Input, Button, Label, Alert, Card } from 'flowbite-svelte';
    import type { TeamsType } from '../../../../lib/schema';
    import { createEventDispatcher } from 'svelte';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { AdminRouter } from '../../../../lib/trpc/admin';

    // from parent
    export let teams: TeamsType[] = [];

    // dispatcher
    const DISPATCH = createEventDispatcher();
    const CLIENT = createTRPCClient<AdminRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/admin'
            })
        ]
    });

    let loading: boolean = true;
    let rawData: { team_id: string; suspicion_lvl: 1 | 2 | 3; marks: { flag_share_team: string; reason: string }[] }[] =
        [];
    let rawPoison: string[] = [];
    let newPoison: string = '';
    let refreshTimeout: NodeJS.Timeout;

    onMount(async () => {
        await refreshAntiCheatEvents();
        await refreshPoisoned();
        loading = false;
        refreshTimeout = setInterval(async () => {
            await refreshAntiCheatEvents();
        }, 5000);
    });

    onDestroy(() => {
        clearInterval(refreshTimeout);
    });

    async function refreshAntiCheatEvents() {
        rawData = await CLIENT.getAntiCheatEvents.query();
    }

    async function refreshPoisoned() {
        rawPoison = await CLIENT.getAntiCheatPoisons.query();
    }

    async function newPoisoned() {
        const DATA = await CLIENT.createAntiCheatPoison.mutate([ newPoison ]);
        if (DATA === true) {
            loading = true;
            await refreshPoisoned();
            DISPATCH('refresh');
            loading = false;
        }
    }
</script>

<div class="p-4 max-w-full">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
            <span class="italic text-neutral-500 opacity-50">#</span>
            ANTI CHEAT
        </h1>
        <Card
            size="lg"
            class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
        >
            <div class="flex flex-1 flex-col justify-center space-y-4">
                <div class="flex-1 text-center text-neutral-900 dark:text-neutral-100">
                    <h1 class="text-lg font-bold mb-6">Actions</h1>
                    <div class="mb-6">
                        <Label for="flag-poison" class="mb-2">Poisoned Flag</Label>
                        <Input
                            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                            bind:value={newPoison}
                            name="flag-poison"
                            type="text"
                            placeholder="s0m3-fl4g"
                        />
                    </div>
                    <Button on:click={newPoisoned} disabled={newPoison === ''}>Create</Button>
                </div>
                <div class="flex-1 text-center text-neutral-900 dark:text-neutral-100">
                    <h1 class="text-lg font-bold mb-6">Active Poisons</h1>
                    {#if rawPoison.length > 0}
                        {#each rawPoison as event}
                            <Alert class="m-4" color="gray">
                                <span>
                                    <span class="font-bold">{event}</span>
                                </span>
                            </Alert>
                        {/each}
                    {:else}
                        <Alert class="m-4" color="blue">
                            <span>
                                <span class="font-bold">Info!</span><br />
                                No Poisons active
                            </span>
                        </Alert>
                    {/if}
                </div>
                <div class="flex-1 text-center text-neutral-900 dark:text-neutral-100">
                    <h1 class="text-lg font-bold mb-6">Events</h1>
                    {#if rawData.length > 0}
                        {#each rawData as event}
                            <Alert
                                border
                                class="m-4"
                                color={event.suspicion_lvl === 1
                                    ? 'orange'
                                    : event.suspicion_lvl === 2
                                      ? 'yellow'
                                      : 'red'}
                            >
                                <span>
                                    <span class="font-bold"
                                        >{teams.find((entry) => entry.id === event.team_id) !== undefined
                                            ? teams.find((entry) => entry.id === event.team_id)?.name
                                            : event.team_id}</span
                                    ><br />
                                    Marks: {event.marks.length}
                                    {#each [...new Set(event.marks.map((item) => {
                                                return { reason: item.reason, team: item.flag_share_team || '' };
                                            }))] as mark}
                                        <div>
                                            {mark.reason}
                                            {teams.find((entry) => entry.id === mark.team) !== undefined
                                                ? teams.find((entry) => entry.id === mark.team)?.name
                                                : mark.team}
                                        </div>
                                    {/each}
                                </span>
                            </Alert>
                        {/each}
                    {:else}
                        <Alert class="m-4" color="blue">
                            <span>
                                <span class="font-bold">Info!</span><br />
                                No Events received
                            </span>
                        </Alert>
                    {/if}
                </div>
            </div>
        </Card>
    {/if}
</div>
