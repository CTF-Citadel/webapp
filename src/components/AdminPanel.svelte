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
        Button,
        Modal,
        Input,
        Label,
        Spinner,
        SpeedDial,
        SpeedDialButton,
        Textarea,
        Select,
        Toggle,
        MultiSelect,
        Checkbox,
        Alert
    } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import PenSolid from 'flowbite-svelte-icons/PenSolid.svelte';
    import UserGroup from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
    import CalendarPlus from 'flowbite-svelte-icons/CalendarMonthSolid.svelte';
    import EyeSlash from 'flowbite-svelte-icons/EyeSlashSolid.svelte';
    import AssignTo from 'flowbite-svelte-icons/CodePullRequestSolid.svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
    import type { UsersType, EventsType, TeamsType, ChallengesType, TeamEventsType } from '../lib/schema';

    let teams: TeamsType[] = [];
    let events: EventsType[] = [];
    let users: UsersType[] = [];
    let challenges: ChallengesType[] = [];
    let teamEvents: TeamEventsType[] = [];
    let sortedEvents: { value: string; name: string }[] = [];
    let selectedEvent = '';
    let selectedDiff = '';
    let loading: boolean = true;
    let editUUID: string = '';
    let editData: any = {};
    let marked = new Set<string>();

    const DIFFICULTIES = [
        { value: 'Easy', name: 'Easy' },
        { value: 'Medium', name: 'Medium' },
        { value: 'Hard', name: 'Hard' }
    ];
    let tabStates = {
        users: true,
        teams: false,
        events: false,
        challenges: false,
        assignments: false
    };
    let edit = {
        user: false,
        team: false,
        event: false,
        challenge: false
    };
    let create = {
        event: false,
        challenge: false,
        assign: false
    };
    let eventTemplate = {
        name: '',
        description: ''
    };
    let challengeTemplate = {
        name: '',
        description: '',
        category: '',
        isContainer: false,
        filePath: '',
        fileURL: ''
    };
    let datePicker = {
        start: '',
        end: ''
    };

    onMount(async () => {
        await refreshEvents();
        await refreshTeamEvents();
        await refreshTeams();
        await refreshUsers();
        await refreshChallenges();
        loading = false;
    });

    // @TODO:
    async function updateUser() {}
    async function updateTeam() {}

    async function refreshUsers() {
        const DATA = await requestWrapper(true, { type: 'users' });
        const JSON = await DATA.json();
        users = JSON.data;
    }

    async function refreshTeams() {
        const DATA = await requestWrapper(true, { type: 'teams' });
        const JSON = await DATA.json();
        teams = JSON.data;
    }

    async function refreshChallenges() {
        const DATA = await requestWrapper(true, { type: 'challenges' });
        const JSON = await DATA.json();
        challenges = JSON.data;
    }

    async function refreshTeamEvents() {
        const DATA = await requestWrapper(true, { type: 'team-events' });
        const JSON = await DATA.json();
        teamEvents = JSON.data;
    }

    async function refreshEvents() {
        const DATA = await requestWrapper(true, { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
        sortedEvents = [];
        events.forEach((element: any) => {
            sortedEvents.push({ value: element.id, name: element.event_name });
        });
    }

    async function createEvent() {
        let tempStart = { ...datePicker };
        const DATA = await requestWrapper(true, {
            type: 'create-event',
            data: {
                ...eventTemplate,
                start: new Date(tempStart.start).getTime(),
                end: new Date(tempStart.end).getTime()
            }
        });
        if (DATA.ok) {
            create.event = false;
            await refreshEvents();
            return true;
        } else return false;
    }

    async function assignEvent(eventID: string) {
        const DATA = await requestWrapper(true, {
            type: 'assign-event',
            data: {
                id: eventID,
                teams: Array.from(marked)
            }
        });
        if (DATA.ok) {
            create.assign = false;
            await refreshTeamEvents();
            return true;
        } else return false;
    }

    async function unassignEvent(eventID: string, teamID: string) {
        const DATA = await requestWrapper(true, {
            type: 'unassign-event',
            data: {
                event: eventID,
                team: teamID
            }
        });
        if (DATA.ok) {
            await refreshTeamEvents();
            return true;
        } else return false;
    }

    async function createChallenge() {
        const DATA = await requestWrapper(true, {
            type: 'create-challenge',
            data: { ...challengeTemplate, difficulty: selectedDiff, event: selectedEvent }
        });
        if (DATA.ok) {
            create.challenge = false;
            await refreshChallenges();
            return true;
        } else return false;
    }

    async function updateEvent() {
        const DATA = await requestWrapper(true, {
            type: 'update-event',
            data: {
                id: editUUID,
                name: editData.event_name,
                description: editData.event_description
            }
        });
        if (DATA.ok) {
            edit.event = false;
            await refreshEvents();
            return true;
        } else return false;
    }

    async function updateChallenge() {
        const DATA = await requestWrapper(true, {
            type: 'update-challenge',
            data: {
                id: editUUID,
                name: editData.challenge_name,
                description: editData.challenge_description,
                category: editData.challenge_category,
                difficulty: selectedDiff,
                event: selectedEvent
            }
        });
        if (DATA.ok) {
            edit.challenge = false;
            await refreshChallenges();
            return true;
        } else return false;
    }

    async function deleteEvent() {
        const DATA = await requestWrapper(true, {
            type: 'delete-event',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit.event = false;
            await refreshEvents();
            return true;
        } else return false;
    }

    async function deleteChallenge() {
        const DATA = await requestWrapper(true, {
            type: 'delete-challenge',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit.challenge = false;
            await refreshChallenges();
            return true;
        } else return false;
    }

    async function deleteTeam() {
        const DATA = await requestWrapper(true, {
            type: 'delete-team',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit.team = false;
            await refreshTeams();
            return true;
        } else return false;
    }

    async function deleteUser() {
        const DATA = await requestWrapper(true, {
            type: 'delete-user',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit.user = false;
            await refreshUsers();
            return true;
        } else return false;
    }

    async function blockUser() {
        const DATA = await requestWrapper(true, {
            type: 'block-user',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit.user = false;
            await refreshUsers();
            return true;
        } else return false;
    }

    function checkEvent(item: string) {
        marked.has(item) ? marked.delete(item) : marked.add(item);
        // reinstantiate workaround
        marked = marked;
    }

    function checkAll(items: TeamsType[]) {
        if (marked.size == items.length) {
            marked.clear();
        } else {
            for (let team of items) {
                marked.add(team.id);
            }
        }
        // reinstantiate workaround
        marked = marked;
    }

    function editInvocate(type: 'team' | 'event' | 'challenge' | 'user') {
        switch (type) {
            case 'user':
                editData = users.find((item) => item['id'] === editUUID);
                break;
            case 'team':
                editData = teams.find((item) => item['id'] === editUUID);
                break;

            case 'event':
                editData = events.find((item) => item['id'] === editUUID);
                break;

            case 'challenge':
                editData = challenges.find((item) => item['id'] === editUUID);
                selectedDiff = editData.challenge_diff;
                selectedEvent = editData.event_id;
                break;
        }
    }
</script>

<!--
    Action Button
-->

<SpeedDial defaultClass="absolute right-6 bottom-6" class="z-20">
    {#if tabStates.challenges}
        <SpeedDialButton
            name="New Challenge"
            on:click={() => {
                create.challenge = create.challenge ? false : true;
            }}
        >
            <CalendarPlus />
        </SpeedDialButton>
    {/if}
    {#if tabStates.events}
        <SpeedDialButton
            name="New Event"
            on:click={() => {
                create.event = create.event ? false : true;
            }}
        >
            <UserGroup />
        </SpeedDialButton>
    {/if}
    {#if tabStates.teams && marked.size > 0}
        <SpeedDialButton
            name="Assign To"
            on:click={() => {
                create.assign = create.assign ? false : true;
            }}
        >
            <AssignTo />
        </SpeedDialButton>
    {/if}
</SpeedDial>

<!--
    Edit Popups
-->

<Modal defaultClass="rounded-none" bind:open={edit.user} title="Edit User">
    <div class="mb-6">
        <Label for="email" class="mb-2">Change Email address</Label>
        <Input type="email" id="email" placeholder="name@example.com" required />
    </div>
    <div>
        <Label for="password" class="mb-2">Change Password</Label>
        <Input type="password" id="password" placeholder="•••••••••" required />
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button on:click={updateUser}>Update</Button>
                <Button
                    on:click={() => {
                        edit.user = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
            <Button on:click={() => blockUser()} color="red"><EyeSlash class="w-4" /></Button>
            <Button on:click={() => deleteUser()} color="red"><TrashBinOutline class="w-4" /></Button>
        </div>
    </svelte:fragment>
</Modal>

<Modal defaultClass="rounded-none" bind:open={edit.team} title="Edit Team">
    <div class="mb-6">
        <Label for="team_name" class="mb-2">Change Team Name</Label>
        <Input id="team_name" placeholder="name" bind:value={editData.user_name} required />
    </div>
    <div>
        <Label for="event_select" class="mb-2">Change Team Events</Label>
        <MultiSelect id="event_select" items={sortedEvents} size="lg" />
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button on:click={updateTeam}>Update</Button>
                <Button
                    on:click={() => {
                        edit.team = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
            <Button on:click={deleteTeam} color="red"><TrashBinOutline class="w-4" /></Button>
        </div>
    </svelte:fragment>
</Modal>

<Modal defaultClass="rounded-none" bind:open={edit.event} title="Edit Event">
    <div class="mb-6">
        <Label for="event_name" class="mb-2">Change Event Name</Label>
        <Input id="event_name" placeholder="name" bind:value={editData.event_name} required />
    </div>
    <div>
        <Label for="event_textarea" class="mb-2">Change Event Description</Label>
        <Textarea id="event_textarea" placeholder="..." rows="4" bind:value={editData.event_description} />
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button on:click={updateEvent}>Update</Button>
                <Button
                    on:click={() => {
                        edit.event = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
            <Button on:click={deleteEvent} color="red"><TrashBinOutline class="w-4" /></Button>
        </div>
    </svelte:fragment>
</Modal>

<Modal defaultClass="rounded-none" bind:open={edit.challenge} title="Edit Challenge">
    <div class="mb-6">
        <Label for="chal_name" class="mb-2">Change Challenge Name</Label>
        <Input id="chal_name" placeholder="name" bind:value={editData.challenge_name} required />
    </div>
    <div class="mb-6">
        <Label for="chall_textarea" class="mb-2">Change Challenge Description</Label>
        <Textarea id="chal_textarea" placeholder="..." rows="4" bind:value={editData.challenge_description} />
    </div>
    <div class="mb-6">
        <Label>
            Change Challenge Difficulty
            <Select class="mt-2" items={DIFFICULTIES} bind:value={editData.challenge_difficulty} />
        </Label>
    </div>
    <div class="mb-6">
        <Label for="chal_name" class="mb-2">Change Challenge Category</Label>
        <Input id="chal_name" placeholder="Linux/Web/OSINT/..." bind:value={editData.challenge_category} required />
    </div>
    <div>
        <Label>
            Change Event Assignment
            <Select class="mt-2" items={sortedEvents} bind:value={selectedEvent} />
        </Label>
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button on:click={updateChallenge} disabled={
                    editData.challenge_difficulty == '' ||
                    editData.challenge_category == '' ||
                    editData.challenge_name == ''}>Update</Button>
                <Button
                    on:click={() => {
                        edit.challenge = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
            <Button on:click={deleteChallenge} color="red"><TrashBinOutline class="w-4" /></Button>
        </div>
    </svelte:fragment>
</Modal>

<!--
    Create Popups
-->

<Modal defaultClass="rounded-none" bind:open={create.event} title="Create Event">
    <div class="mb-6">
        <Label for="event-name" class="mb-2">Event Name</Label>
        <Input id="event-name" placeholder="myCTF" bind:value={eventTemplate.name} required />
    </div>
    <div class="mb-6">
        <Label for="event-textarea" class="mb-2">Event Description</Label>
        <Textarea id="event-textarea" placeholder="..." rows="4" bind:value={eventTemplate.description} />
    </div>
    <div class="mb-6">
        <Label class="mb-2">Event Start</Label>
        <input type="datetime-local" bind:value={datePicker.start} />
    </div>
    <div>
        <Label class="mb-2">Event End</Label>
        <input type="datetime-local" bind:value={datePicker.end} />
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
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
        </div>
    </svelte:fragment>
</Modal>

<Modal defaultClass="rounded-none" class="max-h-full" bind:open={create.challenge} title="Create Challenge">
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
        <Label for="challenge-textarea" class="mb-2">Challenge Category</Label>
        <Input id="challenge-name" placeholder="Linux/Web/OSINT/..." bind:value={challengeTemplate.category} required />
    </div>
    <div class="mb-6">
        <Toggle bind:checked={challengeTemplate.isContainer}>Needs Container</Toggle>
    </div>
    {#if challengeTemplate.isContainer}
        <div class="mb-6">
            <Label for="challenge-file" class="mb-2">Compose File</Label>
            <Input id="challenge-file" placeholder="/path/to/file" bind:value={challengeTemplate.filePath} required />
        </div>
    {/if}
    <div class="mb-6">
        <Label for="opt-file" class="mb-2">Optional File</Label>
        <Input
            id="opt-file"
            placeholder="https://example.com/path/to/file.txt"
            bind:value={challengeTemplate.fileURL}
            required
        />
    </div>
    <div>
        {#if events.length > 0}
            <Label>
                Assign To Event
                <Select class="mt-2" items={sortedEvents} bind:value={selectedEvent} />
            </Label>
        {:else}
            <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                <span slot="icon">
                    <InfoCircle slot="icon" class="text-blue-500 w-5 h-5" />
                    <span class="sr-only">Info</span>
                </span>
                <p class="text-blue-500">No Events created yet.</p>
            </Alert>
        {/if}
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button
                    on:click={createChallenge}
                    disabled={selectedDiff == '' ||
                        selectedEvent == '' ||
                        challengeTemplate.name == '' ||
                        challengeTemplate.description == '' ||
                        challengeTemplate.category == '' ||
                        selectedDiff == '' ||
                        (challengeTemplate.filePath == '' && challengeTemplate.isContainer)}>Create</Button
                >
                <Button
                    on:click={() => {
                        create.challenge = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
        </div>
    </svelte:fragment>
</Modal>

<Modal defaultClass="rounded-none" bind:open={create.assign} title="Assign To">
    <div>
        {#if events.length > 0}
            <Label>
                Select Event
                <Select class="mt-2" items={sortedEvents} bind:value={selectedEvent} />
            </Label>
        {:else}
            <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                <span slot="icon">
                    <InfoCircle slot="icon" class="text-blue-500 w-5 h-5" />
                    <span class="sr-only">Info</span>
                </span>
                <p class="text-blue-500">No Events created yet.</p>
            </Alert>
        {/if}
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button
                    on:click={() => {
                        assignEvent(selectedEvent);
                    }}
                    disabled={selectedEvent == ''}>Assign</Button
                >
                <Button
                    on:click={() => {
                        create.assign = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
        </div>
    </svelte:fragment>
</Modal>

<!--
    Main Tab
-->

<div class="w-full h-full flex-1">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
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
                            <TableHeadCell>Team ID</TableHeadCell>
                            <TableHeadCell>Blocked</TableHeadCell>
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
                                        {entry.is_verified}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.user_team_id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.is_blocked}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            color="alternative"
                                            on:click={() => {
                                                editUUID = entry.id;
                                                editInvocate('user');
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
                    {#key marked.size}
                        <Table>
                            <TableHead>
                                <TableHeadCell>
                                    <Checkbox on:change={() => checkAll(teams)} checked={marked.size == teams.length} />
                                </TableHeadCell>
                                <TableHeadCell>ID</TableHeadCell>
                                <TableHeadCell>Creator ID</TableHeadCell>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Description</TableHeadCell>
                                <TableHeadCell>Country</TableHeadCell>
                                <TableHeadCell>Token</TableHeadCell>
                                <TableHeadCell />
                            </TableHead>
                            <TableBody>
                                {#each teams as entry}
                                    <TableBodyRow>
                                        <TableBodyCell>
                                            <Checkbox
                                                on:change={() => checkEvent(entry.id)}
                                                checked={marked.has(entry.id)}
                                            />
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {entry.id}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {entry.team_creator}
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
                                            {entry.team_join_token}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            <Button
                                                on:click={() => {
                                                    editUUID = entry.id;
                                                    editInvocate('team');
                                                    edit.team = edit.team ? false : true;
                                                }}>Edit</Button
                                            >
                                        </TableBodyCell>
                                    </TableBodyRow>
                                {/each}
                            </TableBody>
                        </Table>
                    {/key}
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
                            <TableHeadCell>Starts</TableHeadCell>
                            <TableHeadCell>Ends</TableHeadCell>
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
                                        {entry.event_start}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.event_end}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            on:click={() => {
                                                editUUID = entry.id;
                                                editInvocate('event');
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
            <TabItem title="Assigned Events" bind:open={tabStates.assignments}>
                {#if teamEvents.length > 0}
                    <Table>
                        <TableHead>
                            <TableHeadCell>Team ID</TableHeadCell>
                            <TableHeadCell>Event ID</TableHeadCell>
                            <TableHeadCell>Current Score</TableHeadCell>
                            <TableHeadCell />
                        </TableHead>
                        <TableBody>
                            {#each teamEvents as entry}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        {entry.team_id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.event_id}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.team_points}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            on:click={() => {
                                                unassignEvent(entry.event_id, entry.team_id);
                                            }}>Delete</Button
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
                            No Assigned Events found.
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
                            <TableHeadCell>Category</TableHeadCell>
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
                                        {entry.challenge_category}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Button
                                            on:click={() => {
                                                editUUID = entry.id;
                                                editInvocate('challenge');
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
