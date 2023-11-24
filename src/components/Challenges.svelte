<script lang="ts">
    import { Card, Button, Spinner, Label, Alert, Input } from 'flowbite-svelte';
    import { requestWrapper } from '../lib/helpers';
    import { onMount } from 'svelte';

    export let uuid: string = '';

    let loading: boolean = true;
    let successFlag: boolean = false;
    let deploymentStatus: 0 | 1 | 2 | 3 = 0;
    let challenges: any[] = [];
    let challengeResponse: any = false;
    let flagInput: string = '';

    onMount(async () => {
        await refreshChallenges();
        loading = false;
    });

    function checkFlag(input: string) {
        if (input == challengeResponse.details.FLAG) {
            successFlag = true;
        }
    }

    async function refreshChallenges() {
        const DATA = await requestWrapper('/events/' + uuid, { type: 'challenges', data: { id: uuid } });
        const JSON = await DATA.json();
        challenges = JSON.data;
    }

    async function deployChallenge() {
        deploymentStatus = 1;
        const DATA = await requestWrapper('/events/' + uuid, { type: 'deploy-challenge' });
        if (DATA.ok) {
            const TEMP = await DATA.json();
            challengeResponse = TEMP.data;
            deploymentStatus = 3;
            return true;
        } else {
            deploymentStatus = 2;
            return false;
        }
    }
</script>

<div class="flex flex-col 2xl:flex-row">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else if challenges.length > 0}
        {#each challenges as challenge}
            <Card>
                <div class="mb-6">
                    <Label for="challenge-name" class="mb-2">Challenge Name</Label>
                    <p id="challenge-diff">{challenge.challenge_name}</p>
                </div>
                <div class="mb-6">
                    <Label for="challenge-desc" class="mb-2">Challenge Description</Label>
                    <p id="challenge-diff">{challenge.challenge_description}</p>
                </div>
                <div class="mb-6">
                    <Label for="challenge-diff" class="mb-2">Challenge Difficulty</Label>
                    <p id="challenge-diff">{challenge.challenge_diff}</p>
                </div>
                <div>
                    <Button on:click={deployChallenge}>
                        {#if deploymentStatus == 1}
                            <Spinner class="mr-3" size="4" />Starting ..
                        {:else}
                            Start
                        {/if}
                    </Button>
                </div>
                {#if challengeResponse && deploymentStatus == 3}
                    <Alert class="my-2" color="green">
                        <span class="font-bold">Started!</span><br />
                        Infos below.
                    </Alert>
                    <div class="mb-2">
                        <Label for="challenge-ip" class="mb-2">IP</Label>
                        <p id="challenge-ip">{challengeResponse.details.IP}</p>
                    </div>
                    <div class="mb-2">
                        <Label for="challenge-port" class="mb-2">Port</Label>
                        <p id="challenge-port">{challengeResponse.details.PORT}</p>
                    </div>
                    <div class="mb-6">
                        <Label for="flag" class="mb-2">Flag</Label>
                        <Input id="flag" placeholder="TH..." bind:value={flagInput} required />
                    </div>
                    <div>
                        <Button
                            on:click={() => {
                                checkFlag(flagInput);
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                    {#if successFlag}
                        <Alert class="my-2" color="green">
                            <span class="font-bold">Correct Flag!</span><br />
                            Congratulations.
                        </Alert>
                    {/if}
                {/if}
            </Card>
        {/each}
    {/if}
</div>
