/**
 * Research Areas Selector Component
 * Multi-select for research areas with suggestions
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/components/LanguageContext';
import { Plus, X, Sparkles, Search } from 'lucide-react';

const SUGGESTED_AREAS = [
  { en: 'Urban Planning & Development', ar: 'التخطيط والتنمية الحضرية' },
  { en: 'Smart Cities & IoT', ar: 'المدن الذكية وإنترنت الأشياء' },
  { en: 'Sustainability & Environment', ar: 'الاستدامة والبيئة' },
  { en: 'Transportation & Mobility', ar: 'النقل والتنقل' },
  { en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي وتعلم الآلة' },
  { en: 'Data Science & Analytics', ar: 'علم البيانات والتحليلات' },
  { en: 'Public Policy', ar: 'السياسة العامة' },
  { en: 'Energy & Utilities', ar: 'الطاقة والمرافق' },
  { en: 'Healthcare Innovation', ar: 'الابتكار الصحي' },
  { en: 'Social Innovation', ar: 'الابتكار الاجتماعي' },
  { en: 'Water Management', ar: 'إدارة المياه' },
  { en: 'Waste Management', ar: 'إدارة النفايات' },
  { en: 'Digital Government', ar: 'الحكومة الرقمية' },
  { en: 'Cybersecurity', ar: 'الأمن السيبراني' },
  { en: 'Renewable Energy', ar: 'الطاقة المتجددة' }
];

export default function ResearchAreasSelector({ 
  selected = [], 
  onChange, 
  maxAreas = 5,
  showSuggestions = true 
}) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [customArea, setCustomArea] = useState('');

  const handleAdd = (area) => {
    if (selected.length < maxAreas && !selected.includes(area)) {
      onChange([...selected, area]);
    }
  };

  const handleRemove = (area) => {
    onChange(selected.filter(a => a !== area));
  };

  const handleAddCustom = () => {
    if (customArea.trim() && selected.length < maxAreas && !selected.includes(customArea.trim())) {
      onChange([...selected, customArea.trim()]);
      setCustomArea('');
    }
  };

  const filteredSuggestions = SUGGESTED_AREAS.filter(area => {
    const areaText = language === 'ar' ? area.ar : area.en;
    const isNotSelected = !selected.includes(area.en) && !selected.includes(area.ar);
    const matchesSearch = areaText.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{t({ en: 'Research Areas', ar: 'مجالات البحث' })}</span>
          <Badge variant="outline" className="text-xs">
            {selected.length}/{maxAreas}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Areas */}
        <div className="flex flex-wrap gap-2">
          {selected.map((area, i) => (
            <Badge key={i} className="bg-teal-100 text-teal-800 pl-3 pr-1 py-1.5">
              {area}
              <button 
                onClick={() => handleRemove(area)}
                className="ml-2 hover:bg-teal-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selected.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t({ en: 'No research areas selected', ar: 'لم يتم اختيار مجالات بحث' })}
            </p>
          )}
        </div>

        {/* Add Custom */}
        <div className="flex gap-2">
          <Input
            value={customArea}
            onChange={(e) => setCustomArea(e.target.value)}
            placeholder={t({ en: 'Add custom area...', ar: 'أضف مجالاً مخصصاً...' })}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            disabled={selected.length >= maxAreas}
          />
          <Button 
            variant="outline" 
            onClick={handleAddCustom}
            disabled={!customArea.trim() || selected.length >= maxAreas}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions */}
        {showSuggestions && selected.length < maxAreas && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {t({ en: 'Suggested Areas', ar: 'المجالات المقترحة' })}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t({ en: 'Search areas...', ar: 'ابحث عن المجالات...' })}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {filteredSuggestions.slice(0, 10).map((area, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleAdd(language === 'ar' ? area.ar : area.en)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {language === 'ar' ? area.ar : area.en}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
