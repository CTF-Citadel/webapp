<script lang="ts">
    import { Card, Button } from 'flowbite-svelte';

    let verified = false;
    let authResponse: any;

    async function onResend() {
        const RESP = await fetch('/api/v1/token/email', {
            method: 'POST',
            body: JSON.stringify({})
        });
        if (RESP) {
            authResponse = await RESP.json();
        }

    }
</script>

<Card class="w-full max-w-md bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Email Verification</h3>
        {#if authResponse && authResponse.verifySent === true}
            <p>Resent Verifcation Email, check your Inbox!</p>
        {:else if !verified}
            <p>Please verify your Email Address!</p>
            {#if authResponse && authResponse.error !== "None"}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button on:click={onResend} class="w-full">Resend Email</Button>
        {/if}
    </div>
</Card>
