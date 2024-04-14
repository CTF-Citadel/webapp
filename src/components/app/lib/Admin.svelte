<!--
  @component
-->

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
    import type {
        UsersType,
        EventsType,
        TeamsType,
        ChallengesType,
        TeamEventsType,
        TeamChallengesType
    } from '../../../lib/schema';
    // subcomponents
    import SubAssignment from './admin/Assignment.svelte';
    import SubChallenge from './admin/Challenge.svelte';
    import SubEvent from './admin/Event.svelte';
    import SubUser from './admin/User.svelte';
    import SubTeam from './admin/Team.svelte';
    import AntiCheat from './admin/AntiCheat.svelte';
    import Submissions from './admin/Submissions.svelte';
    import Actions from './admin/Actions.svelte';

    export let withAC: boolean = false;

    let teams: TeamsType[] = [];
    let events: EventsType[] = [];
    let users: UsersType[] = [];
    let challenges: ChallengesType[] = [];
    let teamEvents: { event_id: string; event_name: string; team_id: string; team_name: string }[] = [];
    let teamChallenges: { team_challenges: TeamChallengesType; teams: TeamsType; challenges: ChallengesType }[] = [];
    let sortedEvents: { value: string; name: string }[] = [];
    let sortedChallenges: { value: string; name: string }[] = [];
    let loading: boolean = true;
    let editUUID: string = '';
    let marked = new Set<string>();
    let tabStates = {
        actions: true,
        users: false,
        teams: false,
        events: false,
        challenges: false,
        assignments: false,
        anticheat: false,
        submission: false
    };
    let edit = {
        user: false,
        team: false,
        event: false,
        challenge: false,
        submission: false
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
        await refreshTeamChallenges();
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
        sortedChallenges = [];
        challenges.forEach((element) => {
            sortedChallenges.push({ value: element.id, name: element.name });
        });
    }

    async function refreshTeamEvents() {
        const DATA = await requestWrapper(true, { type: 'team-events' });
        const JSON = await DATA.json();
        teamEvents = JSON.data;
    }

    async function refreshTeamChallenges() {
        const DATA = await requestWrapper(true, { type: 'team-challenges' });
        const JSON = await DATA.json();
        teamChallenges = JSON.data;
    }

    async function refreshEvents() {
        const DATA = await requestWrapper(true, { type: 'events' });
        const JSON = await DATA.json();
        events = JSON.data;
        sortedEvents = [];
        events.forEach((element) => {
            sortedEvents.push({ value: element.id, name: element.name });
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
    <SpeedDial defaultClass="fixed right-6 bottom-6 z-30">
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
    bind:sortedChallenges
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

<Submissions
    bind:edit={edit.submission}
    bind:teamChallenges
    bind:editUUID
    on:refresh={async () => {
        await refreshTeamChallenges();
    }}
></Submissions>

<!--
    Main Tab
-->

<div class="p-4 max-w-full">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="flex-1">
            <Tabs
                divider={false}
                defaultClass="flex flex-wrap flex-row justify-center items-center space-x-2 mb-4 pb-4 border-b-2 border-neutral-300 dark:border-neutral-800"
                contentClass=""
                activeClasses="px-4 py-2 bg-neutral-300 dark:bg-neutral-800 font-bold text-primary-200"
                inactiveClasses="px-4 py-2 bg-neutral-300 dark:bg-neutral-800 text-neutral-500"
            >
                <TabItem title="Actions" bind:open={tabStates.actions}>
                    <Actions bind:sortedEvents></Actions>
                </TabItem>
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
                                            {entry.role}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.is_verified}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_id}
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
                                                {entry.creator_id}
                                            </TableBodyCell>
                                            <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                                {entry.name}
                                            </TableBodyCell>
                                            <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                                {entry.description}
                                            </TableBodyCell>
                                            <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                                {entry.country_code}
                                            </TableBodyCell>
                                            <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                                {entry.join_token}
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
                                            {entry.name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.description}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {new Date(entry.start).toLocaleString('eu')}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {new Date(entry.end).toLocaleString('eu')}
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
                                <TableHeadCell>Team</TableHeadCell>
                                <TableHeadCell>Team ID</TableHeadCell>
                                <TableHeadCell>Event</TableHeadCell>
                                <TableHeadCell>Event ID</TableHeadCell>
                                <TableHeadCell />
                            </TableHead>
                            <TableBody>
                                {#each teamEvents as entry}
                                    <TableBodyRow>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_id}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.event_name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.event_id}
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
                <TabItem title="Submissions" bind:open={tabStates.submission}>
                    {#if teamChallenges.length > 0}
                        <Table
                            color="custom"
                            class="bg-neutral-300 dark:bg-neutral-800 !text-neutral-900 dark:!text-neutral-100"
                        >
                            <TableHead>
                                <TableHeadCell>Challenge ID</TableHeadCell>
                                <TableHeadCell>Challenge</TableHeadCell>
                                <TableHeadCell>Team</TableHeadCell>
                                <TableHeadCell>Container ID</TableHeadCell>
                                <TableHeadCell>Container Host</TableHeadCell>
                                <TableHeadCell>Container Running</TableHeadCell>
                                <TableHeadCell>Solved</TableHeadCell>
                                <TableHeadCell />
                            </TableHead>
                            <TableBody>
                                {#each teamChallenges as entry}
                                    <TableBodyRow>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.challenges.id}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.challenges.name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.teams.name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_challenges.container_id}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_challenges.container_host}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_challenges.is_running}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.team_challenges.is_solved}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            <Button
                                                on:click={() => {
                                                    editUUID = `${entry.team_challenges.challenge_id}/${entry.team_challenges.team_id}/${entry.team_challenges.event_id}`;
                                                    edit.submission = true;
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
                                No Submissions found.
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
                                            {entry.name}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.description}
                                        </TableBodyCell>
                                        <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                            {entry.category}
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
                {#if withAC === true}
                    <TabItem title="M0n1t0r" bind:open={tabStates.anticheat}>
                        <AntiCheat
                            bind:teams
                            on:refresh={async () => {
                                await refreshTeams();
                            }}
                        />
                    </TabItem>
                {/if}
            </Tabs>
        </div>
    {/if}
</div>
