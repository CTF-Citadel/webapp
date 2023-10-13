<script>
    import { Card, Button, Modal, Label, Input } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    let defaultModal = false;
    let hasTeam = false;
    let teamSelection = {
        option: false
    };
    let inputs = {
        teamID: '',
        teamDesc: ''
    };

    function modelOpen(option) {
        defaultModal = false;
        inputs.teamID = '';
        inputs.teamDesc = '';
        teamSelection.option = option;
        console.log(teamSelection)
        defaultModal = true;
    }
</script>


{#if !hasTeam}
    <div class="flex flex-col sm:flex-row">
        <Card size="sm" padding="sm" img="" class="m-4">
            <Button on:click={() => modelOpen("Join")}>
                Join Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
            </Button>
        </Card>
        <Card size="sm" padding="sm" img="" class="m-4">
            <Button on:click={() => modelOpen("Create")}>
                Create Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </Button>
        </Card>
    </div>

    <Modal title="Team {teamSelection.option}" bind:open={defaultModal} autoclose>
        {#if teamSelection.option === "Join"}
        <Label class="space-y-2">
            <span>Team Token</span>
            <Input
                bind:value={inputs.teamID}
                type="txt"
                name="teamName"
                placeholder="Enter your Team Token"
                required
            />
        </Label>
        {:else if teamSelection.option === "Create"}
            <Label class="space-y-2">
                <span>Team Name</span>
                <Input
                    bind:value={inputs.teamID}
                    type="txt"
                    name="teamName"
                    placeholder="Team Name"
                    required
                />
            </Label>
            <Label class="space-y-2">
                <span>Team Description</span>
                <Input
                    bind:value={inputs.teamDesc}
                    type="txt"
                    name="teamDescr"
                    placeholder="We are the best!"
                />
            </Label>
        {/if}
        <svelte:fragment slot="footer">
        <Button on:click={() => alert('Handle "success"')} disabled={!inputs.teamID}>I accept</Button>
        <Button color="alternative">Decline</Button>
        </svelte:fragment>
    </Modal>
{:else if hasTeam}
    <h1>Here is your Team</h1>    
{/if}