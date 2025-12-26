import { useState } from 'react';
import { useExpertPanelMutations } from '@/hooks/useExpertPanelMutations';
import { useExpertPanels, usePanelChallenges, usePanelPilots, usePanelRDProjects, usePanelScalingPlans } from '@/hooks/useExpertPanelData';
import { useExperts } from '@/hooks/useExpertData';
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
  CheckCircle2,
  Clock,
  X,
  Eye,
  UsersRound
} from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';

export default function ExpertPanelManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const { language, isRTL, t } = useLanguage();

  const [newPanel, setNewPanel] = useState({
    panel_name: '',
    entity_type: 'challenge',
    entity_id: '',
    panel_members: [],
    panel_chair_email: '',
    consensus_threshold: 75
  });

  // Hooks usage
  const { data: panels = [], isLoading } = useExpertPanels();
  const { data: experts = [] } = useExperts();

  const { data: challenges = [] } = usePanelChallenges();
  const { data: pilots = [] } = usePanelPilots();
  const { data: rdProjects = [] } = usePanelRDProjects();
  const { data: scalingPlans = [] } = usePanelScalingPlans();

  const { createPanel } = useExpertPanelMutations();

  const handleCreatePanel = () => {
    createPanel.mutate({
      ...newPanel,
      creation_date: new Date().toISOString(),
      status: 'forming'
    }, {
      onSuccess: () => {
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
  };


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
        title={t({ en: 'Expert Panel Management', ar: 'Ø¥Ø¯Ø§Ø±Ø© Ù„Ø¬Ø§Ù† Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡' })}
        description={t({ en: 'Create and manage multi-expert evaluation panels', ar: 'Ø¥Ù†Ø´Ø§Ø¡ ÙˆØ¥Ø¯Ø§Ø±Ø© Ù„Ø¬Ø§Ù† Ø§Ù„ØªÙ‚ÙŠÙŠÙ… Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡' })}
        stats={[
          { icon: Users, value: panels.length, label: t({ en: 'Total Panels', ar: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù„Ø¬Ø§Ù†' }) },
          { icon: Clock, value: panels.filter(p => ['forming', 'reviewing', 'discussion'].includes(p.status)).length, label: t({ en: 'Active', ar: 'Ù†Ø´Ø·Ø©' }) },
          { icon: CheckCircle2, value: panels.filter(p => p.status === 'completed').length, label: t({ en: 'Completed', ar: 'Ù…ÙƒØªÙ…Ù„Ø©' }) },
        ]}
        action={
          <PersonaButton onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Create Panel', ar: 'Ø¥Ù†Ø´Ø§Ø¡ Ù„Ø¬Ù†Ø©' })}
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
                {t({ en: 'Create New Panel', ar: 'Ø¥Ù†Ø´Ø§Ø¡ Ù„Ø¬Ù†Ø© Ø¬Ø¯ÙŠØ¯Ø©' })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t({ en: 'Panel Name', ar: 'Ø§Ø³Ù… Ø§Ù„Ù„Ø¬Ù†Ø©' })}
              value={newPanel.panel_name}
              onChange={(e) => setNewPanel({ ...newPanel, panel_name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Entity Type', ar: 'Ù†ÙˆØ¹ Ø§Ù„ÙƒÙŠØ§Ù†' })}
                </label>
                <Select value={newPanel.entity_type} onValueChange={(val) => setNewPanel({ ...newPanel, entity_type: val, entity_id: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenge">{t({ en: 'Challenge', ar: 'ØªØ­Ø¯ÙŠ' })}</SelectItem>
                    <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'ØªØ¬Ø±Ø¨Ø©' })}</SelectItem>
                    <SelectItem value="rd_project">{t({ en: 'R&D Project', ar: 'Ù…Ø´Ø±ÙˆØ¹ Ø¨Ø­Ø«' })}</SelectItem>
                    <SelectItem value="scaling_plan">{t({ en: 'Scaling Plan', ar: 'Ø®Ø·Ø© ØªÙˆØ³Ø¹' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Select Entity', ar: 'Ø§Ø®ØªØ± Ø§Ù„ÙƒÙŠØ§Ù†' })}
                </label>
                <Select value={newPanel.entity_id} onValueChange={(val) => setNewPanel({ ...newPanel, entity_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Choose...', ar: 'Ø§Ø®ØªØ±...' })} />
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
                {t({ en: 'Select Panel Members', ar: 'Ø§Ø®ØªØ± Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ù„Ø¬Ù†Ø©' })} ({newPanel.panel_members.length})
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
                      <Badge variant="outline" className="text-xs">{expert.expert_rating.toFixed(1)} â­</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Panel Chair', ar: 'Ø±Ø¦ÙŠØ³ Ø§Ù„Ù„Ø¬Ù†Ø©' })}
              </label>
              <Select value={newPanel.panel_chair_email} onValueChange={(val) => setNewPanel({ ...newPanel, panel_chair_email: val })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select chair...', ar: 'Ø§Ø®ØªØ± Ø§Ù„Ø±Ø¦ÙŠØ³...' })} />
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
                {t({ en: 'Consensus Threshold (%)', ar: 'Ø¹ØªØ¨Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ø¹ (%)' })}
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
              onClick={handleCreatePanel}
              disabled={!newPanel.panel_name || !newPanel.entity_id || newPanel.panel_members.length < 2 || createPanel.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {t({ en: 'Create Panel', ar: 'Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù„Ø¬Ù†Ø©' })}
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
                <span className="text-slate-600">{t({ en: 'Entity:', ar: 'Ø§Ù„ÙƒÙŠØ§Ù†:' })}</span>
                <Badge variant="outline">{panel.entity_type}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{t({ en: 'Members:', ar: 'Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡:' })}</span>
                <span className="font-medium">{panel.panel_members?.length || 0}</span>
              </div>
              {panel.consensus_threshold && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{t({ en: 'Threshold:', ar: 'Ø§Ù„Ø¹ØªØ¨Ø©:' })}</span>
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
                  {t({ en: 'View Panel', ar: 'Ø¹Ø±Ø¶ Ø§Ù„Ù„Ø¬Ù†Ø©' })}
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
            <p className="text-slate-600">{t({ en: 'No panels created yet', ar: 'Ù„Ù… ÙŠØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ù„Ø¬Ø§Ù† Ø¨Ø¹Ø¯' })}</p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
