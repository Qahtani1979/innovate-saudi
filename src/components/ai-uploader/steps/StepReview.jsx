/**
 * Step 5: Review before import
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, 
  Eye, EyeOff, Edit2, Trash2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function StepReview({ state, updateState, onNext, onBack }) {
  const [selectedRows, setSelectedRows] = useState(
    new Set(state.enrichedData?.map((_, i) => i) || [])
  );
  const [showPreview, setShowPreview] = useState(true);
  const [excludeDuplicates, setExcludeDuplicates] = useState(true);

  const rows = state.enrichedData || state.validationResults?.processedRows || [];
  const mappings = state.fieldMappings || {};
  const duplicateIndices = new Set(
    (state.validationResults?.duplicates || [])
      .filter(d => d.inDatabase)
      .map(d => d.rowIndex)
  );

  const getDisplayFields = () => {
    // Show more fields - prioritize required and title/name fields first
    const allFields = Object.keys(mappings);
    const priorityFields = allFields.filter(f => 
      f.includes('title') || f.includes('name') || f.includes('code')
    );
    const otherFields = allFields.filter(f => !priorityFields.includes(f));
    return [...priorityFields, ...otherFields].slice(0, 8);
  };

  const toggleRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    }
  };

  const getRowsToImport = () => {
    return rows.filter((row, idx) => {
      if (!selectedRows.has(idx)) return false;
      if (excludeDuplicates && duplicateIndices.has(idx)) return false;
      if (row._errors?.length > 0) return false;
      return true;
    });
  };

  const handleContinue = () => {
    const rowsToImport = getRowsToImport();
    if (rowsToImport.length === 0) {
      toast.error('No rows selected for import');
      return;
    }

    updateState({
      enrichedData: rowsToImport
    });
    onNext();
  };

  const rowsToImport = getRowsToImport();
  const displayFields = getDisplayFields();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Review Import Data</h3>
          <p className="text-sm text-muted-foreground">
            Review and select which records to import
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="excludeDuplicates"
              checked={excludeDuplicates}
              onCheckedChange={setExcludeDuplicates}
            />
            <Label htmlFor="excludeDuplicates" className="text-sm">
              Skip database duplicates
            </Label>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-xl font-bold">{rows.length}</p>
          <p className="text-xs text-muted-foreground">Total Rows</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{selectedRows.size}</p>
          <p className="text-xs text-blue-600">Selected</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-yellow-600">{duplicateIndices.size}</p>
          <p className="text-xs text-yellow-600">Duplicates</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-green-600">{rowsToImport.length}</p>
          <p className="text-xs text-green-600">To Import</p>
        </div>
      </div>

      {/* Data Preview Table */}
      {showPreview && (
        <ScrollArea className="h-[280px] border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selectedRows.size === rows.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-10">#</TableHead>
                <TableHead className="w-20">Status</TableHead>
                {displayFields.map(field => (
                  <TableHead key={field} className="min-w-[150px]">
                    {mappings[field]?.sourceColumn || field}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const isDuplicate = duplicateIndices.has(idx);
                const hasErrors = row._errors?.length > 0;
                const isSelected = selectedRows.has(idx);
                const willImport = isSelected && !hasErrors && !(excludeDuplicates && isDuplicate);

                return (
                  <TableRow 
                    key={idx}
                    className={`${
                      !willImport ? 'opacity-50' : ''
                    } ${
                      hasErrors ? 'bg-red-50' : isDuplicate ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(idx)}
                        disabled={hasErrors}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      {hasErrors ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Error
                        </Badge>
                      ) : isDuplicate ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300 gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Dup
                        </Badge>
                      ) : willImport ? (
                        <Badge variant="outline" className="text-green-600 border-green-300 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          OK
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Skip</Badge>
                      )}
                    </TableCell>
                    {displayFields.map(field => (
                      <TableCell key={field} className="max-w-[200px] truncate">
                        {row[field]?.toString() || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      {/* Import Summary */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium">Ready to import {rowsToImport.length} records</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Entity type: <span className="font-medium capitalize">{state.detectedEntity}</span></p>
          <p>Mapped fields: {Object.keys(mappings).length}</p>
          {duplicateIndices.size > 0 && excludeDuplicates && (
            <p className="text-yellow-600">
              {duplicateIndices.size} duplicates will be skipped
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={rowsToImport.length === 0}
          className="gap-2"
        >
          Start Import ({rowsToImport.length} records)
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
