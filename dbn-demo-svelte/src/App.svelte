<script lang="ts">
import '@databrainhq/plugin/web';
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const dashboardId = urlParams.get('dashboardId');

/* If you want to customize action buttons on embed
const dbnDashboard = document.querySelector('dbn-dashboard')?.shadowRoot?.querySelector('.dbn-dashboard') as HTMLElement & {
      onClickCreateMetric?: () => void;
      onClickManageMetrics?: () => void;
      onClickScheduleReports?: () => void;
      onClickCustomizeLayout?: () => void;
    };
function createMetric() {
  dbnDashboardElement?.onClickCreateMetric?.();
}
const dashboardOptions = {
  showDashboardActions: false,
}; */
</script>

<main>
  <dbn-dashboard
    token={token}
    dashboard-id={dashboardId}
    <!-- When you want to hide the dashboard actions and add your own buttons -->
    options={dashboardOptions} 
  />
  <!-- Example of adding your own buttons with embed actions -->
  <button on:click={createMetric}>Create Metric</button>
</main>

<style>
</style>
