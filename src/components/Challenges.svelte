<script lang="ts">
    import { Card, Button, Spinner, Label, Alert, Input } from 'flowbite-svelte';
    import { requestWrapper } from '../lib/helpers';
    import { onMount } from 'svelte';
    import { AccordionItem, Accordion } from 'flowbite-svelte';

    export let uuid: string = '';
    export let team: string = '';

    let loading: boolean = true;
    let successFlag: boolean = false;
    let deploymentStatus: 0 | 1 | 2 | 3 = 0;
    let challenges: any[] = [];
    let challengeResponse: any = false;
    let flagInput: string = '';

    onMount(async () => {
        await refreshChallenges();
        loading = false;
        console.log(challenges);
        console.log(challenges.length);
    });

    async function checkFlag(challenge_id: string, input: string) {
        const DATA = await requestWrapper('/events/' + uuid, {
            type: 'check-flag',
            data: { teamID: team, challengeID: challenge_id, flag: input }
        });
        const JSON = await DATA.json();
        if (JSON.data.correct == true) {
            successFlag = true;
        }
    }

    async function refreshChallenges() {
        const DATA = await requestWrapper('/events/' + uuid, { type: 'challenges', data: { id: uuid } });
        const JSON = await DATA.json();
        challenges = JSON.data;
    }

    async function deployChallenge(challenge_id: string) {
        deploymentStatus = 1;
        const DATA = await requestWrapper('/events/' + uuid, {
            type: 'deploy-challenge',
            data: { teamID: team, challengeID: challenge_id }
        });
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

<div class="flex flex-wrap gap-4 ml-4 mt-3 overflow-hidden">
    {#if loading}
        <div class="flex-1 text-center justify-center">
            <Spinner size={'16'} />
        </div>
    {:else if challenges.length > 0}
        {#each challenges as challenge}
            <Card class="flex-1 max-w-[32%] min-w-[32%]">
                <div class="mb-6">
                    <Label for="challenge-name" class="mb-2">Challenge Name</Label>
                    <p id="challenge-diff">{challenge.challenge_name}</p>
                </div>
                <Accordion flush>
                    <AccordionItem>
                        <span slot="header">Challenge Description</span>
                        <p class="mb-2 text-gray-500 dark:text-gray-400">{challenge.challenge_description}</p>                    
                    </AccordionItem>
                </Accordion>
                <div class="mb-6">
                    <Label for="challenge-diff" class="mb-2">Challenge Difficulty</Label>
                    <p id="challenge-diff">{challenge.challenge_diff}</p>
                </div>
                <div class="mb-6">
                    <Label for="challenge-diff" class="mb-2">Challenge File</Label>
                    <div class="p-2 bg-primary-500 rounded-lg w-fit">
                        <a class="text-white" href={challenge.container_file} download
                            >{challenge.container_file.split('/').pop()}</a
                        >
                    </div>
                </div>
                <div>
                    {#if challenge.needs_container}
                        <Button
                            on:click={() => {
                                deployChallenge(challenge.id);
                            }}
                        >
                            {#if deploymentStatus == 1}
                                <Spinner class="mr-3" size="4" />Starting ..
                            {:else}
                                Start
                            {/if}
                        </Button>
                    {/if}
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
                                checkFlag(challenge.challenge_uuid, flagInput);
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

