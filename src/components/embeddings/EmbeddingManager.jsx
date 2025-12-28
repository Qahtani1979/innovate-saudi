import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Zap, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useEmbeddingManager } from '@/hooks/usePlatformCore';

export default function EmbeddingManager({ entities = [] }) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(null);

  const { embedMutation, generating } = useEmbeddingManager();

  const embeddableEntities = [
    { name: 'Challenge', icon: '🎯', color: 'blue' },
    { name: 'Solution', icon: '💡', color: 'purple' },
    { name: 'KnowledgeDocument', icon: '📚', color: 'green' },
    { name: 'CitizenIdea', icon: '💭', color: 'orange' },
    { name: 'Organization', icon: '🏢', color: 'teal' },
    { name: 'Pilot', icon: '🧪', color: 'pink' },
    { name: 'RDProject', icon: '🔬', color: 'indigo' }
  ];

  const generateEmbeddings = async (entityName, mode) => {
    setProgress({ entity: entityName, status: 'processing' });

    embedMutation.mutate({ entityName, mode }, {
      onSuccess: (data) => {
        setProgress({
          entity: entityName,
          status: 'complete',
          ...data
        });

        toast.success(t({
          en: `Generated ${data.successful} embeddings for ${entityName}`,
          ar: `تم توليد ${data.successful} تضمينات لـ ${entityName}`
        }));
      },
      onError: (error) => {
        setProgress({ entity: entityName, status: 'error', error: error.message });
        toast.error(t({ en: 'Embedding generation failed', ar: 'فشل توليد التضمينات' }));
      }
    });
  };

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="h-6 w-6" />
          {t({ en: '🧠 Vector Embeddings Manager', ar: '🧠 مدير التضمينات المتجهة' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          {t({
            en: 'Generate AI embeddings for semantic search, duplicate detection, and intelligent matching',
            ar: 'توليد تضمينات ذكية للبحث الدلالي واكتشاف التكرار والمطابقة الذكية'
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {embeddableEntities.map(entity => {
            const entityData = entities.find(e => e.name === entity.name);
            const total = entityData?.count || 0;
            const withEmbedding = entityData?.with_embedding || 0;
            const coverage = total > 0 ? Math.round((withEmbedding / total) * 100) : 0;



            return (
              <div key={entity.name} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{entity.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{entity.name}</p>
                      <p className="text-xs text-slate-500">
                        {withEmbedding}/{total} embedded
                      </p>
                    </div>
                  </div>
                  <Badge className={`bg-${entity.color}-100 text-${entity.color}-700`}>
                    {coverage}%
                  </Badge>
                </div>

                <Progress value={coverage} className="h-2 mb-3" />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => generateEmbeddings(entity.name, 'missing')}
                    disabled={generating || withEmbedding === total}
                    className={`flex-1 bg-${entity.color}-600 hover:bg-${entity.color}-700 text-xs`}
                  >
                    {generating && progress?.entity === entity.name ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3 mr-1" />
                    )}
                    {t({ en: 'Generate Missing', ar: 'توليد الناقص' })}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateEmbeddings(entity.name, 'all')}
                    disabled={generating}
                    className="text-xs"
                  >
                    {t({ en: 'Regenerate All', ar: 'إعادة الكل' })}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {progress && (
          <div className={`p-4 rounded-lg border-2 ${progress.status === 'complete' ? 'border-green-300 bg-green-50' :
            progress.status === 'error' ? 'border-red-300 bg-red-50' :
              'border-blue-300 bg-blue-50'
            }`}>
            <div className="flex items-start gap-3">
              {progress.status === 'complete' && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />}
              {progress.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
              {progress.status === 'processing' && <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />}

              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {progress.entity} - {progress.status === 'complete' ? 'Complete' : progress.status === 'error' ? 'Error' : 'Processing...'}
                </p>
                {progress.status === 'complete' && (
                  <div className="text-sm text-slate-700 mt-1 space-y-1">
                    <p>✓ Processed: {progress.processed} entities</p>
                    <p>✓ Successful: {progress.successful}</p>
                    {progress.failed > 0 && <p className="text-amber-700">⚠ Failed: {progress.failed}</p>}
                  </div>
                )}
                {progress.status === 'error' && (
                  <p className="text-sm text-red-700 mt-1">{progress.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            {t({ en: '💡 How Embeddings Work', ar: '💡 كيف تعمل التضمينات' })}
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {t({ en: 'Converts text into 768-dimensional vectors', ar: 'تحويل النص إلى متجهات من 768 بعد' })}</li>
            <li>• {t({ en: 'Enables semantic search (meaning-based, not keyword)', ar: 'يمكّن البحث الدلالي (بناءً على المعنى وليس الكلمات)' })}</li>
            <li>• {t({ en: 'Powers AI matching (Challenge↔Solution)', ar: 'يدعم المطابقة الذكية (تحدي↔حل)' })}</li>
            <li>• {t({ en: 'Detects duplicates (CitizenIdea)', ar: 'يكتشف التكرارات (أفكار المواطنين)' })}</li>
            <li>• {t({ en: 'Uses Google Gemini text-embedding-004 model', ar: 'يستخدم نموذج Google Gemini text-embedding-004' })}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
