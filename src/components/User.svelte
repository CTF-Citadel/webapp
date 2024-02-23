<script lang="ts">
    import { onMount } from 'svelte';
    import { requestWrapper } from '../lib/helpers';
    import { Card, Spinner, Avatar } from 'flowbite-svelte';
    import type { TeamsType } from '../lib/schema';

    export let user: any = {};

    let team: TeamsType | null;
    let loading = true;

    onMount(async () => {
        await refreshUserTeam();
        loading = false;
    });

    async function refreshUserTeam() {
        const DATA = await requestWrapper(false, { type: 'team-info', data: { id: user.user_team_id } });
        const JSON = await DATA.json();
        team = JSON.data;
    }
</script>

<div class="flex flex-col 2xl:flex-row">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        <Card class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
            <div class="flex flex-col items-center p-6">
                <Avatar size="xl" src="/img/avatars/default.webp" />
                <h1 class="mt-2 text-xl font-medium text-gray-900 dark:text-white">{user.username}</h1>
                <span class="text-sm text-gray-500 dark:text-gray-400">{user.user_role}</span>
                {#if team !== null}
                    <h2 class="mt-4 font-medium text-gray-900 dark:text-white">Currently playing for:</h2>
                    <h3 class="mt-2 font-medium text-gray-900 dark:text-white">{team.team_name}</h3>
                {:else}
                    <h2 class="mt-4 font-medium text-gray-900 dark:text-white">Currently not in a Team.</h2>
                {/if}
            </div>
        </Card>
    {/if}
</div>
