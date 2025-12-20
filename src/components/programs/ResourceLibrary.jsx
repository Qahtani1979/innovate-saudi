import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, FileText, Video, Link as LinkIcon, Download, Plus } from 'lucide-react';
import FileUploader from '../FileUploader';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ResourceLibrary({ programId }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'document',
    url: '',
    category: 'general'
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data } = await supabase.from('programs').select('*').eq('id', programId).eq('is_deleted', false).maybeSingle();
      return data;
    },
    enabled: !!programId
  });

  const resources = program?.resources || [];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('programs').update({
        resources: [...resources, {
          ...data,
          id: Date.now().toString(),
          uploaded_date: new Date().toISOString(),
          uploaded_by: user?.email
        }]
      }).eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program', programId]);
      setShowForm(false);
      setNewResource({ title: '', type: 'document', url: '', category: 'general' });
      toast.success(t({ en: 'Resource added', ar: 'تمت إضافة المورد' }));
    }
  });

  const filteredResources = resources.filter(r => filter === 'all' || r.category === filter);
  const categories = [...new Set(resources.map(r => r.category))];

  const getIcon = (type) => {
    switch(type) {
      case 'video': return Video;
      case 'link': return LinkIcon;
      default: return FileText;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            {t({ en: 'Resource Library', ar: 'مكتبة الموارد' })}
            <Badge variant="outline">{resources.length}</Badge>
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Resource', ar: 'إضافة مورد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 space-y-3">
            <Input
              placeholder={t({ en: 'Resource title', ar: 'عنوان المورد' })}
              value={newResource.title}
              onChange={(e) => setNewResource({...newResource, title: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="px-3 py-2 border rounded-lg text-sm"
                value={newResource.type}
                onChange={(e) => setNewResource({...newResource, type: e.target.value})}
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </select>
              <select
                className="px-3 py-2 border rounded-lg text-sm"
                value={newResource.category}
                onChange={(e) => setNewResource({...newResource, category: e.target.value})}
              >
                <option value="general">General</option>
                <option value="training">Training</option>
                <option value="templates">Templates</option>
                <option value="case_studies">Case Studies</option>
              </select>
            </div>
            {newResource.type === 'link' ? (
              <Input
                placeholder={t({ en: 'Resource URL', ar: 'رابط المورد' })}
                value={newResource.url}
                onChange={(e) => setNewResource({...newResource, url: e.target.value})}
              />
            ) : (
              <FileUploader
                type={newResource.type === 'video' ? 'video' : 'document'}
                onUploadComplete={(url) => setNewResource({...newResource, url})}
                label={t({ en: 'Upload file', ar: 'رفع ملف' })}
              />
            )}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => createMutation.mutate(newResource)}
                disabled={!newResource.title || !newResource.url || createMutation.isPending}
              >
                {t({ en: 'Add', ar: 'إضافة' })}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            {t({ en: 'All', ar: 'الكل' })}
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={filter === cat ? 'default' : 'outline'}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredResources.map((resource) => {
            const Icon = getIcon(resource.type);
            return (
              <div key={resource.id} className="p-3 border rounded-lg hover:border-teal-300 hover:bg-teal-50">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{resource.title}</h4>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                      <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                    </div>
                  </div>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{t({ en: 'No resources yet', ar: 'لا توجد موارد بعد' })}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}