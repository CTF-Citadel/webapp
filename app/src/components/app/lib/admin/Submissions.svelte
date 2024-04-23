<!--
  @component
  ## Props
  @prop export let edit: boolean = false;
  @prop export let team_challenges: TeamChallengesType[] = [];
  @prop export let editUUID: string = '';
-->

<script lang="ts">
    import { Button, Modal, Label, Input } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import type { TeamChallengesType, ChallengesType, TeamsType } from '../../../../lib/schema';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { AdminRouter } from '../../../../lib/trpc/admin';

    export let edit: boolean = false;
    export let teamChallenges: { team_challenges: TeamChallengesType; teams: TeamsType; challenges: ChallengesType }[] =
        [];
    export let editUUID: string = '';

    // dispatcher
    const DISPATCH = createEventDispatcher();
    const CLIENT = createTRPCClient<AdminRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/admin'
            })
        ]
    });

    $: editData = teamChallenges.find(
        (item) =>
            `${item.team_challenges.challenge_id}/${item.team_challenges.team_id}/${item.team_challenges.event_id}` ===
            editUUID
    );

    async function updateSubmission() {
        if (editData !== undefined) {
            const DATA = await CLIENT.updateSubmission.mutate({
                challengeId: editUUID.split('/')[0],
                teamId: editUUID.split('/')[1],
                eventId: editUUID.split('/')[2],
                containerId: editData?.team_challenges.container_id,
                containerHost: editData?.team_challenges.container_host,
                containerFlag: editData?.team_challenges.container_flag
            })
            if (DATA === true) {
                edit = false;
                DISPATCH('refresh');
            }
        }
    }

    async function deleteSubmission() {
        const DATA = await CLIENT.deleteSubmission.mutate({
            challengeId: editUUID.split('/')[0],
            teamId: editUUID.split('/')[1],
            eventId: editUUID.split('/')[2]
        })
        if (DATA === true) {
            edit = false;
            DISPATCH('refresh');
        }
    }
</script>

<!--
    Edit Popups
-->

{#if editData !== undefined}
    <Modal
        dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
        defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
        color="none"
        outsideclose
        bind:open={edit}
        title="Edit Team Submission"
    >
        <div class="mb-6">
            <Label for="event_name" class="mb-2">Change Container ID</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_name"
                placeholder="name"
                bind:value={editData.team_challenges.container_id}
            />
        </div>
        <div class="mb-6">
            <Label for="event_name" class="mb-2">Change Container Host</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_name"
                placeholder="name"
                bind:value={editData.team_challenges.container_host}
            />
        </div>
        <div class="mb-6">
            <Label for="event_name" class="mb-2">Change Container Flag</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_name"
                placeholder="name"
                bind:value={editData.team_challenges.container_flag}
            />
        </div>
        <svelte:fragment slot="footer">
            <div class="flex flex-row justify-between w-full">
                <div>
                    <Button on:click={updateSubmission}>Update</Button>
                    <Button
                        on:click={() => {
                            edit = false;
                        }}
                        color="alternative">Cancel</Button
                    >
                </div>
                <Button on:click={deleteSubmission} color="red"><TrashBinOutline class="w-4" /></Button>
            </div>
        </svelte:fragment>
    </Modal>
{/if}
