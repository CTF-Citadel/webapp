<script lang="ts">
    import { Card, Button } from 'flowbite-svelte';

    let verified = false;
    let authResponse: any;
    let inputs = {
        password: '',
        password_repeat: ''
    };

    async function onResend() {

    }
</script>

<Card class="w-full max-w-md">
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Email Verification</h3>
        {#if authResponse && authResponse.verifySent == true}
            <p>Resent Verifcation Email, check your Inbox!</p>
        {:else if !verified}
            <p>Please verify your Email Address!</p>
            {#if authResponse && authResponse.error != "None"}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button on:click={onResend} class="w-full">Resend Email</Button>
        {/if}
    </div>
</Card>
