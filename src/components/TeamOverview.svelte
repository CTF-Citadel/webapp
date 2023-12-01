<script>
    import { Card, Button, Modal, Label, Input } from 'flowbite-svelte';
    import ArrowRightOutline from 'flowbite-svelte-icons/ArrowRightOutline.svelte';
    import Chart from 'flowbite-svelte/Chart.svelte';
    
    let defaultModal = false;
    let hasTeam = true;
    let teamSelection = {
        option: false
    };
    let inputs = {
        teamID: '',
        teamDesc: ''
    };

    function modelOpen(option) {
        defaultModal = false;
        inputs.teamID = '';
        inputs.teamDesc = '';
        teamSelection.option = option;
        console.log(teamSelection)
        defaultModal = true;
    }

    //Fetch this data later
    let members = ['Maximilian Mustermann', 'Kennmich Gut', 'Jamie Reisi', 'Franne Ank'];
    let points = [100, 400, 350, 200];
    let infos = {
        correct: 12,
        wrong: 35,
        blood: 5
    }

    const options = {
    series: points,
    colors: ['#1C64F2', '#16BDCA', '#FDBA8C', '#E74694'],
    chart: {
      height: 320,
      width: '100%',
      type: 'donut'
    },
    stroke: {
      colors: ['transparent'],
      lineCap: ''
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: 'Inter, sans-serif',
              offsetY: 20
            },
            total: {
              showAlways: false,
              show: true,
              label: 'Your total Points',
              fontFamily: 'Inter, sans-serif',
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
                return `${sum}`;
              }
            },
            value: {
              show: true,
              fontFamily: 'Inter, sans-serif',
              offsetY: -20,
              formatter: function (value) {
                return value;
              }
            }
          },
          size: '80%'
        }
      }
    },
    grid: {
      padding: {
        top: -2
      }
    },
    labels: members,
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value;
        }
      }
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value;
        }
      },
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true
      }
    }
  };

</script>


{#if hasTeam == false}
    <div class="flex flex-col sm:flex-row">
        <Card size="sm" padding="sm" img="" class="m-4">
            <Button on:click={() => modelOpen("Join")}>
                Join Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />            
            </Button>
        </Card>
        <Card size="sm" padding="sm" img="" class="m-4">
            <Button on:click={() => modelOpen("Create")}>
                Create Team <ArrowRightOutline class="w-3.5 h-3.5 ml-2 text-white" />
            </Button>
        </Card>
    </div>

    <Modal title="Team {teamSelection.option}" bind:open={defaultModal} autoclose>
        {#if teamSelection.option === "Join"}
        <Label class="space-y-2">
            <span>Team Token</span>
            <Input
                bind:value={inputs.teamID}
                type="txt"
                name="teamName"
                placeholder="Enter your Team Token"
                required
            />
        </Label>
        {:else if teamSelection.option === "Create"}
            <Label class="space-y-2">
                <span>Team Name</span>
                <Input
                    bind:value={inputs.teamID}
                    type="txt"
                    name="teamName"
                    placeholder="Team Name"
                    required
                />
            </Label>
            <Label class="space-y-2">
                <span>Team Description</span>
                <Input
                    bind:value={inputs.teamDesc}
                    type="txt"
                    name="teamDescr"
                    placeholder="We are the best!"
                />
            </Label>
        {/if}
        <svelte:fragment slot="footer">
        <Button on:click={() => alert('Handle "success"')} disabled={!inputs.teamID}>Proceed</Button>
        <Button color="alternative">Cancle</Button>
        </svelte:fragment>
    </Modal>
{:else if hasTeam}

<!-- Will need better flexing depending on dater which will be used instead of it -->
<div class="flex flex-col 2xl:flex-row">
    <Card class="m-2">
        <div class="grid grid-cols-3 gap-3 mb-2">
            <dl class="bg-teal-50 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center h-[78px]">
            <dt class="w-8 h-8 rounded-full bg-teal-100 dark:bg-gray-500 text-teal-600 dark:text-teal-300 text-sm font-medium flex items-center justify-center mb-1">{infos.correct}</dt>
            <dd class="text-teal-600 dark:text-teal-300 text-sm font-medium">Right Submitts</dd>
            </dl>
            <dl class="bg-orange-50 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center h-[78px]">
            <dt class="w-8 h-8 rounded-full bg-orange-100 dark:bg-gray-500 text-orange-600 dark:text-orange-300 text-sm font-medium flex items-center justify-center mb-1">{infos.wrong}</dt>
            <dd class="text-orange-600 dark:text-orange-300 text-sm font-medium">False Submitts</dd>
            </dl>

            <dl class="bg-blue-50 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center h-[78px]">
            <dt class="w-8 h-8 rounded-full bg-blue-100 dark:bg-gray-500 text-blue-600 dark:text-blue-300 text-sm font-medium flex items-center justify-center mb-1">{infos.blood}</dt>
            <dd class="text-blue-600 dark:text-blue-300 text-sm font-medium">First Bloods</dd>
            </dl>
        </div>
    <Chart {options} class="py-6" />
    </Card>
    <Card class="m-2">
        <!-- Change this to a nice Listing later-->
       <h1 class="text-xl font-bold leading-none text-gray-900 dark:text-white mr-1">Team Members and their Points</h1>
       {#each members as member, index}
            <p>{member} with {points[index]}</p>
       {/each}
    </Card>
    <Card class="m-2">
        <!-- Change this to real informations-->
        <h1 class="text-xl font-bold leading-none text-gray-900 dark:text-white mr-1">Your Team Settings</h1>
            <p>Team Name: Name</p>
            <p>Team Description: Description</p>
            <p>Country: Country</p>

    </Card>
</div>

{/if}