<script setup lang="ts">
import "@databrainhq/plugin/web";
import { computed } from "vue";

const props = computed(() => {
  const url = new URL(location.href);
  const token = url.searchParams.get("token");
  const dashboardId = url.searchParams.get("dashboardId");
  return { token, dashboardId };
});
</script>

<template>
  <dbn-dashboard :token="props.token" :dashboardId="props.dashboardId" />
</template>

<style scoped></style>
