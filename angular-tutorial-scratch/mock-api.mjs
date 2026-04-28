import express from 'express';

// Mirror of react-tutorial-scratch/mock-api.ts.
// Angular's dev server has no first-party middleware story, so we run a tiny
// Express app on :5174 and proxy /api/* to it from `ng serve` via
// proxy.conf.json. Two processes, one `npm start`.

const app = express();
app.use(express.json());

function generateMetrics() {
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

app.get('/api/dashboard/metrics', (_req, res) => {
  res.json(generateMetrics());
});

app.post('/api/auth/login', (_req, res) => {
  res.json({
    user: { id: 'demo-user', email: 'demo@example.com', role: 'admin' },
    token: 'demo-jwt-token',
  });
});

const port = process.env.PORT ?? 5174;
app.listen(port, () => {
  console.log(`[mock-api] listening on http://localhost:${port}`);
});
