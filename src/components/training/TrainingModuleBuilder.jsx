import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Plus } from 'lucide-react';

export default function TrainingModuleBuilder({ onSave }) {
  const { t } = useLanguage();
  const [module, setModule] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    category: 'platform_basics',
    duration_minutes: 30,
    content_type: 'video',
    learning_objectives: [],
    assessments: []
  });

  const categories = [
    'platform_basics',
    'challenge_management',
    'pilot_execution',
    'rd_processes',
    'data_analytics',
    'strategic_planning'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Training Module Builder', ar: 'بناء وحدة تدريبية' })}
          <Badge className="ml-auto bg-amber-600">
            {t({ en: 'Content Needed', ar: 'محتوى مطلوب' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="text-amber-900 font-medium mb-2">
            {t({ en: 'Training Content Gap', ar: 'فجوة محتوى التدريب' })}
          </p>
          <p className="text-amber-800 text-xs">
            {t({ en: 'Platform needs comprehensive training modules for municipalities, startups, and researchers.', ar: 'المنصة تحتاج وحدات تدريب شاملة' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder={t({ en: 'Module Title (EN)', ar: 'عنوان الوحدة (EN)' })}
            value={module.title_en}
            onChange={(e) => setModule({...module, title_en: e.target.value})}
          />
          <Input
            placeholder={t({ en: 'Module Title (AR)', ar: 'عنوان الوحدة (AR)' })}
            value={module.title_ar}
            onChange={(e) => setModule({...module, title_ar: e.target.value})}
            dir="rtl"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Category', ar: 'الفئة' })}
          </label>
          <select 
            className="w-full border rounded-lg px-3 py-2"
            value={module.category}
            onChange={(e) => setModule({...module, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Duration (min)', ar: 'المدة (دقيقة)' })}
            </label>
            <Input
              type="number"
              value={module.duration_minutes}
              onChange={(e) => setModule({...module, duration_minutes: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Content Type', ar: 'نوع المحتوى' })}
            </label>
            <select 
              className="w-full border rounded-lg px-3 py-2"
              value={module.content_type}
              onChange={(e) => setModule({...module, content_type: e.target.value})}
            >
              <option value="video">Video</option>
              <option value="interactive">Interactive</option>
              <option value="document">Document</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>

        <Button className="w-full bg-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Create Module', ar: 'إنشاء وحدة' })}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-slate-600 mb-2 font-medium">
            {t({ en: 'Required Training Modules:', ar: 'وحدات التدريب المطلوبة:' })}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categories.map(cat => (
              <Badge key={cat} variant="outline">
                {cat.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
