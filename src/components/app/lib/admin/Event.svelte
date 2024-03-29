<!--
  @component
  ## Props
  @prop export let events: EventsType[] = [];
  @prop export let editUUID: string = '';
  @prop export let edit: boolean = false;
  @prop export let create: boolean = false;
-->

<script lang="ts">
    import { requestWrapper } from '../../../../lib/helpers';
    import { Button, Modal, Input, Label, Textarea } from 'flowbite-svelte';
    import TrashBinOutline from 'flowbite-svelte-icons/TrashBinSolid.svelte';
    import type { EventsType } from '../../../../lib/schema';
    import { createEventDispatcher } from 'svelte';

    export let events: EventsType[] = [];
    export let editUUID: string = '';
    export let edit: boolean = false;
    export let create: boolean = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();

    $: editData = events.find((item) => item['id'] === editUUID);

    let eventTemplate = {
        name: '',
        description: ''
    };
    let datePicker = {
        start: '',
        end: ''
    };

    async function createEvent() {
        let tempStart = { ...datePicker };
        const DATA = await requestWrapper(true, {
            type: 'create-event',
            data: {
                ...eventTemplate,
                start: new Date(tempStart.start).getTime(),
                end: new Date(tempStart.end).getTime()
            }
        });
        if (DATA.ok) {
            create = false;
            DISPATCH('refresh');
        }
    }

    async function updateEvent() {
        const DATA = await requestWrapper(true, {
            type: 'update-event',
            data: {
                id: editUUID,
                name: editData?.event_name,
                description: editData?.event_description
            }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
        }
    }

    async function deleteEvent() {
        const DATA = await requestWrapper(true, {
            type: 'delete-event',
            data: { id: editUUID }
        });
        if (DATA.ok) {
            edit = false;
            DISPATCH('refresh');
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
        title="Edit Event"
    >
        <div class="mb-6">
            <Label for="event_name" class="mb-2">Change Event Name</Label>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_name"
                placeholder="name"
                bind:value={editData.event_name}
                required
            />
        </div>
        <div>
            <Label for="event_textarea" class="mb-2">Change Event Description</Label>
            <Textarea
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                id="event_textarea"
                placeholder="..."
                rows="4"
                bind:value={editData.event_description}
            />
        </div>
        <svelte:fragment slot="footer">
            <div class="flex flex-row justify-between w-full">
                <div>
                    <Button on:click={updateEvent}>Update</Button>
                    <Button
                        on:click={() => {
                            edit = false;
                        }}
                        color="alternative">Cancel</Button
                    >
                </div>
                <Button on:click={deleteEvent} color="red"><TrashBinOutline class="w-4" /></Button>
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
    title="Create Event"
>
    <div class="mb-6">
        <Label for="event-name" class="mb-2">Event Name</Label>
        <Input
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="event-name"
            placeholder="myCTF"
            bind:value={eventTemplate.name}
            required
        />
    </div>
    <div class="mb-6">
        <Label for="event-textarea" class="mb-2">Event Description</Label>
        <Textarea
            class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
            id="event-textarea"
            placeholder="..."
            rows="4"
            bind:value={eventTemplate.description}
        />
    </div>

    <div class="mb-6">
        <Label class="mb-2">Event Start</Label>
        <div class="relative">
            <input
                type="datetime-local"
                class="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 transition duration-150 ease-in-out"
                bind:value={datePicker.start}
            />
            <!-- Optional: Add an icon for visual appeal -->
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <!-- You can replace the calendar icon with any other suitable icon -->
                <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0z"
                    >
                    </path>
                </svg>
            </div>
        </div>
    </div>
    <div class="mb-6">
        <Label class="mb-2">Event End</Label>
        <div class="relative">
            <input
                type="datetime-local"
                class="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 transition duration-150 ease-in-out"
                bind:value={datePicker.end}
            />
            <!-- Optional: Add an icon for visual appeal -->
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <!-- You can replace the calendar icon with any other suitable icon -->
                <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0zm0 0h0z"
                    >
                    </path>
                </svg>
            </div>
        </div>
    </div>

    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button
                    on:click={createEvent}
                    disabled={eventTemplate.name === '' ||
                        eventTemplate.description === '' ||
                        datePicker.end === '' ||
                        datePicker.start === ''}>Create</Button
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
