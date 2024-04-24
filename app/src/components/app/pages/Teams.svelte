<!--
  @component
  ## Props
  @prop export let session: User = {};
-->

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
    import { validAlphanumeric, validJoinToken, COUNTRIES } from '../../../lib/helpers';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    import Moon from 'flowbite-svelte-icons/MoonOutline.svelte';
    import type { TeamsType } from '../../../lib/schema';
    import { fade } from 'svelte/transition';
    import type { User } from 'lucia';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { UserRouter } from '../../../lib/trpc/user';

    export let session: User;

    const CLIENT = createTRPCClient<UserRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/user'
            })
        ]
    });

    let loading = true;
    let hasTeam = false;
    let hasCreated = false;
    let canLeaveTeam = false;
    let thisTeam: TeamsType | null;
    let teamMembers: { id: string; username: string; user_avatar: string; user_affiliation: string }[] = [];
    let teams: { id: string; team_name: string; team_description: string; team_country_code: string }[] = [];
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
        if (session.team_id !== '' && session.team_id !== 'someTeam') {
            hasTeam = true;
            await refreshTeamInfo();
            await refreshTeamMembers();
            await refreshLeavable();
        }
        loading = false;
    });

    async function refreshTeams() {
        teams = await CLIENT.getTeams.query();
    }

    async function refreshTeamInfo() {
        thisTeam = await CLIENT.getTeamInfo.query();
        if (thisTeam !== null) {
            hasCreated = session.id === thisTeam.creator_id;
            inputs.teamName = thisTeam.name;
            inputs.teamDesc = thisTeam.description;
        }
    }

    async function refreshTeamMembers() {
        teamMembers = await CLIENT.getTeamMembers.query();
    }

    async function refreshLeavable() {
        canLeaveTeam = await CLIENT.getTeamLeaveStatus.query();
    }

    async function resetToken() {
        const DATA = await CLIENT.updateTeamToken.mutate();
        if (DATA === true) {
            menus.create = false;
            await refreshTeamInfo();
        }
    }

    async function createTeam() {
        const DATA = await CLIENT.createTeam.mutate({
            name: inputs.teamName.slice(0, 50),
            description: inputs.teamDesc.slice(0, 100),
            country: inputs.teamCountry
        });
        if (DATA === true) {
            menus.create = false;
            await refreshTeams();
            window.location.reload();
        }
    }

    async function updateTeamData() {
        const DATA = await CLIENT.updateTeam.mutate({
            name: inputs.teamName.slice(0, 50),
            description: inputs.teamDesc.slice(0, 100)
        });
        if (DATA === true) {
            menus.create = false;
            await refreshTeams();
            window.location.reload();
        }
    }

    async function joinTeam() {
        const DATA = await CLIENT.joinTeam.mutate(inputs.teamToken.slice(0, 20));
        if (DATA === true) {
            menus.join = false;
            window.location.reload();
        }
    }

    async function leaveTeam() {
        const DATA = await CLIENT.leaveTeam.mutate();
        if (DATA === true) {
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
        />
    </div>
    <div class="mb-6">
        <Label for="team-desc" class="mb-2">Team Description</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            bind:value={inputs.teamDesc}
            name="team-desc"
            type="text"
            placeholder="..."
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
            disabled={inputs.teamName === '' ||
                !validAlphanumeric(inputs.teamName, 50, true) ||
                inputs.teamDesc === '' ||
                !validAlphanumeric(inputs.teamDesc, 100) ||
                inputs.teamCountry === ''}>Create</Button
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
        />
    </div>
    <svelte:fragment slot="footer">
        <Button on:click={joinTeam} disabled={inputs.teamToken === '' || !validJoinToken(inputs.teamToken)}>Join</Button
        >
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

<div class="flex flex-col flex-1 max-w-screen-2xl px-4">
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
                size="md"
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
                {:else if thisTeam !== null && Object.keys(thisTeam).length > 0}
                    <div transition:fade>
                        {#if hasCreated}
                            <h1>You are leading: <b>{thisTeam.name}</b></h1>
                        {:else}
                            <h1>You are playing for: <b>{thisTeam.name}</b></h1>
                        {/if}
                        <p>Description: <b>{thisTeam.description}</b></p>
                        <p>Country: <span class="fi fi-{thisTeam.country_code.toLowerCase()}"></span></p>

                        {#if teamMembers.length < 4}
                            <h1>Your Team-Token is: <b>{thisTeam.join_token}</b></h1>
                            <h1>Members: <b>{teamMembers.length}</b></h1>
                        {:else}
                            <h1>Members: <b>{teamMembers.length} (FULL)</b></h1>
                        {/if}
                        {#if teamMembers.length > 0}
                            <div class="flex flex-col m-4">
                                <table>
                                    <tr class="text-center border-b-2">
                                        <th class="border-r-2 p-2"><b>Username</b></th>
                                        <th class="p-2"><b>Affiliation</b></th>
                                    </tr>
                                    {#each teamMembers as member}
                                        <tr class="text-center">
                                            <td class="border-r-2 p-2"
                                                >{member.username}
                                                {member.id === thisTeam.creator_id ? '(Owner)' : ''}</td
                                            >
                                            <td class="p-2">{member.user_affiliation}</td>
                                        </tr>
                                    {/each}
                                </table>
                            </div>
                        {/if}
                        {#if hasCreated}
                            <div class="mb-6">
                                <Label for="team-name" class="mb-2">Team Name</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.teamName}
                                    name="team-name"
                                />
                            </div>
                            <div class="mb-6">
                                <Label for="team-desc" class="mb-2">Team Description</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.teamDesc}
                                    name="team-desc"
                                />
                            </div>
                        {/if}
                        <div class="flex flex-row justify-center items-center space-x-4">
                            {#if hasCreated}
                                <Button
                                    size="lg"
                                    class="mt-4"
                                    on:click={updateTeamData}
                                    disabled={inputs.teamName === '' ||
                                        inputs.teamDesc === '' ||
                                        !validAlphanumeric(inputs.teamName, 50, true) ||
                                        !validAlphanumeric(inputs.teamDesc, 100) ||
                                        (inputs.teamName == thisTeam.name && inputs.teamDesc == thisTeam.description)}
                                    >Save Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" /></Button
                                >
                                <Button size="lg" class="mt-4" on:click={resetToken}>
                                    Reset Token <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                                </Button>
                            {/if}
                            <Button
                                size="lg"
                                class="mt-4"
                                on:click={leaveTeam}
                                disabled={(teamMembers.length > 1 && session.id === thisTeam.creator_id) ||
                                    !canLeaveTeam}
                            >
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
                <div class="p-4 max-w-full">
                    <Table
                        color="custom"
                        class="bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        hoverable
                    >
                        <TableHead>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell>Country</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each teams as entry}
                                <TableBodyRow
                                    color="custom"
                                    class="hover:bg-neutral-500"
                                    on:click={() => {
                                        window.location.href = `/teams/${entry.id}`;
                                    }}
                                >
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
                </div>
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
