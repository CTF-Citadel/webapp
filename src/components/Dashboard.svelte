<script>
    import { Card, Button } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
</script>

<div class="flex flex-col sm:flex-row overflow-x-scroll">
    <Card size="sm" padding="sm" img="/img/teams.webp" class="m-4">
        <Button>
            <a href="/teams">    
                Teams <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
            </a>
        </Button>
    </Card>
    <Card size="sm" padding="sm" img="/img/challenges.webp" class="m-4">
        <Button>
            <a href="/challenge">    
                Challenges <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </a>
        </Button>
    </Card>
    <Card size="sm" padding="sm" img="/img/scoreboard.webp" class="m-4">
        <Button>
            <a href="/scoreboard">    
                Scoreboard <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </a>
        </Button>
    </Card>
</div>
