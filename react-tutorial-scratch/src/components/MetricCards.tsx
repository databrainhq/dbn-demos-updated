import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/useDashboardData';

export function MetricCards() {
  const { data, isLoading, error } = useDashboardMetrics();

  if (error) {
    return <div className="text-red-600">Failed to load metrics</div>;
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: data?.totalRevenue,
      format: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: 'Active Users',
      value: data?.activeUsers,
      format: (v: number) => v.toLocaleString(),
    },
    {
      title: 'Conversion Rate',
      value: data?.conversionRate,
      format: (v: number) => `${v}%`,
    },
    {
      title: 'Avg Order Value',
      value: data?.avgOrderValue,
      format: (v: number) => `$${v.toFixed(2)}`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">
                {metric.value !== undefined && metric.format(metric.value)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
