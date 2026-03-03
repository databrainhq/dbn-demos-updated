import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, BarChart3, PieChart, Table, Activity } from "lucide-react";
import { User, Widget } from '../types/user';
import PermissionGate from './PermissionGate';

interface WidgetManagerProps {
  user: User;
  dashboardId?: string;
  onWidgetChange?: () => void;
}

interface CustomWidget extends Widget {
  dashboardId?: string;
  createdByRole?: string;
}

const WidgetManager: React.FC<WidgetManagerProps> = ({
  user,
  dashboardId,
  onWidgetChange
}) => {
  const [widgets, setWidgets] = useState<CustomWidget[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<CustomWidget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'chart' as 'chart' | 'metric' | 'table' | 'kpi',
    description: '',
    position: { x: 0, y: 0, w: 6, h: 4 }
  });

  // Permission checks
  const canCreateWidgets = user.permissions.some(p => p.id === 'create_widgets' && p.enabled);
  const canManageWidgets = user.permissions.some(p => p.id === 'manage_custom_widgets' && p.enabled);

  // Fetch widgets for current dashboard
  const fetchWidgets = async () => {
    if (!dashboardId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3002/api/dashboard-widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboardId,
          clientId: user.clientId,
          userRole: user.role
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWidgets(data.widgets || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch widgets');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching widgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, [dashboardId, user.clientId]);

  const handleCreateWidget = async () => {
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/create-widget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          dashboardId,
          clientId: user.clientId,
          createdBy: user.id,
          createdByRole: user.role
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Add new widget to local state
        const newWidget: CustomWidget = {
          id: data.widgetId || `widget-${Date.now()}`,
          name: formData.name,
          type: formData.type,
          isOOTB: false,
          createdBy: user.id,
          createdByRole: user.role,
          config: {},
          position: formData.position,
          dashboardId
        };

        setWidgets(prev => [...prev, newWidget]);
        setShowCreateModal(false);
        resetForm();

        if (onWidgetChange) onWidgetChange();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create widget');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error creating widget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWidget = async () => {
    if (!editingWidget || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/update-widget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgetId: editingWidget.id,
          ...formData,
          clientId: user.clientId,
          userRole: user.role
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Update widget in local state
        setWidgets(prev => prev.map(w =>
          w.id === editingWidget.id
            ? { ...w, name: formData.name, type: formData.type, position: formData.position }
            : w
        ));

        setShowEditModal(false);
        setEditingWidget(null);
        resetForm();

        if (onWidgetChange) onWidgetChange();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update widget');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error updating widget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWidget = async (widget: CustomWidget) => {
    if (!confirm(`Are you sure you want to delete "${widget.name}"?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/delete-widget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgetId: widget.id,
          clientId: user.clientId,
          userRole: user.role
        })
      });

      if (response.ok) {

        // Remove widget from local state
        setWidgets(prev => prev.filter(w => w.id !== widget.id));

        if (onWidgetChange) onWidgetChange();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete widget');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error deleting widget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (widget: CustomWidget) => {
    setEditingWidget(widget);
    setFormData({
      name: widget.name,
      type: widget.type,
      description: '',
      position: widget.position
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'chart',
      description: '',
      position: { x: 0, y: 0, w: 6, h: 4 }
    });
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'metric': return <Activity className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'kpi': return <PieChart className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const canEditWidget = (widget: CustomWidget) => {
    return canManageWidgets || (widget.createdBy === user.id);
  };

  const canDeleteWidget = (widget: CustomWidget) => {
    return canManageWidgets || (widget.createdBy === user.id);
  };

  if (!dashboardId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Manager</CardTitle>
          <CardDescription>Select a dashboard to manage widgets</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Custom Widgets</CardTitle>
              <CardDescription>
                Manage widgets for the current dashboard
              </CardDescription>
            </div>
            <PermissionGate user={user} permission="create_widgets">
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Widget
              </Button>
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading widgets...</div>
          ) : widgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No custom widgets found. Create your first widget to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <Card key={widget.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getWidgetIcon(widget.type)}
                        <CardTitle className="text-sm">{widget.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {widget.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Created by: {widget.createdBy}
                        {widget.createdByRole && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {widget.createdByRole}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {canEditWidget(widget) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(widget)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {canDeleteWidget(widget) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWidget(widget)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Widget Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Widget</DialogTitle>
            <DialogDescription>
              Add a new custom widget to this dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="widget-name">Widget Name</Label>
              <Input
                id="widget-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter widget name"
              />
            </div>
            <div>
              <Label htmlFor="widget-type">Widget Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'chart' | 'metric' | 'table' | 'kpi') =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="widget-description">Description (Optional)</Label>
              <Textarea
                id="widget-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this widget shows"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWidget} disabled={!formData.name.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Widget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Widget Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
            <DialogDescription>
              Update the widget configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-widget-name">Widget Name</Label>
              <Input
                id="edit-widget-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter widget name"
              />
            </div>
            <div>
              <Label htmlFor="edit-widget-type">Widget Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'chart' | 'metric' | 'table' | 'kpi') =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-widget-description">Description (Optional)</Label>
              <Textarea
                id="edit-widget-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this widget shows"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditWidget} disabled={!formData.name.trim() || isLoading}>
              {isLoading ? 'Updating...' : 'Update Widget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WidgetManager;
