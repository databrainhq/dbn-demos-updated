"use client";
import '@databrainhq/plugin/web';

export default function Home() {
  const url = new URL(location.href);
  const token = url.searchParams.get("token");
  const dashboardId = url.searchParams.get("dashboardId");

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
  
  return (
    <main className="min-h-screen w-full p-2">
      <dbn-dashboard token={token} dashboard-id={dashboardId} />
    </main>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}
