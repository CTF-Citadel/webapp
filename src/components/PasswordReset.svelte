<script lang="ts">
    import { Card, Button, Label, Input } from 'flowbite-svelte';

    // from parent
    export let id = "";

    let authResponse: any;
    let noMatch = false;
    let inputs = {
        password: '',
        password_repeat: ''
    };

    async function onSubmit() {
        // check for password
        noMatch = false;
        if (inputs.password == inputs.password_repeat) {
            const RESP = await fetch(`/reset/${id}`, {
                method: 'POST',
                body: JSON.stringify(inputs)
            });
            if (RESP) {
                authResponse = await RESP.json();
            }
        } else noMatch = true;
    }
</script>

<Card class="w-full max-w-md">
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Password Reset</h3>
        {#if authResponse}
            <p>Your Password was successfully reset!</p>
            <Button
                on:click={() => {
                    window.location.replace('/login');
                }}
                class="w-full">To Login</Button
            >
        {:else}
            <Label class="space-y-2">
                <span>New Password</span>
                <Input
                    bind:value={inputs.password}
                    type="password"
                    name="password"
                    autocomplete="password"
                    placeholder="••••••••••"
                    required
                />
            </Label>
            <Label class="space-y-2">
                <span>Repeat Password</span>
                <Input
                    bind:value={inputs.password_repeat}
                    type="password"
                    name="password"
                    autocomplete="password"
                    placeholder="••••••••••"
                    required
                />
            </Label>
            {#if noMatch}
                <p class="text-primary-700 dark:text-primary-500">Passwords do not match!</p>
            {/if}
            {#if authResponse && authResponse.error != 'None'}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button on:click={onSubmit} class="w-full">Reset Password</Button>
        {/if}
    </div>
</Card>
