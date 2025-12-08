import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function RecentItems() {
  const recentItems = JSON.parse(localStorage.getItem('recentItems') || '[]')
    .slice(0, 5);

  if (recentItems.length === 0) return null;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentItems.map((item, idx) => (
          <Link
            key={idx}
            to={createPageUrl(item.page) + (item.id ? `?id=${item.id}` : '')}
            className="block p-2 hover:bg-slate-50 rounded text-sm text-slate-700"
          >
            {item.name}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Helper to track recent items
export function trackRecentItem(page, name, id = null) {
  const recent = JSON.parse(localStorage.getItem('recentItems') || '[]');
  const newItem = { page, name, id, timestamp: Date.now() };
  
  const filtered = recent.filter(r => !(r.page === page && r.id === id));
  filtered.unshift(newItem);
  
  localStorage.setItem('recentItems', JSON.stringify(filtered.slice(0, 10)));
}