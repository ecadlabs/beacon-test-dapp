<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
  import {
    TezosToolkit,
    ContractAbstraction,
    Wallet,
    MichelsonMap
  } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import Box from "./Box.svelte";

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

  const initBeacon = async () => {
    wallet = new BeaconWallet({
      name: "Beacon Test Dapp",
      matrixNodes: ["matrix.tez.ie"] as any,
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

  const sendTez = async (): Promise<boolean> => {
    try {
      const op = await Tezos.wallet
        .transfer({ to: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", amount: 2 })
        .send();
      await op.confirmation();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const sendInt = async (): Promise<boolean> => {
    try {
      const op = await contract.methods.simple_param(5).send();
      await op.confirmation();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const sendComplexParam = async (): Promise<boolean> => {
    try {
      const op = await contract.methods.complex_param(5, "Taquito").send();
      await op.confirmation();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const callFail = async (): Promise<boolean> => {
    try {
      const op = await contract.methods.fail([["unit"]]).send();
      await op.confirmation();
      return false;
    } catch (error) {
      console.log(error);
      return true;
    }
  };

  const originateSuccess = async (): Promise<boolean> => {
    try {
      // fetches contract code
      const code = (
        await Tezos.wallet.at("KT1FQZEiij4Sz9wvzRUtyLYE9X92Jsd3BvWV")
      ).script.code;
      const storage = new MichelsonMap();
      const op = await Tezos.wallet.originate({ code, storage }).send();
      await op.confirmation();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  onMount(async () => {
    Tezos = new TezosToolkit("https://testnet-tezos.giganode.io");
    // instantiates contract
    contract = await Tezos.wallet.at(contractAddress);

    tests = [
      {
        id: "send-tez",
        name: "Send tez",
        description: "This test sends 2 tez to Alice's address",
        run: sendTez,
        showExecutionTime: false
      },
      {
        id: "contract-call-simple-type",
        name: "Contract call with int",
        description: "This test calls a contract entrypoint and passes an int",
        run: sendInt,
        showExecutionTime: false
      },
      {
        id: "contract-call-complex-type",
        name: "Contract call with (pair nat string)",
        description:
          "This test calls a contract entrypoint and passes a pair holding a nat and a string",
        run: sendComplexParam,
        showExecutionTime: false
      },
      {
        id: "contract-call-fail",
        name: "Contract call that fails",
        description:
          'This test calls a contract entrypoint that fails with the message "Fail entrypoint"',
        run: callFail,
        showExecutionTime: false
      },
      {
        id: "originate-success",
        name: "Originate smart contract with success",
        description: "This test successfully originates a smart contract",
        run: originateSuccess,
        showExecutionTime: false
      }
      /*{
        id: "originate-fail",
        name: "Originate smart contract that fails",
        description: "This test originates a smart contract that fails",
        run: () => console.log("originate-fail")
      }*/
    ];
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
    </div>
  {/if}
</main>
