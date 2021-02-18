<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
  import { TezosToolkit, ContractAbstraction, Wallet } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import {
    NetworkType,
    BeaconEvent,
    defaultEventCallbacks
  } from "@airgap/beacon-sdk";
  import Box from "./Box.svelte";
  import initializeTests from "./tests";
  import { TestSettings } from "./types";

  // https://ide.ligolang.org/p/sUGBs5AX6XEhtidBe4gaBQ
  // https://better-call.dev/delphinet/KT1FU9mCBABptYMCKRXzwbkEi1oey3z3TQwA/storage

  let tests: TestSettings[] = [];
  let Tezos: TezosToolkit;
  let wallet: BeaconWallet;
  let userAddress: string;
  const contractAddress = "KT19wM6rCppyBZCraQKfVz94PjbZxGkssa2N";
  let contract: ContractAbstraction<Wallet>;
  let defaultMatrixNode = "matrix.papers.tech";
  let rpcUrl = "https://edonet-tezos.giganode.io";

  const initBeacon = async () => {
    wallet = new BeaconWallet({
      name: "Beacon Test Dapp",
      matrixNodes: [defaultMatrixNode] as any,
      preferredNetwork: NetworkType.DELPHINET,
      disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
      eventHandlers: {
        // To keep the pairing alert, we have to add the following default event handlers back
        [BeaconEvent.PAIR_INIT]: {
          handler: defaultEventCallbacks.PAIR_INIT
        },
        [BeaconEvent.PAIR_SUCCESS]: {
          handler: defaultEventCallbacks.PAIR_SUCCESS
        }
      }
    });
    await wallet.requestPermissions({
      network: { type: NetworkType.CUSTOM, rpcUrl }
    });
    Tezos.setWalletProvider(wallet);
    userAddress = await wallet.getPKH();
    tests = initializeTests(Tezos, contract, wallet);
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.client.destroy();
      wallet = undefined;
      userAddress = undefined;
    }
  };

  onMount(async () => {
    Tezos = new TezosToolkit(rpcUrl);
    // instantiates contract
    contract = await Tezos.wallet.at(contractAddress);
  });

  onDestroy(async () => {
    await wallet.client.destroy();
  });
</script>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;
    position: fixed;
    width: 100%;
    background-color: white;
    z-index: 1000;

    .title {
      font-size: 2rem;
      margin-left: 20px;
    }
  }

  main {
    display: grid;
    height: 100%;
    z-index: 10;
  }

  .testboxes {
    width: calc(100% - 60px);
    padding: 30px;
    overflow: auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
  }
</style>

{#if userAddress}
  <header>
    <div class="title">Beacon Test Dapp</div>
    <div
      class="box address"
      in:fly={{
        x: -2000,
        duration: 2000,
        delay: (tests.length + 1) * 200,
        easing: expoInOut
      }}
    >
      <div>
        Connected as {userAddress.slice(0, 7)}...{userAddress.slice(-7)}
      </div>
      <div>
        <button class="blue" on:click={disconnectWallet}>Disconnect</button>
      </div>
    </div>
  </header>
{/if}
<main
  style={userAddress
    ? "place-items:center start;padding-top:120px;"
    : "place-items:center"}
>
  {#if userAddress}
    <div class="testboxes">
      {#each tests as test, index}
        <Box {test} {index} />
      {/each}
    </div>
  {:else}
    <div class="box connect">
      <div>Welcome to the <br /> Beacon Test Dapp</div>
      <br />
      <button class="blue" on:click={initBeacon}>
        <i class="fas fa-wallet" />
        Connect your wallet
      </button>
      <div>
        <label
          for="default-matrix-node"
          class:selected={defaultMatrixNode === "matrix.papers.tech"}
        >
          <input
            type="radio"
            id="default-matrix-node"
            value="matrix.papers.tech"
            bind:group={defaultMatrixNode}
            checked={defaultMatrixNode === "matrix.papers.tech"}
          />
          Default Matrix Node
        </label>
        <label
          for="taquito-matrix-node"
          class:selected={defaultMatrixNode === "matrix.tez.ie"}
        >
          <input
            type="radio"
            id="taquito-matrix-node"
            value="matrix.tez.ie"
            bind:group={defaultMatrixNode}
            checked={defaultMatrixNode === "matrix.tez.ie"}
          />
          Taquito Matrix Node
        </label>
      </div>
    </div>
  {/if}
</main>
