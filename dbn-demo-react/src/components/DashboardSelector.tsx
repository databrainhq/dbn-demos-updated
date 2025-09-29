import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, BarChart3, Bug } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Embed {
  embedId: string;
  name: string;
  embedType: 'dashboard' | 'metric';
  metadata: {
    description?: string;
    isPrivate?: boolean;
    createdAt?: string;
    [key: string]: unknown;
  };
  isDashboard: boolean;
  isMetric: boolean;
}

interface DashboardSelectorProps {
  clientId: string;
  selectedDashboardId: string;
  onDashboardSelect: (embedId: string, dashboardName: string) => void;
  onRefresh?: () => void;
  onCreateNew?: () => void;
  onDashboardsLoaded?: (dashboards: Embed[]) => void;
  embedId?: string;
  autoSelectFirst?: boolean;
  debugInfo?: {
    token?: string;
    currentUser?: { name: string; role: string; customerId: string };
    currentDashboardId?: string;
    configDashboardId?: string;
  };
}

const DashboardSelector: React.FC<DashboardSelectorProps> = ({
  clientId,
  selectedDashboardId,
  onDashboardSelect,
  onRefresh,
  onCreateNew,
  onDashboardsLoaded,
  autoSelectFirst = true,
  debugInfo
}) => {
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSelected = useRef(false);
  const isFetching = useRef(false);

  const fetchEmbeds = useCallback(async () => {
    if (!clientId || isFetching.current) return;

    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching embeds for clientId:', clientId);

      const response = await fetch('http://localhost:3001/api/list-embeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          userPersona: debugInfo?.currentUser?.name || 'Unknown'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Embeds fetched successfully:', data);

        if (data.embeds && Array.isArray(data.embeds)) {
          const processedEmbeds = data.embeds.map((embed: { embedType: string;[key: string]: unknown }) => ({
            ...embed,
            isDashboard: embed.embedType === 'dashboard',
            isMetric: embed.embedType === 'metric'
          }));
          setEmbeds(processedEmbeds);

          // Notify parent component about loaded dashboards
          const dashboards = processedEmbeds.filter(embed => embed.isDashboard);
          if (onDashboardsLoaded) {
            onDashboardsLoaded(dashboards);
          }
        } else {
          console.warn('⚠️ No embeds array in response:', data);
          setEmbeds([]);
          if (onDashboardsLoaded) {
            onDashboardsLoaded([]);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch embeds:', errorData);
        setError(errorData.error || 'Failed to fetch dashboards');
      }
    } catch (error) {
      console.error('❌ Network error fetching embeds:', error);
      setError('Failed to connect to server. Make sure the backend is running on http://localhost:3001');
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchEmbeds();
    }
  }, [clientId, fetchEmbeds]);

  // Auto-select first dashboard when embeds are loaded (only once)
  useEffect(() => {
    if (autoSelectFirst && embeds.length > 0 && !hasAutoSelected.current) {
      const firstDashboard = embeds.find(embed => embed.isDashboard);
      if (firstDashboard && selectedDashboardId !== firstDashboard.embedId) {
        console.log('🎯 Auto-selecting first dashboard from API:', firstDashboard);
        console.log('Current selectedDashboardId:', selectedDashboardId);
        console.log('First dashboard embedId:', firstDashboard.embedId);
        hasAutoSelected.current = true;
        onDashboardSelect(firstDashboard.embedId, firstDashboard.name);
      } else if (firstDashboard && selectedDashboardId === firstDashboard.embedId) {
        console.log('ℹ️ First dashboard already selected, skipping auto-selection');
        hasAutoSelected.current = true;
      }
    }
  }, [embeds, autoSelectFirst, selectedDashboardId, onDashboardSelect]);

  const handleRefresh = () => {
    fetchEmbeds();
    if (onRefresh) {
      onRefresh();
    }
  };

  const dashboards = embeds.filter(embed => embed.isDashboard);
  const metrics = embeds.filter(embed => embed.isMetric);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Dashboards ({dashboards.length})</h2>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {debugInfo && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bug className="h-4 w-4 mr-2" />
                  Debug
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 bg-white border border-slate-200 shadow-lg z-[9999] relative"
                align="end"
                sideOffset={5}
              >
                <DropdownMenuLabel className="bg-slate-50">🔧 Debug Information</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-3 text-sm space-y-2">
                  <div>
                    <span className="font-medium">Token:</span>{' '}
                    {debugInfo.token ? `${debugInfo.token.substring(0, 20)}...` : 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Client ID:</span> {clientId}
                  </div>
                  <div>
                    <span className="font-medium">Selected Dashboard ID:</span> {selectedDashboardId}
                  </div>
                  <div>
                    <span className="font-medium">Current Dashboard ID:</span> {debugInfo.currentDashboardId}
                  </div>
                  <div>
                    <span className="font-medium">CONFIG Dashboard ID:</span> {debugInfo.configDashboardId}
                  </div>
                  <div>
                    <span className="font-medium">User:</span> {debugInfo.currentUser?.name} ({debugInfo.currentUser?.role})
                  </div>
                  <div>
                    <span className="font-medium">Customer ID:</span> {debugInfo.currentUser?.customerId}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Token Valid:</span>
                    <Badge variant={debugInfo.token ? "default" : "destructive"}>
                      {debugInfo.token ? '✅' : '❌'}
                    </Badge>
                  </div>
                  {!debugInfo.token && (
                    <div className="text-destructive font-medium text-xs">
                      ⚠️ Token missing - this will cause invalid_token error
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator />
                <div className="p-3 text-xs text-muted-foreground">
                  Embeds loaded: {embeds.length} | Dashboards: {dashboards.length}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Dashboard content */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading dashboards...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-destructive text-3xl mb-4">⚠️</div>
              <h3 className="font-semibold text-lg mb-2">Error Loading Dashboards</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : dashboards.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-lg mb-2">No Dashboards Found</h3>
              <p className="text-muted-foreground mb-4">
                No dashboards are available for client ID: {clientId}
              </p>
              <Button onClick={onCreateNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default DashboardSelector;