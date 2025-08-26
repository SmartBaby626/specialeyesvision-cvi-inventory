<script>
  /**
   * // Fix subquestion handling to display results in results PDF
   * TODO: Reformat the results PDF to use likert scale
   * TODO: Remove DYC gap
   * // Add email html
   * // Make sure email is sent with correct data
   * TODO: Switch to mums email
   * // Fix weird NULL error on subquestion
   * // Fix filename error
   * TODO: Complete survey on mobile
   * TODO: Double check everything works
   * TODO: Neaten up code
   * TODO: CELEBRATE!
   * // Increase spacing between title and progress bar
   * // Fix spacing between subquestion options
   * // Add quick variables
   * // Test screen reader compatibility
   * // Fix radio buttons in subquestions so multiple options can't be selected
   * // Add a loading spinner when generating PDFs
   * // Fix titles for questions being cut off between page
   * // Change "review and submit" to "submit"
   * // Show strategies for 34/36a and 34/36b questions
   * // Allow proceeding in the survey after selecting subquestion options
   * // Change favicon and page title
   * // Update mobile device compatibility
   * // Check compatibility with different browsers
   * // Check compatibility with mobile (specifically touchscreen)
   * // Create CNAME file
   * // Host on GitHub Pages
   * // Add reCAPTCHA v3 for security
   * // Add name input
   * // Update PDF file names
   * // Remove automatic download
   * // Set up email address
   * // Set up email forwarding of results
   * // Add strategies at school
   * // Add intro page
   */
  import LikertScale from './lib/LikertScale.svelte';
  import RadioButton from './lib/RadioButton.svelte';
  import ContinueButton from './lib/ContinueButton.svelte';
  import BackButton from './lib/BackButton.svelte';
  import { fly, fade, slide } from 'svelte/transition';
  import questions4_8 from '../Questions/questions4-8.json';
  import questions9_12 from '../Questions/questions9-12.json';
  import strategiesAtHome4_8 from '../Strategies/strategiesAtHome4-8.json';
  import strategiesAtHome9_12 from '../Strategies/strategiesAtHome9-12.json';
  import strategiesAtSchool4_8 from '../Strategies/strategiesAtSchool4-8.json';
  import strategiesAtSchool9_12 from '../Strategies/strategiesAtSchool9-12.json';
  import UserNameBox from './lib/UserNameBox.svelte';
  import Loader from './lib/Loader.svelte';

  let isSubmitting = false;
  let currentPage = 0;
  let previousPage = 0;
  let surveyCompleted = false;
  let ageGroup = null;
  let questions = [];
  let answers = [];
  let participantName = '';
  let childName = '';
  let recaptchaV2Passed = false;
  let showRecaptchaV2 = false;
  let isIOS = false;
  let recaptchaLoaded = false;

  import { onMount } from 'svelte';
  import pako from 'pako';
  onMount(() => {
    isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    document.addEventListener('click', loadRecaptcha, { once: true });
  });

  async function loadRecaptcha() {
    if (recaptchaLoaded) return;

    try {
      const proxyScript = document.createElement('script');
      proxyScript.src = '/recaptcha-proxy.js';
      proxyScript.async = true;

      await new Promise((resolve, reject) => {
        proxyScript.onload = resolve;
        proxyScript.onerror = reject;
        document.head.appendChild(proxyScript);
      });

      await waitForRecaptcha();

      await initializeRecaptcha();
    } catch (e) {
      console.error('Proxy method failed, trying direct load', e);
      await loadDirectly();
    }
  }

  async function waitForRecaptcha() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  async function initializeRecaptcha() {
    return new Promise((resolve) => {
      window.grecaptcha.ready(() => {
        recaptchaLoaded = true;

        window.grecaptcha
          .execute('6LdoDn8rAAAAAAKejpFmQdqT0A0p1C3IzPUlJ4iZ', { action: 'survey' })
          .then((token) => console.log('Token preloaded'))
          .catch((err) => console.error('Preload error:', err));

        resolve();
      });
    });
  }

  async function loadDirectly() {
    return new Promise((resolve, reject) => {
      const directScript = document.createElement('script');
      directScript.src =
        'https://www.google.com/recaptcha/api.js?render=6LdoDn8rAAAAAAKejpFmQdqT0A0p1C3IzPUlJ4iZ';
      directScript.async = true;

      directScript.onload = async () => {
        await waitForRecaptcha();
        await initializeRecaptcha();
        resolve();
      };

      directScript.onerror = reject;
      document.head.appendChild(directScript);
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getSubLabel(response) {
    if (!response.subAnswer) return '';
    const question = questions.find((q) => q.questionNum === response.questionNum);
    if (!question || !question.subQuestionOptText) return response.subAnswer;

    const options = question.subQuestionOptText.split('/');
    const optionIndex = parseInt(response.subAnswer.replace('Option ', '')) - 1;

    return options[optionIndex] || response.subAnswer;
  }

  function loadRecaptchaV2() {
    if (document.getElementById('recaptcha-v2-script')) return;

    const script = document.createElement('script');
    script.id = 'recaptcha-v2-script';
    script.src = '/recaptcha-v2-proxy.js';
    script.async = true;

    script.onload = () => {
      const checkReady = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(checkReady);
          window.onRecaptchaV2LoadCallback();
        }
      }, 100);
    };

    document.body.appendChild(script);
  }

  window.onRecaptchaV2LoadCallback = () => {
    if (window.grecaptcha && window.grecaptcha.render) {
      grecaptcha.render('recaptcha-v2', {
        sitekey: '6LdREH8rAAAAANVJX3q3hClHuvxs_kyaVOmMRtTI',
        callback: window.onRecaptchaV2Success,
        'expired-callback': () => console.log('reCAPTCHA expired'),
        'error-callback': () => console.log('reCAPTCHA error'),
      });
    } else {
      console.error('grecaptcha.render not available');
    }
  };

  window.onRecaptchaV2Success = (token) => {
    window.recaptchaV2Token = token;
    recaptchaV2Passed = true;
    handleDynamicSubmit();
  };

  async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

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
    if (val === 'Never' || val === 'Not Applicable') {
      answers[idx].subValue = '';
    }
    answers = answers;
  }

  function handleSubChange(idx, option) {
    answers[idx].subValue = option;
    answers = answers;
  }
  function uint8ToBase64(uint8) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  async function handleDynamicSubmit() {
    isSubmitting = true;
    try {
      const results = {
        ageGroup,
        participantName,
        childName,
        responses: questions.map((q, idx) => ({
          questionNum: q.questionNum,
          questionText: q.questionText,
          answer: answers[idx].value,
          ...(q.subQuestion === 'TRUE' && {
            subQuestionText: q.subQuestionText,
            subAnswer: answers[idx].subValue,
          }),
        })),
      };

      const pdfBase64 = await generatePDF(results);
      const docxBase64 = await generateStrategiesDOCX(results);
      const schoolDocxBase64 = await generateSchoolStrategiesDOCX(results);

      const pdfFilename = safeFileName(
        `CVI-Inventory-Responses-${results.participantName}-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      const docxFilename = safeFileName(
        `CVI-Strategies-Home-${results.participantName}-${new Date().toISOString().slice(0, 10)}.docx`,
      );
      const schoolDocxFilename = safeFileName(
        `CVI-Strategies-School-${results.participantName}-${new Date().toISOString().slice(0, 10)}.docx`,
      );

      let token = null;
      if (recaptchaLoaded && window.grecaptcha && window.grecaptcha.execute) {
        token = await window.grecaptcha.execute('6LdoDn8rAAAAAAKejpFmQdqT0A0p1C3IzPUlJ4iZ', {
          action: 'submit',
        });
      }

      if (!token && window.recaptchaV2Token) {
        token = window.recaptchaV2Token;
      }

      if (!token) {
        showRecaptchaV2 = true;
        loadRecaptchaV2();
        isSubmitting = false;
        return;
      }

      const payload = {
        participantName: results.participantName,
        childName: results.childName,
        ageGroup: results.ageGroup,
        pdfBase64,
        pdfFilename,
        docxBase64,
        docxFilename,
        schoolDocxBase64,
        schoolDocxFilename,
        email: 'addytwhite@icloud.com',
        recaptchaToken: token,
      };

      let body = JSON.stringify(payload);

      if (isIOS) {
        const compressed = pako.gzip(body);
        body = uint8ToBase64(compressed);
      }

      const res = await fetch(
        'https://nodejs-serverless-function-express-one-gold.vercel.app/api/sendEmail',
        {
          method: 'POST',
          headers: {
            'Content-Type': isIOS ? 'application/octet-stream' : 'application/json',
            'X-Compressed': isIOS ? 'gzip-base64' : 'false',
          },
          body,
        },
      );

      if (res.ok) {
        surveyCompleted = true;
      } else {
        const errorText = await res.text();
        console.error('Submission error:', res.status, errorText);

        if (isIOS) {
          alert(
            `Submission failed: ${res.status} ${res.statusText}. Please try again or contact support.`,
          );
        }

        if (res.status === 403 && !recaptchaV2Passed) {
          showRecaptchaV2 = true;
          loadRecaptchaV2();
        }
      }
    } catch (error) {
      console.error('Submission failed:', error);

      if (isIOS) {
        alert(`Submission error: ${error.message}. Please try again or contact support.`);
      }
    } finally {
      isSubmitting = false;
    }
  }

  function safeFileName(filename) {
    if (!filename || typeof filename !== 'string') return 'file.pdf';

    filename = filename.trim();

    const lastDot = filename.lastIndexOf('.');
    let base, ext;
    if (lastDot > 0) {
      base = filename.slice(0, lastDot);
      ext = filename.slice(lastDot + 1).toLowerCase();
    } else {
      base = filename;
      ext = 'pdf';
    }

    base = base
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/^\.+|\.+$/g, '')
      .replace(/\.{2,}/g, '.');
    const maxBase = 180;
    if (base.length > maxBase) base = base.slice(0, maxBase);

    return `${base}.${ext}`;
  }

  async function generatePDF(results) {
    try {
      if (!window.html2pdf) {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
        );
      }

      const html2pdf = window.html2pdf;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        ">
          <h1 style="color: #530A7A; text-align: center; margin-bottom: 30px;">
            CVI Survey Results
          </h1>
          
          <div style="margin-bottom: 40px;">
            <h2 style="color: #530A7A; border-bottom: 1px solid #eee; padding-bottom: 5px;">
              Participant Information
            </h2>
            <p><strong>Name of Form User:</strong> ${results.participantName || 'N/A'}</p>
            <p><strong>Child Name:</strong> ${results.childName || 'N/A'}</p>
            <p><strong>Age Group:</strong> ${results.ageGroup}</p>
          </div>
          
          ${results.responses
            .map(
              (response) => `
            <div style="
              margin-bottom: 30px;
              page-break-inside: avoid;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
            ">
              <h3 style="color: #530A7A;">Question ${response.questionNum}</h3>
              <p style="font-weight: bold;">${response.questionText}</p>
              <p><strong>Response:</strong> ${response.answer}</p>
            ${
              response.subAnswer
                ? `
              <div style="margin-top: 10px; padding-left: 15px; border-left: 3px solid #530A7A;">
                <p><strong>Follow-up:</strong> ${response.subQuestionText}</p>
                <p><strong>Answer:</strong> ${getSubLabel(response)}</p>
              </div>
            `
                : ''
            }
            </div>
          `,
            )
            .join('')}
        </div>
      `;

      const blob = await html2pdf()
        .set({
          margin: 15,
          filename: safeFileName(
            `CVI-Inventory-Responses-${results.participantName}-${new Date().toISOString().slice(0, 10)}.pdf`,
          ),
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            logging: false,
            letterRendering: true,
            useCORS: true,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
        })
        .from(tempDiv)
        .outputPdf('blob');

      return await blobToBase64(blob);
    } catch (error) {
      console.error('PDF generation failed:', error);

      if (isIOS) {
        alert('PDF generation failed. Please try again or contact support.');
      }
      throw error;
    }
  }

  async function generateStrategiesDOCX(results) {
    try {
      if (!window.htmlDocx) {
        await loadScript('https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.min.js');
      }

      const strategies = ageGroup === '4-8' ? strategiesAtHome4_8 : strategiesAtHome9_12;
      const significantResponses = results.responses.filter((response) =>
        ['Sometimes', 'Often', 'Always'].includes(response.answer),
      );

      const strategySections = [];

      for (const response of significantResponses) {
        const questionText = response.questionText.replace(/\?$/, '').trim();
        let strategyKeys;

        if (
          (ageGroup === '4-8' && response.questionNum === 34) ||
          (ageGroup === '9-12' && response.questionNum === 36)
        ) {
          strategyKeys = [response.questionNum.toString()];

          if (response.subAnswer) {
            const optionNum = response.subAnswer.replace('Option', '').trim();
            if (optionNum === '1') strategyKeys.push(`${response.questionNum}1`);
            else if (optionNum === '2') strategyKeys.push(`${response.questionNum}2`);
            else if (optionNum === '3')
              strategyKeys.push(`${response.questionNum}1`, `${response.questionNum}2`);
          }
        } else {
          strategyKeys = [response.questionNum.toString()];
        }

        for (const key of strategyKeys) {
          const strategiesForKey = strategies.filter((s) => s.questionNum.toString() === key);

          if (strategiesForKey.length > 0) {
            let customHeadingText = '';

            if (key === '341') customHeadingText = '34a. Boundaries that are new to them';
            else if (key === '342')
              customHeadingText = '34b. Boundaries that are well known to them';
            else if (key === '361') customHeadingText = '36a. Boundaries that are new to them';
            else if (key === '362')
              customHeadingText = '36b. Boundaries that are well known to them';
            else customHeadingText = `${key}. ${questionText}`;

            const items = strategiesForKey.map((s) => `<li>${s.strategyText}</li>`).join('');

            strategySections.push(`
              <div>
                <h3>${customHeadingText}</h3>
                <ul>${items}</ul>
              </div>
            `);
          }
        }
      }

      const htmlString = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { color: #530A7A; text-align: center; }
              h3 { margin-top: 1.2em; color: #333; }
              ul { margin: 0; padding-left: 1.2em; }
              li { margin-bottom: 0.4em; }
            </style>
          </head>
          <body>
            <h1>CVI Strategies at Home</h1>
            <p><strong>Age Group:</strong> ${results.ageGroup}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${strategySections.join('')}
          </body>
        </html>
      `;
      const converted = window.htmlDocx.asBlob(htmlString);
      return await blobToBase64(converted);
    } catch (error) {
      console.error('DOCX generation failed:', error);
      throw error;
    }
  }

  async function generateSchoolStrategiesDOCX(results) {
    try {
      if (!window.htmlDocx) {
        await loadScript('https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.min.js');
      }

      const strategies = ageGroup === '4-8' ? strategiesAtSchool4_8 : strategiesAtSchool9_12;
      const significantResponses = results.responses.filter((response) =>
        ['Sometimes', 'Often', 'Always'].includes(response.answer),
      );

      const strategySections = [];

      for (const response of significantResponses) {
        const questionText = response.questionText.replace(/\?$/, '').trim();
        let strategyKeys;

        if (
          (ageGroup === '4-8' && response.questionNum === 34) ||
          (ageGroup === '9-12' && response.questionNum === 36)
        ) {
          strategyKeys = [response.questionNum.toString()];

          if (response.subAnswer) {
            const optionNum = response.subAnswer.replace('Option', '').trim();
            if (optionNum === '1') strategyKeys.push(`${response.questionNum}1`);
            else if (optionNum === '2') strategyKeys.push(`${response.questionNum}2`);
            else if (optionNum === '3')
              strategyKeys.push(`${response.questionNum}1`, `${response.questionNum}2`);
          }
        } else {
          strategyKeys = [response.questionNum.toString()];
        }

        for (const key of strategyKeys) {
          const strategiesForKey = strategies.filter((s) => s.questionNum.toString() === key);

          if (strategiesForKey.length > 0) {
            let customHeadingText = '';

            if (key === '341') customHeadingText = '34a. Boundaries that are new to them';
            else if (key === '342')
              customHeadingText = '34b. Boundaries that are well known to them';
            else if (key === '361') customHeadingText = '36a. Boundaries that are new to them';
            else if (key === '362')
              customHeadingText = '36b. Boundaries that are well known to them';
            else customHeadingText = `${key}. ${questionText}`;

            const items = strategiesForKey.map((s) => `<li>${s.strategyText}</li>`).join('');

            strategySections.push(`
              <div>
                <h3>${customHeadingText}</h3>
                <ul>${items}</ul>
              </div>
            `);
          }
        }
      }

      const htmlString = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { color: #530A7A; text-align: center; }
              h3 { margin-top: 1.2em; color: #333; }
              ul { margin: 0; padding-left: 1.2em; }
              li { margin-bottom: 0.4em; }
            </style>
          </head>
          <body>
            <h1>CVI Strategies at School</h1>
            <p><strong>Age Group:</strong> ${results.ageGroup}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${strategySections.join('')}
          </body>
        </html>
      `;
      const converted = window.htmlDocx.asBlob(htmlString);
      return await blobToBase64(converted);
    } catch (error) {
      console.error('School DOCX generation failed:', error);
      throw error;
    }
  }

  $: isForward = currentPage > previousPage;
</script>

<main class="survey">
  {#if isSubmitting}
    <Loader />
  {:else if surveyCompleted}
    <div class="thank-you">
      <h1 class="survey__title">Thank You!</h1>
      <p>Your responses have been recorded.</p>
    </div>
  {:else}
    {#if currentPage === 0}
      <img
        style="width: 20%"
        src="/SE-Logo-PurpleTransparent.png"
        alt="Special Eyes Vision Services Logo"
      />
      <h1 style="color: #530A7A" class="survey__title">
        Special Eyes Vision Services CVI Inventory Form
      </h1>
      <div>
        <div style="display: inline-block; margin: 1rem 0;">
          <label for="nameInput" style="display: block; font-weight: bold; margin-bottom: 0.5rem;">
            Your Name
          </label>
          <UserNameBox bind:value={participantName} />
        </div>

        <div style="display: inline-block; margin: 1rem 0;">
          <label for="nameInput2" style="display: block; font-weight: bold; margin-bottom: 0.5rem;">
            Name of Child
          </label>
          <UserNameBox bind:value={childName} />
        </div>
      </div>

      <div class="survey__question">Is your child:</div>
      <div style="display: flex; gap: 2rem; justify-content: center; margin: 2rem 0;">
        <RadioButton label="4-8 Years Old" value="4-8" bind:group={ageGroup} />
        <RadioButton label="9-12 Years Old" value="9-12" bind:group={ageGroup} />
      </div>
      <ContinueButton
        on:click={() => selectAge(ageGroup)}
        disabled={!ageGroup || participantName.trim() === '' || childName.trim() === ''}
      >
        Next
      </ContinueButton>
    {/if}

    {#if ageGroup && currentPage > 0}
      <header class="survey__header">
        <span class="survey__header-title" style="margin-bottom: 9px"
          >Special Eyes Vision Services CVI Inventory Form</span
        >
        <div class="survey__progress-bar-container">
          <div
            class="survey__progress-bar"
            style="width: {Math.round((currentPage / questions.length) * 100)}%"
          ></div>
        </div>
      </header>
    {/if}

    {#if ageGroup && currentPage > 0}
      <div class="survey__viewport">
        {#key currentPage}
          <div
            class="survey__page"
            in:fly={{ x: isForward ? 400 : -400, duration: 400 }}
            out:fly={{ x: isForward ? -400 : 400, duration: 400 }}
          >
            {#if currentPage > 0 && currentPage <= questions.length}
              <h2 class="survey__subtitle">Question {questions[currentPage - 1].questionNum}</h2>
              {#if questions[currentPage - 1].DYC === 'TRUE'}
                <div class="survey__question-lead" style="color: #000;">Does your child...</div>
              {/if}
              <p class="survey__question">{questions[currentPage - 1].questionText}</p>
              <LikertScale class="survey__scale" bind:value={answers[currentPage - 1].value} />

              {#if questions[currentPage - 1].subQuestion === 'TRUE' && answers[currentPage - 1].value && answers[currentPage - 1].value !== 'Never' && answers[currentPage - 1].value !== 'Not Applicable'}
                <div in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                  <div
                    class="survey__subquestion"
                    in:slide={{ duration: 300 }}
                    out:slide={{ duration: 300 }}
                  >
                    <p>{questions[currentPage - 1].subQuestionText}</p>
                    <div class="radio-options">
                      {#each questions[currentPage - 1].subQuestionOptText.split('/') as opt, i}
                        <div class="radio-option">
                          <input
                            type="radio"
                            id="opt-{currentPage - 1}-{i}"
                            name="subquestion-{currentPage - 1}"
                            value="Option {i + 1}"
                            checked={answers[currentPage - 1].subValue === `Option ${i + 1}`}
                            on:change={() => handleSubChange(currentPage - 1, `Option ${i + 1}`)}
                          />
                          <label for="opt-{currentPage - 1}-{i}">{opt}</label>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/if}

              <div class="survey__navigation">
                {#if currentPage > 1}
                  <BackButton on:click={prevPage}>Back</BackButton>
                {/if}
                <ContinueButton
                  on:click={nextPage}
                  disabled={!answers[currentPage - 1].value ||
                    (questions[currentPage - 1].subQuestion === 'TRUE' &&
                      answers[currentPage - 1].value !== 'Never' &&
                      answers[currentPage - 1].value !== 'Not Applicable' &&
                      !answers[currentPage - 1].subValue)}
                >
                  Next
                </ContinueButton>
              </div>
            {:else}
              <h2 class="survey__subtitle">Submit</h2>
              <ContinueButton on:click={handleDynamicSubmit}>Submit</ContinueButton>
            {/if}
          </div>
        {/key}
      </div>
    {/if}
  {/if}
  {#if showRecaptchaV2}
    <div id="recaptcha-v2" style="margin: 2rem auto;">
      <div
        class="g-recaptcha"
        data-sitekey="6LdREH8rAAAAANVJX3q3hClHuvxs_kyaVOmMRtTI"
        data-callback="onRecaptchaV2Success"
      ></div>
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
    background: #530a7a;
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
    font-size: 1.2rem;
    padding: 0 1rem;
  }

  .survey__subquestion {
    margin-top: 1rem;
    text-align: left;
    width: 100%;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 1rem;
  }

  .radio-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .radio-option input[type='radio'] {
    margin: 0;
    width: 1.2rem;
    height: 1.2rem;
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

  .thank-you {
    text-align: center;
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .download-notice {
    font-size: 1rem;
    color: #333;
    margin: 1.5rem 0;
  }

  .report-list {
    text-align: left;
    max-width: 300px;
    margin: 1rem auto;
    padding-left: 1.5rem;
  }

  .report-list li {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
</style>
