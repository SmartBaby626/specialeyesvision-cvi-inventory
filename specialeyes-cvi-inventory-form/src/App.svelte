<script>
  import LikertScale from './lib/LikertScale.svelte';
  import RadioButton from './lib/RadioButton.svelte';
  import { fly } from 'svelte/transition';

  let currentPage = 0;
  let previousPage = 0;

  let responseQ1 = 0;
  let responseQ2 = 0;
  let responseQ3 = 0;
  let responseQ4 = 0;
  let responseQ5 = 0;

  function nextPage() {
    previousPage = currentPage;
    currentPage++;
  }

  function prevPage() {
    previousPage = currentPage;
    currentPage--;
  }

  function handleSubmit() {
    console.log({
      responseQ1, responseQ2, responseQ3, responseQ4, responseQ5
    });
    alert(`Thanks for submitting!`);
  }

  $: isForward = currentPage > previousPage;
</script>

<main class="survey">
  <div class="survey__viewport">
    {#key currentPage}
      <div
        class="survey__page"
        in:fly={{ x: isForward ? 400 : -400, duration: 400 }}
        out:fly={{ x: isForward ? -400 : 400, duration: 400 }}
      >
        {#if currentPage === 0}
          <h1 class="survey__title">Specialeyes Vision CVI Inventory Survey</h1>
          <button class="survey__button" on:click={nextPage}>Start Survey</button>

        {:else if currentPage === 1}
          <h2 class="survey__subtitle">Page 1</h2>
          <p class="survey__question">1. I feel comfortable reading text on a screen.</p>
          <LikertScale class="survey__scale" bind:value={responseQ1} />

          <p class="survey__question">2. I can focus on moving objects easily.</p>
          <LikertScale class="survey__scale" bind:value={responseQ2} />

          <div class="survey__navigation">
            <button class="survey__button" on:click={prevPage}>Back</button>
            <button class="survey__button" on:click={nextPage}>Next</button>
          </div>

        {:else if currentPage === 2}
          <h2 class="survey__subtitle">Page 2</h2>
          <p class="survey__question">3. I can read in a noisy environment.</p>
          <LikertScale class="survey__scale" bind:value={responseQ3} />

          <p class="survey__question">4. I prefer high contrast text.</p>
          <LikertScale class="survey__scale" bind:value={responseQ4} />

          <div class="survey__navigation">
            <button class="survey__button" on:click={prevPage}>Back</button>
            <button class="survey__button" on:click={nextPage}>Next</button>
          </div>

        {:else if currentPage === 3}
          <h2 class="survey__subtitle">Page 3</h2>
          <p class="survey__question">5. I find it easy to navigate crowded places.</p>
          <LikertScale class="survey__scale" bind:value={responseQ5} />

          <div class="survey__navigation">
            <button class="survey__button" on:click={prevPage}>Back</button>
            <button class="survey__button" on:click={handleSubmit}>Submit</button>
          </div>
        {/if}
      </div>
    {/key}
  </div>
</main>

<style>
  .survey {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .survey__viewport {
    position: relative;
    overflow: hidden;
    min-height: 300px;
  }

  .survey__page {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }

  .survey__title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .survey__subtitle {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .survey__question {
    margin: 1rem 0 0.5rem 0;
  }

  .survey__navigation {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .survey__button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
