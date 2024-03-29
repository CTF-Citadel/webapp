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

<Modal defaultClass="rounded-none" bind:open={create} title="Assign To">
    <div>
        {#if events.length > 0}
            <Label>
                Select Event
                <Select class="mt-2" items={sortedEvents} bind:value={selectedEvent} />
            </Label>
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
