import "@databrainhq/plugin/web";
import "./App.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

function App() {
  const url = new URL(location.href);
  const token = url.searchParams.get("token");
  const dashboardId = url.searchParams.get("dashboardId");
  return <dbn-dashboard token={token} dashboard-id={dashboardId} />;
}

export default App;
