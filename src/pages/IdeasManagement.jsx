import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import MergeDuplicatesDialog from '../components/citizen/MergeDuplicatesDialog';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  Lightbulb, CheckCircle2, XCircle, AlertTriangle, Eye, MessageSquare,
  ThumbsUp, ArrowRight, Sparkles, Loader2, Filter, Search, TrendingUp,
  MapPin, User, Calendar, Target, Network, TestTube, Microscope, Mail, Download
} from 'lucide-react';
import IdeaToSolutionConverter from '../components/citizen/IdeaToSolutionConverter';
import IdeaToPilotConverter from '../components/citizen/IdeaToPilotConverter';
import IdeaToRDConverter from '../components/citizen/IdeaToRDConverter';
import ResponseTemplates from '../components/citizen/ResponseTemplates';
import IdeaBulkActions from '../components/citizen/IdeaBulkActions';
import ExportIdeasData from '../components/citizen/ExportIdeasData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedPage from '../components/permissions/ProtectedPage';
import IdeaToChallengeConverter from '../components/citizen/IdeaToChallengeConverter'; // Added converter for challenge

function IdeasManagement() {
  const { language, isRTL, t } = useLanguage();
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const municipalityFilter = searchParams.get('municipality') || userProfile?.municipality_id;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [reviewMode, setReviewMode] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [convertingToChallenge, setConvertingToChallenge] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [converterType, setConverterType] = useState('challenge');
  const [showResponseTemplate, setShowResponseTemplate] = useState(false);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState([]);
  const queryClient = useQueryClient();

  // Filter by municipality if provided (from URL or user profile)
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['citizen-ideas', municipalityFilter],
    queryFn: async () => {
      const allIdeas = await base44.entities.CitizenIdea.list('-created_date', 200);
      if (municipalityFilter) {
        return allIdeas.filter(idea => idea.municipality_id === municipalityFilter);
      }
      return allIdeas;
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-matching'],
    queryFn: () => base44.entities.Challenge.list('-created_date', 50)
  });

  const updateIdeaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CitizenIdea.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-ideas']);
      setSelectedIdea(null);
      setReviewMode(null);
      setReviewNotes('');
      toast.success(t({ en: 'Idea updated', ar: 'تم تحديث الفكرة' }));
    }
  });

  const handleReview = async (action) => {
    if (!selectedIdea) return;

    const user = await base44.auth.me();
    const updates = {
      status: action,
      review_notes: reviewNotes,
      reviewed_by: user.email,
      review_date: new Date().toISOString()
    };

    await updateIdeaMutation.mutateAsync({ id: selectedIdea.id, data: updates });

    // Trigger auto-notification
    if (selectedIdea.submitter_email) {
      await base44.functions.invoke('autoNotificationTriggers', {
        entity_name: 'CitizenIdea',
        entity_id: selectedIdea.id,
        old_status: selectedIdea.status,
        new_status: action,
        citizen_email: selectedIdea.submitter_email
      });
    }
  };

  const convertToChallenge = async () => {
    if (!selectedIdea) return;
    
    setConvertingToChallenge(true);
    try {
      const user = await base44.auth.me();
      
      const newChallenge = await base44.entities.Challenge.create({
        code: `CH-IDEA-${Date.now().toString().slice(-6)}`,
        title_en: selectedIdea.title,
        title_ar: selectedIdea.title,
        description_en: selectedIdea.description,
        description_ar: selectedIdea.description,
        sector: selectedIdea.category,
        municipality_id: selectedIdea.municipality_id || municipalityFilter,
        priority: 'tier_3',
        status: 'submitted',
        source: 'citizen_idea',
        citizen_origin_idea_id: selectedIdea.id, // Link back to original idea
        keywords: selectedIdea.ai_classification?.keywords || [],
        created_by: user.email,
        challenge_owner: selectedIdea.submitter_email || user.email
      });

      await base44.entities.CitizenIdea.update(selectedIdea.id, {
        status: 'converted_to_challenge',
        converted_challenge_id: newChallenge.id,
        reviewed_by: user.email,
        review_date: new Date().toISOString()
      });

      // Notify the idea submitter about conversion
      if (selectedIdea.submitter_email) {
        await base44.functions.invoke('autoNotificationTriggers', {
          entity_name: 'CitizenIdea',
          entity_id: selectedIdea.id,
          old_status: selectedIdea.status,
          new_status: 'converted_to_challenge',
          citizen_email: selectedIdea.submitter_email,
          challenge_id: newChallenge.id
        });
      }

      await base44.functions.invoke('generateEmbeddings', {
        entity_name: 'Challenge',
        mode: 'missing'
      });

      toast.success(t({ en: 'Converted to challenge!', ar: 'تم التحويل إلى تحدي!' }));
      queryClient.invalidateQueries(['citizen-ideas']);
      setSelectedIdea(null);
      setReviewMode(null);
    } catch (error) {
      toast.error(t({ en: 'Conversion failed', ar: 'فشل التحويل' }));
    } finally {
      setConvertingToChallenge(false);
    }
  };

  const findDuplicates = async (idea) => {
    if (!idea.embedding || idea.embedding.length === 0) {
      toast.info(t({ en: 'No embedding available for this idea', ar: 'لا يوجد تضمين لهذه الفكرة' }));
      return;
    }

    try {
      const response = await base44.functions.invoke('semanticSearch', {
        entity_name: 'CitizenIdea',
        query_embedding: idea.embedding,
        top_k: 5,
        threshold: 0.75
      });

      const duplicates = response.data.results
        .filter(r => r.id !== idea.id)
        .map(r => ({ ...r, similarity: (r.similarity * 100).toFixed(0) }));

      if (duplicates.length > 0) {
        toast.success(`Found ${duplicates.length} similar ideas`);
        setSelectedIdea({ ...idea, duplicates });
      } else {
        toast.info(t({ en: 'No duplicates found', ar: 'لم يتم العثور على تكرارات' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Duplicate search failed', ar: 'فشل البحث عن التكرارات' }));
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: ideas.length,
    submitted: ideas.filter(i => i.status === 'submitted').length,
    under_review: ideas.filter(i => i.status === 'under_review').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    converted: ideas.filter(i => i.status === 'converted_to_challenge').length,
    rejected: ideas.filter(i => i.status === 'rejected').length,
    duplicate: ideas.filter(i => i.status === 'duplicate').length
  };

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    converted_to_challenge: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    duplicate: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent">
          {t({ en: 'Citizen Ideas Management', ar: 'إدارة أفكار المواطنين' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review, classify, and convert citizen submissions', ar: 'مراجعة وتصنيف وتحويل مقترحات المواطنين' })}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'New', ar: 'جديد' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.under_review}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Review', ar: 'مراجعة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Approved', ar: 'معتمد' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.converted}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Converted', ar: 'محول' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Rejected', ar: 'مرفوض' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{stats.duplicate}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Duplicate', ar: 'مكرر' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <IdeaBulkActions 
        selectedIds={selectedIdeaIds} 
        onComplete={() => setSelectedIdeaIds([])}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <ExportIdeasData />
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search ideas...', ar: 'بحث عن الأفكار...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t({ en: 'All Status', ar: 'جميع الحالات' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</SelectItem>
              <SelectItem value="submitted">{t({ en: 'Submitted', ar: 'مقدم' })}</SelectItem>
              <SelectItem value="under_review">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</SelectItem>
              <SelectItem value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</SelectItem>
              <SelectItem value="converted_to_challenge">{t({ en: 'Converted', ar: 'محول' })}</SelectItem>
              <SelectItem value="rejected">{t({ en: 'Rejected', ar: 'مرفوض' })}</SelectItem>
              <SelectItem value="duplicate">{t({ en: 'Duplicate', ar: 'مكرر' })}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t({ en: 'All Categories', ar: 'جميع الفئات' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Categories', ar: 'جميع الفئات' })}</SelectItem>
              <SelectItem value="transport">{t({ en: 'Transport', ar: 'النقل' })}</SelectItem>
              <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
              <SelectItem value="digital_services">{t({ en: 'Digital', ar: 'رقمي' })}</SelectItem>
              <SelectItem value="safety">{t({ en: 'Safety', ar: 'السلامة' })}</SelectItem>
              <SelectItem value="health">{t({ en: 'Health', ar: 'الصحة' })}</SelectItem>
              <SelectItem value="education">{t({ en: 'Education', ar: 'التعليم' })}</SelectItem>
              <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Ideas Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedIdeaIds.length === filteredIdeas.length && filteredIdeas.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIdeaIds(filteredIdeas.map(i => i.id));
                    } else {
                      setSelectedIdeaIds([]);
                    }
                  }}
                  className="rounded"
                />
              </TableHead>
              <TableHead>{t({ en: 'Title', ar: 'العنوان' })}</TableHead>
              <TableHead>{t({ en: 'Category', ar: 'الفئة' })}</TableHead>
              <TableHead>{t({ en: 'Submitter', ar: 'المُقدِّم' })}</TableHead>
              <TableHead>{t({ en: 'Votes', ar: 'الأصوات' })}</TableHead>
              <TableHead>{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
              <TableHead>{t({ en: 'Date', ar: 'التاريخ' })}</TableHead>
              <TableHead>{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                </TableCell>
              </TableRow>
            ) : filteredIdeas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">{t({ en: 'No ideas found', ar: 'لم يتم العثور على أفكار' })}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredIdeas.map((idea) => (
                <TableRow key={idea.id} className="hover:bg-slate-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIdeaIds.includes(idea.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIdeaIds([...selectedIdeaIds, idea.id]);
                        } else {
                          setSelectedIdeaIds(selectedIdeaIds.filter(id => id !== idea.id));
                        }
                      }}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{idea.title}</div>
                    {idea.ai_classification?.is_duplicate && (
                      <Badge variant="outline" className="text-xs mt-1">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Possible Duplicate
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {idea.category?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      {idea.submitter_name || 'Anonymous'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="h-3 w-3 text-green-600" />
                      <span className="font-medium">{idea.vote_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[idea.status] || statusColors.submitted}>
                      {idea.status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(idea.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedIdea(idea);
                          setReviewMode('view');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {idea.status === 'submitted' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedIdea(idea);
                            setReviewMode('review');
                          }}
                          className="bg-yellow-600"
                        >
                          {t({ en: 'Review', ar: 'مراجعة' })}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => findDuplicates(idea)}
                      >
                        <Network className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewMode} onOpenChange={() => { setReviewMode(null); setSelectedIdea(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              {t({ en: 'Citizen Idea Review', ar: 'مراجعة فكرة المواطن' })}
            </DialogTitle>
          </DialogHeader>

          {selectedIdea && (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedIdea.title}</h3>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{selectedIdea.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">{t({ en: 'Category', ar: 'الفئة' })}</p>
                  <p className="font-medium capitalize">{selectedIdea.category?.replace(/_/g, ' ')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">{t({ en: 'Votes', ar: 'الأصوات' })}</p>
                  <p className="font-medium">{selectedIdea.vote_count || 0}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">{t({ en: 'Submitter', ar: 'المُقدِّم' })}</p>
                  <p className="font-medium text-sm">{selectedIdea.submitter_name || 'Anonymous'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">{t({ en: 'Date', ar: 'التاريخ' })}</p>
                  <p className="font-medium text-sm">{new Date(selectedIdea.created_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedIdea.ai_classification && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      {t({ en: 'AI Classification', ar: 'التصنيف الذكي' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">{t({ en: 'Suggested Category', ar: 'الفئة المقترحة' })}</p>
                      <Badge>{selectedIdea.ai_classification.suggested_category}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">{t({ en: 'Priority Score', ar: 'نقاط الأولوية' })}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-600"
                            style={{ width: `${selectedIdea.ai_classification.priority_score || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{selectedIdea.ai_classification.priority_score || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedIdea.duplicates?.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Network className="h-4 w-4 text-amber-700" />
                      {t({ en: 'Similar Ideas Detected', ar: 'أفكار مشابهة مكتشفة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedIdea.duplicates.map((dup, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border border-amber-200 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{dup.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{dup.description?.substring(0, 100)}...</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700">{dup.similarity}% similar</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {reviewMode === 'review' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t({ en: 'Review Notes', ar: 'ملاحظات المراجعة' })}</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder={t({ en: 'Add your review notes...', ar: 'أضف ملاحظات المراجعة...' })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => { setConverterType('challenge'); setShowConverter(true); setReviewMode(null); }}
                        className="flex-1 bg-purple-600"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {t({ en: '→ Challenge', ar: '→ تحدي' })}
                      </Button>
                      <Button
                        onClick={() => { setConverterType('solution'); setShowConverter(true); setReviewMode(null); }}
                        className="flex-1 bg-pink-600"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {t({ en: '→ Solution', ar: '→ حل' })}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => { setConverterType('pilot'); setShowConverter(true); setReviewMode(null); }}
                        className="flex-1 bg-blue-600"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {t({ en: '→ Pilot', ar: '→ تجربة' })}
                      </Button>
                      <Button
                        onClick={() => { setConverterType('rd'); setShowConverter(true); setReviewMode(null); }}
                        className="flex-1 bg-indigo-600"
                      >
                        <Microscope className="h-4 w-4 mr-2" />
                        {t({ en: '→ R&D', ar: '→ بحث' })}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleReview('approved')}
                      disabled={updateIdeaMutation.isPending}
                      className="flex-1 bg-green-600"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Approve', ar: 'قبول' })}
                    </Button>
                    <Button
                      onClick={() => setShowResponseTemplate(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t({ en: 'Respond', ar: 'رد' })}
                    </Button>
                    <Button
                      onClick={() => handleReview('duplicate')}
                      disabled={updateIdeaMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t({ en: 'Duplicate', ar: 'مكرر' })}
                    </Button>
                    <Button
                      onClick={() => handleReview('rejected')}
                      disabled={updateIdeaMutation.isPending}
                      variant="outline"
                      className="flex-1 text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Conversion Wizards */}
      {showConverter && selectedIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            {converterType === 'challenge' && <IdeaToChallengeConverter idea={selectedIdea} onClose={() => { setShowConverter(false); setSelectedIdea(null); }} />}
            {converterType === 'solution' && <IdeaToSolutionConverter idea={selectedIdea} onClose={() => { setShowConverter(false); setSelectedIdea(null); }} />}
            {converterType === 'pilot' && <IdeaToPilotConverter idea={selectedIdea} onClose={() => { setShowConverter(false); setSelectedIdea(null); }} />}
            {converterType === 'rd' && <IdeaToRDConverter idea={selectedIdea} onClose={() => { setShowConverter(false); setSelectedIdea(null); }} />}
          </div>
        </div>
      )}

      {/* Response Templates */}
      {showResponseTemplate && selectedIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t({ en: 'Send Response to Citizen', ar: 'إرسال رد للمواطن' })}</CardTitle>
                  <Button variant="ghost" onClick={() => setShowResponseTemplate(false)}>×</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponseTemplates
                  onSelect={async (text) => {
                    await base44.functions.invoke('citizenNotifications', {
                      eventType: 'custom_response',
                      ideaId: selectedIdea.id,
                      citizenEmail: selectedIdea.submitter_email,
                      customMessage: text
                    });
                    setShowResponseTemplate(false);
                    toast.success(t({ en: 'Response sent', ar: 'تم الإرسال' }));
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(IdeasManagement, { requiredPermissions: ['idea_manage'] });