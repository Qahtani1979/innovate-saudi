import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKnowledgeMutations } from '../hooks/useKnowledgeMutations';
import { useKnowledgeDocuments } from '../hooks/useKnowledgeDocuments';
import ProtectedPage from '../components/permissions/ProtectedPage';

function KnowledgeDocumentEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const docId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { triggerEmail } = useEmailTrigger();

  const { useDocument } = useKnowledgeDocuments();
  const { data: doc, isLoading } = useDocument(docId);

  const [formData, setFormData] = useState(/** @type {any} */({}));

  React.useEffect(() => {
    if (doc) setFormData(doc);
  }, [doc]);

  const { updateDocument } = useKnowledgeMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit Document', ar: 'تعديل المستند' })}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t({ en: 'Document Information', ar: 'معلومات المستند' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
              <Input
                value={formData.title_en || ''}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input
                value={formData.title_ar || ''}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Document Type', ar: 'نوع المستند' })}</Label>
            <Select value={formData.doc_type} onValueChange={(value) => setFormData({ ...formData, doc_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toolkit">Toolkit</SelectItem>
                <SelectItem value="guideline">Guideline</SelectItem>
                <SelectItem value="research_paper">Research Paper</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="best_practice">Best Practice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Knowledge'))}
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => updateDocument.mutate({ id: docId, updates: formData })}
              disabled={updateDocument.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {updateDocument.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(KnowledgeDocumentEdit, { requiredPermissions: ['knowledge_edit'] });