import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';

export default function EntityPermissions({ entity, userRole, entityType }) {
  const canEdit = () => {
    if (userRole === 'admin') return true;
    if (entity.created_by === userRole) return true;
    return false;
  };

  const canDelete = () => {
    if (userRole === 'admin') return true;
    return false;
  };

  const canPublish = () => {
    if (userRole === 'admin') return true;
    if (entityType === 'Challenge' && entity.status === 'approved') return true;
    return false;
  };

  const visibility = entity.is_published ? 'public' : entity.is_hidden ? 'hidden' : 'internal';

  const visibilityColors = {
    public: 'bg-green-100 text-green-700',
    internal: 'bg-blue-100 text-blue-700',
    hidden: 'bg-slate-100 text-slate-700'
  };

  const visibilityIcons = {
    public: Eye,
    internal: Shield,
    hidden: EyeOff
  };

  const Icon = visibilityIcons[visibility];

  return (
    <Badge className={visibilityColors[visibility]}>
      <Icon className="h-3 w-3 mr-1" />
      {visibility.toUpperCase()}
    </Badge>
  );
}