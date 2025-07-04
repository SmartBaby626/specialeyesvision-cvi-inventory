<script>
  import { createEventDispatcher } from 'svelte';
  export let type = "button";
  export let disabled = false;
  export let label = "Back";
  const dispatch = createEventDispatcher();
</script>

<button
  type={type}
  disabled={disabled}
  on:click={(e) => dispatch('click', e)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 74 74"
    height="34"
    width="34"
    style="margin-right: 10px;"
  >
    <circle stroke-width="3" stroke="black" r="35.5" cy="37" cx="37"></circle>
    <path
      fill="black"
      d="M49 38.5C49.8284 38.5 50.5 37.8284 50.5 37C50.5 36.1716 49.8284 35.5 49 35.5V38.5ZM24.9393 35.9393C24.3536 36.5251 24.3536 37.4749 24.9393 38.0607L34.4853 47.6066C35.0711 48.1924 36.0208 48.1924 36.6066 47.6066C37.1924 47.0208 37.1924 46.0711 36.6066 45.4853L28.1213 37L36.6066 28.5147C37.1924 27.9289 37.1924 26.9792 36.6066 26.3934C36.0208 25.8076 35.0711 25.8076 34.4853 26.3934L24.9393 35.9393ZM49 35.5L26 35.5V38.5L49 38.5V35.5Z"
    ></path>
  </svg>
  <span><slot>{label}</slot></span>
</button>

<style>
  button {
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
    padding: 10px 20px;
    border-radius: 100px;
    background: #530A7A80;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    font-size: 15px;
  }

  button:hover {
    background: #530A7A;
    color: #fff;
  }

  button > svg {
    width: 34px;
    margin-right: 10px;
    transition: transform 0.3s ease-in-out;
  }

  button:hover svg {
    transform: translateX(-5px);
  }
  button:hover path {
    transform: translateX(-5px);
    fill: white;
  }
  button:hover circle {
    stroke: white;
  }

  button:active {
    transform: scale(0.95);
  }
</style>
