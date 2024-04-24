<!--
  @component
  @prop export let sortedEvents: { value: string; name: string }[] = [];
  @prop export let mailer: boolean = false;
-->

<script lang="ts">
    import { Button, Label, Select, Card, Alert } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    import { createTRPCClient, httpBatchLink } from '@trpc/client';
    import type { AdminRouter } from '../../../../lib/trpc/admin';

    // from parent
    export let sortedEvents: { value: string; name: string }[] = [];
    export let mailer: boolean = false;

    // dispatcher
    const DISPATCH = createEventDispatcher();
    const CLIENT = createTRPCClient<AdminRouter>({
        links: [
            httpBatchLink({
                url: '/api/v2/admin',
            }),
        ],
    });

    let success: boolean = false;
    let selectedEvent: string = '';
    let batchUsers: { email: string; fullName: string }[] = [];
    let notifyLength: number = 0;

    async function getBatchUsers(eventID: string) {
        const DATA = await CLIENT.getEventMailEligible.query(eventID);
        if (DATA.length > 0) {
            batchUsers = DATA;
            DISPATCH('refresh');
        }
    }

    async function sendBatchCerts() {
        success = false;
        notifyLength = Number(batchUsers.length);
        const DATA = await CLIENT.queryBulkMail.mutate(batchUsers);
        if (DATA === true) {
            success = true;
            batchUsers = [];
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
        {#if mailer === true}
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
                        {#if success === false && batchUsers.length > 0}
                            <p>Got {batchUsers.length} Users.</p>
                        {/if}
                        {#if success === true}
                            <Alert class="m-4" color="green">
                                <span>
                                    <span class="font-bold">Queued!</span><br />
                                    {notifyLength} Emails are being sent!
                                </span>
                            </Alert>
                        {/if}
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
        {/if}
    </div>
</div>
