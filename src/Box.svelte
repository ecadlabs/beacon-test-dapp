<script lang="ts">
  import { fly } from "svelte/transition";

  export let test, index;

  let executionTime = 0;
  let loading = false;
  let success: boolean | undefined;
  let opHash = "";

  const runTest = async () => {
    loading = true;
    executionTime = 0;
    opHash = "";
    const t1 = performance.now();
    try {
      const result = await test.run();
      if (result && result.success === true) {
        const t2 = performance.now();
        executionTime = t2 - t1;
        success = true;
        opHash = result.opHash;
      } else {
        throw "Error";
      }
    } catch (error) {
      console.log(error);
      success = false;
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
</style>

<div
  class={`box test ${
    success !== undefined ? (success ? "success" : "error") : ""
  }`}
  id={`test-${test.id}`}
  in:fly={{ x: -1000, duration: 1000, delay: +index * 400 }}
>
  <h3>Test {index + 1}: <br /> {test.name}</h3>
  <p id="test-description">{test.description}</p>
  {#if executionTime && test.showExecutionTime}
    <p>
      Execution time: {Math.round(executionTime).toLocaleString("en-US")} ms
    </p>
  {/if}
  {#if opHash}
    <p>
      <a
        href={`https://better-call.dev/delphinet/opg/${opHash}/contents`}
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
