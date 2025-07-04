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
    gap: 1rem;
    margin-bottom: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
