<script>
    import { Card, Button } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
</script>

<div class="flex flex-col lg:flex-row">
    <Card img="/img/teams.webp" class="m-2">
        <a href="/teams">
            <Button>
                Teams <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
            </Button>
        </a>
    </Card>
    <Card img="/img/events.webp" class="m-2">
        <a href="/events">
            <Button>
                Events <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </Button>
        </a>
    </Card>
    <Card img="/img/scoreboard.webp" class="m-2">
        <a href="/scoreboards">
            <Button>
                Scoreboards <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </Button>
        </a>
    </Card>
</div>
