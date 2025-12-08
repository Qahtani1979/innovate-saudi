import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, LayoutGrid, Columns, Sparkles, Loader2, X, Download, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import BulkActionsToolbar from '../components/portfolio/BulkActionsToolbar';
import PortfolioExportDialog from '../components/portfolio/PortfolioExportDialog';
import TimelineGanttView from '../components/portfolio/TimelineGanttView';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PortfolioPage() {
  const { language, isRTL, t } = useLanguage();
  const [viewMode, setViewMode] = useState('kanban');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [filterSector, setFilterSector] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  
  const stages = [
    { id: 'discover', label: { en: 'Discover', ar: 'اكتشاف' }, color: 'bg-slate-100' },
    { id: 'validate', label: { en: 'Validate', ar: 'تحقق' }, color: 'bg-blue-100' },
    { id: 'experiment', label: { en: 'Experiment', ar: 'تجربة' }, color: 'bg-purple-100' },
    { id: 'pilot', label: { en: 'Pilot', ar: 'تجريب' }, color: 'bg-green-100' },
    { id: 'scale', label: { en: 'Scale', ar: 'توسع' }, color: 'bg-orange-100' },
    { id: 'institutionalize', label: { en: 'Institutionalize', ar: 'مأسسة' }, color: 'bg-teal-100' }
  ];

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const [items, setItems] = useState({
    discover: challenges.filter(c => c.status === 'submitted').slice(0, 5),
    validate: challenges.filter(c => c.status === 'under_review').slice(0, 3),
    experiment: [],
    pilot: challenges.filter(c => c.track === 'pilot').slice(0, 4),
    scale: [],
    institutionalize: []
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const sourceItems = Array.from(items[source.droppableId]);
    const destItems = Array.from(items[destination.droppableId]);
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setItems({
      ...items,
      [source.droppableId]: sourceItems,
      [destination.droppableId]: destItems
    });
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    setAiLoading(true);
    try {
      const stageCounts = stages.map(s => ({
        stage: s.id,
        count: items[s.id]?.length || 0
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this innovation portfolio pipeline for Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Pipeline Distribution: ${JSON.stringify(stageCounts)}
Total Items: ${Object.values(items).flat().length}

Stage Details:
${stages.map(s => `${s.id}: ${items[s.id]?.length || 0} items`).join('\n')}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Pipeline health assessment and bottleneck identification
2. Stage transition recommendations
3. Resource allocation suggestions
4. Acceleration strategies for stuck items
5. Portfolio balancing recommendations`,
        response_json_schema: {
          type: 'object',
          properties: {
            pipeline_health: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            transition_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            resource_allocation: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            acceleration_strategies: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            balancing_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });
      setAiInsights(result);
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Innovation Portfolio', ar: 'محفظة الابتكار' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Track innovation from discovery to institutionalization', ar: 'تتبع الابتكار من الاكتشاف إلى المأسسة' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</option>
            {sectors.map(s => (
              <option key={s.id} value={s.code}>{language === 'ar' ? s.name_ar : s.name_en}</option>
            ))}
          </select>
          <Button variant="outline" className="gap-2" onClick={() => setShowTimeline(!showTimeline)}>
            <Calendar className="h-4 w-4" />
            {t({ en: 'Timeline', ar: 'جدول زمني' })}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4" />
            {t({ en: 'Export', ar: 'تصدير' })}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleAIInsights}>
            <Sparkles className="h-4 w-4" />
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('matrix')}
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <BulkActionsToolbar
        selectedItems={selectedItems}
        onComplete={() => { setSelectedItems([]); }}
        onClear={() => setSelectedItems([])}
      />

      <PortfolioExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={challenges}
      />

      {showTimeline && <TimelineGanttView items={pilots} />}

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-teal-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Pipeline Insights', ar: 'رؤى خط الابتكار الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing portfolio...', ar: 'جاري تحليل المحفظة...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.pipeline_health?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Pipeline Health', ar: 'صحة خط الابتكار' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.pipeline_health.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.transition_recommendations?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Stage Transitions', ar: 'انتقالات المراحل' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.transition_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.resource_allocation?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Resource Allocation', ar: 'تخصيص الموارد' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.resource_allocation.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.acceleration_strategies?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Acceleration', ar: 'التسريع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.acceleration_strategies.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.balancing_recommendations?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Portfolio Balance', ar: 'توازن المحفظة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.balancing_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <Card key={stage.id} className={stage.color}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {stage.label[language]}
                  <Badge variant="outline" className="ml-2">
                    {items[stage.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-2 ${
                        snapshot.isDraggingOver ? 'bg-white/50 rounded-lg' : ''
                      }`}
                    >
                      {items[stage.id]?.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`cursor-move ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-slate-400 mt-1" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-900 line-clamp-2">
                                      {item.title_en}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {item.code}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Item', ar: 'العنصر' })}</th>
                    {stages.map(stage => (
                      <th key={stage.id} className="text-center p-4 text-sm font-semibold">{stage.label[language]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {challenges.slice(0, 10).map((challenge) => (
                    <tr key={challenge.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{challenge.title_en}</p>
                          <p className="text-xs text-slate-500">{challenge.code}</p>
                        </div>
                      </td>
                      {stages.map(stage => (
                        <td key={stage.id} className="p-4 text-center">
                          <div className={`w-8 h-8 rounded-full mx-auto ${
                            challenge.track === 'pilot' && stage.id === 'pilot' ? 'bg-green-500' :
                            challenge.status === 'submitted' && stage.id === 'discover' ? 'bg-blue-500' :
                            challenge.status === 'under_review' && stage.id === 'validate' ? 'bg-purple-500' :
                            'bg-slate-200'
                          }`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(PortfolioPage, { requiredPermissions: ['portfolio_view'] });