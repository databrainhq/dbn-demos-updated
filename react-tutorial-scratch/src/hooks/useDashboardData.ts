import { useQuery } from '@tanstack/react-query';

export interface DashboardMetrics {
  totalRevenue: number;
  activeUsers: number;
  conversionRate: number;
  avgOrderValue: number;
  revenueByMonth: { month: string; revenue: number }[];
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch('/api/dashboard/metrics');
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
