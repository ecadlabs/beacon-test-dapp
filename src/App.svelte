<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
  import { TezosToolkit } from "@taquito/taquito";
  import type {
    ContractAbstraction,
    Wallet,
    ContractProvider
  } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import {
    NetworkType,
    BeaconEvent,
    defaultEventCallbacks
  } from "@airgap/beacon-sdk";
  import {
    LedgerSigner,
    DerivationType,
    HDPathTemplate
  } from "@taquito/ledger-signer";
  import TransportU2F from "@ledgerhq/hw-transport-u2f";
  import Box from "./Box.svelte";
  import initializeTests from "./tests";
  import type { TestSettings } from "./types";
  import Modal from "./Modal.svelte";

  // https://ide.ligolang.org/p/LdCqNZ-G6rcKYkrbtmmD2A
  // https://better-call.dev/florencenet/KT1PzUGbdKaN332Smfd1ExpdKQ7BSzzJRqJ4/operations

  let tests: TestSettings[] = [];
  let Tezos: TezosToolkit;
  let wallet: BeaconWallet | undefined;
  let userAddress: string;
  const contractAddress = "KT1PzUGbdKaN332Smfd1ExpdKQ7BSzzJRqJ4";
  let contract:
    | ContractAbstraction<Wallet>
    | ContractAbstraction<ContractProvider>;
  let defaultMatrixNode = "matrix.papers.tech";
  let connectedNetwork: "testnet" | "mainnet" | "custom" = "testnet";
  let rpcUrl = {
    testnet: "https://api.tez.ie/rpc/florencenet", //"https://florencenet-tezos.giganode.io",
    mainnet: "https://api.tez.ie/rpc/mainnet", //"https://mainnet-tezos.giganode.io"
    custom: ""
  };
  let initialLoading = true;
  let openModal = false;
  let modalData: { title: string; body: string[] } = {
    title: "",
    body: []
  };
  let openCustomNetwork = false;
  let customNetwork = connectedNetwork;
  let openCustomMatrixNode = false;
  let customMatrixNode = defaultMatrixNode;

  const initBeacon = async () => {
    let networkType: NetworkType;
    if (connectedNetwork === "testnet") {
      networkType = NetworkType.FLORENCENET;
    } else if (connectedNetwork === "mainnet") {
      networkType = NetworkType.MAINNET;
    } else if (connectedNetwork === "custom") {
      networkType = NetworkType.CUSTOM;
    }

    console.log(connectedNetwork, networkType, defaultMatrixNode);

    if (!wallet) {
      // instantiates the wallet
      wallet = new BeaconWallet({
        name: "Beacon Test Dapp",
        matrixNodes: [defaultMatrixNode] as any,
        preferredNetwork: networkType,
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
      Tezos.setWalletProvider(wallet);
    }

    await wallet.requestPermissions({
      network: {
        type: networkType,
        rpcUrl: rpcUrl[connectedNetwork]
      }
    });
    userAddress = await wallet.getPKH();
    // instantiates contract
    contract = await Tezos.wallet.at(contractAddress);
    tests = initializeTests(Tezos, contract, wallet);
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.client.destroy();
      wallet = undefined;
      userAddress = undefined;
    }
  };

  const connectNano = async () => {
    const transport = await TransportU2F.create();
    const ledgerSigner = new LedgerSigner(
      transport, //required
      HDPathTemplate(0), // path optional (equivalent to "44'/1729'/1'/0'")
      true, // prompt optional
      DerivationType.ED25519 // derivationType optional
    );
    Tezos.setProvider({ signer: ledgerSigner });
    //Get the public key and the public key hash from the Ledger
    const publicKeyHash = await Tezos.signer.publicKeyHash();
    if (publicKeyHash) {
      userAddress = publicKeyHash;
      // instantiates contract
      contract = await Tezos.contract.at(contractAddress);
      tests = initializeTests(Tezos, contract, wallet);
    }
  };

  const changeNetwork = event => {
    switch (event.target.value) {
      case "mainnet":
        openCustomNetwork = false;
        connectedNetwork = "mainnet";
        Tezos = new TezosToolkit(rpcUrl.mainnet);
        break;
      case "testnet":
        openCustomNetwork = false;
        connectedNetwork = "testnet";
        Tezos = new TezosToolkit(rpcUrl.testnet);
        break;
      case "custom":
        openCustomMatrixNode = false;
        openCustomNetwork = true;
        break;
    }
  };

  const changeMatrixNode = event => {
    switch (event.target.value) {
      case "default":
        openCustomMatrixNode = false;
        defaultMatrixNode === "matrix.papers.tech";
        break;
      case "taquito":
        openCustomMatrixNode = false;
        defaultMatrixNode === "matrix.tez.ie";
        break;
      case "custom":
        openCustomNetwork = false;
        openCustomMatrixNode = true;
        defaultMatrixNode === "matrix.papers.tech";
        if (!rpcUrl.custom) {
          // in case the user did not provide any custom network URL
          connectedNetwork = "testnet";
          Tezos = new TezosToolkit(rpcUrl.testnet);
        }
        break;
    }
  };

  onMount(async () => {
    Tezos = new TezosToolkit(rpcUrl[connectedNetwork]);
    initialLoading = false;
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
    z-index: 800;

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
        <button
          class="blue"
          on:click={() => {
            if (wallet) {
              disconnectWallet();
            } else {
              userAddress = "";
            }
          }}>Disconnect</button
        >
      </div>
    </div>
  </header>
{/if}
<main
  style={userAddress
    ? "place-items:center start;padding-top:120px;margin-top:120px;"
    : "place-items:center"}
>
  {#if initialLoading}
    <div class="box connect">Loading</div>
  {:else}
    <!--User is logged in-->
    {#if userAddress}
      <div class="testboxes">
        {#each tests as test, index}
          <Box
            {test}
            {index}
            network={connectedNetwork}
            on:open-modal={e => {
              modalData = { ...e.detail };
              openModal = true;
            }}
          />
        {/each}
      </div>
    {:else}
      <div class="box connect">
        <div>Welcome to the <br /> Beacon Test Dapp</div>
        <br />
        <button class="blue main" on:click={initBeacon}>
          <i class="fas fa-wallet" />
          Connect your wallet
        </button>
        <br />
        <button class="blue secondary" on:click={connectNano}>
          <i class="fab fa-usb" />
          Connect your Nano Ledger
        </button>
        <br />
        <br />
        <!--<div>
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
        </div>-->
        <div>
          <label>
            <span class="select-title">RPC node:</span>
            <select
              bind:value={connectedNetwork}
              on:change={changeNetwork}
              on:blur={changeNetwork}
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>
            <span class="select-title">Matrix node:</span>
            <select on:change={changeMatrixNode} on:blur={changeMatrixNode}>
              <option value="default">Default</option>
              <option value="taquito">Taquito</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
        <div>
          {#if openCustomNetwork}
            <div class="custom-input">
              <div>Enter your custom network URL:</div>
              <input type="text" bind:value={rpcUrl.custom} />
              <button class="blue" on:click={() => (openCustomNetwork = false)}
                >Add</button
              >
            </div>
          {/if}
          {#if openCustomMatrixNode}
            <div class="custom-input">
              <div>Enter your custom Matrix node:</div>
              <input type="text" bind:value={defaultMatrixNode} />
              <button
                class="blue"
                on:click={() => (openCustomMatrixNode = false)}>Add</button
              >
            </div>
          {/if}
        </div>
        <!--<div>
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
              on:change={() => {
                Tezos = new TezosToolkit(rpcUrl.testnet);
              }}
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
              on:change={() => {
                Tezos = new TezosToolkit(rpcUrl.mainnet);
              }}
            />
            Mainnet
          </label>
        </div>-->
      </div>
    {/if}
  {/if}
</main>
<div id="taquito-version">
  Taquito version: <span>{Tezos ? Tezos.getVersionInfo().version : "N/A"}</span>
</div>
{#if openModal}
  <Modal close={() => (openModal = false)}>
    <div slot="title">{modalData.title}</div>
    <div slot="body">
      {#each modalData.body as item, index}
        <div>
          {#if index === 0}
            Input
          {:else if index === 1}
            Formatted input
          {:else if index === 2}
            Bytes
          {:else if index === 3}
            Signature
          {/if}
        </div>
        <div>{item}</div>
      {/each}
    </div>
  </Modal>
{/if}
