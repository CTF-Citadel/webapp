<script lang="ts">
    import { Card, Button, Label, Input } from 'flowbite-svelte';

    let authResponse: any;
    let inputs = {
        email: ''
    };

    async function onSubmit() {
        const RESP = await fetch('/reset/password', {
            method: 'POST',
            body: JSON.stringify(inputs)
        });
        if (RESP) {
            authResponse = await RESP.json();
        }
    }
</script>

<Card class="w-full max-w-md">
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Password Reset</h3>
        {#if authResponse && authResponse.verifySent == true}
            <p>Done, check your Inbox!</p>
        {:else}
            <Label class="space-y-2">
                <span>Your Email</span>
                <Input
                    bind:value={inputs.email}
                    type="email"
                    name="email"
                    autocomplete="email"
                    placeholder="name@example.com"
                    required
                />
            </Label>
            {#if authResponse && authResponse.error != 'None'}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button on:click={onSubmit} class="w-full">Submit Reset</Button>
        {/if}
    </div>
</Card>
