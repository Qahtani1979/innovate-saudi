import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from '../LanguageContext';

/**
 * RTL-optimized table that reverses column order for Arabic
 */
export default function RTLTable({ columns, data, ...props }) {
  const { isRTL } = useLanguage();

  const displayColumns = isRTL ? [...columns].reverse() : columns;

  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          {displayColumns.map((col, idx) => (
            <TableHead key={idx} className={isRTL ? 'text-right' : 'text-left'}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIdx) => (
          <TableRow key={rowIdx}>
            {displayColumns.map((col, colIdx) => (
              <TableCell key={colIdx} className={isRTL ? 'text-right' : 'text-left'}>
                {col.cell ? col.cell(row) : row[col.accessorKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}