<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import type { TestResult } from "./types";
  import LinkIcon from "./LinkIcon.svelte";

  export let test, index, network;

  let executionTime = 0;
  let loading = false;
  let success: boolean | undefined;
  let successOp = false;
  let opHash = "";
  let input = "";
  const dispatch = createEventDispatcher();

  const runTest = async () => {
    loading = true;
    executionTime = 0;
    opHash = "";
    const t1 = performance.now();
    try {
      let result: TestResult;
      if (test.id === "sign-payload" || test.id === "sign-payload-and-send") {
        result = await test.run(input);
      } else {
        result = await test.run();
      }
      if (result && result.success === true) {
        const t2 = performance.now();
        executionTime = t2 - t1;
        success = true;
        successOp = true;
        opHash = result.opHash;
        // special output for sign-payload
        if (test.id === "sign-payload" || test.id === "sign-payload-and-send") {
          dispatch("open-modal", {
            title: "Signing Result",
            body: [
              result.sigDetails.input,
              result.sigDetails.formattedInput,
              result.sigDetails.bytes,
              result.output
            ]
          });
        }
      } else {
        throw "Error";
      }
    } catch (error) {
      console.log(error);
      success = false;
      successOp = false;
    } finally {
      loading = false;
      setTimeout(() => (success = undefined), 4000);
    }
  };
</script>

<style lang="scss">
  h3 {
    margin: 0;
  }

  #test-execution {
    text-align: right;
  }

  .link-icon {
    position: absolute;
    top: 10px;
    right: 10px;

    a {
      cursor: pointer;
    }
  }
</style>

<div
  class={`box test ${
    success !== undefined ? (success ? "success" : "error") : ""
  }`}
  id={`test-${test.id}`}
  in:fly={{ x: -1000, duration: 1000, delay: +index * 200 }}
>
  <div class="link-icon">
    {#if opHash}
      <a
        href={`https://better-call.dev/${
          network === "testnet" ? "florencenet" : "mainnet"
        }/opg/${opHash}/contents`}
        target="_blank"
        rel="noreferrer noopener nofollow"
      >
        {#if successOp}
          <LinkIcon color="#10B981" />
        {:else}
          <LinkIcon color="#EF4444" />
        {/if}
      </a>
    {:else}
      <LinkIcon color="#e5e5e5" />
    {/if}
  </div>
  <h3>Test {index + 1}: <br /> {test.name}</h3>
  <p id="test-description">{test.description}</p>
  {#if test.inputRequired}
    <input type="text" placeholder="Input" bind:value={input} />
  {/if}
  {#if executionTime && test.showExecutionTime}
    <p>
      Execution time: {Math.round(executionTime).toLocaleString("en-US")} ms
    </p>
  {/if}
  {#if opHash}
    <p>
      <a
        href={test.id === "send-tez"
          ? `https://${network === "testnet" ? "florencenet." : ""}tzkt.io/${opHash}`
          : `https://better-call.dev/${
              network === "testnet" ? "florencenet/" : ""
            }opg/${opHash}/contents`}
        target="_blank"
        rel="noopener noreferrer nofollow">View operation</a
      >
    </p>
  {:else}
    <p>&nbsp;</p>
  {/if}
  <p id="test-execution">
    <button
      class={`button blue ${loading ? "loading" : ""}`}
      disabled={loading}
      on:click={runTest}
    >
      {#if loading}
        Running...
      {:else}
        Run
      {/if}
    </button>
  </p>
</div>
