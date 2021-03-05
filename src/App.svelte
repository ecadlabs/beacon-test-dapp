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
  import type { TestSettings } from "./types";

  // https://ide.ligolang.org/p/sUGBs5AX6XEhtidBe4gaBQ
  // https://better-call.dev/delphinet/KT1FU9mCBABptYMCKRXzwbkEi1oey3z3TQwA/storage

  let tests: TestSettings[] = [];
  let Tezos: TezosToolkit;
  let wallet: BeaconWallet;
  let userAddress: string;
  const contractAddress = "KT19wM6rCppyBZCraQKfVz94PjbZxGkssa2N";
  let contract: ContractAbstraction<Wallet>;
  let defaultMatrixNode = "matrix.papers.tech";
  let connectedNetwork: "testnet" | "mainnet" = "testnet";
  let rpcUrl = {
    testnet: "https://api.tez.ie/rpc/edonet", //"https://edonet-tezos.giganode.io",
    mainnet: "https://api.tez.ie/rpc/mainnet" //"https://mainnet-tezos.giganode.io"
  };
  let taquitoVersion = {
    name: "8.0.6-beta-RC.0",
    link: "https://github.com/ecadlabs/taquito/tree/8.0.6-beta-RC.0"
  };

  const initBeacon = async () => {
    Tezos = new TezosToolkit(rpcUrl[connectedNetwork]);
    // instantiates contract
    contract = await Tezos.wallet.at(contractAddress);
    // instantiates the wallet
    wallet = new BeaconWallet({
      name: "Beacon Test Dapp",
      matrixNodes: [defaultMatrixNode] as any,
      preferredNetwork:
        connectedNetwork === "testnet"
          ? NetworkType.CUSTOM
          : NetworkType.MAINNET,
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
      network: {
        type:
          connectedNetwork === "testnet"
            ? NetworkType.CUSTOM
            : NetworkType.MAINNET,
        rpcUrl: rpcUrl[connectedNetwork]
      }
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

  onDestroy(async () => {
    disconnectWallet();
  });
</script>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;
    position: fixed;
    top: 0;
    left: 0;
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
    position: relative;
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
    ? "place-items:center start;padding-top:120px;margin-top:120px;"
    : "place-items:center"}
>
  {#if userAddress}
    <div class="testboxes">
      {#each tests as test, index}
        <Box {test} {index} network={connectedNetwork} />
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
      <div>
        <label
          for="select-testnet"
          class:selected={connectedNetwork === "testnet"}
        >
          <input
            type="radio"
            id="select-testnet"
            value="testnet"
            bind:group={connectedNetwork}
            checked={connectedNetwork === "testnet"}
          />
          Testnet
        </label>
        <label
          for="select-mainnet"
          class:selected={connectedNetwork === "mainnet"}
        >
          <input
            type="radio"
            id="select-mainnet"
            value="mainnet"
            bind:group={connectedNetwork}
            checked={connectedNetwork === "mainnet"}
          />
          Mainnet
        </label>
      </div>
    </div>
  {/if}
</main>
<div id="taquito-version">
  Taquito version:
  {#if taquitoVersion.link}
    <a
      href={taquitoVersion.link}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {taquitoVersion.name}
    </a>
  {:else}
    <span>{taquitoVersion.name}</span>
  {/if}
</div>
