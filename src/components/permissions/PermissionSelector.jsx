import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Shield } from 'lucide-react';



const AVAILABLE_PERMISSIONS = [
  // Data Management
  { value: 'can_create_region', label: 'Create Region', category: 'Data' },
  { value: 'can_edit_region', label: 'Edit Region', category: 'Data' },
  { value: 'can_delete_region', label: 'Delete Region', category: 'Data' },
  { value: 'can_create_city', label: 'Create City', category: 'Data' },
  { value: 'can_edit_city', label: 'Edit City', category: 'Data' },
  { value: 'can_delete_city', label: 'Delete City', category: 'Data' },
  { value: 'can_create_organization', label: 'Create Organization', category: 'Data' },
  { value: 'can_edit_organization', label: 'Edit Organization', category: 'Data' },
  { value: 'can_delete_organization', label: 'Delete Organization', category: 'Data' },
  
  // Challenges
  { value: 'can_create_challenge', label: 'Create Challenge', category: 'Challenges' },
  { value: 'can_edit_challenge', label: 'Edit Challenge', category: 'Challenges' },
  { value: 'can_delete_challenge', label: 'Delete Challenge', category: 'Challenges' },
  { value: 'can_approve_challenge', label: 'Approve Challenge', category: 'Challenges' },
  { value: 'can_archive_challenge', label: 'Archive Challenge', category: 'Challenges' },
  
  // Solutions
  { value: 'can_create_solution', label: 'Create Solution', category: 'Solutions' },
  { value: 'can_edit_solution', label: 'Edit Solution', category: 'Solutions' },
  { value: 'can_delete_solution', label: 'Delete Solution', category: 'Solutions' },
  { value: 'can_verify_solution', label: 'Verify Solution', category: 'Solutions' },
  
  // Pilots
  { value: 'can_create_pilot', label: 'Create Pilot', category: 'Pilots' },
  { value: 'can_edit_pilot', label: 'Edit Pilot', category: 'Pilots' },
  { value: 'can_delete_pilot', label: 'Delete Pilot', category: 'Pilots' },
  { value: 'can_approve_pilot_budget', label: 'Approve Pilot Budget', category: 'Pilots' },
  { value: 'can_approve_pilot_milestone', label: 'Approve Pilot Milestone', category: 'Pilots' },
  { value: 'can_terminate_pilot', label: 'Terminate Pilot', category: 'Pilots' },
  
  // R&D
  { value: 'can_create_rd_call', label: 'Create R&D Call', category: 'R&D' },
  { value: 'can_edit_rd_project', label: 'Edit R&D Project', category: 'R&D' },
  { value: 'can_approve_rd_proposal', label: 'Approve R&D Proposal', category: 'R&D' },
  
  // Programs
  { value: 'can_create_program', label: 'Create Program', category: 'Programs' },
  { value: 'can_manage_applications', label: 'Manage Program Applications', category: 'Programs' },
  
  // System
  { value: 'can_manage_users', label: 'Manage Users', category: 'System' },
  { value: 'can_manage_roles', label: 'Manage Roles', category: 'System' },
  { value: 'can_manage_teams', label: 'Manage Teams', category: 'System' },
  { value: 'can_view_analytics', label: 'View Analytics', category: 'System' },
  { value: 'can_export_data', label: 'Export Data', category: 'System' },
  { value: 'can_configure_system', label: 'Configure System', category: 'System' },
];

export default function PermissionSelector({ selectedPermissions = [], onChange }) {
  const [customPermission, setCustomPermission] = useState('');

  const categories = [...new Set(AVAILABLE_PERMISSIONS.map(p => p.category))];

  const addPermission = (permission) => {
    if (!selectedPermissions.includes(permission)) {
      onChange([...selectedPermissions, permission]);
    }
  };

  const removePermission = (permission) => {
    onChange(selectedPermissions.filter(p => p !== permission));
  };

  const addCustomPermission = () => {
    if (customPermission && !selectedPermissions.includes(customPermission)) {
      onChange([...selectedPermissions, customPermission]);
      setCustomPermission('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium">Permissions</span>
      </div>

      {/* Selected Permissions */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-slate-50">
        {selectedPermissions.length === 0 && (
          <p className="text-sm text-slate-400">No permissions selected</p>
        )}
        {selectedPermissions.map((perm, idx) => (
          <Badge key={idx} className="gap-1 bg-blue-600 text-white">
            {perm}
            <button onClick={() => removePermission(perm)} className="hover:bg-blue-700 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Permission by Category */}
      {categories.map(category => {
        const perms = AVAILABLE_PERMISSIONS.filter(p => p.category === category);
        return (
          <div key={category} className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">{category}</p>
            <div className="flex flex-wrap gap-2">
              {perms.map(perm => {
                const isSelected = selectedPermissions.includes(perm.value);
                return (
                  <Button
                    key={perm.value}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => isSelected ? removePermission(perm.value) : addPermission(perm.value)}
                    className="text-xs"
                  >
                    {perm.label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom Permission */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase">Custom Permission</p>
        <div className="flex gap-2">
          <Input
            placeholder="can_custom_action"
            value={customPermission}
            onChange={(e) => setCustomPermission(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" onClick={addCustomPermission}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
