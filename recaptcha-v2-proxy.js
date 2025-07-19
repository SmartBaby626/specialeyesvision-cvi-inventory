const script = document.createElement('script');
script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaV2LoadCallback&render=explicit';
script.async = true;
script.defer = true;
document.head.appendChild(script);