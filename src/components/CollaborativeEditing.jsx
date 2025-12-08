import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, Circle } from 'lucide-react';

export default function CollaborativeEditing({ entityId, entityType }) {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Simulated real-time presence
    // In production, this would use WebSocket or polling
    const mockUsers = [
      { name: 'Ahmed Al-Mutairi', color: 'bg-blue-500', viewing: true },
      { name: 'Sara Al-Qahtani', color: 'bg-purple-500', editing: true }
    ];
    
    setActiveUsers(mockUsers);
  }, [entityId]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Users className="h-4 w-4 text-blue-600" />
      <span className="text-sm text-slate-700">Viewing now:</span>
      <div className="flex items-center gap-2">
        {activeUsers.map((user, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${user.color} ${user.editing ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-slate-600">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}