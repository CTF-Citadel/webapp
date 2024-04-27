<script lang="ts">
    import { slide } from 'svelte/transition';
    import { notifyState } from '../../../lib/notify.ts';
    import { Toast } from 'flowbite-svelte';
    import CheckCircleSolid from 'flowbite-svelte-icons/CheckCircleSolid.svelte';
    import CloseCircleSolid from 'flowbite-svelte-icons/CloseCircleSolid.svelte';
</script>

{#if !$notifyState.error}
    <Toast
        transition={slide}
        params={{ axis: 'y' }}
        color="green"
        class="z-50"
        position="top-right"
        bind:open={$notifyState.active}
    >
        <svelte:fragment slot="icon">
            <CheckCircleSolid class="w-5 h-5" />
            <span class="sr-only">Icon</span>
        </svelte:fragment>
        {$notifyState.message}
    </Toast>
{:else}
    <Toast
        transition={slide}
        params={{ axis: 'y' }}
        color="red"
        class="z-50"
        position="top-right"
        bind:open={$notifyState.active}
    >
        <svelte:fragment slot="icon">
            <CloseCircleSolid class="w-5 h-5" />
            <span class="sr-only">Icon</span>
        </svelte:fragment>
        {$notifyState.message}
    </Toast>
{/if}
