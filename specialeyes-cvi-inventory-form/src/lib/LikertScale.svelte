<script>
  export let value;
</script>

<div class="scale">
  {#each ["Never", "Rarely", "Sometimes", "Often", "Always", "Not Applicable"] as scaleLabel}
    <label>
      {scaleLabel}
      <input
        type="radio"
        bind:group={value}
        value={scaleLabel}
      />
    </label>
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
