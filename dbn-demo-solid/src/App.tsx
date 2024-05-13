import type { Component } from "solid-js";
import "@databrainhq/plugin/web";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

const App: Component = () => {
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get("token");
  const dashboardId = urlParams.get("dashboardId");
  return <dbn-dashboard token={token} dashboard-id={dashboardId} />;
};

export default App;
