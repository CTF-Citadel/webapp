<script lang="ts">
    import { onMount } from 'svelte';

    export let user: any = {};

    onMount(async () => {});
</script>

<div class="flex flex-col 2xl:flex-row">
    <p>{user.username}</p>
</div>
