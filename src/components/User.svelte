<script lang="ts">
    import { Card } from 'flowbite-svelte';

    export let userSession: any = {};
</script>

<div class="flex flex-col 2xl:flex-row">
    <Card class="m-2">
        <h1>Hello {userSession.user_role}, {userSession.username}</h1>
    </Card>
</div>
