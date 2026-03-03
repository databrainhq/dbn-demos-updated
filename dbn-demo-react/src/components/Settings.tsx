import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';

interface ConfigStatus {
  isConfigured: boolean;
  hasApiToken: boolean;
  hasDataAppName: boolean;
  apiBaseUrl: string;
  workspaceName: string;
}

export default function Settings() {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [apiToken, setApiToken] = useState('');
  const [dataAppName, setDataAppName] = useState('');

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/config/status');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setError('Failed to check configuration status');
      }
    } catch (err) {
      setError('Failed to connect to backend. Make sure the server is running on http://localhost:3002');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!apiToken || !dataAppName) {
      setError('API Token and Data App Name are required');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Validate credentials first
      const validateResponse = await fetch('http://localhost:3002/api/config/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken,
          dataAppName
        })
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok || !validateData.valid) {
        setError(validateData.error || 'Invalid credentials. Please check your API Token and Data App Name.');
        setLoading(false);
        return;
      }

      // Step 2: If validation passes, save the configuration
      const response = await fetch('http://localhost:3002/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken,
          dataAppName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage('Credentials validated and configuration updated successfully!');
        setConfig(data.config);

        // Clear sensitive fields after successful save
        setApiToken('');

        // Refresh status after a short delay
        setTimeout(() => {
          checkConfiguration();
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update configuration');
      }
    } catch (err) {
      setError('Failed to update configuration. Check your backend server.');
    } finally {
      setLoading(false);
    }
  };


  if (loading && !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground ml-4">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuration Settings</h1>
        <p className="text-muted-foreground">
          Configure your DataBrain API credentials to get started with the demo.
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configuration Status
            <Badge variant={config?.isConfigured ? "default" : "destructive"}>
              {config?.isConfigured ? 'Configured' : 'Not Configured'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current status of your DataBrain configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">API Token</span>
            <Badge variant={config?.hasApiToken ? "default" : "secondary"}>
              {config?.hasApiToken ? 'Set' : 'Not Set'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Data App Name</span>
            <Badge variant={config?.hasDataAppName ? "default" : "secondary"}>
              {config?.hasDataAppName ? 'Set' : 'Not Set'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Configuration</CardTitle>
          <CardDescription>
            Enter your DataBrain API credentials. You can find these in your DataBrain dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <p className="text-sm">{successMessage}</p>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiToken">
              DataBrain API Token <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Enter your API token from DataBrain dashboard"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get this from: DataBrain Dashboard → Settings → API Keys
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAppName">
              Data App Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dataAppName"
              type="text"
              placeholder="e.g., My Data App"
              value={dataAppName}
              onChange={(e) => setDataAppName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This must match exactly with your data app name in DataBrain
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSaveConfiguration}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
          <CardDescription>
            Follow these steps to get your DataBrain credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. Login to DataBrain</h4>
              <p className="text-muted-foreground">Go to your DataBrain dashboard</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">2. Get API Token</h4>
              <p className="text-muted-foreground">
                Navigate to Settings → API Keys → Create/Copy your API token
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">3. Get Data App Name</h4>
              <p className="text-muted-foreground">
                Go to Data Apps section and copy the exact name of your data app
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">4. Enter Credentials</h4>
              <p className="text-muted-foreground">
                Paste your credentials in the form above and click Save Configuration
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
            <h4 className="text-sm font-medium text-blue-900">💡 Alternative: CLI Configuration</h4>
            <p className="text-xs text-blue-700">
              You can also configure credentials via the command line when starting the backend server.
              Simply restart the server and follow the interactive prompts, or edit the <code className="bg-blue-100 px-1 rounded">backend/.env</code> file directly.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="text-xs text-slate-600">
              Note: Configuration is stored in server memory. You'll need to reconfigure after server restarts,
              unless you save credentials in the <code className="bg-slate-100 px-1 rounded">backend/.env</code> file.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
