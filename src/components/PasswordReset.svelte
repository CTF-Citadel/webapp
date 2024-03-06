<script lang="ts">
    import { Card, Button, Label, Input, Alert } from 'flowbite-svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
    import { validPassword } from '../lib/helpers';

    // from parent
    export let id = '';

    let authResponse: any;
    let inputs = {
        password: '',
        password_repeat: ''
    };

    function checkInput() {
        return inputs.password == inputs.password_repeat;
    }

    async function onSubmit() {
        const RESP = await fetch(`/api/v1/reset/${id}`, {
            method: 'POST',
            body: JSON.stringify(inputs)
        });
        if (RESP) {
            authResponse = await RESP.json();
        }
    }
</script>

<Card
    class="w-full max-w-md bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
>
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
            {#if inputs.password.length > 0 && !validPassword(inputs.password)}
                <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                    <span slot="icon">
                        <InfoCircle slot="icon" class="text-red-500 w-5 h-5" />
                        <span class="sr-only">Info</span>
                    </span>
                    <p class="text-red-500">Ensure that these requirements are met:</p>
                    <ul class="ms-4 list-disc text-red-500">
                        <li>At least 8 characters (up to 96)</li>
                        <li>At least one digit</li>
                        <li>At least one lowercase character</li>
                        <li>At least one uppercase character</li>
                        <li>At least one special character</li>
                    </ul>
                </Alert>
            {/if}
            <Label class="space-y-2">
                <span>Repeat Password</span>
                <Input
                    bind:value={inputs.password_repeat}
                    on:input={checkInput}
                    type="password"
                    name="password"
                    autocomplete="password"
                    placeholder="••••••••••"
                    required
                />
            </Label>
            {#if inputs.password_repeat.length > 0 && !checkInput()}
                <p class="text-primary-700 dark:text-primary-500">Passwords do not match!</p>
            {/if}
            {#if authResponse && authResponse.error != 'None'}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button
                on:click={onSubmit}
                class="w-full"
                disabled={!checkInput() || !validPassword(inputs.password) || inputs.password_repeat.length == 0}
                >Reset Password</Button
            >
        {/if}
    </div>
</Card>
