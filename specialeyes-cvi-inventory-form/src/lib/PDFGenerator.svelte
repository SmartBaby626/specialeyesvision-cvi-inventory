<script>
  import html2pdf from 'html2pdf.js';
  import { onMount, onDestroy } from 'svelte'; 
  
  export let surveyResults;
  export let autoDownload = true;
  export let fileName = 'survey-results.pdf';
  
  let pdfBlob = null;
  let pdfUrl = '';
  
  onMount(() => {
    generatePDF();
  });
  
  async function generatePDF() {
    const element = document.getElementById('pdf-content');
    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    if (autoDownload) {
      html2pdf().set(opt).from(element).save();
    } else {
      const result = await html2pdf().set(opt).from(element).output('blob');
      pdfBlob = result;
      pdfUrl = URL.createObjectURL(result);
    }
  }
  
  onDestroy(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  });
</script>

<div id="pdf-content" class="pdf-container">
  <h1>Survey Results</h1>
  <p>Age Group: {surveyResults.ageGroup}</p>
  
  {#each surveyResults.responses as response}
    <div class="question-block">
      <h3>Question {response.questionNum}</h3>
      <p>{response.questionText}</p>
      <p><strong>Answer:</strong> {response.answer}</p>
      {#if response.subQuestionText}
        <p><strong>Follow-up:</strong> {response.subQuestionText}</p>
        <p><strong>Response:</strong> {response.subAnswer}</p>
      {/if}
    </div>
  {/each}
</div>

{#if !autoDownload && pdfUrl}
  <div class="pdf-actions">
    <a href={pdfUrl} download={fileName} class="download-btn">
      Download PDF
    </a>
  </div>
{/if}

<style>
  .pdf-container {
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  .question-block {
    margin-bottom: 20px;
    page-break-inside: avoid;
  }
  h1 {
    color: #530A7A;
    text-align: center;
  }
  .pdf-actions {
    margin-top: 20px;
    text-align: center;
  }
  .download-btn {
    padding: 10px 20px;
    background: #530A7A;
    color: white;
    border-radius: 4px;
    text-decoration: none;
  }
</style>