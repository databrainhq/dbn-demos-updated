import React, { useState, useEffect } from 'react';
import '@databrainhq/plugin/web';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dbn-dashboard': any;
    }
  }
}

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dashboardId = 'dbn-demo';
  const clientId = '101';

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('🔄 Fetching token...');
        const response = await fetch('http://localhost:3001/api/dashboard-guest-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Token received:', data.guestToken?.substring(0, 20) + '...');
          setToken(data.guestToken);
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch token: ${errorData.error}`);
        }
      } catch (err) {
        setError('Failed to connect to backend');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading DataBrain Dashboard...</h2>
        <div>Fetching authentication token...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>No Token</h2>
        <p>Failed to get authentication token</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>DataBrain Dashboard Test</h1>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>Debug Info:</strong><br />
        Token: {token.substring(0, 20)}...<br />
        Dashboard ID: {dashboardId}<br />
        Client ID: {clientId}
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', minHeight: '400px' }}>
        <h3>DataBrain Component:</h3>
        <dbn-dashboard
          token={token}
          dashboard-id={dashboardId}
        />
      </div>
    </div>
  );
}

export default App;
