<script>
  export let value;
  export let group;
  export let label;
  export let id = `${label}-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="radio-button">
  <input
    class="radio-button__input"
    type="radio"
    id={id}
    value={value}
    bind:group={group}
  />
  <label for={id} class="radio-button__label">
    <span class="radio-button__custom"></span>
    {label}
  </label>
</div>

<style>
  .radio-button {
    display: inline-block;
    position: relative;
    cursor: pointer;
  }

  .radio-button__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-button__label {
    display: inline-block;
    padding-left: 30px;
    margin-bottom: 10px;
    position: relative;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .radio-button__custom {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #555;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .radio-button__input:checked + .radio-button__label .radio-button__custom {
    transform: translateY(-50%) scale(0.9);
    border: 5px solid #4c8bf5;
    color: #4c8bf5;
  }

  .radio-button__input:checked + .radio-button__label {
    color: #4c8bf5;
  }

  .radio-button__label:hover .radio-button__custom {
    transform: translateY(-50%) scale(1.2);
    border-color: #4c8bf5;
    box-shadow: 0 0 10px #4c8bf580;
  }
</style>
