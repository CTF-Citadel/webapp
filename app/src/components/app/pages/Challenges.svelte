<!--
  @component
  ## Props
  @prop export let uuid: string = '';
  @prop export let flagPrefix: string = '';
-->

<script lang="ts">
    import { Card, Button, Spinner, Label, Alert, Input } from 'flowbite-svelte';
    import { validFlag } from '../../../lib/helpers';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import { AccordionItem, Accordion } from 'flowbite-svelte';
    import type { ChallengesType } from '../../../lib/schema';
    import DownloadSolid from 'flowbite-svelte-icons/DownloadSolid.svelte';
    import Moon from 'flowbite-svelte-icons/MoonOutline.svelte';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { UserRouter } from '../../../lib/trpc/user';
    import { newNotify } from '../../../lib/notify';

    export let uuid: string = '';
    export let flagPrefix: string = '';

    const CLIENT = createTRPCClient<UserRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/user'
            })
        ]
    });

    let loading: boolean = true;
    let successFlag: { [key: string]: -1 | 0 | 1 } = {};
    let deploymentStatus: { [key: string]: 0 | 1 | 2 | 3 } = {};
    let challenges: ChallengesType[] = [];
    let deployments: {
        challenge_id: string;
        challenge_host: string;
        challenge_port: string;
        is_running: boolean;
    }[] = [];
    let solvedChallenges: string[] = [];
    let challengeSolves: { [key: string]: number } = {};
    let challengeInputs: { [key: string]: string } = {};
    let categories: { [key: string]: ChallengesType[] } = {};

    onMount(async () => {
        await refreshChallenges().finally(() => {
            sortByCategory(challenges);
        });
        await refreshDeployedChallenges();
        await refreshSolvedChallenges();
        await refreshSolveScores();
        loading = false;
    });

    async function checkFlag(challenge_id: string, input: string, type: 'static' | 'dynamic' | 'pool') {
        successFlag[challenge_id] = -1;
        let data: boolean;
        if (type === 'static') {
            data = await CLIENT.checkStaticFlag.mutate({
                eventId: uuid,
                challengeId: challenge_id,
                flag: input
            });
        } else if (type === 'pool') {
            data = await CLIENT.checkPoolFlag.mutate({
                eventId: uuid,
                challengeId: challenge_id,
                flag: input
            });
        } else {
            data = await CLIENT.checkDynamicFlag.mutate({
                eventId: uuid,
                challengeId: challenge_id,
                flag: input
            });
        }
        if (data === true) {
            successFlag[challenge_id] = 0;
        } else successFlag[challenge_id] = 1;
        setTimeout(async () => {
            successFlag[challenge_id] = -1;
            await refreshChallenges().finally(() => {
                sortByCategory(challenges);
            });
            await refreshSolvedChallenges();
        }, 2000);
    }

    function sortByCategory(data: ChallengesType[]) {
        // clear array
        categories = {};
        // Category Sorting
        data.forEach((item) => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
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
        challenges = await CLIENT.getChallenges.query(uuid);
    }

    async function refreshDeployedChallenges() {
        deployments = await CLIENT.getDeployedChallenges.query(uuid);
    }

    async function refreshSolvedChallenges() {
        const DATA = await CLIENT.getTeamSolved.query();
        solvedChallenges = [];
        for (let entry of DATA) {
            solvedChallenges.push(entry.id);
        }
    }

    async function refreshSolveScores() {
        const DATA = await CLIENT.getChallengeSolves.query(uuid);
        challengeSolves = {};
        for (let entry of DATA) {
            challengeSolves[entry.id] = entry.solves;
        }
    }

    async function deployChallenge(challenge_id: string) {
        deploymentStatus[challenge_id] = 1;
        const DATA = await CLIENT.deployChallenge.mutate({
            challengeId: challenge_id,
            eventId: uuid
        });
        if (DATA === true) {
            deploymentStatus[challenge_id] = 3;
        } else {
            deploymentStatus[challenge_id] = 2;
            newNotify('Deployment Failed', true);
        }
        setTimeout(async () => {
            await refreshChallenges().finally(() => {
                sortByCategory(challenges);
            });
            await refreshDeployedChallenges();
        }, 2000);
    }
</script>

{#if loading}
    <div class="flex-1 text-center justify-center">
        <Spinner size={'16'} />
    </div>
{:else if challenges.length > 0}
    <div class="flex-1 max-w-screen-2xl px-4">
        {#each Object.entries(categories) as [key, value]}
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                {key}
            </h1>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2 place-items-center items-start">
                {#each value as challenge}
                    <Card
                        style="border-color: {challenge.difficulty === 'Easy'
                            ? '#28a745'
                            : challenge.difficulty === 'Medium'
                              ? '#FF9800'
                              : '#dc3545'}; filter: drop-shadow(0px 0px 6px {challenge.difficulty === 'Easy'
                            ? '#28a745'
                            : challenge.difficulty === 'Medium'
                              ? '#FF9800'
                              : '#dc3545'});"
                        class="bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl my-2"
                    >
                        <div class="mb-2">
                            <Label for="challenge-name" class="mb-2">Challenge Name</Label>
                            <p id="challenge-name">{challenge.name}</p>
                        </div>
                        <div class="mb-4">
                            <Accordion flush>
                                <AccordionItem>
                                    <span slot="header">Challenge Description</span>
                                    <p class="text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                                        {challenge.description}
                                    </p>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <div class="mb-2">
                            <Label for="challenge-diff" class="mb-2">Challenge Information</Label>
                            <p>Category: {challenge.category}</p>
                            <p>
                                Difficulty:
                                <span
                                    style="color: {challenge.difficulty === 'Easy'
                                        ? '#28a745'
                                        : challenge.difficulty === 'Medium'
                                          ? '#FF9800'
                                          : '#dc3545'};"
                                >
                                    {challenge.difficulty}
                                </span>
                            </p>
                        </div>
                        {#if !solvedChallenges.includes(challenge.id)}
                            {#if challenge.file_url !== ''}
                                <div class="mb-6">
                                    <Label for="challenge-diff" class="mb-2">Challenge File</Label>
                                    <div
                                        class="p-2 bg-primary-500 rounded-lg w-fit flex flex-row space-x-2 align-middle justify-center"
                                    >
                                        <DownloadSolid size="md" color="#fff" />
                                        <a class="text-white" href={challenge.file_url} download
                                            >{challenge.file_url
                                                .split('/')
                                                [challenge.file_url.split('/').length - 1].split('?')[0]}</a
                                        >
                                    </div>
                                </div>
                            {/if}
                            {#if challenge.needs_container}
                                {#if deployments.find((entry) => entry.challenge_id === challenge.id)?.is_running === false}
                                    <div class="mb-6 text-center">
                                        <Alert class="my-2" color="green">
                                            <span class="font-bold">Queued!</span><br />
                                            Check back soon.
                                        </Alert>
                                    </div>
                                {:else if deployments.find((entry) => entry.challenge_id === challenge.id)?.is_running === true}
                                    <div class="mb-6">
                                        <Label for="challenge-host" class="mb-2">Container running at:</Label>
                                        <p id="challenge-host">
                                            {deployments.find((entry) => entry.challenge_id === challenge.id)
                                                ?.challenge_host}
                                        </p>
                                    </div>
                                {:else if deploymentStatus[challenge.id] === 3}
                                    <div class="mb-6 text-center" transition:slide>
                                        <Alert class="my-2" color="green">
                                            <span class="font-bold">Queued!</span><br />
                                            Check back soon.
                                        </Alert>
                                    </div>
                                {:else if deploymentStatus[challenge.id] === 2}
                                    <div class="mb-6 text-center" transition:slide>
                                        <Alert class="my-2" color="red">
                                            <span class="font-bold">Failed!</span><br />
                                            Contact Admin if this repeats.
                                        </Alert>
                                    </div>
                                {:else}
                                    <div class="mb-6 text-center" transition:slide>
                                        <Label class="mb-2">This Challenge needs a Container</Label>
                                        <Button
                                            disabled={deploymentStatus[challenge.id] === 1 ||
                                                deploymentStatus[challenge.id] === 3}
                                            on:click={() => {
                                                deployChallenge(challenge.id);
                                            }}
                                        >
                                            {#if deploymentStatus[challenge.id] === 1}
                                                <Spinner class="mr-3" size="4" />Requesting ..
                                            {:else}
                                                Request
                                            {/if}
                                        </Button>
                                    </div>
                                {/if}
                            {/if}
                            <div class="mb-6">
                                <Label for="flag-submit" class="mb-2">Submit Flag</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    id="flag-submit"
                                    placeholder="{flagPrefix}&lcub;&rcub;"
                                    bind:value={challengeInputs[challenge.id]}
                                />
                            </div>
                            <div>
                                <Button
                                    disabled={challengeInputs[challenge.id] === '' ||
                                        !validFlag(challengeInputs[challenge.id], flagPrefix) ||
                                        successFlag[challenge.id] === 0}
                                    on:click={() =>
                                        checkFlag(
                                            challenge.id,
                                            challengeInputs[challenge.id],
                                            challenge.needs_static
                                                ? 'static'
                                                : challenge.needs_pool
                                                  ? 'pool'
                                                  : 'dynamic'
                                        )}>Submit</Button
                                >
                            </div>
                            {#if successFlag[challenge.id] === 0}
                                <div transition:slide>
                                    <Alert class="my-2" color="green">
                                        <span class="font-bold">Correct Flag!</span><br />
                                        Congratulations.
                                    </Alert>
                                </div>
                            {:else if successFlag[challenge.id] === 1}
                                <div transition:slide>
                                    <Alert class="my-2" color="red">
                                        <span class="font-bold">Incorrect!</span><br />
                                        Try again.
                                    </Alert>
                                </div>
                            {/if}
                        {:else}
                            <div transition:slide>
                                <Alert class="my-2" color="green">
                                    <span class="font-bold">Already Solved!</span><br />
                                    Try some other Challenges!
                                </Alert>
                            </div>
                        {/if}
                        <div class="mt-6">
                            <p>Solves: {challengeSolves[challenge.id] || 0}</p>
                        </div>
                    </Card>
                {/each}
            </div>
        {/each}
    </div>
{:else}
    <div class="text-center m-auto">
        <div>
            <Moon class="w-20 h-20 p-4 mx-auto text-neutral-900 dark:text-neutral-100" />
        </div>
        <h1 class="text-neutral-900 dark:text-neutral-100 font-bold italic">No Challenges found.</h1>
    </div>
{/if}
