<!--
  @component
  ## Props
  @prop export let edit: boolean = false;
  @prop export let team_challenges: TeamChallengesType[] = [];
  @prop export let editUUID: string = '';
-->

<script lang="ts">
    import { requestWrapper } from '../../../../lib/helpers';
    import { Button, Modal, Label, Input } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import type { TeamChallengesType, ChallengesType, TeamsType } from '../../../../lib/schema';

    export let edit: boolean = false;
    export let teamChallenges: { team_challenges: TeamChallengesType; teams: TeamsType; challenges: ChallengesType }[] =
        [];
    export let editUUID: string = '';

    // dispatcher
    const DISPATCH = createEventDispatcher();

    $: editData = teamChallenges.find(
        (item) =>
            `${item.team_challenges.challenge_id}/${item.team_challenges.team_id}/${item.team_challenges.event_id}` ===
            editUUID
    );

    async function updateSubmission() {
        const DATA = await requestWrapper(true, {
            type: 'update-team-challenge',
            data: {
                challengeID: editUUID.split('/')[0],
                teamID: editUUID.split('/')[1],
                eventID: editUUID.split('/')[2],
                containerID: editData?.team_challenges.challenge_uuid,
                containerHost: editData?.team_challenges.challenge_host,
                containerFlag: editData?.team_challenges.challenge_flag
            }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
        }
    }

    async function deleteSubmission() {
        const DATA = await requestWrapper(true, {
            type: 'delete-team-challenge',
            data: {
                challengeID: editUUID.split('/')[0],
                teamID: editUUID.split('/')[1],
                eventID: editUUID.split('/')[2]
            }
        });
        if (DATA.ok) {
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
                bind:value={editData.team_challenges.challenge_uuid}
            />
        </div>
        <div class="mb-6">
            <Label for="event_name" class="mb-2">Change Container Host</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_name"
                placeholder="name"
                bind:value={editData.team_challenges.challenge_host}
            />
        </div>
        <div class="mb-6">
            <Label for="event_name" class="mb-2">Change Container Flag</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_name"
                placeholder="name"
                bind:value={editData.team_challenges.challenge_flag}
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
