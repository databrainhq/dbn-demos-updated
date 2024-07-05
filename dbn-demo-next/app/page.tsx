"use client";
import '@databrainhq/plugin/web';

export default function Home() {
  const url = new URL(location.href);
  const token = url.searchParams.get("token");
  const dashboardId = url.searchParams.get("dashboardId");
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
