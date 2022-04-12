<script lang="ts">
  import { TezosToolkit } from "@taquito/taquito";
  import { NetworkType } from "@airgap/beacon-sdk";
  import { AvailableNetwork } from "../types";
  import { rpcUrl, defaultMatrixNode } from "../config";
  import store from "../store";

  let connectedNetwork = AvailableNetwork.ITHACANET;
  let matrixNode = defaultMatrixNode;

  const changeNetwork = event => {
    switch (event.target.value) {
      case "mainnet":
        connectedNetwork = AvailableNetwork.MAINNET;
        store.updateTezos(new TezosToolkit(rpcUrl.mainnet));
        store.updateNetworkType(NetworkType.MAINNET);
        break;
      case "hangzhounet":
        connectedNetwork = AvailableNetwork.HANGZHOUNET;
        store.updateTezos(new TezosToolkit(rpcUrl.hangzhounet));
        store.updateNetworkType(NetworkType.HANGZHOUNET);
        break;
      case "ithacanet":
        connectedNetwork = AvailableNetwork.ITHACANET;
        store.updateTezos(new TezosToolkit(rpcUrl.ithacanet));
        store.updateNetworkType(NetworkType.ITHACANET);
        break;
      case "custom":
        //TODO: input custom RPC URL
        store.updateNetworkType(NetworkType.CUSTOM);
        break;
    }
  };
  const changeMatrixNode = event => {
    switch (event.target.value) {
      case "default":
        store.updateMatrixNode("beacon-node-1.sky.papers.tech");
        break;
      case "taquito":
        store.updateMatrixNode("matrix.tez.ie");
        break;
      case "custom":
        store.updateMatrixNode("beacon-node-1.sky.papers.tech");
        if (!rpcUrl.custom) {
          // in case the user did not provide any custom network URL
          connectedNetwork = AvailableNetwork.ITHACANET;
          store.updateTezos(new TezosToolkit(rpcUrl.ithacanet));
        }
        break;
    }
  };
</script>

<style lang="scss">
  .connect-container {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;

    .connect-options {
      background: rgba(255, 255, 255, 0.25);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: white;
      padding: 20px 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .options {
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: center;
        width: 60%;

        & > * {
          margin: 10px 0px;
        }

        button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }

  .test-container {
    position: relative;
  }
</style>

{#if $store.userAddress}
  <div class="test-container">User connected</div>
{:else}
  <div class="connect-container">
    <div class="connect-options">
      <h1>Welcome to the Taquito test dapp</h1>
      <div class="options">
        <button
          on:click={() => {
            const wallet = document.getElementById("wallet-button");
            wallet.click();
          }}
        >
          <span class="material-icons-outlined"> account_balance_wallet </span>
          &nbsp; Connect your wallet
        </button>
        <button>
          <span class="material-icons-outlined"> usb </span>
          &nbsp; Connect your Nano ledger
        </button>
        <label for="rpc-node-select">
          <span class="select-title">RPC node:</span>
          <select
            id="rpc-node-select"
            bind:value={connectedNetwork}
            on:change={changeNetwork}
            on:blur={changeNetwork}
          >
            {#each Object.values(AvailableNetwork) as network}
              <option value={network} selected={connectedNetwork === network}>
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
        <label>
          <span class="select-title">Disable default events:</span>
          <input type="checkbox" bind:checked={$store.disableDefaultEvents} />
        </label>
      </div>
    </div>
  </div>
{/if}
