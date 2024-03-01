<script lang="ts">
    import { Card, Button, Spinner, Label, Alert, Input } from 'flowbite-svelte';
    import { requestWrapper } from '../lib/helpers';
    import { onMount } from 'svelte';
    import { AccordionItem, Accordion } from 'flowbite-svelte';
    import type { ChallengesType } from '../lib/schema';

    export let uuid: string = '';
    export let team: string = '';

    let loading: boolean = true;
    let successFlag: boolean = false;
    let deploymentStatus: 0 | 1 | 2 | 3 = 0;
    let challenges: ChallengesType[] = [];
    let challengeResponse: any = false;
    let flagInput: string = '';
    let sortedData: any = false;

    onMount(async () => {
        //Fetch Challenges
        await refreshChallenges();

        //Sort Challenges by Category and Difficulty
        await sortByCategory(challenges);
        loading = false;
    });

    async function checkFlag(challenge_id: string, input: string) {
        const DATA = await requestWrapper(false, {
            type: 'check-flag',
            data: { teamID: team, challengeID: challenge_id, flag: input }
        });
        const JSON = await DATA.json();
        if (JSON.data.correct == true) {
            successFlag = true;
        }
    }

    async function sortByCategory(data: any[]) {
        // Category Sorting
        const categories: any = {};
        data.forEach((item: { challenge_category: any }) => {
            if (!categories[item.challenge_category]) {
                categories[item.challenge_category] = [];
            }
            categories[item.challenge_category].push(item);
        });

          // Difficulty Sorting
        for (const category in categories) {
            categories[category].sort((a: any, b: any) => {
            const difficultyOrder = ["Easy", "Medium", "Hard", "Other"];
            return difficultyOrder.indexOf(a.challenge_difficulty) - difficultyOrder.indexOf(b.challenge_difficulty);
            });
        }

        // 2. Convert the grouped object to an array of arrays
        sortedData = Object.values(categories);
    }

    async function refreshChallenges() {
        const DATA = await requestWrapper(false, { type: 'challenges', data: { id: uuid } });
        const JSON = await DATA.json();
        challenges = JSON.data;
    }

    async function deployChallenge(challenge_id: string) {
        deploymentStatus = 1;
        const DATA = await requestWrapper(false, {
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

    {#if loading}
        <div class="flex-1 text-center justify-center">
            <Spinner size={'16'} />
        </div>
    {:else if challenges.length > 0}
        {#each sortedData as category}
            <h1 class="text-3xl text-center mt-8">Category: {category[0].challenge_category}</h1>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2 place-items-center">

            {#each category as challenge}
                <Card
                    class="m-4 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <div class="mb-2">
                        <Label for="challenge-name" class="mb-2">Challenge Name</Label>
                        <p id="challenge-name">{challenge.challenge_name}</p>
                    </div>
                    <Accordion flush>
                        <AccordionItem>
                            <span slot="header">Challenge Description</span>
                            <p class="mb-2 text-gray-500 dark:text-gray-400">{challenge.challenge_description}</p>
                        </AccordionItem>
                    </Accordion>
                    <div class="mb-6 mt-6">
                        <Label for="challenge-diff" class="mb-2">Challenge Information</Label>
                        {#if challenge.challenge_difficulty == 'Easy'}
                            <p>Category: {challenge.challenge_category}</p>
                            <p id="challenge-diff" class="text-green-400">
                                Difficulty: {challenge.challenge_difficulty}
                            </p>
                        {:else if challenge.challenge_difficulty == 'Medium'}
                            <p>Category: {challenge.challenge_category}</p>
                            <p id="challenge-diff" class="text-orange-400">
                                Difficulty: {challenge.challenge_difficulty}
                            </p>
                        {:else if challenge.challenge_difficulty == 'Hard'}
                            <p>Category: {challenge.challenge_category}</p>
                            <p id="challenge-diff" class="text-red-400">Difficulty: {challenge.challenge_difficulty}</p>
                        {:else}
                            <p id="challenge-diff">Unknown</p>
                        {/if}
                    </div>
                    {#if challenge.static_file_url != ''}
                        <div class="mb-6">
                            <Label for="challenge-diff" class="mb-2">Challenge File</Label>
                            <div class="p-2 bg-primary-500 rounded-lg w-fit">
                                <a class="text-white" href={challenge.static_file_url} download
                                    >{challenge.static_file_url.split('/').pop()}</a
                                >
                            </div>
                        </div>
                    {/if}

                    <Label for="flag-submit" class="mb-2">Submit Flag</Label>
                    <div class="mb-6 flex">
                        <Input id="flag-submit" placeholder="TH ..." />
                        <Button type="submit" class="text-white px-4 py-2">Submit</Button>
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
                            <Button on:click={() => {}}>Submit</Button>
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
            </div>
        {/each}
    {/if}
