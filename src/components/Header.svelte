<script lang="ts">
    import { DarkMode } from 'flowbite-svelte';
    export let currentPage: any;
</script>

<header class="sticky top-0 w-full">
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <span class="flex items-center">
                <a href="/">                    
                    <img src="/favicon.svg" class="mr-3 h-6 sm:h-9" alt="Logo"/>
                    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">CTF Citadel > {currentPage}</span>
                </a>
            </span>
            <div class="flex items-center lg:order-2">
                <DarkMode class="text-2xl hover:bg-surface-900 border-surface-900 focus:ring-surface-900" />
            </div>
            <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                    <slot />
                </ul>
            </div>
        </div>
    </nav>
</header>
