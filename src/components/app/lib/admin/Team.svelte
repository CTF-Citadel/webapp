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

    async function updateTeam() {}

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
    <Modal defaultClass="rounded-none" bind:open={edit} title="Edit Team">
        <div class="mb-6">
            <Label for="team_name" class="mb-2">Change Team Name</Label>
            <Input id="team_name" placeholder="name" bind:value={editData.team_name} required />
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
