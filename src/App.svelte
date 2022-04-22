<script lang="ts">
  import { onMount } from "svelte";
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
  import { TestSettings, AvailableNetwork } from "./types";
  import Modal from "./Modal.svelte";
  import store from "./store";
  import Header from "./Header.svelte";

  // https://ide.ligolang.org/p/RL93C86hftTTCNGU0ykLMw
  // https://better-call.dev/florencenet/KT1PzUGbdKaN332Smfd1ExpdKQ7BSzzJRqJ4/operations
  // https://better-call.dev/granadanet/KT1T836HqhBu9waqmknStVDCXu2WogZtzsNz/operations
  // https://better-call.dev/hangzhounet/KT1T2gL26SwYMxpkR5SZT1pHRBF84knfw8Cg/operations

  let tests: TestSettings[] = [];
  let Tezos: TezosToolkit;
  let wallet: BeaconWallet | undefined;
  let userAddress: string;
  const contractAddress = {
    mainnet: "KT1ShtH2zCrKMuWGRejEd6RAcnePwxBQeMAN",
    hangzhounet: "KT1T2gL26SwYMxpkR5SZT1pHRBF84knfw8Cg",
    ithacanet: "KT1QKmcNBcfzVTXG2kBcE6XqXtEuYYUzMcT5",
    custom: "KT1T2gL26SwYMxpkR5SZT1pHRBF84knfw8Cg"
  };
  let contract:
    | ContractAbstraction<Wallet>
    | ContractAbstraction<ContractProvider>;
  let defaultMatrixNode = "beacon-node-1.sky.papers.tech";
  let connectedNetwork = AvailableNetwork.ITHACANET;
  let rpcUrl = {
    hangzhounet: "https://hangzhounet.api.tez.ie", //"https://hangzhounet-tezos.giganode.io",
    ithacanet: "https://ithacanet.ecadinfra.com/",
    mainnet: "https://mainnet.api.tez.ie", //"https://mainnet-tezos.giganode.io"
    custom: "https://hangzhounet.api.tez.ie"
  };
  let initialLoading = true;
  let openModal = false;
  let modalData: { id: string; title: string; body: any[] } = {
    id: "",
    title: "",
    body: []
  };
  let openCustomNetwork = false;
  let customNetwork = connectedNetwork;
  let openCustomMatrixNode = false;
  let customMatrixNode = defaultMatrixNode;
  let disableDefaultEvents = true;
  let networkType: NetworkType;

  const createNewWallet = () => {
    return new BeaconWallet(
      disableDefaultEvents
        ? {
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
          }
        : {
            name: "Beacon Test Dapp",
            matrixNodes: [defaultMatrixNode] as any,
            preferredNetwork: networkType
          }
    );
  };

  const initBeacon = async () => {
    if (connectedNetwork === "hangzhounet") {
      networkType = NetworkType.HANGZHOUNET;
    } else if (connectedNetwork === "mainnet") {
      networkType = NetworkType.MAINNET;
    } else if (connectedNetwork === "custom") {
      networkType = NetworkType.CUSTOM;
    } else if (connectedNetwork === "ithacanet") {
      networkType = NetworkType.ITHACANET;
    }

    console.log(connectedNetwork, networkType, defaultMatrixNode);

    if (!wallet) {
      // instantiates the wallet
      wallet = createNewWallet();
      Tezos.setWalletProvider(wallet);
    }

    await wallet.requestPermissions({
      network: {
        type: networkType,
        rpcUrl: rpcUrl[connectedNetwork]
      }
    });
    userAddress = await wallet.getPKH();
    store.updateUserAddress(userAddress);
    // instantiates contract
    contract = await Tezos.wallet.at(contractAddress[connectedNetwork]);
    tests = initializeTests(Tezos, contract, wallet);
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.client.clearActiveAccount();
      wallet.client.removeAllAccounts();
      wallet.client.removeAllPeers();
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
      contract = await Tezos.contract.at(contractAddress[connectedNetwork]);
      tests = initializeTests(Tezos, contract, wallet);
    }
  };

  const changeNetwork = event => {
    switch (event.target.value) {
      case "mainnet":
        openCustomNetwork = false;
        connectedNetwork = AvailableNetwork.MAINNET;
        Tezos = new TezosToolkit(rpcUrl.mainnet);
        break;
      case "hangzhounet":
        openCustomNetwork = false;
        connectedNetwork = AvailableNetwork.HANGZHOUNET;
        Tezos = new TezosToolkit(rpcUrl.hangzhounet);
        break;
      case "ithacanet":
        openCustomNetwork = false;
        connectedNetwork = AvailableNetwork.ITHACANET;
        Tezos = new TezosToolkit(rpcUrl.ithacanet);
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
        defaultMatrixNode === "beacon-node-1.sky.papers.tech";
        break;
      case "taquito":
        openCustomMatrixNode = false;
        defaultMatrixNode === "matrix.tez.ie";
        break;
      case "custom":
        openCustomNetwork = false;
        openCustomMatrixNode = true;
        defaultMatrixNode === "beacon-node-1.sky.papers.tech";
        if (!rpcUrl.custom) {
          // in case the user did not provide any custom network URL
          connectedNetwork = AvailableNetwork.ITHACANET;
          Tezos = new TezosToolkit(rpcUrl.ithacanet);
        }
        break;
    }
  };

  onMount(async () => {
    // this creates a temporary instance of the wallet to clean up previous Beacon configuration
    wallet = createNewWallet();
    disconnectWallet();
    Tezos = new TezosToolkit(rpcUrl[connectedNetwork]);
    initialLoading = false;
  });
</script>

<style lang="scss">
  .container {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-rows: 10% 85% 5%;
  }

  main {
    &.disconnected {
      display: grid;
      height: 100%;
      width: 100%;
      z-index: 10;
      place-items: center;
    }

    &.connected {
      height: 100%;
      width: 100%;
      overflow: auto;
    }
  }

  .testboxes {
    width: calc(100% - 60px);
    padding: 30px;
    overflow: auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
  }

  footer {
    font-size: 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 10px;
  }
</style>

<div class="container">
  {#if userAddress}
    <Header
      delay={tests.length + 1}
      {wallet}
      on:disconnect-wallet={disconnectWallet}
    />
  {:else}
    <div />
  {/if}
  <main class:connected={userAddress} class:disconnected={!userAddress}>
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
          <div>
            <label>
              <span class="select-title">RPC node:</span>
              <select
                bind:value={connectedNetwork}
                on:change={changeNetwork}
                on:blur={changeNetwork}
              >
                {#each Object.values(AvailableNetwork) as network}
                  <option
                    value={network}
                    selected={connectedNetwork === network}
                  >
                    {network[0].toUpperCase() + network.slice(1)}
                  </option>
                {/each}
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
                <button
                  class="blue"
                  on:click={() => (openCustomNetwork = false)}>Add</button
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
          <div>
            <label>
              <span class="select-title">Disable default events:</span>
              <input type="checkbox" bind:checked={disableDefaultEvents} />
            </label>
          </div>
        </div>
      {/if}
    {/if}
  </main>
  <footer id="taquito-version">
    <div />
    <div>
      Taquito version: {Tezos ? Tezos.getVersionInfo().version : "N/A"}
    </div>
  </footer>
</div>
{#if openModal}
  <Modal close={() => (openModal = false)}>
    <div slot="title">{modalData.title}</div>
    <div slot="body">
      {#if modalData.id === "sign-payload" || modalData.id === "sign-payload-and-send" || modalData.id === "verify-signature"}
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
      {:else if modalData.id === "confirmation-observable"}
        {#each modalData.body as item}
          <div>Confirmation: {item.currentConfirmation}</div>
          <div>
            Level: {item.level}
          </div>
        {/each}
      {/if}
    </div>
  </Modal>
{/if}
