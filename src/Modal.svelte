<script lang="ts">
  import { fade, fly } from "svelte/transition";

  export let close;
</script>

<style lang="scss">
  .modal-wrapper {
    position: fixed;
    top: 0px;
    left: 0px;
    height: 100vh;
    width: 100vw;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;

    .modal {
      width: 40%;
      height: 40%;
      background-color: white;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      word-break: break-word;
    }
  }

  :global([slot="body"]) {
    width: 90%;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 30% 70%;
    gap: 15px;
  }
</style>

<div class="modal-wrapper" on:click={close} transition:fade={{ duration: 300 }}>
  <div class="modal" transition:fly={{ duration: 500, y: 200 }}>
    <h3><slot name="title">Unnamed modal</slot></h3>
    <slot name="body">Aren't you missing something? :)</slot>
    <div />
  </div>
</div>
