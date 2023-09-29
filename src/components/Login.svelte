<script lang="ts">
    import { Card, Button, Label, Input } from 'flowbite-svelte';

    let authResponse: any;
    let inputs = {
        email: '',
        password: ''
    };

    async function onLogin() {
        authResponse = '';
        const RESP = await fetch('/login', {
            method: 'POST',
            body: JSON.stringify(inputs)
        });
        if (RESP) {
            authResponse = await RESP.json();
            if (authResponse.needsRedirect) {
                window.location.replace("/");
            }
        }
    }
</script>

<Card class="w-full max-w-md">
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Login</h3>
        <Label class="space-y-2">
            <span>Email</span>
            <Input
                bind:value={inputs.email}
                type="email"
                name="email"
                autocomplete="email"
                placeholder="name@example.com"
                required
            />
        </Label>
        <Label class="space-y-2">
            <span>Your password</span>
            <Input
                bind:value={inputs.password}
                type="password"
                name="password"
                autocomplete="password"
                placeholder="••••••••••"
                required
            />
        </Label>
        <div class="flex items-start">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
                on:click={() => {
                    window.location.replace('/reset/password');
                }}
                class="mr-auto text-sm text-primary-700 hover:underline dark:text-primary-500"
            >
                Forgot password?
            </span>
        </div>
        {#if authResponse && authResponse.error != "None"}
            <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
        {/if}
        <Button on:click={onLogin} class="w-full">Login to your account</Button>
        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            Not registered?
            <a href="/signup" class="text-primary-700 hover:underline dark:text-primary-500">Create account</a>
        </div>
    </div>
</Card>
