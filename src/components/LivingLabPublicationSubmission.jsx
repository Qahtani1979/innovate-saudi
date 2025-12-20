import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { FileText, X, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function LivingLabPublicationSubmission({ lab, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const [publication, setPublication] = useState({
    title: '',
    authors: [],
    author_input: '',
    publication_type: 'journal_article',
    journal_conference: '',
    year: new Date().getFullYear(),
    doi: '',
    url: '',
    abstract: '',
    keywords: [],
    keyword_input: '',
    impact_factor: '',
    citation_count: 0
  });

  const addAuthor = () => {
    if (publication.author_input.trim()) {
      setPublication({
        ...publication,
        authors: [...publication.authors, publication.author_input.trim()],
        author_input: ''
      });
    }
  };

  const addKeyword = () => {
    if (publication.keyword_input.trim()) {
      setPublication({
        ...publication,
        keywords: [...publication.keywords, publication.keyword_input.trim()],
        keyword_input: ''
      });
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const updatedPublications = [
        ...(lab.publications || []),
        {
          ...publication,
          authors: publication.authors,
          keywords: publication.keywords,
          submission_date: new Date().toISOString().split('T')[0],
          living_lab_id: lab.id
        }
      ];

      await base44.entities.LivingLab.update(lab.id, {
        publications: updatedPublications,
        total_publications: updatedPublications.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Publication submitted', ar: 'تم إرسال المنشور' }));
      onClose();
    }
  });

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          {t({ en: 'Submit Publication', ar: 'إرسال منشور' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-purple-900">{lab?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">Research Publication Submission</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Publication Title', ar: 'عنوان المنشور' })}
          </label>
          <Input
            value={publication.title}
            onChange={(e) => setPublication({ ...publication, title: e.target.value })}
            placeholder={t({ en: 'Enter publication title...', ar: 'أدخل عنوان المنشور...' })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Authors', ar: 'المؤلفون' })}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={publication.author_input}
              onChange={(e) => setPublication({ ...publication, author_input: e.target.value })}
              placeholder="Author name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
            />
            <Button onClick={addAuthor} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {publication.authors.map((author, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {author}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setPublication({ ...publication, authors: publication.authors.filter((_, idx) => idx !== i) })}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Publication Type', ar: 'نوع المنشور' })}
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={publication.publication_type}
              onChange={(e) => setPublication({ ...publication, publication_type: e.target.value })}
            >
              <option value="journal_article">Journal Article</option>
              <option value="conference_paper">Conference Paper</option>
              <option value="technical_report">Technical Report</option>
              <option value="white_paper">White Paper</option>
              <option value="dataset">Dataset</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Year', ar: 'السنة' })}
            </label>
            <Input
              type="number"
              value={publication.year}
              onChange={(e) => setPublication({ ...publication, year: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            {t({ en: 'Journal/Conference', ar: 'المجلة/المؤتمر' })}
          </label>
          <Input
            value={publication.journal_conference}
            onChange={(e) => setPublication({ ...publication, journal_conference: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">DOI</label>
            <Input
              value={publication.doi}
              onChange={(e) => setPublication({ ...publication, doi: e.target.value })}
              placeholder="10.xxxx/xxxxx"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">URL</label>
            <Input
              value={publication.url}
              onChange={(e) => setPublication({ ...publication, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Abstract', ar: 'الملخص' })}
          </label>
          <Textarea
            value={publication.abstract}
            onChange={(e) => setPublication({ ...publication, abstract: e.target.value })}
            rows={4}
            placeholder={t({ en: 'Publication abstract...', ar: 'ملخص المنشور...' })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Keywords', ar: 'الكلمات المفتاحية' })}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={publication.keyword_input}
              onChange={(e) => setPublication({ ...publication, keyword_input: e.target.value })}
              placeholder="Add keyword"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            />
            <Button onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {publication.keywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {kw}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setPublication({ ...publication, keywords: publication.keywords.filter((_, idx) => idx !== i) })}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!publication.title || publication.authors.length === 0 || submitMutation.isPending}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Submit Publication', ar: 'إرسال المنشور' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}