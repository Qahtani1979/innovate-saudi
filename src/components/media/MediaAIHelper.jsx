import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { 
  Sparkles, Loader2, TrendingUp, AlertTriangle, Archive, 
  Image, Video, FileText, Trash2, Download, Eye, ChevronDown, ChevronUp,
  RefreshCw, Lightbulb, BarChart3, Zap
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function MediaAIHelper({ files = [], stats = {}, onAction }) {
  const { t, language } = useLanguage();
  const [insights, setInsights] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { invokeAI, isLoading, isRateLimited, error } = useAIWithFallback({
    showToasts: true,
    fallbackData: null,
  });

  const analyzeMedia = async () => {
    if (!files || files.length === 0) return;

    // Prepare comprehensive summary data for AI analysis
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;

    const mediaSummary = {
      // Basic stats
      totalFiles: files.length,
      totalSize: files.reduce((acc, f) => acc + (f.file_size || 0), 0),
      
      // Type distribution
      byType: {},
      byBucket: {},
      byCategory: {},
      
      // Temporal analysis
      recentUploads: files.filter(f => new Date(f.created_at).getTime() > weekAgo).length,
      monthOld: files.filter(f => {
        const t = new Date(f.created_at).getTime();
        return t < monthAgo && t > threeMonthsAgo;
      }).length,
      staleFiles: files.filter(f => new Date(f.created_at).getTime() < threeMonthsAgo).length,
      
      // Engagement metrics
      noEngagement: files.filter(f => (f.view_count || 0) === 0 && (f.download_count || 0) === 0).length,
      lowEngagement: files.filter(f => {
        const total = (f.view_count || 0) + (f.download_count || 0);
        return total > 0 && total < 5;
      }).length,
      highEngagement: files.filter(f => (f.view_count || 0) > 10 || (f.download_count || 0) > 5).length,
      totalViews: files.reduce((acc, f) => acc + (f.view_count || 0), 0),
      totalDownloads: files.reduce((acc, f) => acc + (f.download_count || 0), 0),
      
      // Entity associations
      linkedToEntities: files.filter(f => f.entity_id).length,
      orphanedFiles: files.filter(f => !f.entity_id).length,
      entityTypes: {},
      
      // Content quality
      withDescription: files.filter(f => f.description || f.ai_description).length,
      withTags: files.filter(f => (f.tags?.length || 0) > 0 || (f.ai_tags?.length || 0) > 0).length,
      withAltText: files.filter(f => f.alt_text).length,
      
      // Storage optimization
      duplicateCandidates: findPotentialDuplicates(files),
      largeFiles: files.filter(f => (f.file_size || 0) > 10 * 1024 * 1024),
      veryLargeFiles: files.filter(f => (f.file_size || 0) > 50 * 1024 * 1024),
      
      // User activity
      uploaders: [...new Set(files.map(f => f.uploaded_by_email).filter(Boolean))].length,
      topUploaders: getTopUploaders(files, 3),
    };

    // Count distributions
    files.forEach(f => {
      const type = f.file_type || 'other';
      const bucket = f.bucket_id || 'unknown';
      const category = f.category || 'uncategorized';
      const entityType = f.entity_type || 'none';
      
      mediaSummary.byType[type] = (mediaSummary.byType[type] || 0) + 1;
      mediaSummary.byBucket[bucket] = (mediaSummary.byBucket[bucket] || 0) + 1;
      mediaSummary.byCategory[category] = (mediaSummary.byCategory[category] || 0) + 1;
      mediaSummary.entityTypes[entityType] = (mediaSummary.entityTypes[entityType] || 0) + 1;
    });

    const prompt = `Analyze this comprehensive media library data and provide actionable recommendations:

LIBRARY OVERVIEW:
- Total Files: ${mediaSummary.totalFiles}
- Total Size: ${formatBytes(mediaSummary.totalSize)}
- Unique Uploaders: ${mediaSummary.uploaders}

FILE DISTRIBUTION:
- By Type: ${JSON.stringify(mediaSummary.byType)}
- By Storage Bucket: ${JSON.stringify(mediaSummary.byBucket)}
- By Category: ${JSON.stringify(mediaSummary.byCategory)}

ENTITY ASSOCIATIONS:
- Linked to Entities: ${mediaSummary.linkedToEntities} (${Math.round(mediaSummary.linkedToEntities / mediaSummary.totalFiles * 100)}%)
- Orphaned Files: ${mediaSummary.orphanedFiles}
- Entity Types: ${JSON.stringify(mediaSummary.entityTypes)}

ENGAGEMENT METRICS:
- Total Views: ${mediaSummary.totalViews}
- Total Downloads: ${mediaSummary.totalDownloads}
- High Engagement (10+ views or 5+ downloads): ${mediaSummary.highEngagement}
- Low Engagement: ${mediaSummary.lowEngagement}
- Zero Engagement: ${mediaSummary.noEngagement}

TEMPORAL ANALYSIS:
- Recent Uploads (7 days): ${mediaSummary.recentUploads}
- 1-3 Months Old: ${mediaSummary.monthOld}
- Stale (3+ months, consider archiving): ${mediaSummary.staleFiles}

CONTENT QUALITY:
- With Descriptions: ${mediaSummary.withDescription} (${Math.round(mediaSummary.withDescription / mediaSummary.totalFiles * 100)}%)
- With Tags: ${mediaSummary.withTags} (${Math.round(mediaSummary.withTags / mediaSummary.totalFiles * 100)}%)
- With Alt Text: ${mediaSummary.withAltText} (${Math.round(mediaSummary.withAltText / mediaSummary.totalFiles * 100)}%)

STORAGE OPTIMIZATION:
- Potential Duplicates: ${mediaSummary.duplicateCandidates.length}
- Large Files (>10MB): ${mediaSummary.largeFiles.length}
- Very Large Files (>50MB): ${mediaSummary.veryLargeFiles.length}

Provide insights in ${language === 'ar' ? 'Arabic' : 'English'}.
Focus on actionable recommendations with specific file counts and potential impact.`;

    const result = await invokeAI({
      prompt,
      system_prompt: `You are a media library optimization assistant. Analyze media files and provide actionable recommendations for organization, cleanup, and optimization. Focus on practical, specific actions the user can take.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Brief overview of library health (1-2 sentences)'
          },
          healthScore: {
            type: 'number',
            description: 'Library health score from 0-100'
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['cleanup', 'optimize', 'organize', 'engagement', 'storage'] },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                title: { type: 'string' },
                description: { type: 'string' },
                action: { type: 'string', enum: ['delete_unused', 'archive_old', 'compress_large', 'rename_duplicates', 'review_engagement', 'organize_folders'] },
                affectedCount: { type: 'number' }
              },
              required: ['type', 'priority', 'title', 'description']
            }
          },
          quickStats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                trend: { type: 'string', enum: ['up', 'down', 'neutral'] }
              }
            }
          }
        },
        required: ['summary', 'healthScore', 'recommendations']
      }
    });

    if (result.success && result.data) {
      setInsights(result.data);
    }
  };

  const handleAction = (action, recommendation) => {
    console.log('[MediaAIHelper] Take Action clicked', action, recommendation);
    if (onAction) {
      onAction(action, recommendation);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'cleanup': return Trash2;
      case 'optimize': return Zap;
      case 'organize': return Archive;
      case 'engagement': return Eye;
      case 'storage': return BarChart3;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {t({ en: 'AI Media Assistant', ar: 'مساعد الوسائط الذكي' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Smart recommendations for your media library', ar: 'توصيات ذكية لمكتبة الوسائط' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={analyzeMedia}
                disabled={isLoading || files.length === 0}
                className="gap-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t({ en: 'Analyze', ar: 'تحليل' })}
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {isRateLimited && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t({ en: 'AI rate limit reached. Try again later.', ar: 'تم تجاوز حد الاستخدام. حاول لاحقاً.' })}</span>
              </div>
            )}

            {!insights && !isLoading && (
              <div className="text-center py-6 text-muted-foreground">
                <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'Click "Analyze" to get AI-powered insights', ar: 'انقر على "تحليل" للحصول على رؤى ذكية' })}</p>
                <p className="text-sm mt-1">
                  {t({ 
                    en: `${files.length} files ready for analysis`, 
                    ar: `${files.length} ملف جاهز للتحليل` 
                  })}
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">{t({ en: 'Analyzing your media library...', ar: 'جاري تحليل مكتبة الوسائط...' })}</p>
              </div>
            )}

            {insights && !isLoading && (
              <div className="space-y-4">
                {/* Health Score & Summary */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getHealthColor(insights.healthScore || 0)}`}>
                      {insights.healthScore || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">{t({ en: 'Health', ar: 'الصحة' })}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{insights.summary}</p>
                  </div>
                </div>

                {/* Quick Stats */}
                {insights.quickStats && insights.quickStats.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {insights.quickStats.map((stat, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-background border text-center">
                        <div className="text-lg font-semibold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                        {stat.trend && stat.trend !== 'neutral' && (
                          <TrendingUp className={`h-3 w-3 mx-auto mt-1 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-destructive rotate-180'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      {t({ en: 'Recommendations', ar: 'التوصيات' })}
                    </h4>
                    {insights.recommendations.map((rec, idx) => {
                      const TypeIcon = getTypeIcon(rec.type);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)} transition-colors hover:bg-muted/50`}
                        >
                          <div className="flex items-start gap-3">
                            <TypeIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{rec.title}</span>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {rec.priority}
                                </Badge>
                                {rec.affectedCount && (
                                  <Badge variant="secondary" className="text-xs">
                                    {rec.affectedCount} {t({ en: 'files', ar: 'ملف' })}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              {rec.action && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="mt-2 h-7 text-xs"
                                  onClick={() => handleAction(rec.action, rec)}
                                >
                                  {t({ en: 'Take Action', ar: 'اتخاذ إجراء' })}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Helper functions
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function findPotentialDuplicates(files) {
  const sizeMap = {};
  files.forEach(f => {
    const key = `${f.file_size}-${f.file_type}`;
    if (!sizeMap[key]) sizeMap[key] = [];
    sizeMap[key].push(f);
  });
  return Object.values(sizeMap).filter(group => group.length > 1).flat();
}

function getTopUploaders(files, count) {
  const uploaderCounts = {};
  files.forEach(f => {
    if (f.uploaded_by_email) {
      uploaderCounts[f.uploaded_by_email] = (uploaderCounts[f.uploaded_by_email] || 0) + 1;
    }
  });
  return Object.entries(uploaderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([email, count]) => ({ email, count }));
}
