import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";

interface CreateDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dashboard: CreatedDashboard) => void;
  clientId: string;
  inline?: boolean;
}

interface CreatedDashboard {
  dashboardId: string;
  embedId: string;
  dashboardName: string;
  description?: string;
}

interface FormData {
  embedName: string;
  description: string;
  sourceDashboardId: string;
}

const CreateDashboard: React.FC<CreateDashboardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  inline = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    embedName: '',
    description: '',
    sourceDashboardId: 'dbn-demo'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDashboardId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleClose = () => {
    setFormData({
      embedName: '',
      description: '',
      sourceDashboardId: 'dbn-demo'
    });
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.embedName.trim()) {
      setError('Dashboard name is required');
      return;
    }

    if (!clientId) {
      setError('Client ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Creating dashboard with data:', formData);

      const dashboardId = generateDashboardId(formData.embedName);

      const response = await fetch('http://localhost:3001/api/v2/create-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboardName: formData.embedName.trim(),
          description: formData.description.trim(),
          clientId: clientId,
          datamartName: 'Demo Embed Datamart'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Dashboard created successfully:', data);
        const createdDashboard: CreatedDashboard = {
          dashboardId: data.dashboardId,
          embedId: data.embedId,
          dashboardName: data.dashboardName,
          description: data.description
        };
        onSuccess(createdDashboard);
        handleClose();
      } else {
        console.error('❌ Failed to create dashboard:', data);
        setError(data.error || 'Failed to create dashboard');
      }
    } catch (err) {
      console.error('❌ Network error creating dashboard:', err);
      setError('Failed to connect to server. Make sure the backend is running on http://localhost:3001');
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="dashboard-name">Dashboard Name *</Label>
        <Input
          id="dashboard-name"
          type="text"
          value={formData.embedName}
          onChange={(e) => handleInputChange('embedName', e.target.value)}
          placeholder="Enter dashboard name"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <Label htmlFor="dashboard-description">Description</Label>
        <Textarea
          id="dashboard-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter dashboard description (optional)"
          disabled={isLoading}
          rows={3}
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.embedName.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (inline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Dashboard</CardTitle>
          <CardDescription>
            Create a new dashboard using DataBrain's API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Create a new dashboard using DataBrain's API
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default CreateDashboard;