<script lang="ts">
    import { DarkMode } from 'flowbite-svelte';
    import ArrowLeftToBracketOutline from 'flowbite-svelte-icons/ArrowLeftToBracketOutline.svelte';
    import UserCircleOutline from 'flowbite-svelte-icons/UserCircleOutline.svelte';
    import CogOutline from 'flowbite-svelte-icons/CogOutline.svelte'

    // from parent
    export let username = '';
    export let interactive = false;
    export let admin = false;

    // header text
    let headerText = 'CTF Citadel';
    if (username != '') {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        let greeting: string;

        if (currentHour > 5 && currentHour < 12) {
            greeting = 'Good morning';
        } else if (currentHour > 12 && currentHour < 15) {
            greeting = 'Good noon';
        } else if (currentHour > 15 && currentHour < 18) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }
        headerText = `${greeting}, ${username}!`;
    }
</script>

<header class="sticky top-0 w-screen z-30 min-w-screen h-16">
    <nav class="bg-neutral-100 dark:bg-neutral-900 lg:bg-[#0000001f] lg:dark:bg-[#0000004f] backdrop-blur-3xl border-b-4 border-neutral-200 dark:border-neutral-800 px-4 lg:px-6 py-2.5">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <a href="/" class="items-center flex">
                <img src="/favicon.svg" class="mr-3 h-6 sm:h-9 brightness-0 dark:brightness-[300%]" alt="Logo" />
                <span class="hidden lg:block self-center text-xl font-semibold whitespace-nowrap dark:text-white">{headerText}</span>
            </a>
            <div class="flex items-center lg:order-2">
                {#if interactive}
                    <a href="/user">
                        <button class="p-2.5">
                            <UserCircleOutline />
                        </button>
                    </a>
                {/if}
                {#if admin}
                    <a href="/settings">
                        <button class="p-2.5">
                            <CogOutline />
                        </button>
                    </a>
                {/if}
                <DarkMode class="text-2xl hover:bg-surface-900 border-surface-900 focus:ring-surface-900" />
                {#if interactive}
                    <form method="post" action="/logout">
                        <button type="submit" class="p-2.5">
                            <ArrowLeftToBracketOutline />
                        </button>
                    </form>
                {/if}
            </div>
            <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                    <slot />
                </ul>
            </div>
        </div>
    </nav>
</header>
