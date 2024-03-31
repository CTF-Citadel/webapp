<!--
  @component
-->

<script>
    import { Card, Button } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
</script>

<div class="flex flex-1 flex-col justify-center max-w-8/10">
    <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
        <span class="italic text-neutral-500 opacity-50">#</span>
        DASHBOARD
    </h1>
    <div class="flex flex-col lg:flex-row items-center justify-center flex-1">
        <Card img="/img/banners/03.webp" class="text-center m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
            <a href="/rules">
                <Button>
                    Rules <ArrowRightOutline class="w-5 h-5 ml-1 text-white" />
                </Button>
            </a>
        </Card>
        <Card img="/img/banners/01.webp" class="text-center m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
            <a href="/teams">
                <Button>
                    Teams <ArrowRightOutline class="w-5 h-5 ml-1 text-white" />
                </Button>
            </a>
        </Card>
        <Card img="/img/banners/02.webp" class="text-center m-2 bg-[#0000001f] dark:bg-[#0000004f] border-2 border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl">
            <a href="/events">
                <Button>
                    Events <ArrowRightOutline class="w-5 h-5 ml-1 text-white" />
                </Button>
            </a>
        </Card>
    </div>
</div>
