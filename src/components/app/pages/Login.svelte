<!--
  @component
-->

<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Button, Label, Input, Alert } from 'flowbite-svelte';
    import InfoCircle from 'flowbite-svelte-icons/InfoCircleOutline.svelte';

    let authResponse: any;
    let inputs = {
        email: '',
        password: ''
    };
    let showVerifySuccess: boolean = false;
    let showBlocked: boolean = false;

    onMount(() => {
        let queryString = window.location.search;
        const PARAMS = new URLSearchParams(queryString);

        if (PARAMS.has('verified')) {
            Boolean(PARAMS.get('verified')) ? (showVerifySuccess = true) : (showVerifySuccess = false);
        }
        if (PARAMS.has('blocked')) {
            Boolean(PARAMS.get('blocked')) ? (showBlocked = true) : (showBlocked = false);
        }
    });

    async function onEnterKey(event: any) {
        if (event.key === 'Enter' && inputs.email.length > 0 && inputs.password.length > 0) {
            await onLogin();
        }
    }

    async function onLogin() {
        authResponse = '';
        const RESP = await fetch('/api/v1/account/auth', {
            method: 'POST',
            body: JSON.stringify(inputs)
        });
        if (RESP) {
            authResponse = await RESP.json();
            if (authResponse.needsRedirect) {
                window.location.replace('/');
            }
        }
    }
</script>

<Card
    class="w-full max-w-md bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
>
    <div class="flex flex-col space-y-6">
        {#if showVerifySuccess}
            <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                <span slot="icon">
                    <InfoCircle slot="icon" class="text-green-500 w-5 h-5" />
                    <span class="sr-only">Info</span>
                </span>
                <p class="text-green-500">Verified! Please log in again.</p>
            </Alert>
        {/if}
        {#if showBlocked}
            <Alert class="!items-start bg-neutral-100 dark:bg-neutral-900">
                <span slot="icon">
                    <InfoCircle slot="icon" class="text-red-500 w-5 h-5" />
                    <span class="sr-only">Info</span>
                </span>
                <p class="text-red-500">Your are currently blocked!</p>
            </Alert>
        {/if}
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Login</h3>
        <Label class="space-y-2">
            <span>Email</span>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                bind:value={inputs.email}
                on:keydown={onEnterKey}
                type="email"
                name="email"
                autocomplete="email"
                placeholder="name@example.com"
            />
        </Label>
        <Label class="space-y-2">
            <span>Your password</span>
            <Input
                class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                bind:value={inputs.password}
                on:keydown={onEnterKey}
                type="password"
                name="password"
                autocomplete="password"
                placeholder="••••••••••"
            />
        </Label>
        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            <a href="/reset/password" class="text-primary-700 hover:underline dark:text-primary-500">Forgot Password?</a
            >
        </div>
        {#if authResponse && authResponse.error !== 'None'}
            <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
        {/if}
        <Button on:click={onLogin} disabled={inputs.email.length === 0 || inputs.password.length === 0} class="w-full"
            >Login to your account</Button
        >
        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            Not registered?
            <a href="/signup" class="text-primary-700 hover:underline dark:text-primary-500">Create account</a>
        </div>
    </div>
</Card>
