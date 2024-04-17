<!--
  @component
  ## Props
  @prop export let uuid: string = '';
-->

<script lang="ts">
    import { requestWrapper } from '../../../lib/helpers';
    import { onMount } from 'svelte';
    import { Card, Avatar, Spinner } from 'flowbite-svelte';

    // from parent
    export let uuid: string = '';

    let loading: boolean = true;
    let userInfo: {
        username: string;
        avatar: string;
        affiliation: string;
        role: string;
        team_id: string;
        team_name: string;
        team_country: string;
    } | null;

    onMount(async () => {
        await refreshUserProfile();
        loading = false;
    });

    async function refreshUserProfile() {
        const DATA = await requestWrapper(false, { type: 'user-profile', data: { userID: uuid } });
        userInfo = (await DATA.json()).data;
    }
</script>

<div class="flex-1 max-w-screen-2xl px-4">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else if userInfo !== null}
        <div class="flex flex-1 flex-col h-full justify-center items-center">
            <Card
                class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
            >
                <div class="flex flex-col items-center p-6 dark:text-neutral-100 text-neutral-900">
                    <Avatar size="xl" src="/img/avatars/{userInfo.avatar}.webp" />
                    <h1 class="mt-2 text-xl font-medium">{userInfo.username}</h1>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{userInfo.role}</span>
                    {#if userInfo.team_id !== ''}
                        <h2 class="mt-4 font-medium">Currently playing for:</h2>
                        <a href="/teams/{userInfo.team_id}">
                            <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                                {userInfo.team_name}<span class="ml-2 fi fi-{userInfo.team_country.toLowerCase()}"
                                ></span>
                            </p>
                        </a>
                    {:else}
                        <h2 class="mt-4 font-medium">Currently not in a Team.</h2>
                    {/if}
                </div>
            </Card>
        </div>
    {/if}
</div>
