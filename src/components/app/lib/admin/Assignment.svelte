<!--
  @component
  ## Props
  @prop export let events: EventsType[] = [];
  @prop export let sortedEvents: { value: string; name: string }[] = [];
  @prop export let marked = new Set<string>();
  @prop export let create: boolean = false;
-->

<script lang="ts">
    import { requestWrapper } from '../../../../lib/helpers';
    import { Button, Modal, Label, Select, Alert } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
    import type { EventsType } from '../../../../lib/schema';

    export let events: EventsType[] = [];
    export let sortedEvents: { value: string; name: string }[] = [];
    export let marked = new Set<string>();
    export let create: boolean = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();

    let selectedEvent = '';

    async function assignEvent(eventID: string) {
        const DATA = await requestWrapper(true, {
            type: 'assign-event',
            data: {
                id: eventID,
                teams: Array.from(marked)
            }
        });
        if (DATA.ok) {
            create = false;
            DISPATCH('refresh');
        }
    }

    async function unassignEvent(eventID: string, teamID: string) {
        const DATA = await requestWrapper(true, {
            type: 'unassign-event',
            data: {
                event: eventID,
                team: teamID
            }
        });
        if (DATA.ok) {
            DISPATCH('refresh');
        }
    }
</script>

<!--
    Create Popups
-->

<Modal
    dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
    defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
    backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
    color="none"
    outsideclose
    bind:open={create}
    title="Assign To"
>
    <div>
        {#if events.length > 0}
            <Label class="mb-2">Select Event</Label>
            <Select
                defaultClass="text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                bind:value={selectedEvent}
                placeholder=""
            >
                <option selected value="">None</option>
                {#each sortedEvents as { value, name }}
                    <option {value}>{name}</option>
                {/each}
            </Select>
        {:else}
            <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                <span slot="icon">
                    <InfoCircle slot="icon" class="text-blue-500 w-5 h-5" />
                    <span class="sr-only">Info</span>
                </span>
                <p class="text-blue-500">No Events created yet.</p>
            </Alert>
        {/if}
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button
                    on:click={() => {
                        assignEvent(selectedEvent);
                    }}
                    disabled={selectedEvent === ''}>Assign</Button
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
