<script lang="ts">
  import Sidebar from "$lib/Sidebar.svelte";
  import TaquitoLogo from "$lib/TaquitoLogo.svelte";
  import "../styles/index.scss";
</script>

<main>
  <Sidebar />
  <slot />
</main>
<TaquitoLogo />
