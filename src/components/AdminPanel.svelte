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
        SpeedDialButton,
        Textarea,
        Select,
        Toggle
    } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import PenSolid from 'flowbite-svelte-icons/PenSolid.svelte';
    import UserGroup from 'flowbite-svelte-icons/UserGroupSolid.svelte';
    import CalendarPlus from 'flowbite-svelte-icons/CalendarPlusSolid.svelte';

    const DIFFICULTIES = [
        { value: 'Easy', name: 'Easy' },
        { value: 'Normal', name: 'Normal' },
        { value: 'Hard', name: 'Hard' }
    ];
    let teams: any[] = [];
    let events: any[] = [];
    let users: any[] = [];
    let challenges: any[] = [];
    let sortedEvents: { value: string; name: string }[] = [];
    let selectedEvent = '';
    let selectedDiff = '';
    let tabStates = {
        users: true,
        teams: false,
        events: false,
        challenges: false
    };
    let loading: boolean = true;
    let edit = {
        user: false,
        team: false,
        event: false,
        challenge: false
    };
    let create = {
        event: false,
        challenge: false
    };
    let eventTemplate = {
        name: '',
        description: ''
    };
    let challengeTemplate = {
        name: '',
        description: '',
        is_container: false,
        file: ''
    };

    onMount(async () => {
        await refreshEvents();
        await refreshTeams();
        await refreshUsers();
        await refreshChallenges();
        loading = false;
    });

    async function refreshUsers() {
        const DATA = await requestWrapper('/settings', { type: 'users' });
        const JSON = await DATA.json();
        users = JSON.data;
    }

    async function refreshTeams() {
        const DATA = await requestWrapper('/settings', { type: 'teams' });
        const JSON = await DATA.json();
        teams = JSON.data;
    }

    async function refreshChallenges() {
        const DATA = await requestWrapper('/settings', { type: 'challenges' });
        const JSON = await DATA.json();
        challenges = JSON.data;
    }

    async function refreshEvents() {
        const DATA = await requestWrapper('/settings', { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
        events.forEach((element: any) => {
            sortedEvents.push({ value: element.id, name: element.event_name });
        });
    }

    async function createEvent() {
        const DATA = await requestWrapper('/settings', { type: 'create-event', data: { ...eventTemplate } });
        if (DATA.ok) {
            create.event = false;
            await refreshEvents();
            return true;
        } else return false;
    }

    async function createChallenge() {
        const DATA = await requestWrapper('/settings', {
            type: 'create-challenge',
            data: { ...challengeTemplate, difficulty: selectedDiff, event: selectedEvent }
        });
        if (DATA.ok) {
            create.challenge = false;
            await refreshChallenges();
            return true;
        } else return false;
    }
</script>

<!--
    Action Button
-->

<SpeedDial defaultClass="absolute right-6 bottom-6">
    <SpeedDialButton
        name="New Challenge"
        on:click={() => {
            create.challenge = create.challenge ? false : true;
        }}
    >
        <CalendarPlus />
    </SpeedDialButton>
    <SpeedDialButton
        name="New Event"
        on:click={() => {
            create.event = create.event ? false : true;
        }}
    >
        <UserGroup />
    </SpeedDialButton>
</SpeedDial>

<!--
    Edit Popups
-->

<Modal bind:open={edit.user} title="Edit User">
    <div class="mb-6">
        <Label for="email" class="mb-2">Change Email address</Label>
        <Input type="email" id="email" placeholder="name@example.com" required />
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

<Modal bind:open={edit.challenge} title="Edit Challenge" />

<!--
    Create Popups
-->

<Modal bind:open={create.event} title="Create Event">
    <div class="mb-6">
        <Label for="event-name" class="mb-2">Event Name</Label>
        <Input id="event-name" placeholder="myCTF" bind:value={eventTemplate.name} required />
    </div>
    <div class="mb-6">
        <Label for="event-textarea" class="mb-2">Event Description</Label>
        <Textarea id="event-textarea" placeholder="..." rows="4" bind:value={eventTemplate.description} />
    </div>
    <svelte:fragment slot="footer">
        <div>
            <Button on:click={createEvent} disabled={eventTemplate.name == '' || eventTemplate.description == ''}
                >Create</Button
            >
            <Button
                on:click={() => {
                    create.event = false;
                }}
                color="alternative">Cancel</Button
            >
        </div>
    </svelte:fragment>
</Modal>

<Modal bind:open={create.challenge} title="Create Challenge">
    <div class="mb-6">
        <Label for="challenge-name" class="mb-2">Challenge Name</Label>
        <Input id="challenge-name" placeholder="Petition" bind:value={challengeTemplate.name} required />
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Description</Label>
        <Textarea id="challenge-textarea" placeholder="..." rows="4" bind:value={challengeTemplate.description} />
    </div>
    <div class="mb-6">
        <Label>
            Challenge Difficulty
            <Select class="mt-2" items={DIFFICULTIES} bind:value={selectedDiff} />
        </Label>
    </div>
    <div class="mb-6">
        <Toggle bind:checked={challengeTemplate.is_container}>Needs Container</Toggle>
    </div>
    {#if challengeTemplate.is_container}
        <div class="mb-6">
            <Label for="challenge-file" class="mb-2">Compose File</Label>
            <Input id="challenge-file" placeholder="/path/to/file" bind:value={challengeTemplate.file} required />
        </div>
    {/if}
    <div class="mb-6">
        <Label>
            Assign To Event
            <Select class="mt-2" items={sortedEvents} bind:value={selectedEvent} />
        </Label>
    </div>
    <svelte:fragment slot="footer">
        <div>
            <Button
                on:click={createChallenge}
                disabled={selectedDiff == '' ||
                    selectedEvent == '' ||
                    challengeTemplate.name == '' ||
                    challengeTemplate.description == '' ||
                    challengeTemplate.file == ''}>Create</Button
            >
            <Button
                on:click={() => {
                    create.challenge = false;
                }}
                color="alternative">Cancel</Button
            >
        </div>
    </svelte:fragment>
</Modal>

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
                    <Alert class="m-4" color="blue">
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
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell>Country</TableHeadCell>
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
                                        {entry.team_description}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.team_country_code}
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
                    <Alert class="m-4" color="blue">
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
                            <TableHeadCell>Description</TableHeadCell>
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
                                        {entry.event_description}
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
                    <Alert class="m-4" color="blue">
                        <span>
                            <span class="font-bold">Info!</span><br />
                            No Events found.
                        </span>
                    </Alert>
                {/if}
            </TabItem>
            <TabItem title="Challenges" bind:open={tabStates.challenges}>
                {#if challenges.length > 0}
                    <Table>
                        <TableHead>
                            <TableHeadCell>ID</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell />
                        </TableHead>
                        <TableBody>
                            {#each challenges as entry}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.challenge_name}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.challenge_description}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            on:click={() => {
                                                edit.challenge = edit.challenge ? false : true;
                                            }}>Edit</Button
                                        >
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                {:else}
                    <Alert class="m-4" color="blue">
                        <span>
                            <span class="font-bold">Info!</span><br />
                            No Teams found.
                        </span>
                    </Alert>
                {/if}
            </TabItem>
        </Tabs>
    {/if}
</div>
