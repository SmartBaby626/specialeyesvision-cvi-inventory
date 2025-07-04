<script>
  import LikertScale from './lib/LikertScale.svelte';
  import RadioButton from './lib/RadioButton.svelte';
  import ContinueButton from './lib/ContinueButton.svelte';
  import BackButton from './lib/BackButton.svelte';
  import { fly, fade, slide } from 'svelte/transition';
  import questions4_8 from '../Questions/questions4-8.json';
  import questions9_12 from '../Questions/questions9-12.json';

  let currentPage = 0;
  let previousPage = 0;

  let ageGroup = null; // '4-8' or '9-12'
  let questions = [];
  let answers = [];

  function selectAge(group) {
    ageGroup = group;
    questions = group === '4-8' ? questions4_8 : questions9_12;
    answers = questions.map(() => ({ value: '', subValue: '' }));
    nextPage();
  }

  function nextPage() {
    previousPage = currentPage;
    currentPage++;
  }

  function prevPage() {
    previousPage = currentPage;
    currentPage--;
  }

  function handleLikertChange(idx, val) {
    answers[idx].value = val;
    // Reset subValue if main answer is 'Never' or 'Not Applicable'
    if (val === 'Never' || val === 'Not Applicable') {
      answers[idx].subValue = '';
    }
  }

  function handleSubChange(idx, val) {
    answers[idx].subValue = val;
  }

  function handleDynamicSubmit() {
    // You can use the 'answers' array for the next part of your code
    console.log('Survey Results:', answers);
    alert('Thanks for submitting!');
  }

  $: isForward = currentPage > previousPage;
</script>

<main class="survey">
  {#if currentPage === 0}
    <h1 class="survey__title">Specialeyes Vision CVI Inventory Survey</h1>
    <div class="survey__question">Is your child:</div>
    <div style="display: flex; gap: 2rem; justify-content: center; margin: 2rem 0;">
      <RadioButton label="4-8 Years Old" value="4-8" bind:group={ageGroup} />
      <RadioButton label="9-12 Years Old" value="9-12" bind:group={ageGroup} />
    </div>
    <ContinueButton on:click={() => selectAge(ageGroup)} disabled={!ageGroup}>Next</ContinueButton>
  {/if}

  {#if ageGroup && currentPage > 0}
    <header class="survey__header">
      <span class="survey__header-title">Special Eyes Vision Services CVI Inventory Form</span>
      <div class="survey__progress-bar-container">
        <div class="survey__progress-bar" style="width: {Math.round((currentPage/questions.length)*100)}%"></div>
      </div>
    </header>
  {/if}

  {#if ageGroup && currentPage > 0}
    <div class="survey__viewport">
      {#key currentPage}
        <div class="survey__page" in:fly={{ x: isForward ? 400 : -400, duration: 400 }} out:fly={{ x: isForward ? -400 : 400, duration: 400 }}>
          {#if currentPage > 0 && currentPage <= questions.length}
            <h2 class="survey__subtitle">Question {questions[currentPage-1].questionNum}</h2>
            {#if questions[currentPage-1].DYC === 'TRUE'}
              <div class="survey__question-lead" style="color: #000;">Does your child...</div>
            {/if}
            <p class="survey__question">{questions[currentPage-1].questionText}</p>
            <LikertScale class="survey__scale" bind:value={answers[currentPage-1].value} />
            {#if questions[currentPage-1].subQuestion === 'TRUE' && answers[currentPage-1].value && answers[currentPage-1].value !== 'Never' && answers[currentPage-1].value !== 'Not Applicable'}
              <div in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                <div class="survey__subquestion" in:slide={{ duration: 300 }} out:slide={{ duration: 300 }}>
                  <p>{questions[currentPage-1].subQuestionText}</p>
                  {#each questions[currentPage-1].subQuestionOptText.split('/') as opt}
                    <RadioButton label={opt} value={opt} group={answers[currentPage-1].subValue} on:click={() => handleSubChange(currentPage-1, opt)} />
                  {/each}
                </div>
              </div>
            {/if}
            <div class="survey__navigation">
              {#if currentPage > 1}
                <BackButton on:click={prevPage}>Back</BackButton>
              {/if}
              <ContinueButton on:click={nextPage} disabled={!answers[currentPage-1].value}>Next</ContinueButton>
            </div>
          {:else}
            <h2 class="survey__subtitle">Review & Submit</h2>
            <ContinueButton on:click={handleDynamicSubmit}>Submit</ContinueButton>
          {/if}
        </div>
      {/key}
    </div>
  {/if}
</main>

<style>
  .survey {
    font-family: Arial, sans-serif;
    width: 100vw;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    text-align: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .survey__header {
    width: 100vw;
    background: #530A7A;
    color: #fff;
    padding: 1.2rem 0 0.7rem 0;
    font-size: 1.3rem;
    font-weight: bold;
    letter-spacing: 0.5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    box-shadow: 0 2px 8px #0002;
  }
  .survey__header-title {
    margin-bottom: 0.5rem;
  }
  .survey__progress-bar-container {
    width: 80vw;
    max-width: 600px;
    height: 8px;
    background: #fff2;
    border-radius: 4px;
    overflow: hidden;
  }
  .survey__progress-bar {
    height: 100%;
    background: #fff;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .survey__viewport {
    position: relative;
    overflow: hidden;
    min-height: 300px;
    height: 100vh;
    width: 100vw;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .survey__page {
    position: absolute;
    width: 100vw;
    top: 0;
    left: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .survey__title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .survey__subtitle {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .survey__question-lead {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
    color: #000;
    letter-spacing: 0.2px;
  }

  .survey__question {
    margin: 1rem 0 0.5rem 0;
  }

  .survey__navigation {
    margin-top: auto;
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .survey__button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .survey__subquestion {
    margin-top: 1rem;
    text-align: left;
    width: 100%;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
