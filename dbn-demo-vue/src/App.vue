<script setup lang="ts">
import "@databrainhq/plugin/web";
import { computed } from "vue";

const props = computed(() => {
  const url = new URL(location.href);
  const token = url.searchParams.get("token");
  const dashboardId = url.searchParams.get("dashboardId");
  const dbnDashboard = document.querySelector('dbn-dashboard')?.shadowRoot?.querySelector('.dbn-dashboard') as HTMLElement & {
        onClickCreateMetric?: () => void;
        onClickManageMetrics?: () => void;
        onClickScheduleReports?: () => void;
        onClickCustomizeLayout?: () => void;
      };
  const createMetric = () => {
    dbnDashboard?.onClickCreateMetric?.();
  };
  // hides dashboard actions, needs to be added when you want to customize buttons for dashboard actions
  const dashboardOptions = {
    showDashboardActions: false,
  };
  return { token, dashboardId, createMetric, dashboardOptions };
});
</script>

<template>
  <!-- Example of adding your own buttons with embed actions -->
  <button @click="props.createMetric">Create Metric</button>
  <dbn-dashboard :token="props.token" :dashboardId="props.dashboardId" :options="dashboardOptions" />
</template>

<style scoped></style>
