<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
  import { TezosToolkit, ContractAbstraction, Wallet } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import Box from "./Box.svelte";
  import initializeTests from "./tests";

  // https://ide.ligolang.org/p/DHZ-nxgoWeVxLwgivpad-w
  // https://better-call.dev/delphinet/KT1EJGjahTifrVz8zWjJ6C4J2JBzvbZnYot4/storage

  let tests: {
    id: string;
    name: string;
    description: string;
    run: any;
    showExecutionTime: boolean;
  }[] = [];
  let Tezos: TezosToolkit;
  let wallet: BeaconWallet;
  let userAddress: string;
  const contractAddress = "KT1EJGjahTifrVz8zWjJ6C4J2JBzvbZnYot4";
  let contract: ContractAbstraction<Wallet>;
  let opHash: string = "";
  let defaultMatrixNode = "matrix.papers.tech";

  const initBeacon = async () => {
    wallet = new BeaconWallet({
      name: "Beacon Test Dapp",
      matrixNodes: [defaultMatrixNode] as any,
      eventHandlers: {
        ACTIVE_TRANSPORT_SET: {
          handler: async data => {
            // console.log("ACTIVE_TRANSPORT_SET:", data);
          }
        },
        ACTIVE_ACCOUNT_SET: {
          handler: async data => {
            // console.log("ACTIVE_ACCOUNT_SET:", data);
          }
        },
        PAIR_SUCCESS: {
          handler: async data => {
            // console.log("PAIR_SUCCESS:", data);
          }
        },
        PERMISSION_REQUEST_SENT: {
          handler: async data => {
            // console.log("permission request success:", data);
          }
        },
        PERMISSION_REQUEST_SUCCESS: {
          handler: async data => {
            // console.log("PERMISSION_REQUEST_SUCCESS:", data);
          }
        },
        OPERATION_REQUEST_SENT: {
          handler: async data => {
            // console.log("PERMISSION_REQUEST_SUCCESS:", data);
          }
        },
        OPERATION_REQUEST_SUCCESS: {
          handler: async data => {
            // console.log("OPERATION_REQUEST_SUCCESS:", data);
          }
        },
        OPERATION_REQUEST_ERROR: {
          handler: async data => {
            // console.log("BROADCAST_REQUEST_ERROR:", data);
          }
        },
        BROADCAST_REQUEST_ERROR: {
          handler: async data => {
            // console.log("BROADCAST_REQUEST_ERROR:", data);
          }
        }
      }
    });
    await wallet.requestPermissions({
      network: { type: NetworkType.DELPHINET }
    });
    Tezos.setWalletProvider(wallet);
    userAddress = await wallet.getPKH();
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.client.destroy();
      wallet = undefined;
      userAddress = undefined;
    }
  };

  onMount(async () => {
    Tezos = new TezosToolkit("https://testnet-tezos.giganode.io");
    // instantiates contract
    contract = await Tezos.wallet.at(contractAddress);
    tests = initializeTests(Tezos, contract);
  });
</script>

<style lang="scss">
  main {
    display: grid;
    height: 100%;
  }

  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 2rem;
  }

  .testboxes {
    width: 100%;
    max-height: 80%;
    padding: 0px 30px;
    overflow: auto;
  }
</style>

<main style={userAddress ? "place-items:center start;" : "place-items:center"}>
  {#if userAddress}
    <div class="title">Beacon Test Dapp</div>
    <div
      class="box address"
      in:fly={{
        x: -2000,
        duration: 2000,
        delay: (tests.length + 1) * 400,
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
