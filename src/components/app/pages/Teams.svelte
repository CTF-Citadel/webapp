<script lang="ts">
    import { onMount } from 'svelte';
    import {
        Card,
        Button,
        Modal,
        Label,
        Input,
        Spinner,
        Textarea,
        Select,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from 'flowbite-svelte';
    import { requestWrapper, COUNTRIES } from '../../../lib/helpers';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    import Moon from 'flowbite-svelte-icons/MoonOutline.svelte';
    import type { TeamsType } from '../../../lib/schema';
    import { fade } from 'svelte/transition';

    export let sessionID: string = '';
    export let session: any = {};

    let loading = true;
    let hasTeam = false;
    let hasCreated = false;
    let thisTeam: TeamsType;
    let teamMembers: { id: string; username: string; user_avatar: string; user_affiliation: string }[] = [];
    let teams: { team_name: string; team_description: string; team_country_code: string }[] = [];
    let inputs = {
        teamToken: '',
        teamName: '',
        teamDesc: '',
        teamCountry: ''
    };
    let menus = {
        create: false,
        join: false
    };

    onMount(async () => {
        await refreshTeams();
        if (session.user_team_id !== '' && session.user_team_id !== 'someTeam') {
            hasTeam = true;
            await refreshTeamInfo();
            await refreshTeamMembers();
        }
        loading = false;
    });

    async function refreshTeams() {
        const DATA = await requestWrapper(false, { type: 'teams' });
        const JSON = await DATA.json();
        teams = JSON.data;
    }

    async function refreshTeamInfo() {
        const DATA = await requestWrapper(false, { type: 'team-info', data: { id: session.user_team_id } });
        const JSON = await DATA.json();
        thisTeam = JSON.data;
        hasCreated = session.id === thisTeam.team_creator;
    }

    async function refreshTeamMembers() {
        const DATA = await requestWrapper(false, { type: 'team-members', data: { id: session.user_team_id } });
        const JSON = await DATA.json();
        teamMembers = JSON.data;
    }

    async function resetToken() {
        const DATA = await requestWrapper(false, {
            type: 'reset-team-token',
            data: {
                session: sessionID,
                teamID: thisTeam.id
            }
        });
        if (DATA.ok) {
            menus.create = false;
            await refreshTeamInfo();
        }
    }

    async function createTeam() {
        const DATA = await requestWrapper(false, {
            type: 'create-team',
            data: {
                session: sessionID,
                creator: session.id,
                name: inputs.teamName,
                description: inputs.teamDesc,
                country: inputs.teamCountry
            }
        });
        if (DATA.ok) {
            menus.create = false;
            await refreshTeams();
            window.location.reload();
        }
    }

    async function joinTeam() {
        const DATA = await requestWrapper(false, {
            type: 'join-team',
            data: { session: sessionID, user: session.id, token: inputs.teamToken }
        });
        if (DATA.ok) {
            menus.join = false;
            window.location.reload();
        }
    }

    async function leaveTeam() {
        const DATA = await requestWrapper(false, {
            type: 'leave-team',
            data: { session: sessionID, teamID: thisTeam.id }
        });
        if (DATA.ok) {
            window.location.reload();
        }
    }
</script>

<!--
    Create Popup
-->

<Modal
    dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
    defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
    backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
    color="none"
    outsideclose
    title="Create Team"
    bind:open={menus.create}
>
    <div class="mb-6">
        <Label for="team-name" class="mb-2">Team Name</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            bind:value={inputs.teamName}
            name="team-name"
            type="text"
            placeholder="BugHunters"
            required
        />
    </div>
    <div class="mb-6">
        <Label for="team-textarea" class="mb-2">Team Description</Label>
        <Textarea
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="event-textarea"
            name="team-textarea"
            placeholder="..."
            rows="4"
            bind:value={inputs.teamDesc}
        />
    </div>
    <div class="mb-6">
        <Label class="mb-2">Select Country</Label>
        <Select
            defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
            bind:value={inputs.teamCountry}
            placeholder=""
        >
            <option selected value="">None</option>
            {#each COUNTRIES as { value, name }}
                <option {value}>{name}</option>
            {/each}
        </Select>
    </div>
    <svelte:fragment slot="footer">
        <Button
            on:click={createTeam}
            disabled={inputs.teamName === '' || inputs.teamDesc === '' || inputs.teamCountry === ''}>Create</Button
        >
        <Button
            on:click={() => {
                menus.create = false;
            }}
            color="alternative">Cancel</Button
        >
    </svelte:fragment>
</Modal>

<!--
    Join Popup
-->

<Modal
    dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
    defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
    backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
    color="none"
    outsideclose
    title="Join Team"
    bind:open={menus.join}
>
    <div class="mb-6 text-center">
        <Label for="team-token" class="mb-2">Team Token</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            bind:value={inputs.teamToken}
            name="team-token"
            type="text"
            placeholder="CTD-X7X5K8..."
            required
        />
    </div>
    <svelte:fragment slot="footer">
        <Button on:click={joinTeam} disabled={inputs.teamToken === ''}>Join</Button>
        <Button
            on:click={() => {
                menus.join = false;
            }}
            color="alternative">Cancel</Button
        >
    </svelte:fragment>
</Modal>

<!--
    Main
-->

<div class="flex flex-col flex-grow flex-1 max-w-8/10">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="flex flex-col items-center">
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                YOUR TEAM
            </h1>
            <Card
                size="sm"
                padding="sm"
                img=""
                class="m-4 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
            >
                {#if !hasTeam}
                    <h1 class="mx-auto">You are currently not playing for any team!</h1>
                    <div class="flex flex-row space-x-4 justify-center mt-4">
                        <Button
                            on:click={() => {
                                menus.join = true;
                            }}
                        >
                            Join
                        </Button>
                        <Button
                            on:click={() => {
                                menus.create = true;
                            }}
                            disabled={hasCreated}
                        >
                            Create
                        </Button>
                    </div>
                {:else if Object.keys(thisTeam).length > 0}
                    <div transition:fade>
                        {#if hasCreated}
                            <h1>You are leading: <b>{thisTeam.team_name}</b></h1>
                        {:else}
                            <h1>You are playing for: <b>{thisTeam.team_name}</b></h1>
                        {/if}
                        <p>Description: <b>{thisTeam.team_description}</b></p>
                        <p>Country: <span class="fi fi-{thisTeam.team_country_code.toLowerCase()}"></span></p>
                        <h1>Your Team-Token is: <b>{thisTeam.team_join_token}</b></h1>
                        <h1>Members: <b>{teamMembers.length}</b></h1>
                        {#if teamMembers.length > 0}
                            <div class="flex flex-col m-4">
                                <table>
                                    <tr class="text-center border-b-2">
                                        <th class="border-x-2 p-2"><b>Username</b></th>
                                        <th class="border-x-2 p-2"><b>Affiliation</b></th>
                                    </tr>
                                    {#each teamMembers as member}
                                        <tr class="text-center">
                                            <td class="border-x-2 p-2"
                                                >{member.username}
                                                {member.id === thisTeam.team_creator ? '(Owner)' : ''}</td
                                            >
                                            <td class="border-x-2 p-2">{member.user_affiliation}</td>
                                        </tr>
                                    {/each}
                                </table>
                            </div>
                        {/if}
                        <div class="flex flex-row justify-center items-center space-x-4">
                            {#if hasCreated}
                                <Button size="lg" class="mt-4" on:click={resetToken}>
                                    Reset Token <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                                </Button>
                            {/if}
                            <Button size="lg" class="mt-4" on:click={leaveTeam} disabled={teamMembers.length > 1}>
                                Leave Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                            </Button>
                        </div>
                    </div>
                {/if}
            </Card>
        </div>
        <div class="flex flex-col flex-1 items-center">
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                OTHER TEAMS
            </h1>
            {#if teams.length > 0}
                <Table color="custom" class="bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    <TableHead>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Description</TableHeadCell>
                        <TableHeadCell>Country</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each teams as entry}
                            <TableBodyRow>
                                <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                    {entry.team_name}
                                </TableBodyCell>
                                <TableBodyCell class="text-neutral-900 dark:text-neutral-100">
                                    {entry.team_description}
                                </TableBodyCell>
                                <TableBodyCell class="text-center text-neutral-900 dark:text-neutral-100">
                                    <span class="fi fi-{entry.team_country_code.toLowerCase()}"></span>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {:else}
                <div class="flex flex-col flex-1 justify-center text-center w-full h-full">
                    <div>
                        <Moon class="w-20 h-20 p-4 mx-auto text-neutral-900 dark:text-neutral-100" />
                    </div>
                    <h1 class="text-neutral-900 dark:text-neutral-100 font-bold italic">No Teams found.</h1>
                </div>
            {/if}
        </div>
    {/if}
</div>
