<!--
  @component
  ## Props
  @prop export let users: UsersType[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit: boolean = false;
-->

<script lang="ts">
    import { requestWrapper } from '../../../../lib/helpers';
    import { Button, Modal, Input, Label, Toggle } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import EyeSlash from 'flowbite-svelte-icons/EyeSlashSolid.svelte';
    import type { UsersType } from '../../../../lib/schema';

    export let users: UsersType[] = [];
    export let editUUID: string = '';
    export let edit: boolean = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();

    $: editData = users.find((item) => item['id'] === editUUID);

    async function updateUser() {
        const DATA = await requestWrapper(true, {
            type: 'update-user',
            data: {
                id: editUUID,
                email: editData?.email,
                verified: editData?.is_verified
            }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
        }
    }

    async function deleteUser() {
        const DATA = await requestWrapper(true, {
            type: 'delete-user',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
        }
    }

    async function blockUser() {
        const DATA = await requestWrapper(true, {
            type: 'block-user',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
        }
    }
</script>

<!--
    Edit Popup
-->

{#if editData != null}
    <Modal defaultClass="rounded-none" bind:open={edit} title="Edit User">
        <div class="mb-6">
            <Label for="email" class="mb-2">Change Email address</Label>
            <Input type="email" id="email" bind:value={editData.email} placeholder="name@example.com" required />
        </div>
        <div>
            <Label for="verify-check" class="mb-2">Verified</Label>
            <Toggle id="verify-check" bind:checked={editData.is_verified}></Toggle>
        </div>
        <svelte:fragment slot="footer">
            <div class="flex flex-row justify-between w-full">
                <div>
                    <Button on:click={updateUser}>Update</Button>
                    <Button
                        on:click={() => {
                            edit = false;
                        }}
                        color="alternative">Cancel</Button
                    >
                </div>
                <Button on:click={() => blockUser()} color="red"><EyeSlash class="w-4" /></Button>
                <Button on:click={() => deleteUser()} color="red"><TrashBinOutline class="w-4" /></Button>
            </div>
        </svelte:fragment>
    </Modal>
{/if}
