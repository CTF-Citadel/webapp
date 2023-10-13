<script>
    import { Card, Button } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
</script>

<div class="flex flex-col 2xl:flex-row overflow-x-scroll">
    <Card img="/img/teams.webp" class="m-2">
        <Button>
            Teams <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
        </Button>
    </Card>
    <Card img="/img/challenges.webp" class="m-2">
        <Button>
            Challenges <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
        </Button>
    </Card>
    <Card img="/img/scoreboard.webp" class="m-2">
        <Button>
            Scoreboard <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
        </Button>
    </Card>
</div>
