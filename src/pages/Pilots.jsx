import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Archive
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import ExportData from '../components/ExportData';
import { createNotification } from '../components/AutoNotification';
import PilotsAIInsights from '../components/pilots/PilotsAIInsights';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';

function PilotsPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedIds, setSelectedIds] = useState([]);
  const queryClient = useQueryClient();
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-created_date', 100)
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pilot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pilots']);
      toast.success('Pilot deleted');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => base44.entities.Pilot.update(id, { stage: 'terminated' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pilots']);
      toast.success('Pilot archived');
    }
  });

  const handleBulkAction = async (action) => {
    if (action === 'clear') {
      setSelectedIds([]);
      return;
    }
    if (selectedIds.length === 0) return;
    
    if (action === 'archive') {
      for (const id of selectedIds) {
        await base44.entities.Pilot.update(id, { stage: 'terminated' });
      }
      toast.success(`${selectedIds.length} pilots archived`);
    } else if (action === 'delete') {
      if (confirm(`Delete ${selectedIds.length} pilots permanently?`)) {
        for (const id of selectedIds) {
          await base44.entities.Pilot.delete(id);
        }
        toast.success(`${selectedIds.length} pilots deleted`);
      }
    }
    queryClient.invalidateQueries(['pilots']);
    setSelectedIds([]);
  };

  const filteredPilots = pilots.filter(pilot => {
    const matchesSearch = pilot.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pilot.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || pilot.sector === sectorFilter;
    const matchesStage = stageFilter === 'all' || pilot.stage === stageFilter;
    const notHidden = !pilot.is_hidden;
    return matchesSearch && matchesSector && matchesStage && notHidden;
  });

  const stageColors = {
    pre_pilot: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    evaluation: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    scaled: 'bg-teal-100 text-teal-700',
    terminated: 'bg-red-100 text-red-700'
  };

  const kanbanStages = [
    { key: 'pre_pilot', label: 'Pre-Pilot' },
    { key: 'approved', label: 'Approved' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'evaluation', label: 'Evaluation' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t({ en: 'Pilot Console', ar: 'وحدة التحكم بالتجارب' })}
          </h1>
          <p className="text-slate-600 mt-2">{t({ en: 'Manage and monitor pilot projects across municipalities', ar: 'إدارة ومراقبة المشاريع التجريبية عبر البلديات' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportData data={filteredPilots} filename="pilots" entityType="Pilot" />
          {hasPermission('pilot_create') && (
            <Link to={createPageUrl('PilotCreate')}>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg">
                <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <PilotsAIInsights pilots={pilots} challenges={challenges} municipalities={municipalities} />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (hasPermission('pilot_edit') || hasPermission('pilot_delete')) && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} selected
          </span>
          {hasPermission('pilot_edit') && (
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
              Archive All
            </Button>
          )}
          {hasPermission('pilot_delete') && (
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-red-600">
              Delete All
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleBulkAction('clear')}>
            Clear
          </Button>
        </div>
      )}

      {/* Filters & View Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search pilots by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="urban_design">Urban Design</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="digital_services">Digital Services</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="pre_pilot">Pre-Pilot</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="evaluation">Evaluation</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredPilots.length && filteredPilots.length > 0}
                    onCheckedChange={(checked) => {
                      setSelectedIds(checked ? filteredPilots.map(p => p.id) : []);
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold">{t({ en: 'Code', ar: 'الرمز' })}</TableHead>
                <TableHead className="font-semibold">{t({ en: 'Title', ar: 'العنوان' })}</TableHead>
                <TableHead className="font-semibold">{t({ en: 'Challenge', ar: 'التحدي' })}</TableHead>
                <TableHead className="font-semibold">{t({ en: 'Municipality', ar: 'البلدية' })}</TableHead>
                <TableHead className="font-semibold">{t({ en: 'Stage', ar: 'المرحلة' })}</TableHead>
                <TableHead className="font-semibold">TRL</TableHead>
                <TableHead className="font-semibold">{t({ en: 'Success Probability', ar: 'احتمالية النجاح' })}</TableHead>
                <TableHead className={`${isRTL ? 'text-left' : 'text-right'} font-semibold`}>{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPilots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="h-12 w-12 text-slate-400" />
                      <p className="text-slate-600">No pilots found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPilots.map((pilot) => (
                  <TableRow key={pilot.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(pilot.id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds(checked 
                            ? [...selectedIds, pilot.id]
                            : selectedIds.filter(id => id !== pilot.id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{pilot.code}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {challenges.find(c => c.id === pilot.challenge_id)?.code || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {pilot.municipality_id?.substring(0, 15)}
                    </TableCell>
                    <TableCell>
                      <Badge className={stageColors[pilot.stage]}>
                        {pilot.stage?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{pilot.trl_current || pilot.trl_start || 0}</span>
                        {pilot.trl_start && pilot.trl_current > pilot.trl_start && (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              (pilot.success_probability || 0) >= 70
                                ? 'bg-green-500'
                                : (pilot.success_probability || 0) >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${pilot.success_probability || 50}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium min-w-[2.5rem]">
                          {pilot.success_probability || 50}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                          <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                        {hasPermission('pilot_edit') && (
                          <Link to={createPageUrl(`PilotEdit?id=${pilot.id}`)}>
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-50">
                              <Edit className="h-4 w-4 text-yellow-600" />
                            </Button>
                          </Link>
                        )}
                        {hasPermission('pilot_edit') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archiveMutation.mutate(pilot.id)}
                            className="hover:bg-amber-50"
                          >
                            <Archive className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        {hasPermission('pilot_delete') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Delete permanently?')) {
                                deleteMutation.mutate(pilot.id);
                              }
                            }}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPilots.map((pilot) => (
            <Card key={pilot.id} className="hover:shadow-lg transition-all overflow-hidden">
              {pilot.image_url && (
                <div className="h-40 overflow-hidden">
                  <img src={pilot.image_url} alt={pilot.title_en} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs">{pilot.code}</Badge>
                    <Badge className={stageColors[pilot.stage]}>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Progress value={pilot.success_probability || 50} className="flex-1 h-2" />
                    <span className="text-xs font-medium">{pilot.success_probability || 50}%</span>
                  </div>
                  <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-5 gap-4">
          {kanbanStages.map((stage) => {
            const stagePilots = filteredPilots.filter(p => p.stage === stage.key);
            return (
              <Card key={stage.key} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <Badge variant="outline">{stagePilots.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stagePilots.map((pilot) => (
                    <Link
                      key={pilot.id}
                      to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                      className="block bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    >
                      {pilot.image_url && (
                        <div className="h-32 overflow-hidden">
                          <img src={pilot.image_url} alt={pilot.title_en} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-medium text-sm text-slate-900 line-clamp-2">
                          {pilot.title_en}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{pilot.code}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${pilot.success_probability || 50}%` }}
                            />
                          </div>
                          <span className="text-xs">{pilot.success_probability || 50}%</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(PilotsPage, { requiredPermissions: ['pilot_view_all'] });