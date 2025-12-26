import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import {
  FlaskConical, Plus, Play, Pause, CheckCircle
} from 'lucide-react';
import { useABExperimentMutations } from '@/hooks/useABExperimentMutations';

export default function ABTestingManager() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    variants: ['control', 'treatment'],
    allocation_percentages: { control: 50, treatment: 50 }
  });

  const { createExperiment, updateExperimentStatus, useAllExperiments, useExperimentStats } = useABExperimentMutations();
  const { data: experiments = [], isLoading } = useAllExperiments();
  const { data: experimentStats = {} } = useExperimentStats(experiments);

  const handleCreate = () => {
    createExperiment.mutate({
      ...newExperiment,
      userEmail: user?.email
    }, {
      onSuccess: () => {
        setNewExperiment({
          name: '',
          description: '',
          variants: ['control', 'treatment'],
          allocation_percentages: { control: 50, treatment: 50 }
        });
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            {t({ en: 'A/B Testing Manager', ar: 'مدير اختبارات A/B' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="experiments">
            <TabsList className="mb-4">
              <TabsTrigger value="experiments">
                {t({ en: 'Experiments', ar: 'التجارب' })}
              </TabsTrigger>
              <TabsTrigger value="create">
                {t({ en: 'Create New', ar: 'إنشاء جديد' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="experiments" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : experiments.length === 0 ? (
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No experiments yet', ar: 'لا توجد تجارب بعد' })}</p>
                </div>
              ) : (
                experiments.map((exp) => {
                  const stats = experimentStats[exp.id] || { totalParticipants: 0, variants: {} };
                  return (
                    <Card key={exp.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{exp.name}</h4>
                              <Badge className={getStatusColor(exp.status)}>
                                {exp.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">{exp.description}</p>

                            {/* Variant Stats */}
                            <div className="grid grid-cols-2 gap-4">
                              {(exp.variants || ['control', 'treatment']).map((variant) => {
                                const vStats = stats.variants?.[variant] || { participants: 0, conversions: 0, rate: 0 };
                                return (
                                  <div key={variant} className="p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-sm capitalize">{variant}</span>
                                      <Badge variant="outline">{exp.allocation_percentages?.[variant] || 50}%</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <p className="text-slate-500">Users</p>
                                        <p className="font-semibold">{vStats.participants}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-500">Conversions</p>
                                        <p className="font-semibold">{vStats.conversions}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-500">Rate</p>
                                        <p className="font-semibold text-green-600">{vStats.rate}%</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 ml-4">
                            {exp.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: 'active' })}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {exp.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: 'paused' })}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {exp.status === 'paused' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: 'active' })}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: 'completed' })}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>{t({ en: 'Experiment Name', ar: 'اسم التجربة' })}</Label>
                  <Input
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                    placeholder="e.g., onboarding_wizard_v2"
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                  <Textarea
                    value={newExperiment.description}
                    onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                    placeholder="What are you testing?"
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Variants & Allocation', ar: 'المتغيرات والتوزيع' })}</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm mb-2">Control</p>
                      <Input
                        type="number"
                        value={newExperiment.allocation_percentages.control}
                        onChange={(e) => setNewExperiment({
                          ...newExperiment,
                          allocation_percentages: {
                            ...newExperiment.allocation_percentages,
                            control: parseInt(e.target.value) || 0
                          }
                        })}
                        suffix="%"
                      />
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm mb-2">Treatment</p>
                      <Input
                        type="number"
                        value={newExperiment.allocation_percentages.treatment}
                        onChange={(e) => setNewExperiment({
                          ...newExperiment,
                          allocation_percentages: {
                            ...newExperiment.allocation_percentages,
                            treatment: parseInt(e.target.value) || 0
                          }
                        })}
                        suffix="%"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={!newExperiment.name || createExperiment.isPending}
                  className="w-full bg-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Experiment', ar: 'إنشاء التجربة' })}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
