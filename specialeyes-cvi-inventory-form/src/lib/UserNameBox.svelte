<script>
  export let value = '';
</script>

<input
  type="text"
  name="text"
  class="input"
  placeholder="Enter full name"
  bind:value
/>

<style>
  .input {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
    font-weight: 500;
    font-size: clamp(14px, 4vw, 18px); 
    color: #530A7A;
    background-color: rgb(255,255,255);
    box-shadow: 0 0 .4vw rgba(0,0,0,0.5), 0 0 0 .15vw transparent;
    border-radius: 0.4vw;
    border: none;
    outline: none;
    padding: 0.4vw;
    max-width: 300px;
    transition: .4s;
    width: 100%;  
    box-sizing: border-box;
  }

  .input:hover {
    box-shadow: 0 0 0 .15vw #530A7A80;
  }

  .input:focus {
    box-shadow: 0 0 0 .15vw #530A7A;
  }
</style>
