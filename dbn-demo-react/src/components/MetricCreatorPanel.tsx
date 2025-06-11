import React, { useState } from 'react';
import './MetricCreatorPanel.css';

interface MetricCreatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metricConfig: any) => void;
}

const MetricCreatorPanel: React.FC<MetricCreatorPanelProps> = ({ isOpen, onClose, onSave }) => {
  const [metricName, setMetricName] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [chartType, setChartType] = useState('bar');
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Mock dataset fields (in real implementation, these would come from DataBrain)
  const availableFields = {
    dimensions: [
      { value: 'product_category', label: 'Product Category' },
      { value: 'customer_segment', label: 'Customer Segment' },
      { value: 'store_location', label: 'Store Location' },
      { value: 'order_date', label: 'Order Date' },
      { value: 'payment_method', label: 'Payment Method' }
    ],
    measures: [
      { value: 'total_sales', label: 'Total Sales' },
      { value: 'order_count', label: 'Order Count' },
      { value: 'avg_order_value', label: 'Average Order Value' },
      { value: 'profit_margin', label: 'Profit Margin' },
      { value: 'customer_count', label: 'Customer Count' }
    ]
  };

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'pie', label: 'Pie Chart', icon: '🥧' },
    { value: 'area', label: 'Area Chart', icon: '📉' },
    { value: 'scatter', label: 'Scatter', icon: '⚪' },
    { value: 'table', label: 'Table', icon: '📋' }
  ];

  const handleSave = () => {
    const metricConfig = {
      name: metricName,
      dimensions: selectedDimensions,
      measures: selectedMeasures,
      chartType,
      filters: filterField ? [{ field: filterField, operator: filterOperator, value: filterValue }] : [],
      sort: sortField ? { field: sortField, direction: sortDirection } : null
    };
    onSave(metricConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="metric-creator-overlay">
      <div className="metric-creator-panel">
        {/* Header */}
        <div className="panel-header">
          <h2 className="panel-title">Create New Metric</h2>
          <button className="panel-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="panel-body">
          {/* Metric Name */}
          <div className="panel-section">
            <label className="field-label">Metric Name</label>
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="Enter metric name..."
              className="metric-input"
            />
          </div>

          {/* Data Selection */}
          <div className="panel-section">
            <h3 className="section-title">Data Selection</h3>

            {/* Dimensions (Rows) */}
            <div className="field-group">
              <label className="field-label">Dimensions (Rows)</label>
              <select
                multiple
                value={selectedDimensions}
                onChange={(e) => setSelectedDimensions(Array.from(e.target.selectedOptions, option => option.value))}
                className="metric-select"
              >
                {availableFields.dimensions.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <small className="field-hint">Hold Ctrl/Cmd to select multiple</small>
            </div>

            {/* Measures (Columns) */}
            <div className="field-group">
              <label className="field-label">Measures (Columns)</label>
              <select
                multiple
                value={selectedMeasures}
                onChange={(e) => setSelectedMeasures(Array.from(e.target.selectedOptions, option => option.value))}
                className="metric-select"
              >
                {availableFields.measures.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <small className="field-hint">Hold Ctrl/Cmd to select multiple</small>
            </div>
          </div>

          {/* Chart Type */}
          <div className="panel-section">
            <h3 className="section-title">Chart Type</h3>
            <div className="chart-type-grid">
              {chartTypes.map(type => (
                <div
                  key={type.value}
                  className={`chart-type-option ${chartType === type.value ? 'selected' : ''}`}
                  onClick={() => setChartType(type.value)}
                >
                  <div className="chart-icon">{type.icon}</div>
                  <div className="chart-label">{type.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="panel-section">
            <h3 className="section-title">Filters</h3>
            <div className="filter-group">
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="metric-select small"
              >
                <option value="">Select field...</option>
                {[...availableFields.dimensions, ...availableFields.measures].map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <select
                value={filterOperator}
                onChange={(e) => setFilterOperator(e.target.value)}
                className="metric-select small"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Filter value..."
                className="metric-input small"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="panel-section">
            <h3 className="section-title">Sorting</h3>
            <div className="sort-group">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="metric-select"
              >
                <option value="">No sorting</option>
                {[...availableFields.dimensions, ...availableFields.measures].map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              {sortField && (
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                  className="metric-select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              )}
            </div>
          </div>

          {/* Chart Appearance */}
          <div className="panel-section">
            <h3 className="section-title">Chart Appearance</h3>
            <div className="appearance-options">
              <div className="appearance-row">
                <label className="field-label">Show Legend</label>
                <input type="checkbox" defaultChecked className="metric-checkbox" />
              </div>
              <div className="appearance-row">
                <label className="field-label">Show Data Labels</label>
                <input type="checkbox" className="metric-checkbox" />
              </div>
              <div className="appearance-row">
                <label className="field-label">Enable Animations</label>
                <input type="checkbox" defaultChecked className="metric-checkbox" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!metricName || selectedMeasures.length === 0}
          >
            Create Metric
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricCreatorPanel; 