<script lang="ts">
    import { validEmail, validPassword, validUsername } from '../../../lib/helpers';
    import { Card, Button, Label, Input, Alert } from 'flowbite-svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';

    let authResponse: any;
    let inputs = {
        username: '',
        email: '',
        password: ''
    };

    async function onEnterKey(event: any) {
        if (
            event.key === 'Enter' &&
            validPassword(inputs.password) &&
            validEmail(inputs.email) &&
            validUsername(inputs.username) &&
            inputs.username.length >= 4
        ) {
            await onSignup();
        }
    }

    async function onSignup() {
        const RESP = await fetch('/api/v1/account/new', {
            method: 'POST',
            body: JSON.stringify(inputs)
        });
        if (RESP) {
            authResponse = await RESP.json();
            // verify is set to bypassed
            if (authResponse.redirect) {
                // go to dash
                window.location.href = '/';
            }
        }
    }
</script>

<Card
    class="w-full max-w-md bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
>
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign Up</h3>
        {#if authResponse && authResponse.success === true && authResponse.redirect === false}
            <p>Done, check your Inbox!</p>
        {:else if authResponse && authResponse.redirect === true}
            <p>Done, now login!</p>
        {:else}
            <Label class="space-y-2">
                <span>Your username</span>
                <Input
                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                    bind:value={inputs.username}
                    type="text"
                    name="username"
                    placeholder="myuniqueuser"
                    required
                />
            </Label>
            {#if inputs.username.length > 0 && !validUsername(inputs.username)}
                <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                    <span slot="icon">
                        <InfoCircle slot="icon" class="text-red-500 w-5 h-5" />
                        <span class="sr-only">Info</span>
                    </span>
                    <p class="text-red-500">Ensure that these requirements are met:</p>
                    <ul class="ms-4 list-disc text-red-500">
                        <li>At least 4 characters (up to 24)</li>
                        <li>Alphabetic characters, digits or underscore</li>
                    </ul>
                </Alert>
            {/if}
            <Label class="space-y-2">
                <span>Email</span>
                <Input
                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                    bind:value={inputs.email}
                    on:keydown={onEnterKey}
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    autocomplete="email"
                    required
                />
            </Label>
            {#if inputs.email.length > 0 && !validEmail(inputs.email)}
                <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                    <span slot="icon">
                        <InfoCircle slot="icon" class="text-red-500 w-5 h-5" />
                        <span class="sr-only">Info</span>
                    </span>
                    <p class="text-red-500">Ensure that you entered a valid Email</p>
                </Alert>
            {/if}
            <Label class="space-y-2">
                <span>Your password</span>
                <Input
                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                    bind:value={inputs.password}
                    on:keydown={onEnterKey}
                    type="password"
                    name="password"
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
            {#if authResponse && authResponse.error !== 'None'}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button
                on:click={onSignup}
                disabled={!validPassword(inputs.password) ||
                    !validEmail(inputs.email) ||
                    !validUsername(inputs.username) ||
                    inputs.username.length < 4}
                class="w-full">Create your account</Button
            >
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                Already registered?
                <a href="/login" class="text-primary-700 hover:underline dark:text-primary-500"> Login here </a>
            </div>
        {/if}
    </div>
</Card>
