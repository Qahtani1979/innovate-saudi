import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/components/LanguageContext';
import { Search, X, Filter, Calendar, MapPin, Video } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'workshop', label: { en: 'Workshop', ar: 'ورشة عمل' } },
  { value: 'conference', label: { en: 'Conference', ar: 'مؤتمر' } },
  { value: 'hackathon', label: { en: 'Hackathon', ar: 'هاكاثون' } },
  { value: 'webinar', label: { en: 'Webinar', ar: 'ندوة إلكترونية' } },
  { value: 'training', label: { en: 'Training', ar: 'تدريب' } },
  { value: 'networking', label: { en: 'Networking', ar: 'تواصل' } },
  { value: 'meetup', label: { en: 'Meetup', ar: 'لقاء' } },
  { value: 'demo_day', label: { en: 'Demo Day', ar: 'يوم العرض' } }
];

const EVENT_STATUSES = [
  { value: 'draft', label: { en: 'Draft', ar: 'مسودة' } },
  { value: 'upcoming', label: { en: 'Upcoming', ar: 'قادم' } },
  { value: 'registration_open', label: { en: 'Registration Open', ar: 'التسجيل مفتوح' } },
  { value: 'registration_closed', label: { en: 'Registration Closed', ar: 'التسجيل مغلق' } },
  { value: 'in_progress', label: { en: 'In Progress', ar: 'جاري' } },
  { value: 'completed', label: { en: 'Completed', ar: 'مكتمل' } },
  { value: 'cancelled', label: { en: 'Cancelled', ar: 'ملغي' } }
];

const EVENT_MODES = [
  { value: 'in_person', label: { en: 'In-Person', ar: 'حضوري' }, icon: MapPin },
  { value: 'virtual', label: { en: 'Virtual', ar: 'افتراضي' }, icon: Video },
  { value: 'hybrid', label: { en: 'Hybrid', ar: 'هجين' }, icon: Calendar }
];

export default function EventFilters({ 
  filters = {}, 
  onFilterChange,
  showStatusFilter = true,
  showModeFilter = true,
  compact = false 
}) {
  const { t, language } = useLanguage();

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all');

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t({ en: 'Search events...', ar: 'بحث في الفعاليات...' })}
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filters.event_type || 'all'} onValueChange={(v) => handleChange('event_type', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t({ en: 'Type', ar: 'النوع' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {t(type.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{t({ en: 'Filters', ar: 'التصفية' })}</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
            <X className="h-4 w-4 mr-1" />
            {t({ en: 'Clear', ar: 'مسح' })}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t({ en: 'Search events...', ar: 'بحث في الفعاليات...' })}
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Event Type */}
        <Select value={filters.event_type || 'all'} onValueChange={(v) => handleChange('event_type', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder={t({ en: 'Event Type', ar: 'نوع الفعالية' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {t(type.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        {showStatusFilter && (
          <Select value={filters.status || 'all'} onValueChange={(v) => handleChange('status', v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
              {EVENT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Mode */}
        {showModeFilter && (
          <Select value={filters.mode || 'all'} onValueChange={(v) => handleChange('mode', v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Mode', ar: 'الطريقة' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Modes', ar: 'جميع الطرق' })}</SelectItem>
              {EVENT_MODES.map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  <div className="flex items-center gap-2">
                    <mode.icon className="h-4 w-4" />
                    {t(mode.label)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{t({ en: 'Active:', ar: 'نشط:' })}</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              {t({ en: 'Search:', ar: 'بحث:' })} "{filters.search}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleChange('search', '')} />
            </Badge>
          )}
          {filters.event_type && (
            <Badge variant="secondary" className="gap-1">
              {t(EVENT_TYPES.find(t => t.value === filters.event_type)?.label || { en: filters.event_type, ar: filters.event_type })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleChange('event_type', '')} />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              {t(EVENT_STATUSES.find(s => s.value === filters.status)?.label || { en: filters.status, ar: filters.status })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleChange('status', '')} />
            </Badge>
          )}
          {filters.mode && (
            <Badge variant="secondary" className="gap-1">
              {t(EVENT_MODES.find(m => m.value === filters.mode)?.label || { en: filters.mode, ar: filters.mode })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleChange('mode', '')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Export constants for reuse
export { EVENT_TYPES, EVENT_STATUSES, EVENT_MODES };
