<!--
  @component
  ## Props
  @prop export let teams: TeamsType[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit: boolean = false;
-->

<script lang="ts">
    import { Button, Modal, Input, Label } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import type { TeamsType } from '../../../../lib/schema';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { AdminRouter } from '../../../../lib/trpc/admin';
    import { newNotify } from '../../../../lib/notify';

    export let teams: TeamsType[] = [];
    export let editUUID: string = '';
    export let edit: boolean = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();
    const CLIENT = createTRPCClient<AdminRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/admin'
            })
        ]
    });

    $: editData = teams.find((item) => item['id'] === editUUID);

    async function updateTeam() {
        if (editData !== undefined) {
            const DATA = await CLIENT.updateTeam.mutate({
                id: editUUID,
                name: editData.name,
                description: editData.description
            })
            if (DATA === true) {
                edit = false;
                DISPATCH('refresh');
            } else {
                newNotify('Editing Failed', true);
            }
        }
    }

    async function deleteTeam() {
        const DATA = await CLIENT.deleteTeam.mutate(editUUID);
        if (DATA === true) {
            edit = false;
            DISPATCH('refresh');
        } else {
            newNotify('Deletion Failed', true);
        }
    }
</script>

<!--
    Edit Popups
-->
{#if editData !== undefined}
    <Modal
        dialogClass="fixed top-0 left-0 m-auto p-4 z-40 flex flex-1 justify-center w-full h-full"
        defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        backdropClass="fixed inset-0 z-30 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
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
                bind:value={editData.name}
            />
        </div>
        <div class="mb-6">
            <Label for="team_desc" class="mb-2">Change Description</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="team_desc"
                bind:value={editData.description}
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
