import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Newspaper, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function NewsCMS() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: '',
    category: 'announcement',
    is_published: false
  });

  // Note: NewsArticle entity would need to be created
  const { data: articles = [] } = useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      try {
        return await base44.entities.NewsArticle?.list() || [];
      } catch {
        return [];
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          {t({ en: 'News & Announcements CMS', ar: 'إدارة الأخبار والإعلانات' })}
          <Badge className="ml-auto bg-amber-600">
            {t({ en: 'Entity Required', ar: 'كيان مطلوب' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="text-amber-900 font-medium mb-2">
            {t({ en: 'Implementation Required', ar: 'التنفيذ مطلوب' })}
          </p>
          <p className="text-amber-800 text-xs">
            {t({ en: 'NewsArticle entity needs to be created with fields: title_en, title_ar, content_en, content_ar, category, image_url, is_published, published_date', ar: 'يجب إنشاء كيان NewsArticle' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Title (EN)" value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} />
          <Input placeholder="Title (AR)" value={formData.title_ar} onChange={(e) => setFormData({...formData, title_ar: e.target.value})} dir="rtl" />
        </div>

        <Textarea placeholder="Content (EN)" value={formData.content_en} onChange={(e) => setFormData({...formData, content_en: e.target.value})} rows={4} />

        <Button className="w-full bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Create Article', ar: 'إنشاء مقال' })}
        </Button>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Features to implement:</p>
          <ul className="space-y-1 ml-4">
            <li>• Rich text editor for content</li>
            <li>• Image upload and management</li>
            <li>• Category tagging</li>
            <li>• Publish/draft workflow</li>
            <li>• SEO metadata</li>
            <li>• Public news feed page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}