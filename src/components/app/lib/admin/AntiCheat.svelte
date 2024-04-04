<!--
  @component
-->

<script lang="ts">
    import { onMount } from 'svelte';
    import { Spinner, Input, Button, Label, Alert, Card } from 'flowbite-svelte';
    import { requestWrapper } from '../../../../lib/helpers';

    let loading: boolean = true;
    let rawData: { team_id: string; suspicion_lvl: 1 | 2 | 3; marks: { flag_share_team: string; reason: string }[] }[] =
        [];
    let rawPoison: string[] = [];
    let newPoison: string = '';

    onMount(async () => {
        await refreshAntiCheatEvents();
        await refreshPoisoned();
        loading = false;
    });

    async function refreshAntiCheatEvents() {
        const DATA = await requestWrapper(true, { type: 'get-ac-events' });
        rawData = (await DATA.json()).data;
    }

    async function refreshPoisoned() {
        const DATA = await requestWrapper(true, { type: 'get-ac-poisoned' });
        rawPoison = (await DATA.json()).data;
    }

    async function newPoisoned() {
        const DATA = await requestWrapper(true, {
            type: 'create-ac-poisoned',
            data: {
                flags: [newPoison]
            }
        });
        if (DATA.ok) {
            loading = true;
            await refreshPoisoned();
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
                <div class="flex-1 text-center">
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
                <div class="flex-1 text-center">
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
                <div class="flex-1 text-center">
                    <h1 class="text-lg font-bold mb-6">Events</h1>
                    {#if rawData.length > 0}
                        {#each rawData as event}
                            <Alert border class="m-4" color="{event.suspicion_lvl === 1 ? 'orange'  : event.suspicion_lvl === 2 ? 'yellow' : 'red' }">
                                <span>
                                    <span class="font-bold">{event.team_id}</span><br />
                                    Marks: {event.marks.length}
                                    {#each event.marks as mark}
                                        <div id="mark-{btoa(mark.reason)}">{mark.reason}</div>
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
