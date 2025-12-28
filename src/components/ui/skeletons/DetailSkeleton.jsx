import { Skeleton } from "@/components/ui/skeleton";

/**
 * Standardized skeleton for Detail pages.
 * Simulates: Header, Tabs, and Content area.
 */
export function DetailSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-96 rounded-lg" />
                        <div className="flex gap-4">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-8">
                    <Skeleton className="h-10 w-24 rounded-t-lg" />
                    <Skeleton className="h-10 w-24 rounded-t-lg" />
                    <Skeleton className="h-10 w-24 rounded-t-lg" />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border rounded-xl p-6 space-y-4">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    <div className="border rounded-xl p-6 space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="border rounded-xl p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
