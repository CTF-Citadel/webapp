<!--
  @component
  ## Props
  @prop export let events: EventsType[] = [];
  @prop export let challenges: ChallengesType[] = [];
  @prop export let sortedEvents: { value: string; name: string }[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit = false;
  @prop export let create = false;
-->

<script lang="ts">
    import { requestWrapper } from '../../../../lib/helpers';
    import { Button, Modal, Input, Label, Textarea, Select, Toggle, Alert } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
    import type { EventsType, ChallengesType } from '../../../../lib/schema';

    export let events: EventsType[] = [];
    export let challenges: ChallengesType[] = [];
    export let sortedEvents: { value: string; name: string }[] = [];
    export let editUUID: string = '';
    export let edit = false;
    export let create = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();

    $: editData = challenges.find((item) => item['id'] === editUUID);

    const DIFFICULTIES = [
        { value: 'Easy', name: 'Easy' },
        { value: 'Medium', name: 'Medium' },
        { value: 'Hard', name: 'Hard' }
    ];
    let selectchallenges: { value: string; name: string }[] = [];
    let selectedEvent = '';
    let dependsOnChallenge = '';
    let disableDependDelete = false;
    let selectedDiff = '';

    let challengeNeedsFile: boolean = false;
    let challengeNeedsDepend: boolean = false;
    let challengeTemplate = {
        name: '',
        description: '',
        category: '',
        path: '',
        fileURL: '',
        points: 0,
        isContainer: false,
        flagStatic: false,
        staticFlag: ''
    };

    async function createChallenge() {
        const DATA = await requestWrapper(true, {
            type: 'create-challenge',
            data: { ...challengeTemplate, difficulty: selectedDiff, event: selectedEvent, dependon: dependsOnChallenge }
        });
        if (DATA.ok) {
            create = false;
            DISPATCH('refresh');
        }
    }

    async function checkChildDepends(dependAmount: any) {
        disableDependDelete = false;
        const checkDepend = await requestWrapper(true, {
            type: 'check-children',
            data: {
                id: editUUID
            }
        });
        if (checkDepend.ok) {
            let depens = await checkDepend.json();
            disableDependDelete = depens.data.length > 0 ? true : false;
        }
    }

    async function updateChallenge() {
        const DATA = await requestWrapper(true, {
            type: 'update-challenge',
            data: {
                id: editUUID,
                name: editData?.challenge_name,
                description: editData?.challenge_description,
                category: editData?.challenge_category,
                difficulty: editData?.challenge_difficulty,
                event: editData?.event_id,
                points: editData?.base_points
            }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
            return true;
        }
    }

    async function deleteChallenge() {
        const DATA = await requestWrapper(true, {
            type: 'delete-challenge',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
            return true;
        }
    }
</script>

<!--
    Edit Popup
-->

{#if editData != null}
    <Modal defaultClass="rounded-none" bind:open={edit} title="Edit Challenge">
        <div class="mb-6">
            <Label for="chal_name" class="mb-2">Change Challenge Name</Label>
            <Input id="chal_name" placeholder="name" bind:value={editData.challenge_name} required />
        </div>
        <div class="mb-6">
            <Label for="chall_textarea" class="mb-2">Change Challenge Description</Label>
            <Textarea id="chal_textarea" placeholder="..." rows="4" bind:value={editData.challenge_description} />
        </div>
        <div class="mb-6">
            <Label>
                Change Challenge Difficulty
                <Select class="mt-2" items={DIFFICULTIES} bind:value={editData.challenge_difficulty} />
            </Label>
        </div>
        <div class="mb-6">
            <Label for="chal_name" class="mb-2">Change Challenge Category</Label>
            <Input id="chal_name" placeholder="Linux/Web/OSINT/..." bind:value={editData.challenge_category} required />
        </div>
        <div class="mb-6">
            <Label for="challenge-textarea" class="mb-2">Change Base Points</Label>
            <Input id="challenge-name" type="number" bind:value={editData.base_points} required />
        </div>
        <div>
            <Label>
                Change Event Assignment
                <Select class="mt-2" items={sortedEvents} bind:value={editData.event_id} />
            </Label>
        </div>
        <svelte:fragment slot="footer">
            <div class="flex flex-row justify-between w-full">
                <div>
                    <Button
                        on:click={updateChallenge}
                        disabled={editData.challenge_difficulty == '' ||
                            editData.challenge_category == '' ||
                            editData.base_points == 0 ||
                            editData.challenge_name == ''}>Update</Button
                    >
                    <Button
                        on:click={() => {
                            edit = false;
                        }}
                        color="alternative">Cancel</Button
                    >
                </div>
                <Button on:click={deleteChallenge} disabled={disableDependDelete == true} color="red"
                    ><TrashBinOutline class="w-4" /></Button
                >
            </div>
        </svelte:fragment>
    </Modal>
{/if}

<!--
    Create Popup
-->

<Modal defaultClass="rounded-none" class="max-h-full" bind:open={create} title="Create Challenge">
    <div class="mb-6">
        <Label for="challenge-name" class="mb-2">Challenge Name</Label>
        <Input id="challenge-name" placeholder="Petition" bind:value={challengeTemplate.name} required />
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Description</Label>
        <Textarea id="challenge-textarea" placeholder="..." rows="4" bind:value={challengeTemplate.description} />
    </div>
    <div class="mb-6">
        <Label>
            Challenge Difficulty
            <Select class="mt-2" items={DIFFICULTIES} bind:value={selectedDiff} />
        </Label>
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Category</Label>
        <Input id="challenge-name" placeholder="Linux/Web/OSINT/..." bind:value={challengeTemplate.category} required />
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Base Points</Label>
        <Input id="challenge-name" type="number" bind:value={challengeTemplate.points} required />
    </div>
    <div class="mb-6">
        <Toggle bind:checked={challengeTemplate.isContainer}>Needs Container</Toggle>
    </div>
    {#if challengeTemplate.isContainer}
        <div class="mb-6" transition:slide>
            <Label for="challenge-file" class="mb-2">Compose File</Label>
            <Input id="challenge-file" placeholder="some" bind:value={challengeTemplate.path} required />
        </div>
    {/if}
    <div class="mb-6">
        <Toggle bind:checked={challengeNeedsFile}>Needs File</Toggle>
    </div>
    {#if challengeNeedsFile}
        <div class="mb-6" transition:slide>
            <Label for="challenge-url" class="mb-2">File URL</Label>
            <Input
                id="challenge-url"
                placeholder="https://example.com/source.zip"
                bind:value={challengeTemplate.fileURL}
                required
            />
        </div>
    {/if}
    <div class="mb-6">
        <Toggle bind:checked={challengeTemplate.flagStatic}>Needs Static Flag</Toggle>
    </div>
    {#if challengeTemplate.flagStatic}
        <div class="mb-6" transition:slide>
            <Label for="challenge-static" class="mb-2">Static Flag</Label>
            <Input
                id="challenge-static"
                placeholder="3asy-r3v3rs1ng"
                bind:value={challengeTemplate.staticFlag}
                required
            />
        </div>
    {/if}
    <div class="mb-6">
        <Toggle bind:checked={challengeNeedsDepend}>Depends On</Toggle>
    </div>
    {#if challengeNeedsDepend}
        {#if challenges.length > 0}
            <div class="mb-6">
                <Label>
                    Parent Challenge
                    <Select class="mt-2" items={selectchallenges} bind:value={dependsOnChallenge} />
                </Label>
            </div>
        {:else}
            <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                <span slot="icon">
                    <InfoCircle slot="icon" class="text-blue-500 w-5 h-5" />
                    <span class="sr-only">Info</span>
                </span>
                <p class="text-blue-500">No other Challenges created yet.</p>
            </Alert>
        {/if}
    {/if}
    {#if events.length > 0}
        <div class="mb-6" transition:slide>
            <Label>
                Assign To Event
                <Select class="mt-2" items={sortedEvents} bind:value={selectedEvent} />
            </Label>
        </div>
    {:else}
        <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
            <span slot="icon">
                <InfoCircle slot="icon" class="text-blue-500 w-5 h-5" />
                <span class="sr-only">Info</span>
            </span>
            <p class="text-blue-500">No Events created yet.</p>
        </Alert>
    {/if}
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button
                    on:click={createChallenge}
                    disabled={selectedDiff == '' ||
                        selectedEvent == '' ||
                        challengeTemplate.name == '' ||
                        challengeTemplate.description == '' ||
                        challengeTemplate.category == '' ||
                        challengeTemplate.points == 0 ||
                        (challengeTemplate.staticFlag == '' && challengeTemplate.flagStatic) ||
                        (dependsOnChallenge == '' && challengeNeedsDepend) ||
                        (challengeTemplate.fileURL == '' && challengeNeedsFile) ||
                        (challengeTemplate.path == '' && challengeTemplate.staticFlag == '') ||
                        (challengeTemplate.path == '' && challengeTemplate.isContainer)}>Create</Button
                >
                <Button
                    on:click={() => {
                        create = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
        </div>
    </svelte:fragment>
</Modal>
