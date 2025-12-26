import { useState } from 'react';
import { useRDMutations } from '@/hooks/useRDMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Plus, ExternalLink, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function PublicationTracker({ projectId, publications }) {
  const { language, t } = useLanguage();
  const { updateProject } = useRDMutations();
  const [adding, setAdding] = useState(false);
  const [newPub, setNewPub] = useState({ title: '', journal: '', year: '', doi: '' });

  const addPublication = async () => {
    if (!newPub.title) {
      toast.error(t({ en: 'Title required', ar: 'العنوان مطلوب' }));
      return;
    }

    const newPublications = [...(publications || []), {
      ...newPub,
      citations: 0,
      added_date: new Date().toISOString()
    }];

    updateProject.mutate({
      id: projectId,
      data: { publications: newPublications }
    }, {
      onSuccess: () => {
        setNewPub({ title: '', journal: '', year: '', doi: '' });
        setAdding(false);
        // toast handled by hook mostly, but component had custom message
        // hook has generic 'Project updated'
      }
    });
  };

  const yearlyData = publications?.reduce((acc, pub) => {
    const year = pub.year || new Date().getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(yearlyData || {}).map(([year, count]) => ({
    year,
    count
  }));

  const totalCitations = publications?.reduce((sum, p) => sum + (p.citations || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t({ en: 'Research Outputs', ar: 'مخرجات البحث' })}
          </CardTitle>
          <Button size="sm" onClick={() => setAdding(!adding)} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            {t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-2xl font-bold text-blue-600">{publications?.length || 0}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Publications', ar: 'المنشورات' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-600">{totalCitations}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Citations', ar: 'الاستشهادات' })}</p>
          </div>
        </div>

        {adding && (
          <div className="p-4 border-2 border-blue-300 rounded-lg space-y-3 bg-blue-50">
            <Input
              placeholder={t({ en: 'Publication title', ar: 'عنوان النشر' })}
              value={newPub.title}
              onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t({ en: 'Journal', ar: 'المجلة' })}
                value={newPub.journal}
                onChange={(e) => setNewPub({ ...newPub, journal: e.target.value })}
              />
              <Input
                placeholder={t({ en: 'Year', ar: 'السنة' })}
                type="number"
                value={newPub.year}
                onChange={(e) => setNewPub({ ...newPub, year: e.target.value })}
              />
            </div>
            <Input
              placeholder="DOI"
              value={newPub.doi}
              onChange={(e) => setNewPub({ ...newPub, doi: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addPublication} className="flex-1">
                {t({ en: 'Save', ar: 'حفظ' })}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              {t({ en: 'Publications by Year', ar: 'المنشورات حسب السنة' })}
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-2">
          {publications?.slice(0, 5).map((pub, idx) => (
            <div key={idx} className="p-3 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{pub.title}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {pub.journal} ({pub.year})
                  </p>
                  {pub.citations > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {pub.citations} citations
                    </Badge>
                  )}
                </div>
                {pub.doi && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
