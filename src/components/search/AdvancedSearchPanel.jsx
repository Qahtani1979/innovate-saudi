import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Search, Filter, X, Calendar } from 'lucide-react';
export default function AdvancedSearchPanel({ onSearch, onClose }) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    query: '',
    entityType: 'all',
    sector: 'all',
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: '',
    city: 'all',
    tags: []
  });

  const entityTypes = [
    { value: 'all', label: { en: 'All Types', ar: 'كل الأنواع' } },
    { value: 'Challenge', label: { en: 'Challenges', ar: 'التحديات' } },
    { value: 'Pilot', label: { en: 'Pilots', ar: 'التجارب' } },
    { value: 'Solution', label: { en: 'Solutions', ar: 'الحلول' } },
    { value: 'RDProject', label: { en: 'R&D Projects', ar: 'مشاريع البحث' } },
    { value: 'Program', label: { en: 'Programs', ar: 'البرامج' } },
    { value: 'Organization', label: { en: 'Organizations', ar: 'المنظمات' } }
  ];

  const sectors = [
    'all', 'urban_design', 'transport', 'environment', 'digital_services', 
    'health', 'education', 'safety', 'economic_development', 'social_services'
  ];

  const handleSearch = async () => {
    const results = await searchWithFilters(filters);
    onSearch(results);
  };

  const searchWithFilters = async (filters) => {
    const query = {};
    
    if (filters.query) {
      query.$or = [
        { title_en: { $regex: filters.query, $options: 'i' } },
        { title_ar: { $regex: filters.query, $options: 'i' } },
        { name_en: { $regex: filters.query, $options: 'i' } },
        { description_en: { $regex: filters.query, $options: 'i' } }
      ];
    }
    
    if (filters.sector !== 'all') query.sector = filters.sector;
    if (filters.status !== 'all') query.status = filters.status;
    if (filters.priority !== 'all') query.priority = filters.priority;
    
    if (filters.dateFrom) {
      query.created_date = { $gte: filters.dateFrom };
    }
    
    const results = [];
    const entities = filters.entityType === 'all' 
      ? ['Challenge', 'Pilot', 'Solution', 'RDProject', 'Program', 'Organization']
      : [filters.entityType];

    for (const entityType of entities) {
      try {
        const data = await base44.entities[entityType].filter(query, '-created_date', 10);
        results.push(...data.map(item => ({ ...item, _type: entityType })));
      } catch (error) {
        console.error(`Search error for ${entityType}:`, error);
      }
    }

    return results;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t({ en: 'Advanced Search', ar: 'البحث المتقدم' })}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Search Query', ar: 'استعلام البحث' })}
          </label>
          <Input
            placeholder={t({ en: 'Enter keywords...', ar: 'أدخل الكلمات المفتاحية...' })}
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Entity Type', ar: 'نوع الكيان' })}
            </label>
            <Select value={filters.entityType} onValueChange={(v) => setFilters({ ...filters, entityType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Sector', ar: 'القطاع' })}
            </label>
            <Select value={filters.sector} onValueChange={(v) => setFilters({ ...filters, sector: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Status', ar: 'الحالة' })}
            </label>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</SelectItem>
                <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                <SelectItem value="submitted">{t({ en: 'Submitted', ar: 'مقدم' })}</SelectItem>
                <SelectItem value="active">{t({ en: 'Active', ar: 'نشط' })}</SelectItem>
                <SelectItem value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Priority', ar: 'الأولوية' })}
            </label>
            <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Priorities', ar: 'كل الأولويات' })}</SelectItem>
                <SelectItem value="tier_1">Tier 1</SelectItem>
                <SelectItem value="tier_2">Tier 2</SelectItem>
                <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Calendar className="h-3 w-3 inline mr-1" />
              {t({ en: 'From Date', ar: 'من تاريخ' })}
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Calendar className="h-3 w-3 inline mr-1" />
              {t({ en: 'To Date', ar: 'إلى تاريخ' })}
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSearch} className="flex-1 bg-blue-600">
            <Search className="h-4 w-4 mr-2" />
            {t({ en: 'Search', ar: 'بحث' })}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFilters({
              query: '', entityType: 'all', sector: 'all', status: 'all',
              priority: 'all', dateFrom: '', dateTo: '', city: 'all', tags: []
            })}
          >
            {t({ en: 'Reset', ar: 'إعادة تعيين' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}