import type { Plugin } from 'vite';

interface MockMetrics {
  totalRevenue: number;
  activeUsers: number;
  conversionRate: number;
  avgOrderValue: number;
  revenueByMonth: { month: string; revenue: number }[];
}

function generateMetrics(): MockMetrics {
  const now = Date.now();
  const jitter = Math.sin(now / 60_000) * 0.05;
  return {
    totalRevenue: Math.round(1_284_500 * (1 + jitter)),
    activeUsers: Math.round(12_450 * (1 + jitter)),
    conversionRate: Number((3.8 + jitter * 2).toFixed(2)),
    avgOrderValue: Number((78.42 * (1 + jitter)).toFixed(2)),
    revenueByMonth: [
      { month: 'Jan', revenue: 92000 },
      { month: 'Feb', revenue: 105000 },
      { month: 'Mar', revenue: 98500 },
      { month: 'Apr', revenue: 118200 },
      { month: 'May', revenue: 124800 },
      { month: 'Jun', revenue: 131500 },
      { month: 'Jul', revenue: 142300 },
      { month: 'Aug', revenue: 138900 },
      { month: 'Sep', revenue: 149100 },
      { month: 'Oct', revenue: 155400 },
      { month: 'Nov', revenue: 162800 },
      { month: 'Dec', revenue: 170500 },
    ],
  };
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/dashboard/metrics', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(generateMetrics()));
      });

      server.middlewares.use('/api/auth/login', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            user: {
              id: 'demo-user',
              email: 'demo@example.com',
              role: 'admin',
            },
            token: 'demo-jwt-token',
          }),
        );
      });
    },
  };
}
