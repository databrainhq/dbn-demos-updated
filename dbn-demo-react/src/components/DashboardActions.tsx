import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, Copy, Share } from "lucide-react";
import { User, Dashboard } from '../types/user';
import PermissionGate from './PermissionGate';

interface DashboardActionsProps {
  user: User;
  currentDashboard: Dashboard | null;
  onSaveAs: (newName: string, description: string, apiResponse?: unknown) => void;
  onPublish: (publishTarget: { type: 'all' | 'role' | 'user'; value?: string }) => void;
  onSave: () => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  user,
  currentDashboard,
  onSaveAs,
  onPublish,
  onSave
}) => {
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [saveAsDescription, setSaveAsDescription] = useState('');
  const [publishType, setPublishType] = useState<'all' | 'role' | 'user'>('all');
  const [publishValue, setPublishValue] = useState('');

  const handleSaveAs = async () => {
    if (!saveAsName.trim()) return;

    try {
      console.log('🚀 Creating dashboard copy with DataBrain API...');

      // Call real DataBrain v2 API to copy dashboard
      const response = await fetch('http://localhost:3001/api/v2/copy-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceDashboardId: currentDashboard?.id,
          newDashboardName: saveAsName.trim(),
          description: saveAsDescription.trim(),
          clientId: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard copied successfully with DataBrain API:', data);

        onSaveAs(saveAsName.trim(), saveAsDescription.trim(), data);
        setShowSaveAsModal(false);
        setSaveAsName('');
        setSaveAsDescription('');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to copy dashboard:', errorData);
        alert(`Failed to copy dashboard: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error copying dashboard:', error);
      alert(`Failed to copy dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublish = async () => {
    const target = {
      type: publishType,
      value: publishType !== 'all' ? publishValue : undefined
    };

    // Call custom publishing API (v2 for consistency)
    try {
      const response = await fetch('http://localhost:3001/api/v2/publish-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embedId: currentDashboard?.id,
          publishTarget: target,
          clientId: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard published successfully:', data);
        onPublish(target);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to publish dashboard:', errorData);
        alert(`Failed to publish dashboard: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error publishing dashboard:', error);
      alert(`Failed to publish dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setShowPublishModal(false);
    setPublishValue('');
  };

  // Check if user has required permissions
  const canSave = user.permissions.some(p => p.id === 'manage_custom_dashboards' && p.enabled);
  const canSaveAs = user.permissions.some(p => p.id === 'create_dashboards' && p.enabled);
  const canPublish = user.permissions.some(p => p.id === 'publish_dashboards' && p.enabled);

  return (
    <>
      <div className="flex gap-2 mb-6">
        <PermissionGate user={user} permission="manage_custom_dashboards">
          {canSave && (
            <Button onClick={onSave} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </PermissionGate>

        <PermissionGate user={user} permission="create_dashboards">
          {canSaveAs && (
            <Button onClick={() => setShowSaveAsModal(true)} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Save As
            </Button>
          )}
        </PermissionGate>

        <PermissionGate user={user} permission="publish_dashboards" role="Process Owner">
          {canPublish && currentDashboard && (
            <Button onClick={() => setShowPublishModal(true)} variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
        </PermissionGate>
      </div>

      {/* Save As Modal */}
      <Dialog open={showSaveAsModal} onOpenChange={setShowSaveAsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Dashboard As</DialogTitle>
            <DialogDescription>
              Create a copy of this dashboard with a new name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input
                id="dashboard-name"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="Enter dashboard name"
              />
            </div>

            <div>
              <Label htmlFor="dashboard-description">Description (Optional)</Label>
              <Textarea
                id="dashboard-description"
                value={saveAsDescription}
                onChange={(e) => setSaveAsDescription(e.target.value)}
                placeholder="Enter dashboard description"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveAsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAs} disabled={!saveAsName.trim()}>
              Create Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Modal */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Dashboard</DialogTitle>
            <DialogDescription>
              Make this dashboard available to other users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Publish To</Label>
              <Select value={publishType} onValueChange={(value: 'all' | 'role' | 'user') => setPublishType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="role">Specific Role</SelectItem>
                  <SelectItem value="user">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {publishType === 'role' && (
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={publishValue}
                  onChange={(e) => setPublishValue(e.target.value)}
                  placeholder="e.g., Process Owner, Automation Admin"
                />
              </div>
            )}

            {publishType === 'user' && (
              <div>
                <Label htmlFor="user-emails">User Emails</Label>
                <Textarea
                  id="user-emails"
                  value={publishValue}
                  onChange={(e) => setPublishValue(e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishType !== 'all' && !publishValue.trim()}
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardActions;