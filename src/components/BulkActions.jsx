import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Trash2, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';

export default function BulkActions({ selected, onAction, entityType }) {
  if (selected.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm font-medium text-blue-900">
        {selected.length} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <MoreVertical className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {entityType === 'Challenge' && (
            <>
              <DropdownMenuItem onClick={() => onAction('approve')}>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Approve All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('reject')}>
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                Reject All
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={() => onAction('archive')}>
            <Archive className="h-4 w-4 mr-2 text-amber-600" />
            Archive All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('delete')} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="sm" variant="ghost" onClick={() => onAction('clear')}>
        Clear
      </Button>
    </div>
  );
}