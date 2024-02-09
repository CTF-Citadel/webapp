<script lang="ts">
    import { Card, Button, Label, Input } from 'flowbite-svelte';

    let authResponse: any;
    let inputs = {
        username: '',
        email: '',
        password: ''
    };

    async function onSignup() {
        const RESP = await fetch('/api/v1/account/new', {
            method: 'POST',
            body: JSON.stringify(inputs)
        });
        if (RESP) {
            authResponse = await RESP.json();
        }
    }
</script>

<Card class="w-full max-w-md bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
    <div class="flex flex-col space-y-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign Up</h3>
        {#if authResponse && authResponse.verifySent == true}
            <p>Done, check your Inbox!</p>
        {:else}
            <Label class="space-y-2">
                <span>Your username</span>
                <Input bind:value={inputs.username} type="text" name="username" placeholder="myuniqueuser" required />
            </Label>
            <Label class="space-y-2">
                <span>Email</span>
                <Input
                    bind:value={inputs.email}
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    autocomplete="email"
                    required
                />
            </Label>
            <Label class="space-y-2">
                <span>Your password</span>
                <Input bind:value={inputs.password} type="password" name="password" placeholder="••••••••••" required minlength="12"  maxlength="96"/>
            </Label>
            {#if authResponse && authResponse.error != 'None'}
                <p class="text-primary-700 dark:text-primary-500">{authResponse.error}</p>
            {/if}
            <Button on:click={onSignup} class="w-full">Create your account</Button>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                Already registered?
                <a href="/login" class="text-primary-700 hover:underline dark:text-primary-500"> Login here </a>
            </div>
        {/if}
    </div>
</Card>
