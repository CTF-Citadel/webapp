<script lang="ts">
    import { requestWrapper } from '../lib/helpers';
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Tabs,
        TabItem,
        Alert,
        Button,
        Modal,
        Input,
        Label,
        Spinner,
        SpeedDial,
        SpeedDialButton
    } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import PenSolid from 'flowbite-svelte-icons/PenSolid.svelte';
    import UserSolid from 'flowbite-svelte-icons/UserSolid.svelte';
    import UserGroup from 'flowbite-svelte-icons/UserGroupSolid.svelte';
    import CalendarPlus from 'flowbite-svelte-icons/CalendarPlusSolid.svelte';

    let teams: any[] = [];
    let events: any[] = [];
    let users: any[] = [];
    let tabStates = {
        users: true,
        teams: false,
        events: false
    };
    let loading: boolean = true;
    let edit = {
        user: false,
        team: false,
        event: false
    };
    let create = {
        user: false,
        team: false,
        event: false
    };

    onMount(async () => {
        await refreshEvents();
        await refreshTeams();
        await refreshUsers();
        loading = false;
    });

    async function refreshUsers() {
        const DATA = await requestWrapper('/user', { type: 'users' });
        const JSON = await DATA.json();
        users = JSON.data;
    }

    async function refreshTeams() {
        const DATA = await requestWrapper('/user', { type: 'teams' });
        const JSON = await DATA.json();
        teams = JSON.data;
    }

    async function refreshEvents() {
        const DATA = await requestWrapper('/user', { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
    }
</script>

<SpeedDial defaultClass="absolute right-6 bottom-6">
    <SpeedDialButton
        name="New User"
        on:click={() => {
            create.user = create.user ? false : true;
        }}
    >
        <UserSolid />
    </SpeedDialButton>
    <SpeedDialButton
        name="New Team"
        on:click={() => {
            create.team = create.team ? false : true;
        }}
    >
        <UserGroup />
    </SpeedDialButton>
    <SpeedDialButton
        name="New Event"
        on:click={() => {
            create.event = create.event ? false : true;
        }}
    >
        <CalendarPlus />
    </SpeedDialButton>
</SpeedDial>

<Modal bind:open={edit.user} title="Edit User">
    <div class="mb-6">
        <Label for="email" class="mb-2">Change Email address</Label>
        <Input type="email" id="email" placeholder="john.doe@company.com" required />
    </div>
    <div class="mb-6">
        <Label for="password" class="mb-2">Change Password</Label>
        <Input type="password" id="password" placeholder="•••••••••" required />
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button on:click={() => alert('Handle "success"')}>Update</Button>
                <Button
                    on:click={() => {
                        edit.user = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
            <Button on:click={() => alert('Handle "delete"')} color="red"><TrashBinOutline class="w-4" /></Button>
        </div>
    </svelte:fragment>
</Modal>

<Modal bind:open={edit.team} title="Edit Team" />

<Modal bind:open={edit.event} title="Edit Event" />

<div class="w-full h-full flex-1">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} /><Modal bind:open={edit.user} title="Edit User" />
        </div>
    {:else}
        <Tabs
            contentClass=""
            activeClasses="p-4 text-primary-600 bg-gray-100 dark:bg-gray-800 dark:text-primary-500"
            inactiveClasses="p-4 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
            <TabItem title="Users" bind:open={tabStates.users}>
                {#if users.length > 0}
                    <Table>
                        <TableHead>
                            <TableHeadCell>ID</TableHeadCell>
                            <TableHeadCell>Username</TableHeadCell>
                            <TableHeadCell>Email</TableHeadCell>
                            <TableHeadCell>Type</TableHeadCell>
                            <TableHeadCell>Verified</TableHeadCell>
                            <TableHeadCell />
                        </TableHead>
                        <TableBody>
                            {#each users as entry}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.username}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.email}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.user_role}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.email_verified}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            color="alternative"
                                            on:click={() => {
                                                edit.user = edit.user ? false : true;
                                            }}><PenSolid class="w-4" /></Button
                                        >
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                {:else}
                    <Alert color="blue">
                        <span>
                            <span class="font-bold">Info!</span><br />
                            No Users found
                        </span>
                    </Alert>
                {/if}
            </TabItem>
            <TabItem title="Teams" bind:open={tabStates.teams}>
                {#if teams.length > 0}
                    <Table>
                        <TableHead>
                            <TableHeadCell>ID</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell />
                        </TableHead>
                        <TableBody>
                            {#each teams as entry}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.team_name}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            on:click={() => {
                                                edit.team = edit.team ? false : true;
                                            }}>Edit</Button
                                        >
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                {:else}
                    <Alert color="blue">
                        <span>
                            <span class="font-bold">Info!</span><br />
                            No Teams found.
                        </span>
                    </Alert>
                {/if}
            </TabItem>
            <TabItem title="Events" bind:open={tabStates.events}>
                {#if events.length > 0}
                    <Table>
                        <TableHead>
                            <TableHeadCell>ID</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell />
                        </TableHead>
                        <TableBody>
                            {#each events as entry}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.event_name}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            on:click={() => {
                                                edit.event = edit.event ? false : true;
                                            }}>Edit</Button
                                        >
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                {:else}
                    <Alert color="blue">
                        <span>
                            <span class="font-bold">Info!</span><br />
                            No Events found.
                        </span>
                    </Alert>
                {/if}
            </TabItem>
        </Tabs>
    {/if}
</div>
