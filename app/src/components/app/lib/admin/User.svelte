<!--
  @component
  ## Props
  @prop export let users: UsersType[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit: boolean = false;
-->

<script lang="ts">
    import { requestWrapper, USER_ROLES } from '../../../../lib/helpers';
    import { Button, Modal, Input, Label, Toggle, Select } from 'flowbite-svelte';
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
                verified: editData?.is_verified,
                role: editData?.role,
                firstname: editData?.firstname,
                lastname: editData?.lastname,
                affiliation: editData?.affiliation,
                team: editData?.team_id,
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

{#if editData !== undefined}
    <Modal
        dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
        defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
        color="none"
        outsideclose
        bind:open={edit}
        title="Edit User"
    >
        <div class="mb-6">
            <Label for="email" class="mb-2">Change Email address</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                type="email"
                id="email"
                bind:value={editData.email}
                placeholder="name@example.com"
            />
        </div>
        <div class="mb-6">
            <Label class="mb-2">Change User Role</Label>
            <Select
                defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                bind:value={editData.role}
                placeholder=""
            >
                {#each USER_ROLES as { value, name }}
                    <option {value}>{name}</option>
                {/each}
            </Select>
        </div>
        <div class="mb-6">
            <Label for="first" class="mb-2">Change User Firstname</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="first"
                bind:value={editData.firstname}
            />
        </div>
        <div class="mb-6">
            <Label for="last" class="mb-2">Change User Lastname</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="last"
                bind:value={editData.lastname}
            />
        </div>
        <div class="mb-6">
            <Label for="last" class="mb-2">Change User Affiliation</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="last"
                bind:value={editData.affiliation}
            />
        </div>
        <div class="mb-6">
            <Label for="last" class="mb-2">Change User Team</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="last"
                bind:value={editData.team_id}
            />
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
                <div>
                    <Button on:click={() => blockUser()} color="red"><EyeSlash class="w-4" /></Button>
                    <Button on:click={() => deleteUser()} color="red"><TrashBinOutline class="w-4" /></Button>
                </div>
            </div>
        </svelte:fragment>
    </Modal>
{/if}
