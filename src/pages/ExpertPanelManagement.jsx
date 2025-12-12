import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Eye,
  UsersRound
} from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';

export default function ExpertPanelManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const [newPanel, setNewPanel] = useState({
    panel_name: '',
    entity_type: 'challenge',
    entity_id: '',
    panel_members: [],
    panel_chair_email: '',
    consensus_threshold: 75
  });

  const { data: panels = [], isLoading } = useQuery({
    queryKey: ['expert-panels'],
    queryFn: () => base44.entities.ExpertPanel.list('-created_date', 50)
  });

  const { data: experts = [] } = useQuery({
    queryKey: ['expert-profiles'],
    queryFn: () => base44.entities.ExpertProfile.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-panel'],
    queryFn: () => base44.entities.Challenge.list('-created_date', 100)
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-for-panel'],
    queryFn: () => base44.entities.Pilot.list('-created_date', 100)
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-for-panel'],
    queryFn: () => base44.entities.RDProject.list('-created_date', 100)
  });

  const { data: scalingPlans = [] } = useQuery({
    queryKey: ['scaling-plans-for-panel'],
    queryFn: () => base44.entities.ScalingPlan.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ExpertPanel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expert-panels']);
      toast.success(t({ en: 'Panel created', ar: 'تم إنشاء اللجنة' }));
      setShowCreate(false);
      setNewPanel({
        panel_name: '',
        entity_type: 'challenge',
        entity_id: '',
        panel_members: [],
        panel_chair_email: '',
        consensus_threshold: 75
      });
    }
  });

  const getEntitiesByType = () => {
    const map = {
      challenge: challenges,
      pilot: pilots,
      rd_project: rdProjects,
      scaling_plan: scalingPlans
    };
    return map[newPanel.entity_type] || [];
  };

  const toggleExpert = (email) => {
    setNewPanel(prev => ({
      ...prev,
      panel_members: prev.panel_members.includes(email)
        ? prev.panel_members.filter(e => e !== email)
        : [...prev.panel_members, email]
    }));
  };

  const verifiedExperts = experts.filter(e => e.is_verified && e.is_active);

  const statusColors = {
    forming: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    discussion: 'bg-purple-100 text-purple-700',
    consensus: 'bg-green-100 text-green-700',
    completed: 'bg-teal-100 text-teal-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <PageLayout>
      <PageHeader
        icon={UsersRound}
        title={t({ en: 'Expert Panel Management', ar: 'إدارة لجان الخبراء' })}
        description={t({ en: 'Create and manage multi-expert evaluation panels', ar: 'إنشاء وإدارة لجان التقييم متعددة الخبراء' })}
        stats={[
          { icon: Users, value: panels.length, label: t({ en: 'Total Panels', ar: 'إجمالي اللجان' }) },
          { icon: Clock, value: panels.filter(p => ['forming', 'reviewing', 'discussion'].includes(p.status)).length, label: t({ en: 'Active', ar: 'نشطة' }) },
          { icon: CheckCircle2, value: panels.filter(p => p.status === 'completed').length, label: t({ en: 'Completed', ar: 'مكتملة' }) },
        ]}
        action={
          <PersonaButton onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Create Panel', ar: 'إنشاء لجنة' })}
          </PersonaButton>
        }
      />

      {/* Create Panel Modal */}
      {showCreate && (
        <Card className="border-purple-300 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                {t({ en: 'Create New Panel', ar: 'إنشاء لجنة جديدة' })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t({ en: 'Panel Name', ar: 'اسم اللجنة' })}
              value={newPanel.panel_name}
              onChange={(e) => setNewPanel({ ...newPanel, panel_name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Entity Type', ar: 'نوع الكيان' })}
                </label>
                <Select value={newPanel.entity_type} onValueChange={(val) => setNewPanel({ ...newPanel, entity_type: val, entity_id: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenge">{t({ en: 'Challenge', ar: 'تحدي' })}</SelectItem>
                    <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجربة' })}</SelectItem>
                    <SelectItem value="rd_project">{t({ en: 'R&D Project', ar: 'مشروع بحث' })}</SelectItem>
                    <SelectItem value="scaling_plan">{t({ en: 'Scaling Plan', ar: 'خطة توسع' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Select Entity', ar: 'اختر الكيان' })}
                </label>
                <Select value={newPanel.entity_id} onValueChange={(val) => setNewPanel({ ...newPanel, entity_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Choose...', ar: 'اختر...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {getEntitiesByType().map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.title_en || entity.name_en || entity.code || 'Untitled'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Select Panel Members', ar: 'اختر أعضاء اللجنة' })} ({newPanel.panel_members.length})
              </label>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                {verifiedExperts.map((expert) => (
                  <div key={expert.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                    <Checkbox
                      checked={newPanel.panel_members.includes(expert.user_email)}
                      onCheckedChange={() => toggleExpert(expert.user_email)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{expert.title} {expert.user_email?.split('@')[0]}</p>
                      <p className="text-xs text-slate-500">{expert.position}</p>
                    </div>
                    {expert.expert_rating > 0 && (
                      <Badge variant="outline" className="text-xs">{expert.expert_rating.toFixed(1)} ⭐</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Panel Chair', ar: 'رئيس اللجنة' })}
              </label>
              <Select value={newPanel.panel_chair_email} onValueChange={(val) => setNewPanel({ ...newPanel, panel_chair_email: val })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select chair...', ar: 'اختر الرئيس...' })} />
                </SelectTrigger>
                <SelectContent>
                  {newPanel.panel_members.map((email) => {
                    const expert = experts.find(e => e.user_email === email);
                    return (
                      <SelectItem key={email} value={email}>
                        {expert?.title} {email.split('@')[0]}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Consensus Threshold (%)', ar: 'عتبة الإجماع (%)' })}
              </label>
              <Input
                type="number"
                value={newPanel.consensus_threshold}
                onChange={(e) => setNewPanel({ ...newPanel, consensus_threshold: parseInt(e.target.value) })}
                min={50}
                max={100}
              />
            </div>

            <Button
              onClick={() => createMutation.mutate({
                ...newPanel,
                creation_date: new Date().toISOString(),
                status: 'forming'
              })}
              disabled={!newPanel.panel_name || !newPanel.entity_id || newPanel.panel_members.length < 2 || createMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {t({ en: 'Create Panel', ar: 'إنشاء اللجنة' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Panels List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {panels.map((panel) => (
          <Card key={panel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{panel.panel_name}</CardTitle>
                <Badge className={statusColors[panel.status]}>
                  {panel.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{t({ en: 'Entity:', ar: 'الكيان:' })}</span>
                <Badge variant="outline">{panel.entity_type}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{t({ en: 'Members:', ar: 'الأعضاء:' })}</span>
                <span className="font-medium">{panel.panel_members?.length || 0}</span>
              </div>
              {panel.consensus_threshold && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{t({ en: 'Threshold:', ar: 'العتبة:' })}</span>
                  <span className="font-medium">{panel.consensus_threshold}%</span>
                </div>
              )}
              {panel.decision && (
                <Badge className={
                  panel.decision === 'approve' ? 'bg-green-100 text-green-700' :
                  panel.decision === 'reject' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }>
                  {panel.decision}
                </Badge>
              )}
              <Link to={createPageUrl(`ExpertPanelDetail?id=${panel.id}`)}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Eye className="h-4 w-4 mr-2" />
                  {t({ en: 'View Panel', ar: 'عرض اللجنة' })}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {panels.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">{t({ en: 'No panels created yet', ar: 'لم يتم إنشاء لجان بعد' })}</p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}