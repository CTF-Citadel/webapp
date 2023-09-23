<script>
    import { Card, Button } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
</script>

<div class="flex flex-col sm:flex-row overflow-x-scroll">
    <Card size="sm" padding="sm" img="/img/teams.webp" class="m-4">
        <Button>
            Teams <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
        </Button>
    </Card>
    <Card size="sm" padding="sm" img="/img/challenges.webp" class="m-4">
        <Button>
            Challenges <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
        </Button>
    </Card>
    <Card size="sm" padding="sm" img="/img/scoreboard.webp" class="m-4">
        <Button>
            Scoreboard <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
        </Button>
    </Card>
</div>
