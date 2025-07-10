<script>
  import RadioButton from "./RadioButton.svelte";
  export let value;
</script>

<div class="scale">
  {#each ["Never", "Rarely", "Sometimes", "Often", "Always", "Not Applicable"] as scaleLabel}
    <RadioButton label={scaleLabel} value={scaleLabel} bind:group={value} />
  {/each}
</div>

<style>
  .scale {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;          
    flex: 1 1 auto;          
    text-align: center;
  }
</style>
