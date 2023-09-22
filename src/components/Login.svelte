<script lang="ts">
    import { Card, Button, Label, Input } from 'flowbite-svelte';

    let showLogin = true;
    let inputs = {
        user: '',
        email: '',
        password: ''
    };

    function actionSwitch() {
        // change view
        if (showLogin) {
            showLogin = false;
        } else showLogin = true;
        // reset inputs
        inputs = {
            user: '',
            email: '',
            password: ''
        };
    }
</script>

<Card class="w-full max-w-md">
    <div class="flex flex-col space-y-6">
        {#if showLogin == true}
            <h3 class="text-xl font-medium text-gray-900 dark:text-white">Login to our platform</h3>
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
                <span
                    on:click={() => {}}
                    class="mr-auto text-sm text-primary-700 hover:underline dark:text-primary-500"
                >
                    Forgot password?
                </span>
            </div>
            <Button type="submit" class="w-full">Login to your account</Button>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                Not registered? <span
                    on:click={actionSwitch}
                    class="text-primary-700 hover:underline dark:text-primary-500"
                >
                    Create account
                </span>
            </div>
        {:else}
            <h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
            <Label class="space-y-2">
                <span>Your username</span>
                <Input bind:value={inputs.user} type="text" name="username" placeholder="myuniqueuser" required />
            </Label>
            <Label class="space-y-2">
                <span>Email</span>
                <Input bind:value={inputs.email} type="email" name="email" placeholder="name@example.com" required />
            </Label>
            <Label class="space-y-2">
                <span>Your password</span>
                <Input bind:value={inputs.password} type="password" name="password" placeholder="••••••••••" required />
            </Label>
            <Button type="submit" class="w-full">Create your account</Button>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                Already registered? <span
                    on:click={actionSwitch}
                    class="text-primary-700 hover:underline dark:text-primary-500"
                >
                    Login here
                </span>
            </div>
        {/if}
    </div>
</Card>
