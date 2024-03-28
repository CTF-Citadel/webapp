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
    import type { TeamsType } from '../../../lib/schema';

    export let sessionID: string = '';
    export let session: any = {};

    let loading = true;
    let defaultModal = false;
    let hasTeam = false;
    let hasCreated = false;
    let thisTeam: TeamsType;
    let teams: { team_name: string; team_description: string; team_country_code: string }[] = [];
    let selection: 0 | 'Join' | 'Create' = 0;
    let inputs = {
        teamToken: '',
        teamName: '',
        teamDesc: '',
        teamCountry: ''
    };

    onMount(async () => {
        await refreshTeams();
        // check for team
        if (session.user_team_id != '' && session.user_team_id != 'someTeam') {
            hasTeam = true;
            await refreshTeamInfo();
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
            defaultModal = false;
            await refreshTeams();
            window.location.reload();
        } else return false;
    }

    async function joinTeam() {
        const DATA = await requestWrapper(false, {
            type: 'join-team',
            data: { session: sessionID, user: session.id, token: inputs.teamToken }
        });
        if (DATA.ok) {
            defaultModal = false;
            window.location.reload();
        } else return false;
    }

    async function leaveTeam() {
        const DATA = await requestWrapper(false, {
            type: 'leave-team',
            data: { session: sessionID }
        });
        if (DATA.ok) {
            window.location.reload();
        } else return false;
    }

    function refreshValues() {
        inputs.teamName = '';
        inputs.teamDesc = '';
        inputs.teamCountry = '';
        inputs.teamToken = '';
    }

    function modalOpen(option: 'Join' | 'Create') {
        defaultModal = false;
        refreshValues();
        if (option == 'Join') {
            inputs.teamName = 'placeholder';
        } else {
            inputs.teamToken = 'placeholder';
        }
        selection = option;
        defaultModal = true;
    }
</script>

<Modal title="{selection} a new Team" bind:open={defaultModal} autoclose>
    {#if selection == 'Join'}
        <div class="mb-6 text-center">
            <Label for="team-token" class="mb-2">Team Token</Label>
            <Input
                bind:value={inputs.teamToken}
                class="text-center"
                name="team-token"
                type="text"
                placeholder="C7w1nuEyk..."
                required
            />
        </div>
    {:else if selection == 'Create'}
        <div class="mb-6">
            <Label for="team-name" class="mb-2">Team Name</Label>
            <Input bind:value={inputs.teamName} name="team-name" type="text" placeholder="BugHunters" required />
        </div>
        <div class="mb-6">
            <Label for="team-textarea" class="mb-2">Team Description</Label>
            <Textarea
                id="event-textarea"
                name="team-textarea"
                placeholder="..."
                rows="4"
                bind:value={inputs.teamDesc}
            />
        </div>
        <div class="mb-6">
            <Label for="team-textarea" class="mb-2">
                <Select class="mt-2" items={COUNTRIES} bind:value={inputs.teamCountry} />
            </Label>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        {#if selection == 'Join'}
            <Button on:click={joinTeam} disabled={inputs.teamToken == ''}>{selection}</Button>
        {:else}
            <Button
                on:click={createTeam}
                disabled={inputs.teamName == '' || inputs.teamDesc == '' || inputs.teamCountry == ''}
                >{selection}</Button
            >
        {/if}
        <Button
            on:click={() => {
                defaultModal = false;
            }}
            color="alternative">Cancel</Button
        >
    </svelte:fragment>
</Modal>

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
            {#if !hasTeam}
                <Card
                    size="sm"
                    padding="sm"
                    img=""
                    class="m-4 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <p>You are currently not playing for any team!</p>
                    <Button size="lg" class="mt-4" on:click={() => modalOpen('Join')}>
                        Join Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                    </Button>
                    <Button size="lg" class="mt-4" on:click={() => modalOpen('Create')} disabled={hasCreated}>
                        Create Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                    </Button>
                </Card>
            {:else if Object.keys(thisTeam).length > 0}
                <Card
                    size="lg"
                    padding="sm"
                    img=""
                    class="m-4 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    {#if hasCreated}
                        <h1>You are the <b>TEAM LEADER</b> of: <b>{thisTeam.team_name}</b></h1>
                    {:else}
                        <h1>You are playing for: <b>{thisTeam.team_name}</b></h1>
                    {/if}
                    <p>Description <b>{thisTeam.team_description}</b></p>
                    <p>Country: <span class="fi fi-{thisTeam.team_country_code.toLowerCase()}"></span></p>
                    <h1>Your Team-Token is: <b>{thisTeam.team_join_token}</b></h1>
                    <div class="flex flex-row justify-center items-center space-x-4">
                        {#if hasCreated}
                            <Button size="lg" class="mt-4">
                                Refresh Token <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                            </Button>
                        {/if}
                        <Button size="lg" class="mt-4" on:click={leaveTeam} disabled={hasCreated}>
                            Leave Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
                        </Button>
                    </div>
                </Card>
            {/if}
        </div>
        <div class="flex flex-col flex-1 items-center">
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                OTHER TEAMS
            </h1>
            {#if teams.length > 0}
                <Table>
                    <TableHead>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Description</TableHeadCell>
                        <TableHeadCell>Country</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each teams as entry}
                            <TableBodyRow>
                                <TableBodyCell>
                                    {entry.team_name}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {entry.team_description}
                                </TableBodyCell>
                                <TableBodyCell class="text-center">
                                    <span class="fi fi-{entry.team_country_code.toLowerCase()}"></span>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {:else}
                <div class="text-center">
                    <h1>No other Teams registered</h1>
                </div>
            {/if}
        </div>
    {/if}
</div>
