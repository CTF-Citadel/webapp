<script lang="ts">
    import { requestWrapper } from '../../../lib/helpers';
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
        Spinner,
        SpeedDial,
        SpeedDialButton,
        Checkbox,
        Alert
    } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import PenSolid from 'flowbite-svelte-icons/PenSolid.svelte';
    import UserGroup from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
    import CalendarPlus from 'flowbite-svelte-icons/CalendarMonthSolid.svelte';
    import AssignTo from 'flowbite-svelte-icons/CodePullRequestSolid.svelte';
    import type { UsersType, EventsType, TeamsType, ChallengesType, TeamEventsType } from '../../../lib/schema';
    // subcomponents
    import SubAssignment from './admin/Assignment.svelte';
    import SubChallenge from './admin/Challenge.svelte';
    import SubEvent from './admin/Event.svelte';
    import SubUser from './admin/User.svelte';
    import SubTeam from './admin/Team.svelte';

    let teams: TeamsType[] = [];
    let events: EventsType[] = [];
    let users: UsersType[] = [];
    let challenges: ChallengesType[] = [];
    let teamEvents: TeamEventsType[] = [];
    let sortedEvents: { value: string; name: string }[] = [];
    let selectchallenges: { value: string; name: string }[] = [];
    let loading: boolean = true;
    let editUUID: string = '';
    let marked = new Set<string>();
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

    onMount(async () => {
        await refreshEvents();
        await refreshTeamEvents();
        await refreshTeams();
        await refreshUsers();
        await refreshChallenges();
        loading = false;
    });

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
        selectchallenges = [];
        challenges.forEach((element: any) => {
            selectchallenges.push({ value: element.id, name: element.challenge_name });
        });
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

    function checkEvent(item: string) {
        marked.has(item) ? marked.delete(item) : marked.add(item);
        // reinstantiate workaround
        marked = marked;
    }

    function checkAll(items: TeamsType[]) {
        if (marked.size === items.length) {
            marked.clear();
        } else {
            for (let team of items) {
                marked.add(team.id);
            }
        }
        // reinstantiate workaround
        marked = marked;
    }
</script>

<!--
    Action Button
-->

{#if tabStates.challenges || tabStates.events || (tabStates.teams && marked.size > 0)}
    <SpeedDial defaultClass="absolute right-6 bottom-6 z-30">
        {#if tabStates.challenges}
            <SpeedDialButton
                name="New Challenge"
                on:click={() => {
                    create.challenge = true;
                }}
            >
                <CalendarPlus />
            </SpeedDialButton>
        {/if}
        {#if tabStates.events}
            <SpeedDialButton
                name="New Event"
                on:click={() => {
                    create.event = true;
                }}
            >
                <UserGroup />
            </SpeedDialButton>
        {/if}
        {#if tabStates.teams && marked.size > 0}
            <SpeedDialButton
                name="Assign To"
                on:click={() => {
                    create.assign = true;
                }}
            >
                <AssignTo />
            </SpeedDialButton>
        {/if}
    </SpeedDial>
{/if}

<!--
    Imports
-->

<SubAssignment
    bind:create={create.assign}
    bind:events
    bind:sortedEvents
    bind:marked
    on:refresh={async () => {
        await refreshTeamEvents();
        await refreshEvents();
    }}
></SubAssignment>

<SubChallenge
    bind:create={create.challenge}
    bind:edit={edit.challenge}
    bind:events
    bind:challenges
    bind:sortedEvents
    bind:editUUID
    on:refresh={async () => {
        await refreshEvents();
        await refreshChallenges();
    }}
></SubChallenge>

<SubEvent
    bind:create={create.event}
    bind:edit={edit.event}
    bind:events
    bind:editUUID
    on:refresh={async () => {
        await refreshEvents();
    }}
></SubEvent>

<SubTeam
    bind:edit={edit.team}
    bind:teams
    bind:editUUID
    on:refresh={async () => {
        await refreshTeams();
    }}
></SubTeam>

<SubUser
    bind:edit={edit.user}
    bind:users
    bind:editUUID
    on:refresh={async () => {
        await refreshUsers();
    }}
></SubUser>

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
            divider={false}
            defaultClass="flex flex-wrap flex-row justify-center items-center space-x-2 mb-4 border-b-2 border-neutral-300 dark:border-neutral-800"
            contentClass=""
            activeClasses="px-4 py-2 bg-neutral-300 dark:bg-neutral-800 text-primary-600 dark:text-primary-500"
            inactiveClasses="px-4 py-2 bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        >
            <TabItem title="Users" bind:open={tabStates.users}>
                {#if users.length > 0}
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                    >
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
                                <TableBodyRow class="custom">
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.username}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.email}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.user_role}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.is_verified}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.user_team_id}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.is_blocked}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        <Button
                                            color="alternative"
                                            on:click={() => {
                                                editUUID = entry.id;
                                                edit.user = true;
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
                        <Table
                            color="custom"
                            class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                        >
                            <TableHead>
                                <TableHeadCell>
                                    <Checkbox
                                        on:change={() => checkAll(teams)}
                                        checked={marked.size === teams.length}
                                    />
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
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            <Checkbox
                                                on:change={() => checkEvent(entry.id)}
                                                checked={marked.has(entry.id)}
                                            />
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.id}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_creator}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_description}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_country_code}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_join_token}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            <Button
                                                on:click={() => {
                                                    editUUID = entry.id;
                                                    edit.team = true;
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
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                    >
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
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.event_name}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.event_description}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.event_start}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.event_end}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        <Button
                                            on:click={() => {
                                                editUUID = entry.id;
                                                edit.event = true;
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
            <TabItem title="Assignments" bind:open={tabStates.assignments}>
                {#if teamEvents.length > 0}
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                    >
                        <TableHead>
                            <TableHeadCell>Team ID</TableHeadCell>
                            <TableHeadCell>Event ID</TableHeadCell>
                            <TableHeadCell>Current Score</TableHeadCell>
                            <TableHeadCell />
                        </TableHead>
                        <TableBody>
                            {#each teamEvents as entry}
                                <TableBodyRow>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.team_id}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.event_id}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.team_points}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
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
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                    >
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
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.id}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.challenge_name}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.challenge_description}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        {entry.challenge_category}
                                    </TableBodyCell>
                                    <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                        <Button
                                            on:click={() => {
                                                editUUID = entry.id;
                                                edit.challenge = true;
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
