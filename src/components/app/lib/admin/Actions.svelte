<!--
  @component
  @prop export let sortedEvents: { value: string; name: string }[] = [];
-->

<script lang="ts">
    import { Button, Label, Select, Card } from 'flowbite-svelte';
    import { requestWrapper } from '../../../../lib/helpers';
    import { createEventDispatcher } from 'svelte';

    // from parent
    export let sortedEvents: { value: string; name: string }[] = [];

    // dispatcher
    const DISPATCH = createEventDispatcher();

    let selectedEvent: string = '';
    let batchUsers: { email: string; fullName: string }[] = [];

    async function getBatchUsers(eventID: string) {
        const DATA = await requestWrapper(true, {
            type: 'get-cert-users',
            data: {
                eventID: eventID
            }
        });
        if (DATA.ok) {
            batchUsers = (await DATA.json()).data;
            DISPATCH('refresh');
        }
    }

    async function sendBatchCerts() {
        const DATA = await requestWrapper(true, {
            type: 'send-certs',
            data: {
                list: batchUsers
            }
        });
        if (DATA.ok) {
            DISPATCH('refresh');
        }
    }
</script>

<div class="flex-1 flex-col justify-center p-4 max-w-full">
    <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
        <span class="italic text-neutral-500 opacity-50">#</span>
        ACTIONS
    </h1>
    <div class="mx-auto">
        <Card
            size="lg"
            class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
        >
            <div class="flex flex-1 flex-col justify-center space-y-4">
                <div class="flex-1 text-center text-neutral-900 dark:text-neutral-100">
                    <h1 class="text-lg font-bold mb-6">CertMailer</h1>
                    <div class="mb-6">
                        <Label for="flag-poison" class="mb-2">Event</Label>
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
                    </div>
                    <div class="flex flex-row space-x-4">
                        <Button
                            on:click={async () => {
                                await getBatchUsers(selectedEvent);
                            }}
                            disabled={selectedEvent === ''}>Check</Button
                        >
                        <Button on:click={sendBatchCerts} disabled={batchUsers.length === 0}>Send</Button>
                    </div>
                </div>
            </div>
        </Card>
    </div>
</div>
