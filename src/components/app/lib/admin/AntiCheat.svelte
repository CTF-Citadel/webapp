<!--
  @component
-->

<script lang="ts">
    import { onMount } from "svelte";

    let sse: EventSource;
    let socketMessages: any[] = [];

    onMount(() => {
        sse = new EventSource('/api/v1/ac/stream');
        sse.onmessage = (event) => {
            const data = JSON.parse(event.data);
            socketMessages.push(data.data);
            console.log(socketMessages);
        };
        sse.onerror = () => {
            sse.close();
        };
        window.onbeforeunload = () => {
            sse.close();
        };
    });
</script>

<div class="">
    <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
        <span class="italic text-neutral-500 opacity-50">#</span>
        ANTI CHEAT
    </h1>
</div>
