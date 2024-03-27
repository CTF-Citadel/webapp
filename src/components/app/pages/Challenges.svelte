<script lang="ts">
    import { Card, Button, Spinner, Label, Alert, Input } from 'flowbite-svelte';
    import { requestWrapper } from '../../../lib/helpers';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import { AccordionItem, Accordion } from 'flowbite-svelte';
    import type { ChallengesType } from '../../../lib/schema';
    import DownloadSolid from 'flowbite-svelte-icons/DownloadSolid.svelte'

    export let uuid: string = '';
    export let team: string = '';
    export let user: string = '';

    let loading: boolean = true;
    let successFlag: { [key: string]: -1 | 0 | 1 } = {};
    let deploymentStatus: { [key: string]: 0 | 1 | 2 | 3 } = {};
    let challenges: ChallengesType[] = [];
    let solvedChallenges: string[] = [];
    let challengeResponse: { [key: string]: any } = {};
    let challengeInputs: { [key: string]: string } = {};
    let categories: { [key: string]: ChallengesType[] } = {};

    onMount(async () => {
        await refreshChallenges().finally(() => {
            sortByCategory(challenges);
        });
        await refreshSolvedChallenges();
        loading = false;
    });

    function checkFlagInput(input: string): boolean {
        return /^TH{.*}$/.test(input);
    }

    async function checkFlag(challenge_id: string, input: string, staticFlag: boolean) {
        successFlag[challenge_id] = -1;
        const TYPE = staticFlag ? 'check-flag-static' : 'check-flag';
        const DATA = await requestWrapper(false, {
            type: TYPE,
            data: { userID: user, teamID: team, eventID: uuid, challengeID: challenge_id, flag: input }
        });
        const JSON = await DATA.json();
        if (JSON.data.correct == true) {
            successFlag[challenge_id] = 0;
        } else successFlag[challenge_id] = 1;
        setTimeout(async () => {
            successFlag[challenge_id] = -1;
            await refreshSolvedChallenges();
        }, 2000);
    }

    function sortByCategory(data: ChallengesType[]) {
        // Category Sorting
        data.forEach((item) => {
            if (!categories[item.challenge_category]) {
                categories[item.challenge_category] = [];
            }
            categories[item.challenge_category].push(item);
        });

        // Difficulty Sorting
        for (const category in categories) {
            categories[category].sort((a: any, b: any) => {
                const difficultyOrder = ['Easy', 'Medium', 'Hard', 'Other'];
                return (
                    difficultyOrder.indexOf(a.challenge_difficulty) - difficultyOrder.indexOf(b.challenge_difficulty)
                );
            });
        }
    }

    async function refreshChallenges() {
        const DATA = await requestWrapper(false, { type: 'challenges', data: { eventID: uuid, teamID: team } });
        const JSON = await DATA.json();
        challenges = JSON.data;
    }

    async function refreshSolvedChallenges() {
        const DATA = await requestWrapper(false, { type: 'solved-challenges', data: { id: team } });
        const JSON = await DATA.json();
        solvedChallenges = [];
        for (let entry of JSON.data) {
            solvedChallenges.push(entry.id);
        }
    }

    async function deployChallenge(challenge_id: string) {
        deploymentStatus[challenge_id] = 1;
        const DATA = await requestWrapper(false, {
            type: 'deploy-challenge',
            data: { teamID: team, challengeID: challenge_id, eventID: uuid }
        });
        if (DATA.ok) {
            const TEMP = await DATA.json();
            if (TEMP.error == false) {
                challengeResponse[challenge_id] = TEMP.data;
                deploymentStatus[challenge_id] = 3;
            } else {
                deploymentStatus[challenge_id] = 2;
            }
        } else {
            deploymentStatus[challenge_id] = 2;
        }
    }
</script>

{#if loading}
    <div class="flex-1 text-center justify-center">
        <Spinner size={'16'} />
    </div>
{:else if challenges.length > 0}
    {#each Object.entries(categories) as [key, value]}
        <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
            <span class="italic text-neutral-500 opacity-50">#</span>
            {key}
        </h1>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2 place-items-center items-start m-4">
            {#each value as challenge}
                <Card
                    style="border-color: {challenge.challenge_difficulty === 'Easy'
                        ? '#28a745'
                        : challenge.challenge_difficulty === 'Medium'
                          ? '#FF9800'
                          : '#dc3545'}; filter: drop-shadow(8px 8px 4px {challenge.challenge_difficulty === 'Easy'
                        ? '#28a745'
                        : challenge.challenge_difficulty === 'Medium'
                          ? '#FF9800'
                          : '#dc3545'});"
                    class="bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl my-2"
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
                        <p>Category: {challenge.challenge_category}</p>
                        <p
                            style="color: {challenge.challenge_difficulty === 'Easy'
                                ? '#28a745'
                                : challenge.challenge_difficulty === 'Medium'
                                  ? '#FF9800'
                                  : '#dc3545'};"
                        >
                            Difficulty: {challenge.challenge_difficulty}
                        </p>
                    </div>
                    {#if !solvedChallenges.includes(challenge.id)}
                        {#if challenge.static_file_url != ''}
                            <div class="mb-6">
                                <Label for="challenge-diff" class="mb-2">Challenge File</Label>
                                <div class="p-2 bg-primary-500 rounded-lg w-fit flex flex-row space-x-2 align-middle justify-center">
                                    <DownloadSolid size="md" color="#fff" />
                                    <a class="text-white" href={challenge.static_file_url} download
                                        >{challenge.static_file_url.split('/')[(challenge.static_file_url.split('/')).length - 1].split('?')[0]}</a
                                    >
                                </div>
                            </div>
                        {/if}
                        {#if challenge.needs_container}
                            <div class="mb-6">
                                <Button
                                    on:click={() => {
                                        deployChallenge(challenge.id);
                                    }}
                                >
                                    {#if deploymentStatus[challenge.id] == 1}
                                        <Spinner class="mr-3" size="4" />Starting ..
                                    {:else}
                                        Start
                                    {/if}
                                </Button>
                            </div>
                        {/if}
                        {#if challengeResponse[challenge.id] && deploymentStatus[challenge.id] == 3}
                            <div class="mb-6" transition:slide>
                                <Alert class="my-2" color="green">
                                    <span class="font-bold">Started!</span><br />
                                    Infos below.
                                </Alert>
                            </div>
                            <div class="mb-6">
                                <Label for="challenge-ip" class="mb-2">Host</Label>
                                <a href="http://{challengeResponse[challenge.id].details.IP}/"><p id="challenge-ip">{challengeResponse[challenge.id].details.IP}</p></a>
                            </div>
                        {:else if deploymentStatus[challenge.id] == 2}
                            <div class="mb-6" transition:slide>
                                <Alert class="my-2" color="red">
                                    <span class="font-bold">Failed!</span><br />
                                    Contact Admin if this repeats.
                                </Alert>
                            </div>
                        {/if}
                        <div class="mb-6">
                            <Label for="flag-submit" class="mb-2">Submit Flag</Label>
                            <Input
                                id="flag-submit"
                                placeholder="TH&lcub;&rcub;"
                                bind:value={challengeInputs[challenge.id]}
                                required
                            />
                        </div>
                        <div>
                            <Button
                                disabled={challengeInputs[challenge.id] == '' ||
                                    !checkFlagInput(challengeInputs[challenge.id]) ||
                                    (challenge.needs_container && deploymentStatus[challenge.id] != 3 ||
                                    successFlag[challenge.id] === 0)}
                                on:click={() =>
                                    checkFlag(challenge.id, challengeInputs[challenge.id], challenge.flag_static)}
                                >Submit</Button
                            >
                        </div>
                        {#if successFlag[challenge.id] === 0}
                            <div transition:slide class="mt-6">
                                <Alert class="my-2" color="green">
                                    <span class="font-bold">Correct Flag!</span><br />
                                    Congratulations.
                                </Alert>
                            </div>
                        {:else if successFlag[challenge.id] === 1}
                            <div transition:slide class="mt-6">
                                <Alert class="my-2" color="red">
                                    <span class="font-bold">Incorrect!</span><br />
                                    Try again.
                                </Alert>
                            </div>
                        {/if}
                    {:else}
                        <div transition:slide class="mt-6">
                            <Alert class="my-2" color="green">
                                <span class="font-bold">Already Solved!</span><br />
                                Try some other Challenges!
                            </Alert>
                        </div>
                    {/if}
                </Card>
            {/each}
        </div>
    {/each}
{:else}
    <div class="text-center">
        <h1 class="text-neutral-900 dark:text-neutral-100 font-bold italic">No Challenges found.</h1>
    </div>
{/if}
