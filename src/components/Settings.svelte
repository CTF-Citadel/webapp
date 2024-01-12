<script lang="ts">
    import AdminPanel from './AdminPanel.svelte';

    export let userSession: any = {};
</script>

<div class="flex flex-col 2xl:flex-row flex-1 w-full h-full p-2">
    {#if userSession.user_role == 'admin'}
        <AdminPanel />
    {/if}
</div>
