<!--
  @component
  ## Props
  @prop export let session: any = {};
-->

<script lang="ts">
    import Admin from '../lib/Admin.svelte';
    import { onMount } from 'svelte';
    import { requestWrapper } from '../../../lib/helpers';
    import { Card, Spinner, Avatar } from 'flowbite-svelte';
    import type { TeamsType } from '../../../lib/schema';

    export let session: any = {};

    let team: TeamsType | null;
    let loading = true;

    onMount(async () => {
        await refreshUserTeam();
        loading = false;
    });

    async function refreshUserTeam() {
        const DATA = await requestWrapper(false, { type: 'team-info', data: { id: session.user_team_id } });
        const JSON = await DATA.json();
        team = JSON.data;
    }
</script>

<div class="flex flex-col flex-grow flex-1 max-w-screen-2xl px-4">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="flex flex-col items-center">
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                PROFILE
            </h1>
            <Card
                class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
            >
                <div class="flex flex-col items-center p-6">
                    <Avatar size="xl" src="/img/avatars/wolf.webp" />
                    <h1 class="mt-2 text-xl font-medium text-gray-900 dark:text-white">{session.username}</h1>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{session.user_role}</span>
                    {#if team !== null}
                        <h2 class="mt-4 font-medium text-gray-900 dark:text-white">Currently playing for:</h2>
                        <h3 class="mt-2 font-medium text-gray-900 dark:text-white">{team.team_name}</h3>
                    {:else}
                        <h2 class="mt-4 font-medium text-gray-900 dark:text-white">Currently not in a Team.</h2>
                    {/if}
                </div>
            </Card>
        </div>
        {#if session.user_role === 'admin'}
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                SETTINGS
            </h1>
            <div class="flex flex-col flex-1 items-center">
                <Admin />
            </div>
        {/if}
    {/if}
</div>
