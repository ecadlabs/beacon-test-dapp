<script lang="ts">
  import { init, list } from "../tests";
  import store from "../store";
  import Wallet from "./Wallet.svelte";
</script>

<style lang="scss">
  section {
    padding: 10px;
    height: calc(100vh - 20px);
    color: white;
    display: grid;
    grid-template-rows: 5% 5% 90%;
    position: relative;
    z-index: 100;

    .title {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    h4 {
      text-align: center;
      padding: 0px;
      margin: 0px;
    }

    ul {
      height: 90%;
      list-style-image: url(description_white_24dp.svg);
      list-style-position: inside;
      overflow: auto;
      margin-left: 0px;
      margin-bottom: 50px;
      padding: 5px 5px;

      &::-webkit-scrollbar {
        display: none;
      }

      li {
        background: rgba(80, 227, 194, 0.25);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.18);

        padding: 10px;
        margin: 10px 0px;

        span {
          line-height: 30px;
          height: 30px;
          vertical-align: top;
        }
      }
    }
  }
</style>

<section>
  <Wallet />
  <div class="title">
    <h4>Available tests ({list.length})</h4>
  </div>
  <ul>
    {#each list as test}
      <li>
        <span>{test}</span>
      </li>
    {/each}
  </ul>
</section>
