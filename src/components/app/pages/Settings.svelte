<!--
  @component
  ## Props
  @prop export let sessionID: string = '';
  @prop export let session: any = {};
  @prop export let ac: boolean = false;
-->

<script lang="ts">
    import Admin from '../lib/Admin.svelte';
    import { onMount } from 'svelte';
    import { requestWrapper, validAlphanumeric, validPassword } from '../../../lib/helpers';
    import { Card, Spinner, Avatar, Input, Label, Button } from 'flowbite-svelte';
    import type { TeamsType } from '../../../lib/schema';
    import type { User } from 'lucia';

    export let sessionID: string = '';
    export let session: User;
    export let ac: boolean = false;

    let team: TeamsType | null;
    let loading = true;
    let inputs = {
        password: '',
        passwordRepeat: '',
        firstName: '',
        lastName: '',
        affiliation: ''
    };

    onMount(async () => {
        await refreshUserTeam();
        inputs.firstName = session.user_firstname;
        inputs.lastName = session.user_lastname;
        inputs.affiliation = session.user_affiliation;
        loading = false;
    });

    async function refreshUserTeam() {
        const DATA = await requestWrapper(false, { type: 'team-info', data: { id: session.user_team_id } });
        const JSON = await DATA.json();
        team = JSON.data;
    }

    async function updateUserData() {
        const DATA = await requestWrapper(false, {
            type: 'update-userdata',
            data: {
                session: sessionID,
                first: inputs.firstName.slice(0, 30),
                last: inputs.lastName.slice(0, 30),
                affiliation: inputs.affiliation.slice(0, 30)
            }
        });
        if (DATA.ok) {
            window.location.reload();
        }
    }

    async function resetPassword() {
        const DATA = await requestWrapper(false, {
            type: 'reset-password',
            data: {
                session: sessionID,
                password: inputs.password.slice(0, 96)
            }
        });
        if (DATA.ok) {
            window.location.reload();
        }
    }
</script>

<div class="flex flex-col flex-grow flex-1 max-w-screen-2xl px-4">
    {#if loading}
        <div class="text-center">
            <Spinner size={'16'} />
        </div>
    {:else}
        <div class="flex flex-col items-center">
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                PROFILE
            </h1>
            <div class="flex flex-col lg:flex-row">
                <Card
                    class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <div class="flex flex-col items-center p-6 dark:text-neutral-100 text-neutral-900">
                        <div class="flex flex-col items-center">
                            <Avatar size="xl" src="/img/avatars/wolf.webp" />
                            <h1 class="mt-2 text-xl font-medium">{session.username}</h1>
                            <span class="text-sm text-gray-500 dark:text-gray-400">{session.user_role}</span>
                            {#if team !== null}
                                <h2 class="mt-4 font-medium">Currently playing for:</h2>
                                <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                                    {team.team_name}<span class="ml-2 fi fi-{team.team_country_code.toLowerCase()}"
                                    ></span>
                                </p>
                            {:else}
                                <h2 class="mt-4 font-medium">Currently not in a Team.</h2>
                            {/if}
                        </div>
                    </div>
                </Card>
                <Card
                    class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <div class="flex flex-col justify items-center p-6 dark:text-neutral-100 text-neutral-900">
                        <div class="flex flex-col">
                            <h1 class="mb-6 text-xl font-medium">Personal Data</h1>
                            <div class="mb-6">
                                <Label for="first-name" class="mb-2">First Name</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.firstName}
                                    name="first-name"
                                    type="text"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div class="mb-6">
                                <Label for="last-name" class="mb-2">Last Name</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.lastName}
                                    name="last-name"
                                    type="text"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                            <div class="mb-6">
                                <Label for="affiliation" class="mb-2">Affiliation</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.affiliation}
                                    name="affiliation"
                                    type="text"
                                    required
                                />
                            </div>
                            <Button
                                on:click={updateUserData}
                                disabled={inputs.lastName === '' ||
                                    !validAlphanumeric(inputs.lastName, 30, true) ||
                                    inputs.firstName === '' ||
                                    !validAlphanumeric(inputs.firstName, 30, true) ||
                                    inputs.affiliation === '' ||
                                    !validAlphanumeric(inputs.affiliation, 30, true) ||
                                    inputs.firstName == session.user_firstname &&
                                    inputs.lastName == session.user_lastname && 
                                    inputs.affiliation == session.user_affiliation}>Save</Button
                            >
                        </div>
                    </div>
                </Card>
                <Card
                    class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <div class="flex flex-col items-center p-6 dark:text-neutral-100 text-neutral-900">
                        <div class="flex flex-col">
                            <h1 class="mb-6 text-xl font-medium">Reset Password</h1>
                            <div class="mb-6">
                                <Label for="pass-first" class="mb-2">New Password</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.password}
                                    name="pass-first"
                                    type="password"
                                    placeholder="••••••••••"
                                    required
                                />
                            </div>
                            <div class="mb-6">
                                <Label for="pass-second" class="mb-2">Repeat Password</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.passwordRepeat}
                                    name="pass-second"
                                    type="password"
                                    placeholder="••••••••••"
                                    required
                                />
                            </div>
                            <Button
                                on:click={resetPassword}
                                disabled={inputs.password === '' ||
                                    inputs.passwordRepeat === '' ||
                                    inputs.password !== inputs.passwordRepeat ||
                                    !validPassword(inputs.password)}>Save</Button
                            >
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        {#if session.user_role === 'admin'}
            <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
                <span class="italic text-neutral-500 opacity-50">#</span>
                SETTINGS
            </h1>
            <div class="flex flex-col flex-1 items-center">
                <Admin withAC={ac} />
            </div>
        {/if}
    {/if}
</div>
