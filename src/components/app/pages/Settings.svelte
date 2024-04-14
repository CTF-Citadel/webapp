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
    import { requestWrapper, validAlphanumeric, validPassword, AVATARS } from '../../../lib/helpers';
    import { Card, Spinner, Avatar, Input, Label, Button, Modal, Carousel } from 'flowbite-svelte';
    import type { TeamsType } from '../../../lib/schema';
    import type { User } from 'lucia';

    export let sessionID: string = '';
    export let session: User;
    export let ac: boolean = false;

    let team: TeamsType | null;
    let loading = true;
    let currentAvatar = '';
    let editAvatar: boolean = false;
    let avatarIndex: number = 0;
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
        currentAvatar = session.user_avatar;
        loading = false;
    });

    async function refreshUserTeam() {
        const DATA = await requestWrapper(false, { type: 'team-info', data: { session: sessionID } });
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

    async function updateUserAvatar() {
        const DATA = await requestWrapper(false, {
            type: 'update-useravatar',
            data: {
                session: sessionID,
                avatar: AVATARS[avatarIndex].title
            }
        });
        if (DATA.ok) {
            editAvatar = false;
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

<!--
    Avatar Modal
-->

<Modal
    size="sm"
    dialogClass="absolute top-0 left-0 m-auto p-4 z-50 flex flex-1 justify-center w-full h-full"
    defaultClass="rounded-none overflow-scroll bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
    backdropClass="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
    color="none"
    outsideclose
    bind:open={editAvatar}
    title="Edit Avatar"
>
    <div class="mb-6">
        <Carousel images={AVATARS} let:Controls bind:index={avatarIndex}>
            <Controls />
        </Carousel>
    </div>
    <svelte:fragment slot="footer">
        <div class="flex flex-row justify-between w-full">
            <div>
                <Button on:click={updateUserAvatar}>Update</Button>
                <Button
                    on:click={() => {
                        editAvatar = false;
                    }}
                    color="alternative">Cancel</Button
                >
            </div>
        </div>
    </svelte:fragment>
</Modal>

<!--
    Main
-->

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
                    <div
                        class="flex flex-1 flex-col justify-center items-center p-6 dark:text-neutral-100 text-neutral-900"
                    >
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="flex flex-col items-center">
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <span
                                on:click={() => {
                                    editAvatar = true;
                                }}
                            >
                                <Avatar
                                    size="xl"
                                    src="/img/avatars/{currentAvatar}.webp"
                                    class="ring-2 ring-transparent hover:ring-primary-500 hover:dark:ring-primary-500"
                                />
                            </span>
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
                    <div
                        class="flex flex-1 flex-col justify-center items-center p-6 dark:text-neutral-100 text-neutral-900"
                    >
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
                                />
                            </div>
                            <div class="mb-6">
                                <Label for="affiliation" class="mb-2">Affiliation</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.affiliation}
                                    name="affiliation"
                                    type="text"
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
                                    (inputs.firstName == session.user_firstname &&
                                        inputs.lastName == session.user_lastname &&
                                        inputs.affiliation == session.user_affiliation)}>Save</Button
                            >
                        </div>
                    </div>
                </Card>
                <Card
                    class="m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl"
                >
                    <div
                        class="flex flex-1 flex-col justify-center items-center p-6 dark:text-neutral-100 text-neutral-900"
                    >
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
                                />
                            </div>
                            {#if inputs.password.length > 0 && !validPassword(inputs.password)}
                                <p class="text-red-500 text-sm mb-6">Requirements not met!</p>
                            {/if}
                            <div class="mb-6">
                                <Label for="pass-second" class="mb-2">Repeat Password</Label>
                                <Input
                                    class="bg-neutral-100 dark:bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !rounded-none !border-none focus:!outline-none focus:!border-none"
                                    bind:value={inputs.passwordRepeat}
                                    name="pass-second"
                                    type="password"
                                    placeholder="••••••••••"
                                />
                            </div>
                            {#if inputs.passwordRepeat.length > 0 && inputs.password !== inputs.passwordRepeat}
                                <p class="text-red-500 text-sm mb-6">Passwords do not match!</p>
                            {/if}
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
