<script lang="ts">
import '@databrainhq/plugin/web';
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const dashboardId = urlParams.get('dashboardId');
</script>

<main>
  <dbn-dashboard
    token={token}
    dashboard-id={dashboardId}
  />
</main>

<style>
</style>
