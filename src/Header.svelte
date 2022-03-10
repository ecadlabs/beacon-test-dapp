<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
  import store from "./store";

  export let delay: number, wallet;

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;
    width: 100%;
    background-color: white;
    z-index: 800;

    .title {
      font-size: 2rem;
      margin-left: 20px;
    }
  }
</style>

<header>
  <div class="title">Beacon Test Dapp</div>
  <div
    class="box address"
    in:fly={{
      x: -2000,
      duration: 2000,
      delay: delay * 200,
      easing: expoInOut
    }}
  >
    <div>
      Connected as {$store.userAddress.slice(0, 7)}...{$store.userAddress.slice(
        -7
      )}
    </div>
    <div>
      <button
        class="blue"
        on:click={() => {
          if (wallet) {
            dispatch("disconnect-wallet");
          } else {
            store.updateUserAddress("");
          }
        }}
      >
        Disconnect
      </button>
    </div>
  </div>
</header>
