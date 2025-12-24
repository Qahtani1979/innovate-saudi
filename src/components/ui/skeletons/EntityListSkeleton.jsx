import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Standardized skeleton for list views (Table or Grid).
 * 
 * @param {Object} props
 * @param {'table' | 'grid' | 'list'} [props.mode='table'] - Display mode
 * @param {number} [props.rowCount=5] - Number of items to show
 * @param {number} [props.columnCount=4] - Number of columns (table mode)
 * @param {boolean} [props.showHeader=true] - Show table header
 */
export function EntityListSkeleton({
    mode = 'table',
    rowCount = 5,
    columnCount = 4,
    showHeader = true
}) {
    if (mode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: rowCount }).map((_, i) => (
                    <div key={i} className="border rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="pt-4 flex gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (mode === 'list') {
        return (
            <div className="space-y-4">
                {Array.from({ length: rowCount }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-2 w-full mt-2" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-slate-950">
            <Table>
                {showHeader && (
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columnCount }).map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {Array.from({ length: rowCount }).map((_, r) => (
                        <TableRow key={r}>
                            {Array.from({ length: columnCount }).map((_, c) => (
                                <TableCell key={c}>
                                    {c === 0 ? (
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    ) : (
                                        <Skeleton className="h-4 w-full" />
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
