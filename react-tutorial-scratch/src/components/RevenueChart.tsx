import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardData';

export function RevenueChart() {
  const { data, isLoading } = useDashboardMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] animate-pulse rounded bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
