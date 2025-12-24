import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';

/**
 * Standardized Filter Component.
 * Handles Search, Status Filtering, and Sort Order.
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search text
 * @param {Function} props.onSearchChange - Search handler (text)
 * @param {string} props.statusValue - Current status filter value
 * @param {Function} props.onStatusChange - Status handler (value)
 * @param {string} props.sortValue - Current sort value
 * @param {Function} props.onSortChange - Sort handler (value)
 * @param {Object[]} [props.statusOptions] - [{ value, label }] options
 * @param {Object[]} [props.sortOptions] - [{ value, label }] options
 * @param {string} [props.placeholder] - Search placeholder
 */
export function EntityFilter({
    searchQuery = '',
    onSearchChange = () => { },
    statusValue = 'all',
    onStatusChange = () => { },
    sortValue = '',
    onSortChange = () => { },
    statusOptions = [],
    sortOptions = [],
    placeholder = "Search..."
}) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const hasActiveFilters = searchQuery || (statusValue && statusValue !== 'all') || (sortValue && sortValue !== 'newest');

    const clearFilters = () => {
        onSearchChange('');
        if (onStatusChange) onStatusChange('all');
        if (onSortChange) onSortChange('newest');
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                <Input
                    placeholder={placeholder}
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} bg-white dark:bg-slate-950`}
                />
            </div>

            <div className="flex gap-2">
                {statusOptions.length > 0 && (
                    <Select value={statusValue} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {sortOptions.length > 0 && (
                    <Select value={sortValue} onValueChange={onSortChange}>
                        <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearFilters}
                        title="Clear Filters"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
