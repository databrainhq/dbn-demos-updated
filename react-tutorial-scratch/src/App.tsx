import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCards } from '@/components/MetricCards';
import { RevenueChart } from '@/components/RevenueChart';

function App() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MetricCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart />
          {/* Add more chart components here — see src/pages for a routed version. */}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;
