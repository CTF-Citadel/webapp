<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Button, Modal, Label, Input, Spinner, Textarea, Select } from 'flowbite-svelte';
    import { requestWrapper, COUNTRIES } from '../lib/helpers';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    let loading = true;
    let defaultModal = false;
    let hasTeam = false;
    let teams: any[] = [];
    let selection: 0 | 'Join' | 'Create' = 0;
    let inputs = {
        teamToken: '',
        teamName: '',
        teamDesc: '',
        teamCountry: ''
    };

    onMount(async () => {
        await refreshTeams();
        loading = false;
    });

    async function refreshTeams() {
        const DATA = await requestWrapper('/teams', { type: 'teams' });
        const JSON = await DATA.json();
        teams = JSON.data;
    }

    async function createTeam() {
        const DATA = await requestWrapper('/teams', {
            type: 'create-team',
            data: { name: inputs.teamName, description: inputs.teamDesc, country: inputs.teamCountry }
        });
        if (DATA.ok) {
            defaultModal = false;
            await refreshTeams();
            return true;
        } else return false;
    }

    function modelOpen(option: 'Join' | 'Create') {
        defaultModal = false;
        inputs.teamName = '';
        inputs.teamDesc = '';
        selection = option;
        defaultModal = true;
    }
</script>

<Modal title="{selection} a new Team" bind:open={defaultModal} autoclose>
    {#if selection == 'Join'}
        <div class="mb-6 text-center">
            <Label for="team-token" class="mb-2">Team Token</Label>
            <Input bind:value={inputs.teamToken} class="text-center" name="team-token" type="text" placeholder="C7w1nuEyk..." required />
        </div>
    {:else if selection == 'Create'}
        <div class="mb-6">
            <Label for="team-name" class="mb-2">Team Name</Label>
            <Input bind:value={inputs.teamName} name="team-name" type="text" placeholder="BugHunters" required />
        </div>
        <div class="mb-6">
            <Label for="team-textarea" class="mb-2">Team Description</Label>
            <Textarea id="event-textarea" name="team-textarea" placeholder="..." rows="4" bind:value={inputs.teamDesc} />
        </div>
        <div class="mb-6">
            <Label for="team-textarea" class="mb-2">
                <Select class="mt-2" items={COUNTRIES} bind:value={inputs.teamCountry} />
            </Label>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button on:click={createTeam} disabled={inputs.teamName == '' || inputs.teamDesc == ''}>{selection}</Button>
        <Button color="alternative">Cancel</Button>
    </svelte:fragment>
</Modal>

{#if loading}
    <div class="text-center">
        <Spinner size={'16'} />
    </div>
{:else if !hasTeam}
    <div class="flex flex-col sm:flex-row">
        <Card size="sm" padding="sm" img="" class="m-4">
            <Button on:click={() => modelOpen('Join')}>
                Join Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </Button>
        </Card>
        <Card size="sm" padding="sm" img="" class="m-4">
            <Button on:click={() => modelOpen('Create')}>
                Create Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </Button>
        </Card>
    </div>
{:else}
    <div class="text-center">
        <h1>You're currently not in a Team.</h1>
    </div>
{/if}
