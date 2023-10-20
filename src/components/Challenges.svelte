<script>
    import AccordionItem from 'flowbite-svelte/AccordionItem.svelte';
    import Accordion from 'flowbite-svelte/Accordion.svelte';
    import FileCodeSolid from 'flowbite-svelte-icons/FileCodeSolid.svelte';
    //import UsersGroupOutline from 'flowbite-svelte-icons/UsersGroupOutline.svelte';
    //import FingerprintSolid from 'flowbite-svelte-icons/FingerprintSolid.svelte';
    //import DrawSquareSolid from 'flowbite-svelte-icons/DrawSquareSolid.svelte';
    //import EyeSlashOutline from 'flowbite-svelte-icons/EyeSlashOutline.svelte';

    const TEMPLATE_CHALLENGES = {
        challenge1: {
            category: 'Programming',
            difficulty: 'Easy',
            points: 10,
            name: 'Introduction to Variables',
            description: 'This is a easy challenge',
            isdone: true,
            flagformat: "TH{ . . . }"
        },
        challenge2: {
            category: 'OSINT',
            difficulty: 'Medium',
            points: 20,
            name: 'Responsive Design Challenge',
            description: 'This is a medium challenge',
            isdone: false,
            flagformat: "TH{ . . . }"
        },
        challenge3: {
            category: 'Forensic',
            difficulty: 'Hard',
            points: 30,
            name: 'Machine Learning Project',
            description: 'This is a hard challenge',
            isdone: false,
            flagformat: "TH ..."
        }
        // Template for real challenges
    };
</script>

<div class="!w-[90%]">
    <Accordion multiple>
        {#each Object.values(TEMPLATE_CHALLENGES) as challenge}
            <AccordionItem class="border-none !rounded-none">
                <div slot="header" class="flex-container">
                    <FileCodeSolid class="mt-0.5" />
                    <div class="font-bold">{challenge.category}:</div>
                    <div class="font-bold">{challenge.name} ({challenge.points})</div>
                    {#if challenge.difficulty == 'Easy'}
                        <div class="text-green-500">Difficulty: {challenge.difficulty}</div>
                    {:else if challenge.difficulty == 'Medium'}
                        <div class="text-orange-500">Difficulty: {challenge.difficulty}</div>
                    {:else}
                        <div class="text-red-500">Difficulty: {challenge.difficulty}</div>
                    {/if}
                </div>
                <p class="mb-2 text-gray-500 dark:text-gray-400">{challenge.description}</p>
                <div class="relative">
                    {#if challenge.isdone == false}
                        <input
                            type="text"
                            id="search"
                            class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={challenge.flagformat}
                            required
                        />
                        <button
                            type="submit"
                            class="text-white absolute right-2.5 bottom-2.5 bg-pink-700 hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
                            >Submit Flag</button
                        >
                    {:else}
                        <input
                            type="text"
                            id="search"
                            class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-green-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-green-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Submitted!, Well done"
                            required
                            disabled
                        />
                        <button
                            type="submit"
                            class="text-white absolute right-2.5 bottom-2.5 bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                            disabled>Flag Submitted</button
                        >
                    {/if}
                </div>
            </AccordionItem>
        {/each}
    </Accordion>
</div>
