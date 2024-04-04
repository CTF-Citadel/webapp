<!--
  @component
  ## Props
  @prop export let uuid: string = '';
-->

<script lang="ts">
    import { requestWrapper } from '../../../lib/helpers';
    import { onMount } from 'svelte';
    import { Card, Spinner, Avatar } from 'flowbite-svelte';

    // from parent
    export let uuid: string = '';

    let loading: boolean = true;
    let teamInfo: {
        name: string;
        description: string;
        country: string;
        members: {
            id: string;
            username: string;
            avatar: string;
        }[];
    } | null;

    onMount(async () => {
        await refreshTeamProfile();
        loading = false;
    });

    async function refreshTeamProfile() {
        const DATA = await requestWrapper(false, { type: 'team-profile', data: { teamID: uuid } });
        teamInfo = (await DATA.json()).data;
    }
</script>

<div class="flex-1 max-w-screen-2xl px-4">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else if teamInfo !== null}
        <div class="flex flex-1 flex-col h-full justify-center items-center">
            <Card
                class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
            >
                <div class="flex flex-col items-center p-6 dark:text-neutral-100 text-neutral-900">
                    <h1 class="mt-2 text-xl font-medium">
                        {teamInfo.name}<span class="ml-2 fi fi-{teamInfo.country.toLowerCase()}"></span>
                    </h1>
                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{teamInfo.description}</p>
                    <h1 class="mt-2 text-xl font-medium">Members:</h1>
                    <div class="mt-2 flex flex-1 flex-col space-y-4 justify-center">
                        {#each teamInfo.members as member}
                            <a href="/users/{member.id}">
                                <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Avatar src="/img/avatars/{member.avatar}.webp" rounded />
                                    <div class="space-y-1 font-medium">
                                        <div>{member.username}</div>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            </Card>
        </div>
    {/if}
</div>
