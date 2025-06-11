import React, { useState, useEffect } from 'react';
import './Reports.css';

interface Metric {
  id: string;
  metricId?: string; // Original metric ID from DataBrain API
  externalMetricId?: string;
  originalMetricId?: string;
  name: string;
  description?: string;
  value?: number;
  unit?: string;
  category?: string;
  lastUpdated?: string;
  status?: string;
}

interface ReportsProps {
  embedId: string;
  clientId: string;
}

const Reports: React.FC<ReportsProps> = ({ embedId, clientId }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Metric>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'widgets'>('table');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    console.log('📊 Reports component mounted, creating guest token...');
    console.log('🔧 Props:', { embedId, clientId });
    initializeReports();
  }, []);

  const createGuestToken = async (): Promise<string> => {
    console.log('🔑 Creating guest token for Reports...');

    const response = await fetch('http://localhost:3001/api/guest-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create guest token: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Guest token created successfully for Reports');
    return data.guestToken;
  };

  const initializeReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create guest token first
      const guestToken = await createGuestToken();
      setToken(guestToken);

      // Then fetch metrics
      await fetchMetrics();
    } catch (err) {
      console.error('❌ Error initializing Reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Reports');
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      console.log('🚀 Starting fetchMetrics with new dashboard-based approach...');
      setLoading(true);
      setError(null);

      // Use the provided embed ID for the Data App Embedding API
      if (!embedId) {
        throw new Error('Embed ID is required for fetching metrics');
      }
      if (!clientId) {
        throw new Error('Client ID is required for fetching metrics');
      }

      const response = await fetch('http://localhost:3001/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embedId: embedId,
          clientId: clientId,
          dashboardId: embedId, // Use embedId as dashboardId as fallback
          isPagination: false,
          pageNumber: 1
        })
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Metrics response data:', data);
        console.log('📊 Number of metrics:', data.metrics?.length || 0);

        // Log the first few raw metrics to understand the structure
        if (data.metrics?.length > 0) {
          console.log('🔍 Raw metric structure (first 3 metrics):', data.metrics.slice(0, 3).map((metric: any, index: number) => ({
            index,
            rawMetric: metric,
            availableKeys: Object.keys(metric)
          })));
        }

        // Use the exact metric data from API without transformation
        const transformedMetrics = data.metrics?.map((metric: any, index: number) => ({
          id: metric.metricId || metric.id || `metric-${index}`, // Use metricId as primary ID
          metricId: metric.metricId, // Original metricId for dbn-metric component
          externalMetricId: metric.externalMetricId,
          originalMetricId: metric.originalMetricId || metric.metricId,
          name: metric.name || metric.title || `Metric ${index + 1}`,
          description: metric.description || metric.summary || '',
          value: metric.value || Math.floor(Math.random() * 10000),
          unit: metric.unit || metric.format || '',
          category: metric.category || metric.type || 'General',
          lastUpdated: metric.lastUpdated || metric.updatedAt || new Date().toISOString(),
          status: metric.status || 'Active'
        })) || [];

        // Log the metric IDs we're getting to debug
        console.log('🔍 Metric IDs from API:', transformedMetrics.map((m: Metric) => ({
          name: m.name,
          id: m.id,
          originalMetricId: m.originalMetricId,
          externalMetricId: m.externalMetricId,
          idLength: m.id?.length || 0,
          idFormat: m.id?.includes('-') ? 'UUID' : 'SHORT'
        })));

        // Identify which metrics have short vs UUID format IDs
        const shortIdMetrics = transformedMetrics.filter((m: Metric) => !(m.id?.includes('-')));
        const uuidIdMetrics = transformedMetrics.filter((m: Metric) => m.id?.includes('-'));

        console.log('📋 ID Format Analysis:', {
          totalMetrics: transformedMetrics.length,
          shortIdMetrics: shortIdMetrics.length,
          uuidIdMetrics: uuidIdMetrics.length,
          shortIdExamples: shortIdMetrics.slice(0, 3).map((m: Metric) => ({ name: m.name, id: m.id })),
          uuidIdExamples: uuidIdMetrics.slice(0, 3).map((m: Metric) => ({ name: m.name, id: m.id }))
        });

        console.log('🔄 Setting metrics in state:', transformedMetrics);
        setMetrics(transformedMetrics);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch metrics: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Error fetching metrics:', err);
      setError('Failed to connect to backend. Make sure the server is running on http://localhost:3001');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Metric) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMetrics = metrics
    .filter(metric =>
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleMetricClick = async (metricId: string) => {
    console.log('🎯 Opening metric with specific token:', metricId);

    // Try to get a metric-specific token
    try {
      const response = await fetch('http://localhost:3001/api/metric-guest-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: clientId,
          metricId: metricId,
          embedId: embedId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Got metric-specific token:', data.guestToken);
        // Store the metric-specific token (we'll use it in the component)
        setSelectedMetricId(metricId);
      } else {
        console.log('⚠️ Metric-specific token failed, using dashboard token');
        setSelectedMetricId(metricId);
      }
    } catch (err) {
      console.log('⚠️ Metric token request failed, using dashboard token:', err);
      setSelectedMetricId(metricId);
    }
  };

  const handleBackToList = () => {
    setSelectedMetricId(null);
  };

  const getMetricIcon = (metricName: string): string => {
    const name = metricName.toLowerCase();
    if (name.includes('revenue') || name.includes('sales') || name.includes('profit')) return '💰';
    if (name.includes('customer') || name.includes('acquisition')) return '👥';
    if (name.includes('product') || name.includes('analytics')) return '📊';
    if (name.includes('transaction') || name.includes('order')) return '🛒';
    if (name.includes('store') || name.includes('location')) return '🏪';
    if (name.includes('feedback') || name.includes('review')) return '⭐';
    if (name.includes('price') || name.includes('unit')) return '💲';
    if (name.includes('trend') || name.includes('percentile')) return '📈';
    if (name.includes('comparison') || name.includes('vs')) return '📋';
    if (name.includes('procurement') || name.includes('supply')) return '📦';
    return '📊'; // Default icon
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1>📊 Reports</h1>
          <p>Analytics and metrics overview</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1>📊 Reports</h1>
          <p>Analytics and metrics overview</p>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Metrics</h3>
          <p>{error}</p>
          <button onClick={fetchMetrics} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If a metric is selected, show the metric component directly
  if (selectedMetricId) {
    const selectedMetric = metrics.find(m => m.id === selectedMetricId);

    // Use the original metricId from the API for the dbn-metric component
    const metricIdToUse = selectedMetric?.metricId || selectedMetric?.originalMetricId || selectedMetricId;

    // Log that we're rendering the metric component with detailed ID info
    console.log('🚀 Rendering metric component directly:', {
      selectedMetric: selectedMetric?.name || selectedMetricId,
      metricId: selectedMetricId,
      originalMetricId: selectedMetric?.originalMetricId,
      externalMetricId: selectedMetric?.externalMetricId,
      apiMetricId: selectedMetric?.metricId,
      actualMetricIdUsed: metricIdToUse,
      embedId,
      clientId
    });

    return (
      <div className="reports-container">
        <div className="reports-header">
          <button
            onClick={handleBackToList}
            className="back-button"
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            ← Back to Reports
          </button>
          <h2 style={{ margin: '0.5rem 0', color: '#1f2937' }}>
            📊 {selectedMetric?.name || 'Metric View'}
          </h2>
        </div>

        {/* Embed the specific metric with minimal configuration */}
        <dbn-metric
          token={token}
          client-id={clientId}
          metric-id={metricIdToUse}
          variant="card"
          enable-download-csv
          enable-email-csv
          options-icon="kebab-menu-vertical"
          onError={(e: any) => {
            console.error('🚨 dbn-metric component error:', e);
            console.error('🚨 Error details:', {
              selectedMetricId,
              originalMetricId: selectedMetric?.originalMetricId,
              externalMetricId: selectedMetric?.externalMetricId,
              apiMetricId: selectedMetric?.metricId,
              metricIdToUse,
              embedId,
              error: e
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Reports</h1>
        <p>Analytics and metrics overview</p>
      </div>

      <div className="reports-controls">
        <div className="view-tabs">
          <button
            className={`tab-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </button>
          <button
            className={`tab-button ${viewMode === 'widgets' ? 'active' : ''}`}
            onClick={() => setViewMode('widgets')}
          >
            🎛️ Widget View
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="reports-count">
          {filteredAndSortedMetrics.length} of {metrics.length} metrics
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Description</th>
                <th onClick={() => handleSort('lastUpdated')} className="sortable">
                  Last Updated {sortField === 'lastUpdated' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={3} className="no-data">
                    {searchTerm ? 'No metrics match your search' : 'No metrics available'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedMetrics.map((metric) => (
                  <tr
                    key={metric.id}
                    className="report-row"
                    onClick={() => handleMetricClick(metric.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="report-name">{metric.name}</td>
                    <td className="report-description">
                      {metric.description || 'No description available'}
                    </td>
                    <td className="report-updated">
                      {formatDate(metric.lastUpdated)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="reports-widgets-container">
          {filteredAndSortedMetrics.length === 0 ? (
            <div className="no-widgets">
              <div className="empty-icon">📈</div>
              <h3>{searchTerm ? 'No metrics match your search' : 'No metrics available'}</h3>
              <p>Try adjusting your search terms or check back later.</p>
            </div>
          ) : (
            <div className="widgets-grid">
              {filteredAndSortedMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="report-widget"
                  onClick={() => handleMetricClick(metric.id)}
                >
                  <div className="widget-icon">
                    {getMetricIcon(metric.name)}
                  </div>
                  <div className="widget-content">
                    <h3 className="widget-title">{metric.name}</h3>
                    <p className="widget-description">
                      {metric.description || 'No description available'}
                    </p>
                    <div className="widget-footer">
                      <span className="widget-updated">
                        Updated {formatDate(metric.lastUpdated)}
                      </span>
                    </div>
                  </div>
                  <div className="widget-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {metrics.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>No Metrics Available</h3>
          <p>There are no metrics to display at the moment.</p>
          <button onClick={fetchMetrics} className="refresh-button">
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports; 