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
  
  // if you want to disable the actions provided by 
  // embed and add your own buttons to perform those actions
  // you can add like how we did for create metric below

  // const dbnDashboard = document.querySelector(
  //   'dbn-dashboard'
  // )?.shadowRoot?.querySelector('.dbn-dashboard') as HTMLElement & {
  //   onClickCreateMetric?: () => void;
  //   onClickManageMetrics?: () => void;
  //   onClickScheduleReports?: () => void;
  //   onClickCustomizeLayout?: () => void;
  // };

  // return (
  //   <div>
  //     <button type="button" onClick={() => dbnDashboard?.onClickCreateMetric?.()}>
  //       Create Metric
  //     </button>
  //     <dbn-dashboard token={token} dashboard-id={dashboardId} options={JSON.stringify({ showDashboardActions: false })} />
  //   </div>
  // );

  return <dbn-dashboard token={token} dashboard-id={dashboardId} />;
};

export default App;
