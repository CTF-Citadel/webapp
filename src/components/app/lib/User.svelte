<!--
  @component
  ## Props
  @prop export let session: any = {};
-->

<script lang="ts">
    import { onMount } from 'svelte';

    export let session: any = {};

    onMount(async () => {});
</script>

<div class="flex flex-col 2xl:flex-row">
    <p>{session.username}</p>
</div>
