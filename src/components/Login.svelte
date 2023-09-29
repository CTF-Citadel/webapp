<script lang="ts">
    import { auth } from "../lib/lucia";
    import { LuciaError } from "lucia";
    import { Card, Button, Label, Input } from 'flowbite-svelte';

    let errorMessage: string | null = null;
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

    async function onLogin() {
        const username = inputs.user;
        const password = inputs.password;
        // basic check
        const validUsername =
            typeof username === "string" &&
            username.length >= 4 &&
            username.length <= 31;
        const validPassword =
            typeof password === "string" &&
            password.length >= 6 &&
            password.length <= 255;
        if (validUsername && validPassword) {
            try {
                // find user by key
                // and validate password
                const key = await auth.useKey(
                    "username",
                    username.toLowerCase(),
                    password
                );
                const session = await auth.createSession({
                    userId: key.userId,
                    attributes: {}
                });
                auth.createSessionCookie(session);
                window.location.replace("/");
            } catch (e) {
                if (
                    e instanceof LuciaError &&
                    (e.message === "AUTH_INVALID_KEY_ID" ||
                        e.message === "AUTH_INVALID_PASSWORD")
                ) {
                    errorMessage = "Incorrect username or password";
                } else {
                    errorMessage = "An unknown error occurred";
                }
            }
        } else {
            errorMessage = "Invalid input";
        }
    }

    async function onSignup() {
        const email = inputs.email;
        const username = inputs.user;
        const password = inputs.password;
        // basic check
        const validUsername =
            typeof username === "string" &&
            username.length >= 4 &&
            username.length <= 31;
        const validPassword =
            typeof password === "string" &&
            password.length >= 6 &&
            password.length <= 255;
        if (validUsername && validPassword) {
            try {
                // @TODO:
                // ADD EMAIL VERIFY
                const user = await auth.createUser({
                    key: {
                        providerId: "username",
                        providerUserId: username.toLowerCase(),
                        password
                    },
                    attributes: {
                        username
                    }
                });
                const session = await auth.createSession({
                    userId: user.userId,
                    attributes: {}
                });
                auth.createSessionCookie(session);
                window.location.replace("/");
            } catch (e) {
                if (
                    e instanceof LuciaError &&
                    (e.message === "AUTH_INVALID_KEY_ID" ||
                        e.message === "AUTH_INVALID_PASSWORD")
                ) {
                    errorMessage = "Incorrect username or password";
                } else {
                    errorMessage = "An unknown error occurred";
                }
            }
        } else {
            errorMessage = "Invalid input";
        }
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
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span
                    on:click={() => {}}
                    class="mr-auto text-sm text-primary-700 hover:underline dark:text-primary-500"
                >
                    Forgot password?
                </span>
            </div>
            <Button on:click={onSignup} class="w-full">Login to your account</Button>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
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
            <Button on:click={onLogin} class="w-full">Create your account</Button>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
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
