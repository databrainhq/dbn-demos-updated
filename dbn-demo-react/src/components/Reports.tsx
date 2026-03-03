import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, BarChart3, TrendingUp } from "lucide-react";

interface Metric {
  id: string;
  metricId?: string;
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

  const fetchMetrics = useCallback(async () => {
    if (!embedId || !clientId) {
      setError('Missing embedId or clientId');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const response = await fetch('http://localhost:3002/api/v2/dashboard-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embedId: embedId,
          clientId: clientId
        })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.metrics && Array.isArray(data.metrics)) {
          setMetrics(data.metrics);
        } else {
          console.warn('⚠️ No metrics array in response:', data);
          setMetrics([]);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch metrics:', errorData);
        setError(errorData.error || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('❌ Network error fetching metrics:', error);
      setError('Failed to connect to server. Make sure the backend is running on http://localhost:3002');
    } finally {
      setLoading(false);
    }
  }, [embedId, clientId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleRefresh = () => {
    fetchMetrics();
  };


  const filteredAndSortedMetrics = metrics
    .filter(metric =>
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (metric.description && metric.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (metric.category && metric.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading reports and metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-destructive text-3xl mb-4">⚠️</div>
              <h3 className="font-semibold text-lg mb-2">Error Loading Reports</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports & Metrics</h1>
        <p className="text-muted-foreground">
          View and analyze metrics from your dashboard
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={sortField} onValueChange={(value: keyof Metric) => setSortField(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>

              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      {filteredAndSortedMetrics.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg mb-2">No Metrics Found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No metrics match your search "${searchTerm}"`
                  : `No metrics are available for dashboard "${embedId}"`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedMetrics.map((metric) => (
            <Card
              key={metric.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedMetricId === metric.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
                }`}
              onClick={() => setSelectedMetricId(selectedMetricId === metric.id ? null : metric.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{metric.name}</CardTitle>
                  {metric.status && (
                    <Badge variant={metric.status === 'active' ? 'default' : 'secondary'}>
                      {metric.status}
                    </Badge>
                  )}
                </div>
                {metric.description && (
                  <CardDescription className="text-sm">
                    {metric.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  {metric.value !== undefined && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {metric.value} {metric.unit || ''}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>ID: {metric.metricId || metric.id}</span>
                    {metric.category && (
                      <Badge variant="outline" className="text-xs">
                        {metric.category}
                      </Badge>
                    )}
                  </div>

                  {metric.lastUpdated && (
                    <div className="text-xs text-muted-foreground">
                      Updated: {new Date(metric.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{metrics.length}</div>
              <div className="text-sm text-muted-foreground">Total Metrics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{filteredAndSortedMetrics.length}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {new Set(metrics.map(m => m.category).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {metrics.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Metrics</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;