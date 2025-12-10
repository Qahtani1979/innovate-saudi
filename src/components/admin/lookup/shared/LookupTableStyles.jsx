import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from 'lucide-react';

// Unified stat card component
export function StatCard({ icon: Icon, title, value, colorClass }) {
  return (
    <Card className={`bg-gradient-to-br ${colorClass} to-background/50`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="h-8 w-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
  );
}

// Unified table wrapper
export function LookupTableCard({ title, onAdd, addLabel, addButtonClass, children }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onAdd && (
          <Button onClick={onAdd} className={addButtonClass}>
            <Plus className="h-4 w-4 mr-2" />
            {addLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Unified search input
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}

// Unified table component
export function LookupTable({ headers, children }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className={`px-4 py-3 text-sm font-medium ${header.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// Table row component
export function LookupTableRow({ children, onClick }) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors" onClick={onClick}>
      {children}
    </tr>
  );
}

// Table cell component
export function LookupTableCell({ children, align = 'left', dir }) {
  return (
    <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : ''}`} dir={dir}>
      {children}
    </td>
  );
}

// Status badge component
export function StatusBadge({ isActive, activeLabel, inactiveLabel }) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
}

// Action buttons component
export function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {message}
    </div>
  );
}

// Filter helper function
export function filterBySearchTerm(items, searchTerm, fields = ['name_en', 'name_ar']) {
  if (!searchTerm) return items;
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    fields.some(field => item[field]?.toLowerCase?.().includes(term) || item[field]?.includes?.(searchTerm))
  );
}
