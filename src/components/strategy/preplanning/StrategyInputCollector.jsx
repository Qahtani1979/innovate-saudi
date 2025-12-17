import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStrategyInputs } from '@/hooks/strategy/useStrategyInputs';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { STRATEGY_INPUT_SYSTEM_PROMPT, buildStrategyInputPrompt, STRATEGY_INPUT_SCHEMA } from '@/lib/ai/prompts/strategy/preplanning';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Download,
  Building2,
  Users,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Filter,
  Search,
  Tag,
  TrendingUp,
  BarChart3,
  Send
} from 'lucide-react';

const StrategyInputCollector = ({ strategicPlanId, onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  
  // Database integration hook
  const { 
    inputs: dbInputs, 
    loading: dbLoading, 
    saving: dbSaving, 
    saveInput: saveToDb,
    voteOnInput,
    deleteInput: deleteFromDb 
  } = useStrategyInputs(strategicPlanId);

  const sourceTypes = [
    { id: 'municipality', label: { en: 'Municipality', ar: 'البلدية' }, icon: Building2, color: 'bg-blue-500' },
    { id: 'department', label: { en: 'Department', ar: 'الإدارة' }, icon: Building2, color: 'bg-green-500' },
    { id: 'citizen', label: { en: 'Citizen', ar: 'مواطن' }, icon: Users, color: 'bg-purple-500' },
    { id: 'expert', label: { en: 'Expert', ar: 'خبير' }, icon: Lightbulb, color: 'bg-amber-500' },
    { id: 'stakeholder', label: { en: 'Stakeholder', ar: 'أصحاب المصلحة' }, icon: Users, color: 'bg-red-500' }
  ];

  const [inputs, setInputs] = useState([]);

  // Sync with database data when loaded
  useEffect(() => {
    if (dbInputs && !dbLoading && dbInputs.length > 0) {
      setInputs(dbInputs);
    }
  }, [dbInputs, dbLoading]);

  const [editingInput, setEditingInput] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const [formData, setFormData] = useState({
    source_type: 'municipality',
    source_name: '',
    input_text: '',
    theme: '',
    sentiment: 'neutral'
  });

  const handleAddInput = () => {
    setEditingInput(null);
    setFormData({
      source_type: 'municipality',
      source_name: '',
      input_text: '',
      theme: '',
      sentiment: 'neutral'
    });
    setIsDialogOpen(true);
  };

  const handleSaveInput = async () => {
    const newInput = {
      id: editingInput?.id || `input-${Date.now()}`,
      ...formData,
      priority_votes: editingInput?.priority_votes || 0,
      ai_extracted_themes: editingInput?.ai_extracted_themes || [],
      created_at: editingInput?.created_at || new Date().toISOString().split('T')[0]
    };

    // Save to database
    const result = await saveToDb(newInput);
    if (result) {
      setInputs(prev => {
        const existingIndex = prev.findIndex(i => i.id === result.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = result;
          return updated;
        }
        return [...prev, result];
      });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteInput = async (id) => {
    const success = await deleteFromDb(id);
    if (success) {
      setInputs(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleVote = async (id, direction) => {
    await voteOnInput(id, direction);
    setInputs(prev => prev.map(i => 
      i.id === id 
        ? { ...i, priority_votes: i.priority_votes + (direction === 'up' ? 1 : -1) }
        : i
    ));
  };

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare existing inputs for analysis
      const inputTexts = inputs.map(input => input.input_text).join('\n---\n');
      
      const result = await invokeAI({
        system_prompt: STRATEGY_INPUT_SYSTEM_PROMPT,
        prompt: buildStrategyInputPrompt(inputTexts),
        response_json_schema: STRATEGY_INPUT_SCHEMA
      });

      if (result.success && result.data?.inputs) {
        const aiInputs = result.data.inputs;
        
        // Save each new input to database
        for (const input of aiInputs) {
          const newInput = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source_type: input.source_type,
            source_name: input.source_name,
            input_text: input.input_text,
            theme: input.theme,
            sentiment: input.sentiment,
            priority_votes: 0,
            ai_extracted_themes: input.ai_extracted_themes || [],
            created_at: new Date().toISOString().split('T')[0]
          };
          
          const saved = await saveToDb(newInput);
          if (saved) {
            setInputs(prev => [...prev, saved]);
          }
        }
        
        toast({
          title: t({ en: 'AI Analysis Complete', ar: 'اكتمل تحليل الذكاء الاصطناعي' }),
          description: t({ en: `${aiInputs.length} strategic inputs analyzed and saved.`, ar: `تم تحليل وحفظ ${aiInputs.length} مدخلات استراتيجية.` })
        });
      } else {
        toast({
          title: t({ en: 'AI Analysis Failed', ar: 'فشل التحليل' }),
          description: t({ en: 'Unable to analyze inputs. Please try again.', ar: 'تعذر تحليل المدخلات. يرجى المحاولة مرة أخرى.' }),
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: t({ en: 'An error occurred during AI analysis.', ar: 'حدث خطأ أثناء تحليل الذكاء الاصطناعي.' }),
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredInputs = inputs.filter(i => {
    const matchesSource = selectedSource === 'all' || i.source_type === selectedSource;
    const matchesSearch = searchTerm === '' || 
      i.input_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.source_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  }).sort((a, b) => b.priority_votes - a.priority_votes);

  const getThemeStats = () => {
    const themes = {};
    inputs.forEach(input => {
      input.ai_extracted_themes.forEach(theme => {
        themes[theme] = (themes[theme] || 0) + 1;
      });
    });
    return Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  const getSentimentStats = () => ({
    positive: inputs.filter(i => i.sentiment === 'positive').length,
    neutral: inputs.filter(i => i.sentiment === 'neutral').length,
    negative: inputs.filter(i => i.sentiment === 'negative').length
  });

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      inputs: inputs,
      summary: {
        total: inputs.length,
        bySource: sourceTypes.map(s => ({
          type: s.id,
          count: inputs.filter(i => i.source_type === s.id).length
        })),
        themes: getThemeStats(),
        sentiment: getSentimentStats()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-inputs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: t({ en: 'Export Complete', ar: 'اكتمل التصدير' }),
      description: t({ en: 'Strategy inputs exported.', ar: 'تم تصدير المدخلات الاستراتيجية.' })
    });
  };

  const sentimentStats = getSentimentStats();
  const themeStats = getThemeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t({ en: 'Strategy Input Collector', ar: 'جامع المدخلات الاستراتيجية' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Collect, aggregate, and analyze inputs from municipalities, departments, citizens, and experts',
                  ar: 'جمع وتجميع وتحليل المدخلات من البلديات والإدارات والمواطنين والخبراء'
                })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAIAnalyze} disabled={isAnalyzing}>
                <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {t({ en: 'AI Analyze', ar: 'تحليل ذكي' })}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
              <Button onClick={handleAddInput}>
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Input', ar: 'إضافة مدخل' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{inputs.length}</div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Total Inputs', ar: 'إجمالي المدخلات' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{sentimentStats.positive}</div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Positive', ar: 'إيجابي' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{sentimentStats.neutral}</div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Neutral', ar: 'محايد' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{sentimentStats.negative}</div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Needs Attention', ar: 'يحتاج اهتمام' })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Cloud */}
      {themeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t({ en: 'Extracted Themes', ar: 'المواضيع المستخرجة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {themeStats.map(([theme, count]) => (
                <Badge key={theme} variant="secondary" className="text-sm py-1 px-3">
                  {theme} <span className="ml-1 text-primary">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Filters */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedSource === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedSource('all')}
        >
          {t({ en: 'All Sources', ar: 'جميع المصادر' })}
        </Button>
        {sourceTypes.map(source => {
          const Icon = source.icon;
          const count = inputs.filter(i => i.source_type === source.id).length;
          return (
            <Button 
              key={source.id}
              variant={selectedSource === source.id ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedSource(source.id)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {t(source.label)} ({count})
            </Button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t({ en: 'Search inputs...', ar: 'البحث في المدخلات...' })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Inputs List */}
      <div className="space-y-4">
        {filteredInputs.map(input => {
          const source = sourceTypes.find(s => s.id === input.source_type);
          const Icon = source?.icon || MessageSquare;
          
          return (
            <Card key={input.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleVote(input.id, 'up')}>
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg">{input.priority_votes}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleVote(input.id, 'down')}>
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full ${source?.color || 'bg-gray-500'} flex items-center justify-center`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium">{input.source_name}</span>
                      <Badge variant={
                        input.sentiment === 'positive' ? 'default' : 
                        input.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }>
                        {input.sentiment === 'positive' ? t({ en: 'Positive', ar: 'إيجابي' }) :
                         input.sentiment === 'negative' ? t({ en: 'Negative', ar: 'سلبي' }) :
                         t({ en: 'Neutral', ar: 'محايد' })}
                      </Badge>
                      {input.theme && <Badge variant="outline">{input.theme}</Badge>}
                    </div>
                    
                    <p className="text-sm mb-3">{input.input_text}</p>
                    
                    {input.ai_extracted_themes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {input.ai_extracted_themes.map((theme, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingInput(input);
                      setFormData({ ...input });
                      setIsDialogOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInput(input.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInput 
                ? t({ en: 'Edit Input', ar: 'تعديل المدخل' })
                : t({ en: 'Add Strategy Input', ar: 'إضافة مدخل استراتيجي' })
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Source Type', ar: 'نوع المصدر' })}</Label>
                <Select value={formData.source_type} onValueChange={(v) => setFormData({ ...formData, source_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTypes.map(s => (
                      <SelectItem key={s.id} value={s.id}>{t(s.label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Source Name', ar: 'اسم المصدر' })}</Label>
                <Input
                  value={formData.source_name}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t({ en: 'Input Text', ar: 'نص المدخل' })}</Label>
              <Textarea
                value={formData.input_text}
                onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Theme', ar: 'الموضوع' })}</Label>
                <Input
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Sentiment', ar: 'المشاعر' })}</Label>
                <Select value={formData.sentiment} onValueChange={(v) => setFormData({ ...formData, sentiment: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">{t({ en: 'Positive', ar: 'إيجابي' })}</SelectItem>
                    <SelectItem value="neutral">{t({ en: 'Neutral', ar: 'محايد' })}</SelectItem>
                    <SelectItem value="negative">{t({ en: 'Negative', ar: 'سلبي' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSaveInput}>
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyInputCollector;
