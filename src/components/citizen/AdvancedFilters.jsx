import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Calendar } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function AdvancedFilters({ filters, onChange }) {
  const { t } = useLanguage();

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'Min Votes', ar: 'الحد الأدنى للأصوات' })}
          </label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={filters.minVotes || ''}
            onChange={(e) => onChange({ ...filters, minVotes: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'Max Votes', ar: 'الحد الأقصى للأصوات' })}
          </label>
          <Input
            type="number"
            min="0"
            placeholder="∞"
            value={filters.maxVotes || ''}
            onChange={(e) => onChange({ ...filters, maxVotes: parseInt(e.target.value) || 999999 })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'From Date', ar: 'من تاريخ' })}
          </label>
          <Input
            type="date"
            value={filters.fromDate || ''}
            onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'To Date', ar: 'إلى تاريخ' })}
          </label>
          <Input
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'AI Priority', ar: 'الأولوية الذكية' })}
          </label>
          <Select
            value={filters.priorityRange || 'all'}
            onValueChange={(val) => onChange({ ...filters, priorityRange: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High (80+)</SelectItem>
              <SelectItem value="medium">Medium (50-80)</SelectItem>
              <SelectItem value="low">Low (&lt;50)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'Has Embedding', ar: 'له تضمين' })}
          </label>
          <Select
            value={filters.hasEmbedding || 'all'}
            onValueChange={(val) => onChange({ ...filters, hasEmbedding: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            {t({ en: 'Sentiment', ar: 'المشاعر' })}
          </label>
          <Select
            value={filters.sentiment || 'all'}
            onValueChange={(val) => onChange({ ...filters, sentiment: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}