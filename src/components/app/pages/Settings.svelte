<script lang="ts">
    import Admin from '../lib/Admin.svelte';
    import User from '../lib/User.svelte';

    export let user: any = {};
</script>

<div class="flex flex-col 2xl:flex-row flex-1 w-full h-full p-2">
    {#if user.user_role == 'admin'}
        <Admin />
    {/if}
    <User user={user} />
</div>
