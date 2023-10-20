<script>
    import { Card, Button } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
</script>


<div class="flex flex-col 2xl:flex-row">
    <Card img="/img/scoreboard.webp" class="m-2">
        <a href="/challenges">
            <Button>
                Senior Challenges <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
            </Button>
        </a>
    </Card>
    <Card img="/img/teams.webp" class="m-2">
        <a href="/challenges">
            <Button>
                Junior Challenges <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
            </Button>
        </a>
    </Card>
</div>
