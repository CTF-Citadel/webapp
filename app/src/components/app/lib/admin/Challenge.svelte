<!--
  @component
  ## Props
  @prop export let events: EventsType[] = [];
  @prop export let challenges: ChallengesType[] = [];
  @prop export let sortedEvents: { value: string; name: string }[] = [];
  @prop export let sortedChallenges: { value: string; name: string }[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit = false;
  @prop export let create = false;
-->

<script lang="ts">
    import { Button, Modal, Input, Label, Textarea, Select, Toggle, Alert } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
    import type { EventsType, ChallengesType } from '../../../../lib/schema';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { AdminRouter } from '../../../../lib/trpc/admin';

    export let events: EventsType[] = [];
    export let challenges: ChallengesType[] = [];
    export let sortedEvents: { value: string; name: string }[] = [];
    export let sortedChallenges: { value: string; name: string }[] = [];
    export let editUUID: string = '';
    export let edit = false;
    export let create = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();
    const CLIENT = createTRPCClient<AdminRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/admin'
            })
        ]
    });

    $: editData = challenges.find((item) => item.id === editUUID);
    $: dependants = challenges.filter((item) => item.depends_on !== '').map((match) => match.depends_on);

    const DIFFICULTIES = [
        { value: 'Easy', name: 'Easy' },
        { value: 'Medium', name: 'Medium' },
        { value: 'Hard', name: 'Hard' }
    ];
    let challengeTemplate = {
        name: '',
        description: '',
        difficulty: '',
        category: '',
        containerPath: '',
        fileUrl: '',
        points: 0,
        staticFlag: '',
        assignTo: '',
        dependsOn: '',
        isContainer: false,
        isStaticFlag: false,
        isFlagPool: false,
        isWithFile: false,
        isDependant: false
    };

    async function createChallenge() {
        let temp = { ...challengeTemplate }
        temp.points = Number(temp.points);
        const DATA = await CLIENT.createChallenge.mutate(temp)
        if (DATA === true) {
            create = false;
            DISPATCH('refresh');
        }
    }

    async function updateChallenge() {
        if (editData !== undefined) {
            const DATA = await CLIENT.updateChallenge.mutate({
                id: editUUID,
                name: editData.name,
                description: editData.description,
                category: editData.category,
                difficulty: editData.difficulty,
                assignTo: editData.event_id,
                points: Number(editData.points),
                dependsOn: editData.depends_on
            })
            if (DATA === true) {
                edit = false;
                DISPATCH('refresh');
                return true;
            }
        }
    }

    async function deleteChallenge() {
        const DATA = await CLIENT.deleteChallenge.mutate(editUUID);
        if (DATA === true) {
            edit = false;
            DISPATCH('refresh');
            return true;
        }
    }
</script>

<!--
    Edit Popup
-->

{#if editData !== undefined}
    <Modal
        dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
        defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
        color="none"
        outsideclose
        bind:open={edit}
        title="Edit Challenge"
    >
        <div class="mb-6">
            <Label for="chal_name" class="mb-2">Change Challenge Name</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="chal_name"
                placeholder="name"
                bind:value={editData.name}
            />
        </div>
        <div class="mb-6">
            <Label for="chall_textarea" class="mb-2">Change Challenge Description</Label>
            <Textarea
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="chal_textarea"
                placeholder="..."
                rows="4"
                bind:value={editData.description}
            />
        </div>
        <div class="mb-6">
            <Label class="mb-2">Change Challenge Difficulty</Label>
            <Select
                defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                bind:value={editData.difficulty}
                placeholder=""
            >
                <option selected value="">None</option>
                {#each DIFFICULTIES as { value, name }}
                    <option {value}>{name}</option>
                {/each}
            </Select>
        </div>
        <div class="mb-6">
            <Label for="chal_name" class="mb-2">Change Challenge Category</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="chal_name"
                placeholder="Linux/Web/OSINT/..."
                bind:value={editData.category}
            />
        </div>
        <div class="mb-6">
            <Label for="challenge-textarea" class="mb-2">Change Base Points</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="challenge-name"
                type="number"
                bind:value={editData.points}
            />
        </div>
        <div>
            <Label class="mb-2">Change Dependency</Label>
            <Select
                defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                bind:value={editData.depends_on}
                placeholder=""
            >
                <option selected value="">None</option>
                {#each sortedChallenges as { value, name }}
                    <option {value}>{name}</option>
                {/each}
            </Select>
        </div>
        <div>
            <Label class="mb-2">Change Event Assignment</Label>
            <Select
                defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                bind:value={editData.event_id}
                placeholder=""
            >
                <option selected value="">None</option>
                {#each sortedEvents as { value, name }}
                    <option {value}>{name}</option>
                {/each}
            </Select>
        </div>
        <svelte:fragment slot="footer">
            <div class="flex flex-row justify-between w-full">
                <div>
                    <Button
                        on:click={updateChallenge}
                        disabled={editData.difficulty === '' ||
                            editData.category === '' ||
                            editData.points === 0 ||
                            editData.name === ''}>Update</Button
                    >
                    <Button
                        on:click={() => {
                            edit = false;
                        }}
                        color="alternative">Cancel</Button
                    >
                </div>
                <Button on:click={deleteChallenge} disabled={dependants.includes(editData.id)} color="red"
                    ><TrashBinOutline class="w-4" /></Button
                >
            </div>
        </svelte:fragment>
    </Modal>
{/if}

<!--
    Create Popup
-->

<Modal
    dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
    defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
    backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
    color="none"
    outsideclose
    bind:open={create}
    title="Create Challenge"
>
    <div class="mb-6">
        <Label for="challenge-name" class="mb-2">Challenge Name</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="challenge-name"
            placeholder="Petition"
            bind:value={challengeTemplate.name}
        />
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Description</Label>
        <Textarea
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="challenge-textarea"
            placeholder="..."
            rows="4"
            bind:value={challengeTemplate.description}
        />
    </div>
    <div class="mb-6">
        <Label class="mb-2">Challenge Difficulty</Label>
        <Select
            defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
            bind:value={challengeTemplate.difficulty}
            placeholder=""
        >
            <option selected value="">None</option>
            {#each DIFFICULTIES as { value, name }}
                <option {value}>{name}</option>
            {/each}
        </Select>
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Category</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="challenge-name"
            placeholder="Linux/Web/OSINT/..."
            bind:value={challengeTemplate.category}
        />
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Challenge Base Points</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="challenge-name"
            type="number"
            bind:value={challengeTemplate.points}
        />
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Type</Label>
        {#if challengeTemplate.isFlagPool === false && challengeTemplate.isStaticFlag === false}
            <div class="mb-6" transition:slide>
                <Toggle bind:checked={challengeTemplate.isContainer}>Needs Container</Toggle>
            </div>
        {/if}
        {#if challengeTemplate.isContainer}
            <div transition:slide>
                <Label for="challenge-file" class="mb-2">Compose File</Label>
                <Input
                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                    id="challenge-file"
                    placeholder="some"
                    bind:value={challengeTemplate.containerPath}
                />
            </div>
        {/if}
        {#if challengeTemplate.isFlagPool === false && challengeTemplate.isContainer === false}
            <div class="mb-6" transition:slide>
                <Toggle bind:checked={challengeTemplate.isStaticFlag}>Needs Static Flag</Toggle>
            </div>
        {/if}
        {#if challengeTemplate.isStaticFlag}
            <div transition:slide>
                <Label for="challenge-static" class="mb-2">Static Flag</Label>
                <Input
                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                    id="challenge-static"
                    placeholder="3asy-r3v3rs1ng"
                    bind:value={challengeTemplate.staticFlag}
                />
            </div>
        {/if}
        {#if challengeTemplate.isStaticFlag === false && challengeTemplate.isContainer === false}
            <div transition:slide>
                <Toggle bind:checked={challengeTemplate.isFlagPool}>Needs Pool Flag</Toggle>
            </div>
        {/if}
    </div>
    <div class="mb-6">
        <Label for="challenge-textarea" class="mb-2">Additions</Label>
        <div class="mb-6">
            <Toggle bind:checked={challengeTemplate.isWithFile}>Needs File</Toggle>
        </div>
        {#if challengeTemplate.isWithFile}
            <div class="mb-6" transition:slide>
                <Label for="challenge-url" class="mb-2">File URL</Label>
                <Input
                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                    id="challenge-url"
                    placeholder="https://example.com/source.zip"
                    bind:value={challengeTemplate.fileUrl}
                />
            </div>
        {/if}
        <div class="mb-6">
            <Toggle bind:checked={challengeTemplate.isDependant}>Depends On</Toggle>
        </div>
        {#if challengeTemplate.isDependant}
            {#if challenges.length > 0}
                <div class="mb-6">
                    <Label class="mb-2">Parent Challenge</Label>
                    <Select
                        defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                        bind:value={challengeTemplate.dependsOn}
                        placeholder=""
                    >
                        <option selected value="">None</option>
                        {#each sortedChallenges as { value, name }}
                            <option {value}>{name}</option>
                        {/each}
                    </Select>
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
    </div>
    {#if events.length > 0}
        <div class="mb-6" transition:slide>
            <Label class="mb-2">Assign To Event</Label>
            <Select
                defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                bind:value={challengeTemplate.assignTo}
                placeholder=""
            >
                <option selected value="">None</option>
                {#each sortedEvents as { value, name }}
                    <option {value}>{name}</option>
                {/each}
            </Select>
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
                    disabled={challengeTemplate.difficulty === '' ||
                        challengeTemplate.assignTo === '' ||
                        challengeTemplate.name === '' ||
                        challengeTemplate.description === '' ||
                        challengeTemplate.category === '' ||
                        challengeTemplate.points === 0 ||
                        (challengeTemplate.staticFlag === '' && challengeTemplate.isStaticFlag) ||
                        (challengeTemplate.dependsOn === '' && challengeTemplate.isDependant) ||
                        (challengeTemplate.fileUrl === '' && challengeTemplate.isWithFile) ||
                        (challengeTemplate.containerPath === '' &&
                            challengeTemplate.staticFlag === '' &&
                            challengeTemplate.isFlagPool === false) ||
                        (challengeTemplate.containerPath === '' && challengeTemplate.isContainer)}>Create</Button
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
