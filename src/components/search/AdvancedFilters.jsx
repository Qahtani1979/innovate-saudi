import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from 'lucide-react';

/**
 * Advanced search filters
 */
export default function AdvancedFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    entityType: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    createdBy: '',
    tags: []
  });

  const applyFilters = () => {
    const query = {};
    
    if (filters.status !== 'all') query.status = filters.status;
    if (filters.priority !== 'all') query.priority = filters.priority;
    if (filters.createdBy) query.created_by = { $regex: filters.createdBy, $options: 'i' };
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: new Date(now.setHours(0, 0, 0, 0)),
        week: new Date(now.setDate(now.getDate() - 7)),
        month: new Date(now.setMonth(now.getMonth() - 1)),
        year: new Date(now.setFullYear(now.getFullYear() - 1))
      };
      query.created_date = { $gte: ranges[filters.dateRange]?.toISOString() };
    }

    if (filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    onFilterChange(query, filters.entityType);
  };

  const clearFilters = () => {
    setFilters({
      entityType: 'all',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      createdBy: '',
      tags: []
    });
    onFilterChange({}, 'all');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select value={filters.entityType} onValueChange={(v) => setFilters({...filters, entityType: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Challenge">Challenges</SelectItem>
              <SelectItem value="Pilot">Pilots</SelectItem>
              <SelectItem value="Solution">Solutions</SelectItem>
              <SelectItem value="Program">Programs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Created by..."
            value={filters.createdBy}
            onChange={(e) => setFilters({...filters, createdBy: e.target.value})}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFilters} size="sm" className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} size="sm" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}