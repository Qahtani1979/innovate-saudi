import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { FileText, Plus, ExternalLink, Award, Database, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicationManager({ rdProjectId }) {
  const { language, isRTL, t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    publication: '',
    year: new Date().getFullYear(),
    url: '',
    type: 'journal'
  });
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['rd-project', rdProjectId],
    queryFn: async () => {
      const projects = await base44.entities.RDProject.list();
      return projects.find(p => p.id === rdProjectId);
    },
    enabled: !!rdProjectId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.RDProject.update(rdProjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-project', rdProjectId]);
      toast.success(t({ en: 'Publication added', ar: 'تمت الإضافة' }));
      setShowForm(false);
      setFormData({ title: '', authors: [], publication: '', year: new Date().getFullYear(), url: '', type: 'journal' });
    }
  });

  const handleSubmit = () => {
    const publications = [...(project?.publications || []), formData];
    updateMutation.mutate({ publications });
  };

  const publications = project?.publications || [];
  const patents = project?.patents || [];
  const datasets = project?.datasets_generated || [];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t({ en: 'Research Outputs', ar: 'مخرجات البحث' })}</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add Output', ar: 'إضافة مخرج' })}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t({ en: 'New Publication', ar: 'منشور جديد' })}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder={t({ en: 'Title', ar: 'العنوان' })}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <Input
              placeholder={t({ en: 'Authors (comma-separated)', ar: 'المؤلفون (بفاصلة)' })}
              value={formData.authors.join(', ')}
              onChange={(e) => setFormData({...formData, authors: e.target.value.split(',').map(a => a.trim())})}
            />
            <Input
              placeholder={t({ en: 'Journal/Conference', ar: 'المجلة/المؤتمر' })}
              value={formData.publication}
              onChange={(e) => setFormData({...formData, publication: e.target.value})}
            />
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder={t({ en: 'Year', ar: 'السنة' })}
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                className="w-32"
              />
              <Input
                type="url"
                placeholder={t({ en: 'URL', ar: 'الرابط' })}
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="flex-1"
              />
            </div>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="w-full">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t({ en: 'Add Publication', ar: 'إضافة المنشور' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
                <p className="text-3xl font-bold text-blue-600">{publications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Patents', ar: 'براءات' })}</p>
                <p className="text-3xl font-bold text-purple-600">{patents.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Datasets', ar: 'بيانات' })}</p>
                <p className="text-3xl font-bold text-green-600">{datasets.length}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t({ en: 'Publications', ar: 'المنشورات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {publications.map((pub, i) => (
              <div key={i} className="p-4 border rounded-lg hover:bg-slate-50">
                <h4 className="font-medium text-slate-900 mb-1">{pub.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{pub.authors?.join(', ')}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>{pub.publication}</span>
                  <span>•</span>
                  <span>{pub.year}</span>
                  {pub.url && (
                    <>
                      <span>•</span>
                      <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Link
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
            {publications.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{t({ en: 'No publications yet', ar: 'لا توجد منشورات' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}