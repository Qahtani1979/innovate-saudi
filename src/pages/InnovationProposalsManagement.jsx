import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  Lightbulb, Search, CheckCircle2, XCircle, Eye, Loader2,
  Target, FileText, Filter, Sparkles
} from 'lucide-react';
import AIProposalScreening from '../components/citizen/AIProposalScreening';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedPage from '../components/permissions/ProtectedPage';

function InnovationProposalsManagement() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading, error: proposalsError } = useQuery({
    queryKey: ['innovation-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('innovation_proposals').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });

  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('innovation_proposals').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['innovation-proposals']);
      toast.success(t({ en: 'Proposal updated', ar: 'تم التحديث' }));
    }
  });

  const handleApprove = async (proposal) => {
    await updateProposalMutation.mutateAsync({
      id: proposal.id,
      data: { status: 'approved' }
    });
  };

  const handleReject = async (proposal) => {
    await updateProposalMutation.mutateAsync({
      id: proposal.id,
      data: { status: 'rejected' }
    });
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title_en?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.proposal_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: proposals.length,
    submitted: proposals.filter(p => p.status === 'submitted').length,
    under_evaluation: proposals.filter(p => p.status === 'under_evaluation').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    converted: proposals.filter(p => p.status === 'converted').length
  };

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_evaluation: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    converted: 'bg-purple-100 text-purple-700'
  };

  if (proposalsError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t({ en: 'Error loading proposals', ar: 'خطأ في تحميل المقترحات' })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
          {t({ en: 'Innovation Proposals Management', ar: 'إدارة المقترحات الابتكارية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review structured proposals for programs and challenges', ar: 'مراجعة المقترحات المنظمة للبرامج والتحديات' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{value}</p>
                <p className="text-xs text-slate-600 mt-1 capitalize">{key.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search proposals...', ar: 'بحث...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_evaluation">Under Evaluation</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
              <SelectItem value="problem">Problem</SelectItem>
              <SelectItem value="solution">Solution</SelectItem>
              <SelectItem value="research_question">Research</SelectItem>
              <SelectItem value="implementation_plan">Implementation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Proposals Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t({ en: 'Title', ar: 'العنوان' })}</TableHead>
              <TableHead>{t({ en: 'Type', ar: 'النوع' })}</TableHead>
              <TableHead>{t({ en: 'Submitter', ar: 'المقدم' })}</TableHead>
              <TableHead>{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
              <TableHead>{t({ en: 'Budget', ar: 'الميزانية' })}</TableHead>
              <TableHead>{t({ en: 'Date', ar: 'التاريخ' })}</TableHead>
              <TableHead>{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
                </TableCell>
              </TableRow>
            ) : filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">{t({ en: 'No proposals found', ar: 'لم يتم العثور على مقترحات' })}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal) => (
                <TableRow key={proposal.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{proposal.title_en}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {proposal.proposal_type?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{proposal.submitter_email}</div>
                    {proposal.submitter_organization && (
                      <div className="text-xs text-slate-500">{proposal.submitter_organization}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[proposal.status]}>
                      {proposal.status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {proposal.budget_estimate ? `${(proposal.budget_estimate / 1000).toFixed(0)}K SAR` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(proposal.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`InnovationProposalDetail?id=${proposal.id}`)}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {proposal.status === 'submitted' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(proposal)} className="bg-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleReject(proposal)} variant="outline" className="text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default ProtectedPage(InnovationProposalsManagement, { requiredPermissions: ['innovation_proposal_manage'] });