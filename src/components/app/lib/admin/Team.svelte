<!--
  @component
  ## Props
  @prop export let teams: TeamsType[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit: boolean = false;
-->

<script lang="ts">
    import { requestWrapper } from '../../../../lib/helpers';
    import { Button, Modal, Input, Label } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import type { TeamsType } from '../../../../lib/schema';

    export let teams: TeamsType[] = [];
    export let editUUID: string = '';
    export let edit: boolean = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();

    $: editData = teams.find((item) => item['id'] === editUUID);

    async function updateTeam() {
        const DATA = await requestWrapper(true, {
            type: 'update-team',
            data: { id: editUUID, name: editData?.team_name, description: editData?.team_description }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
        }
    }

    async function deleteTeam() {
        const DATA = await requestWrapper(true, {
            type: 'delete-team',
            data: { id: editUUID }
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
        title="Edit Team"
    >
        <div class="mb-6">
            <Label for="team_name" class="mb-2">Change Team Name</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="team_name"
                bind:value={editData.team_name}
            />
        </div>
        <div class="mb-6">
            <Label for="team_desc" class="mb-2">Change Description</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="team_desc"
                bind:value={editData.team_description}
            />
        </div>
        <svelte:fragment slot="footer">
            <div class="flex flex-row justify-between w-full">
                <div>
                    <Button on:click={updateTeam}>Update</Button>
                    <Button
                        on:click={() => {
                            edit = false;
                        }}
                        color="alternative">Cancel</Button
                    >
                </div>
                <Button on:click={deleteTeam} color="red"><TrashBinOutline class="w-4" /></Button>
            </div>
        </svelte:fragment>
    </Modal>
{/if}
