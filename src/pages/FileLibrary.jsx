import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Download, Trash2, Search, FolderOpen } from 'lucide-react';
import { useKnowledgeDocuments } from '@/hooks/useKnowledgeDocuments';
import { useKnowledgeDocumentMutations } from '@/hooks/useKnowledgeDocumentMutations';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

export default function FileLibrary() {
  const { t, isRTL, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const { useAllDocuments } = useKnowledgeDocuments();
  const { data: knowledgeDocs = [] } = useAllDocuments();

  const { data: allChallenges = [] } = useChallengesWithVisibility();
  const challenges = allChallenges.filter(c => c.attachments && c.attachments.length > 0);

  const { uploadDocument, deleteDocument } = useKnowledgeDocumentMutations();

  const handleFileUpload = async (e, category) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadDocument.mutateAsync({ file, category });
    } finally {
      setUploading(false);
    }
  };



  const filteredDocs = knowledgeDocs.filter(doc =>
    doc.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title_ar?.includes(searchTerm)
  );

  const categories = {
    toolkit: { label: { en: 'Toolkits & Guides', ar: 'الأدوات والأدلة' }, icon: FileText, color: 'blue' },
    guideline: { label: { en: 'Guidelines', ar: 'الإرشادات' }, icon: FileText, color: 'purple' },
    research_paper: { label: { en: 'Research', ar: 'الأبحاث' }, icon: FileText, color: 'green' },
    report: { label: { en: 'Reports', ar: 'التقارير' }, icon: FileText, color: 'amber' }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'File Library', ar: 'مكتبة الملفات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Centralized document management', ar: 'إدارة مركزية للوثائق' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(categories).map(([key, cat]) => {
          const Icon = cat.icon;
          const count = knowledgeDocs.filter(d => d.doc_type === key).length;
          return (
            <Card key={key} className={`bg-gradient-to-br from-${cat.color}-50 to-white`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t(cat.label)}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{count}</p>
                  </div>
                  <Icon className={`h-8 w-8 text-${cat.color}-600`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Documents', ar: 'الوثائق' })}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                <Input
                  placeholder={t({ en: 'Search files...', ar: 'ابحث عن الملفات...' })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-64 ${isRTL ? 'pr-10' : 'pl-10'}`}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">{t({ en: 'All Files', ar: 'كل الملفات' })} ({filteredDocs.length})</TabsTrigger>
              <TabsTrigger value="upload">{t({ en: 'Upload', ar: 'رفع' })}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-6">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {language === 'ar' && doc.title_ar ? doc.title_ar : doc.title_en}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {doc.doc_type?.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(doc.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          {t({ en: 'Download', ar: 'تحميل' })}
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument.mutate(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No files found', ar: 'لم يتم العثور على ملفات' })}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(categories).map(([key, cat]) => (
                      <label key={key} className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, key)}
                          disabled={uploading}
                        />
                        <div className="p-6 border-2 border-dashed rounded-lg hover:border-blue-400 hover:bg-white transition-all text-center">
                          <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="font-medium text-slate-900">{t(cat.label)}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {t({ en: 'Click to upload', ar: 'انقر للرفع' })}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {uploading && (
                    <div className="text-center mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                      <p className="text-sm text-slate-600 mt-2">
                        {t({ en: 'Uploading...', ar: 'جاري الرفع...' })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}