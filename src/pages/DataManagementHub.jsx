import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch";
import {
  MapPin, Building2, Users, Shield, Mail, Plus, Pencil, Trash2,
  Search, Database, Check, X, Loader2, UserPlus, Settings, Sparkles, Globe
} from 'lucide-react';
import EmbeddingManager from '../components/embeddings/EmbeddingManager';
import SemanticSearchPanel from '../components/embeddings/SemanticSearchPanel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';

function DataManagementHub() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [enriching, setEnriching] = useState(false);

  // Fetch all data
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list()
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: knowledgeDocs = [] } = useQuery({
    queryKey: ['knowledgeDocs'],
    queryFn: () => base44.entities.KnowledgeDocument.list()
  });

  const { data: citizenIdeas = [] } = useQuery({
    queryKey: ['citizenIdeas'],
    queryFn: () => base44.entities.CitizenIdea.list()
  });

  const embeddingStats = [
    { name: 'Challenge', count: challenges.length, with_embedding: challenges.filter(c => c.embedding?.length > 0).length },
    { name: 'Solution', count: solutions.length, with_embedding: solutions.filter(s => s.embedding?.length > 0).length },
    { name: 'KnowledgeDocument', count: knowledgeDocs.length, with_embedding: knowledgeDocs.filter(k => k.embedding?.length > 0).length },
    { name: 'CitizenIdea', count: citizenIdeas.length, with_embedding: citizenIdeas.filter(i => i.embedding?.length > 0).length },
    { name: 'Organization', count: organizations.length, with_embedding: organizations.filter(o => o.embedding?.length > 0).length }
  ];

  // AI Enrich Functions
  const handleAIEnrichRegion = async () => {
    if (!formData.name_en) {
      toast.error(t({ en: 'Please enter region name first', ar: 'يرجى إدخال اسم المنطقة أولاً' }));
      return;
    }

    setEnriching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide comprehensive data for Saudi Arabian region: ${formData.name_en}

Using web search, provide:
1. Official Arabic name (proper transliteration)
2. Region code (2-3 letter abbreviation, uppercase)
3. Brief description (EN + AR, 100-150 words each)
4. Region type (urban/rural/mixed)
5. Population estimate
6. Area in square kilometers
7. Geographic center coordinates (latitude, longitude)
8. Governor name (if publicly available)`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            name_ar: { type: 'string' },
            code: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            region_type: { type: 'string' },
            population: { type: 'number' },
            area_sqkm: { type: 'number' },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' }
              }
            },
            governor_name: { type: 'string' }
          }
        }
      });

      setFormData({ ...formData, ...result });
      toast.success(t({ en: '✅ Data enriched', ar: '✅ تم الإثراء' }));
    } catch (error) {
      toast.error(t({ en: 'Enrichment failed', ar: 'فشل الإثراء' }));
    } finally {
      setEnriching(false);
    }
  };

  const handleAIEnrichCity = async () => {
    if (!formData.name_en || !formData.region_id) {
      toast.error(t({ en: 'Please enter city name and region', ar: 'يرجى إدخال اسم المدينة والمنطقة' }));
      return;
    }

    const regionName = regions.find(r => r.id === formData.region_id)?.name_en || '';

    setEnriching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide data for Saudi city: ${formData.name_en} in ${regionName}

Using web search:
1. Arabic name
2. Population
3. Area (km²)
4. Coordinates (lat, lng)
5. Mayor name
6. Website URL
7. Economic indicators (GDP per capita, unemployment rate, key industries)`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            name_ar: { type: 'string' },
            population: { type: 'number' },
            area_sqkm: { type: 'number' },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' }
              }
            },
            mayor_name: { type: 'string' },
            city_website: { type: 'string' },
            economic_indicators: {
              type: 'object',
              properties: {
                gdp_per_capita: { type: 'number' },
                unemployment_rate: { type: 'number' },
                key_industries: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });

      setFormData({ ...formData, ...result });
      toast.success(t({ en: '✅ Data enriched', ar: '✅ تم الإثراء' }));
    } catch (error) {
      toast.error(t({ en: 'Enrichment failed', ar: 'فشل الإثراء' }));
    } finally {
      setEnriching(false);
    }
  };

  // Data integrity checks
  const getOrphanedRecords = () => {
    const orphanedCities = cities.filter(city =>
      city.region_id && !regions.find(r => r.id === city.region_id)
    );
    const orphanedOrgs = organizations.filter(org =>
      (org.region_id && !regions.find(r => r.id === org.region_id)) ||
      (org.city_id && !cities.find(c => c.id === org.city_id))
    );
    return { orphanedCities, orphanedOrgs };
  };

  const getDataQualityIssues = () => {
    const issues = [];

    const duplicateOrgs = [];
    const seen = new Set();
    organizations.forEach((org, idx) => {
      const normalized = org.name_en?.toLowerCase().trim();
      if (!normalized) return;

      for (let i = idx + 1; i < organizations.length; i++) {
        const otherNormalized = organizations[i].name_en?.toLowerCase().trim();
        if (!otherNormalized) continue;

        const similarity = normalized === otherNormalized ||
                          normalized.includes(otherNormalized) ||
                          otherNormalized.includes(normalized);

        if (similarity) {
          const key = [org.id, organizations[i].id].sort().join('-');
          if (!seen.has(key)) {
            duplicateOrgs.push([org, organizations[i]]);
            seen.add(key);
          }
        }
      }
    });

    if (duplicateOrgs.length > 0) {
      issues.push({
        type: 'duplicate_organizations',
        count: duplicateOrgs.length,
        items: duplicateOrgs,
        severity: 'high'
      });
    }

    const duplicateCities = [];
    const citySeen = new Set();
    cities.forEach((city, idx) => {
      const normalized = city.name_en?.toLowerCase().trim();
      if (!normalized) return;

      for (let i = idx + 1; i < cities.length; i++) {
        const otherNormalized = cities[i].name_en?.toLowerCase().trim();
        if (!otherNormalized) continue;

        if (normalized === otherNormalized && city.region_id === cities[i].region_id) {
          const key = [city.id, cities[i].id].sort().join('-');
          if (!citySeen.has(key)) {
            duplicateCities.push([city, cities[i]]);
            citySeen.add(key);
          }
        }
      }
    });

    if (duplicateCities.length > 0) {
      issues.push({
        type: 'duplicate_cities',
        count: duplicateCities.length,
        items: duplicateCities,
        severity: 'high'
      });
    }

    const partnershipIssues = organizations.filter(org =>
      (org.is_partner && (!org.partnership_status || org.partnership_status === 'none')) ||
      (!org.is_partner && org.partnership_status === 'active')
    );
    if (partnershipIssues.length > 0) {
      issues.push({
        type: 'partnership_mismatch',
        count: partnershipIssues.length,
        items: partnershipIssues,
        severity: 'medium'
      });
    }

    const missingData = organizations.filter(org =>
      !org.description_en || !org.contact_email || !org.sectors?.length
    );
    if (missingData.length > 0) {
      issues.push({
        type: 'incomplete_profile',
        count: missingData.length,
        items: missingData,
        severity: 'low'
      });
    }

    const fundingIssues = organizations.filter(org => {
      if (org.org_type !== 'startup' && org.org_type !== 'sme' && org.org_type !== 'company') return false;
      const hasFundingStage = org.funding_stage && org.funding_stage !== 'not_applicable';
      const hasFundingRounds = org.funding_rounds?.length > 0;
      const hasInvestors = org.key_investors?.length > 0;
      return hasFundingStage && !hasFundingRounds && !hasInvestors;
    });
    if (fundingIssues.length > 0) {
      issues.push({
        type: 'funding_inconsistency',
        count: fundingIssues.length,
        items: fundingIssues,
        severity: 'medium'
      });
    }

    const complianceGaps = organizations.filter(org => {
      if (org.org_type === 'ministry' || org.org_type === 'municipality' || org.org_type === 'agency') return false;
      return !org.regulatory_compliance && org.is_partner && org.partnership_status === 'active';
    });
    if (complianceGaps.length > 0) {
      issues.push({
        type: 'compliance_data_missing',
        count: complianceGaps.length,
        items: complianceGaps,
        severity: 'high'
      });
    }

    const unverifiedPartners = organizations.filter(org =>
      org.is_partner && org.partnership_status === 'active' && !org.is_verified
    );
    if (unverifiedPartners.length > 0) {
      issues.push({
        type: 'unverified_partners',
        count: unverifiedPartners.length,
        items: unverifiedPartners,
        severity: 'high'
      });
    }

    const citiesNoPopulation = cities.filter(c => !c.population);
    if (citiesNoPopulation.length > 0) {
      issues.push({
        type: 'missing_population',
        count: citiesNoPopulation.length,
        items: citiesNoPopulation,
        severity: 'low'
      });
    }

    return issues;
  };

  const [aiFixing, setAiFixing] = useState(false);
  const [aiFixResults, setAiFixResults] = useState(null);

  const calculateDataScore = (org) => {
    const fields = [
      org.name_en, org.name_ar, org.description_en, org.description_ar,
      org.org_type, org.contact_email, org.contact_phone, org.website,
      org.region_id, org.city_id, org.address,
      org.team_size, org.maturity_level,
      org.sectors?.length > 0, org.specializations?.length > 0,
      org.logo_url, org.image_url,
      org.primary_contact_name, org.primary_contact_role
    ];
    const filled = fields.filter(Boolean).length;
    const score = Math.round((filled / fields.length) * 100);
    return score;
  };

  const fixOrphanedMutation = useMutation({
    mutationFn: async ({ type, items, action, targetId }) => {
      if (action === 'delete') {
        await Promise.all(items.map(item => {
          if (type === 'city') return base44.entities.City.delete(item.id);
          if (type === 'organization') return base44.entities.Organization.delete(item.id);
        }));
      } else if (action === 'reassign' && targetId) {
        await Promise.all(items.map(item => {
          if (type === 'city') return base44.entities.City.update(item.id, { region_id: targetId });
          if (type === 'organization') {
            const updates = {};
            if (item.region_id && !regions.find(r => r.id === item.region_id)) updates.region_id = null;
            if (item.city_id && !cities.find(c => c.id === item.city_id)) updates.city_id = targetId;
            return base44.entities.Organization.update(item.id, updates);
          }
        }));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Fixed orphaned records', ar: 'تم إصلاح السجلات اليتيمة' }));
    },
    onError: () => {
      toast.error(t({ en: 'Failed to fix records', ar: 'فشل إصلاح السجلات' }));
    }
  });

  const handleAIAnalyze = async () => {
    setAiFixing(true);
    setAiFixResults(null);

    try {
      const { orphanedCities, orphanedOrgs } = getOrphanedRecords();
      const qualityIssues = getDataQualityIssues();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a data integrity expert for Saudi Municipal Innovation Platform. Analyze ALL data issues and provide comprehensive fix recommendations.

Available Regions: ${regions.map(r => `${r.id}: ${r.name_en}`).join(', ')}
Available Cities: ${cities.map(c => `${c.id}: ${c.name_en} (region: ${c.region_id})`).join(', ')}

ORPHANED RECORDS:

Orphaned Cities (${orphanedCities.length}):
${orphanedCities.map(c => `- ${c.name_en} (id: ${c.id}, invalid region_id: ${c.region_id})`).join('\n') || 'None'}

Orphaned Organizations (${orphanedOrgs.length}):
${orphanedOrgs.map(o => `- ${o.name_en} (id: ${o.id}, invalid region_id: ${o.region_id || 'none'}, invalid city_id: ${o.city_id || 'none'})`).join('\n') || 'None'}

DATA QUALITY ISSUES:

${qualityIssues.map(issue => {
  if (issue.type === 'duplicate_organizations') {
    return `Duplicate Organizations (${issue.count} pairs):\n${issue.items.map(pair => `- "${pair[0].name_en}" (${pair[0].id}, score: ${calculateDataScore(pair[0])}%) vs "${pair[1].name_en}" (${pair[1].id}, score: ${calculateDataScore(pair[1])}%)`).join('\n')}`;
  }
  if (issue.type === 'duplicate_cities') {
    return `Duplicate Cities (${issue.count} pairs):\n${issue.items.map(pair => `- "${pair[0].name_en}" (${pair[0].id}) vs "${pair[1].name_en}" (${pair[1].id})`).join('\n')}`;
  }
  if (issue.type === 'partnership_mismatch') {
    return `Partnership Inconsistencies (${issue.count}):\n${issue.items.map(o => `- ${o.name_en}: is_partner=${o.is_partner}, status=${o.partnership_status}`).join('\n')}`;
  }
  if (issue.type === 'incomplete_profile') {
    return `Incomplete Profiles (${issue.count}):\n${issue.items.map(o => `- ${o.name_en}: missing ${!o.description_en ? 'description' : ''} ${!o.contact_email ? 'email' : ''} ${!o.sectors?.length ? 'sectors' : ''}`).join('\n')}`;
  }
  if (issue.type === 'unverified_partners') {
    return `Unverified Active Partners (${issue.count}):\n${issue.items.map(o => `- ${o.name_en}: active partner but not verified`).join('\n')}`;
  }
  if (issue.type === 'missing_population') {
    return `Cities Missing Population (${issue.count}):\n${issue.items.map(c => `- ${c.name_en}`).join('\n')}`;
  }
  if (issue.type === 'funding_inconsistency') {
    return `Funding Stage Without Details (${issue.count}):\n${issue.items.map(o => `- ${o.name_en}: has funding_stage=${o.funding_stage} but no funding_rounds or investors`).join('\n')}`;
  }
  if (issue.type === 'compliance_data_missing') {
    return `Active Partners Missing Compliance Data (${issue.count}):\n${issue.items.map(o => `- ${o.name_en}: active partner but no regulatory compliance info`).join('\n')}`;
  }
  return '';
}).join('\n\n')}

Provide specific fixes with actions (DELETE, REASSIGN, FIX_PARTNERSHIP, ENRICH_DATA, VERIFY, etc).`,
        response_json_schema: {
          type: 'object',
          properties: {
            city_fixes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  city_id: { type: 'string' },
                  city_name: { type: 'string' },
                  action: { type: 'string' },
                  target_region_id: { type: 'string' },
                  target_region_name: { type: 'string' },
                  estimated_population: { type: 'number' },
                  duplicate_of_id: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            org_fixes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  org_id: { type: 'string' },
                  org_name: { type: 'string' },
                  issue_type: { type: 'string' },
                  action: { type: 'string' },
                  target_region_id: { type: 'string' },
                  target_city_id: { type: 'string' },
                  suggested_partnership_status: { type: 'string' },
                  suggested_is_partner: { type: 'boolean' },
                  suggested_sectors: { type: 'array', items: { type: 'string' } },
                  suggested_description_en: { type: 'string' },
                  suggested_contact_email: { type: 'string' },
                  suggested_specializations: { type: 'array', items: { type: 'string' } },
                  duplicate_of_id: { type: 'string' },
                  keep_record_id: { type: 'string' },
                  suggested_funding_stage: { type: 'string' },
                  add_compliance_note: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            summary: { type: 'string' },
            total_issues: { type: 'number' },
            critical_count: { type: 'number' }
          }
        }
      });

      setAiFixResults(result);
    } catch (error) {
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    } finally {
      setAiFixing(false);
    }
  };

  const applyFixMutation = useMutation({
    mutationFn: async ({ type, fix, index }) => {
      if (type === 'city') {
        if (fix.action === 'DELETE' || fix.action === 'DELETE_DUPLICATE') {
          await base44.entities.City.delete(fix.city_id);
        } else if (fix.action === 'REASSIGN' && fix.target_region_id) {
          const updates = { region_id: fix.target_region_id };
          if (fix.estimated_population) updates.population = fix.estimated_population;
          await base44.entities.City.update(fix.city_id, updates);
        } else if (fix.action === 'UPDATE_POPULATION' && fix.estimated_population) {
          await base44.entities.City.update(fix.city_id, { population: fix.estimated_population });
        }
      } else if (type === 'org') {
        if (fix.action === 'DELETE' || fix.action === 'DELETE_DUPLICATE') {
          await base44.entities.Organization.delete(fix.org_id);
        } else if (fix.action === 'REASSIGN') {
          const updates = {};
          if (fix.target_region_id) updates.region_id = fix.target_region_id;
          if (fix.target_city_id) updates.city_id = fix.target_city_id;
          await base44.entities.Organization.update(fix.org_id, updates);
        } else if (fix.action === 'NULLIFY') {
          await base44.entities.Organization.update(fix.org_id, { region_id: null, city_id: null });
        } else if (fix.action === 'FIX_PARTNERSHIP') {
          const updates = {};
          if (fix.suggested_partnership_status) updates.partnership_status = fix.suggested_partnership_status;
          if (typeof fix.suggested_is_partner === 'boolean') updates.is_partner = fix.suggested_is_partner;
          await base44.entities.Organization.update(fix.org_id, updates);
        } else if (fix.action === 'ENRICH_DATA') {
          const updates = {};
          if (fix.suggested_sectors?.length) updates.sectors = fix.suggested_sectors;
          if (fix.suggested_description_en) updates.description_en = fix.suggested_description_en;
          if (fix.suggested_contact_email) updates.contact_email = fix.suggested_contact_email;
          if (fix.suggested_specializations?.length) updates.specializations = fix.suggested_specializations;
          await base44.entities.Organization.update(fix.org_id, updates);
        } else if (fix.action === 'VERIFY') {
          await base44.entities.Organization.update(fix.org_id, {
            is_verified: true,
            verification_date: new Date().toISOString().split('T')[0],
            verification_notes: 'Auto-verified by AI integrity check'
          });
        } else if (fix.action === 'MARK_FOR_REVIEW') {
          await base44.entities.Organization.update(fix.org_id, {
            notes: (fix.reason || 'Flagged by AI for admin review')
          });
        } else if (fix.action === 'FIX_FUNDING_STAGE') {
          const updates = {};
          if (fix.suggested_funding_stage) updates.funding_stage = fix.suggested_funding_stage;
          await base44.entities.Organization.update(fix.org_id, updates);
        } else if (fix.action === 'ADD_COMPLIANCE_NOTE') {
          await base44.entities.Organization.update(fix.org_id, {
            notes: `[COMPLIANCE REQUIRED] ${fix.add_compliance_note || fix.reason}`
          });
        }
      }
      return { type, index };
    },
    onSuccess: (data) => {
      setAiFixResults(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (data.type === 'city') {
          updated.city_fixes = prev.city_fixes.filter((_, i) => i !== data.index);
        } else {
          updated.org_fixes = prev.org_fixes.filter((_, i) => i !== data.index);
        }
        return updated;
      });

      queryClient.invalidateQueries();
      toast.success(t({ en: 'Fix applied', ar: 'تم تطبيق الإصلاح' }));
    },
    onError: (error) => {
      console.error('Fix error:', error);
      toast.error(t({ en: 'Fix failed', ar: 'فشل الإصلاح' }));
    }
  });

  // Generic mutations
  const createMutation = useMutation({
    mutationFn: ({ entity, data }) => {
      if (entity === 'Region') return base44.entities.Region.create(data);
      if (entity === 'City') return base44.entities.City.create(data);
      if (entity === 'Organization') return base44.entities.Organization.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setDialogOpen(false);
      setFormData({});
      toast.success(t({ en: 'Created successfully', ar: 'تم الإنشاء بنجاح' }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ entity, id, data }) => {
      if (entity === 'Region') return base44.entities.Region.update(id, data);
      if (entity === 'City') return base44.entities.City.update(id, data);
      if (entity === 'Organization') return base44.entities.Organization.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setDialogOpen(false);
      setSelectedEntity(null);
      setFormData({});
      toast.success(t({ en: 'Updated successfully', ar: 'تم التحديث بنجاح' }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ entity, id }) => {
      if (entity === 'Region') {
        const dependentCities = cities.filter(c => c.region_id === id);
        const dependentOrgs = organizations.filter(o => o.region_id === id);
        const [dependentChallenges, dependentPilots] = await Promise.all([
          base44.entities.Challenge.list().then(all => all.filter(c => c.region_id === id)),
          base44.entities.Pilot.list().then(all => all.filter(p => p.region_id === id))
        ]);

        const deps = [];
        if (dependentCities.length > 0) deps.push(`${dependentCities.length} cities`);
        if (dependentOrgs.length > 0) deps.push(`${dependentOrgs.length} organizations`);
        if (dependentChallenges.length > 0) deps.push(`${dependentChallenges.length} challenges`);
        if (dependentPilots.length > 0) deps.push(`${dependentPilots.length} pilots`);

        if (deps.length > 0) {
          throw new Error(`Cannot delete region: ${deps.join(', ')} depend on it. Update or delete them first.`);
        }
        return base44.entities.Region.delete(id);

      } else if (entity === 'City') {
        const dependentOrgs = organizations.filter(o => o.city_id === id);
        const [dependentChallenges, dependentPilots] = await Promise.all([
          base44.entities.Challenge.list().then(all => all.filter(c => c.city_id === id)),
          base44.entities.Pilot.list().then(all => all.filter(p => p.city_id === id))
        ]);

        const deps = [];
        if (dependentOrgs.length > 0) deps.push(`${dependentOrgs.length} organizations`);
        if (dependentChallenges.length > 0) deps.push(`${dependentChallenges.length} challenges`);
        if (dependentPilots.length > 0) deps.push(`${dependentPilots.length} pilots`);

        if (deps.length > 0) {
          throw new Error(`Cannot delete city: ${deps.join(', ')} depend on it. Update or delete them first.`);
        }
        return base44.entities.City.delete(id);

      } else if (entity === 'Organization') {
        const [dependentSolutions, dependentPrograms] = await Promise.all([
          base44.entities.Solution.list().then(all => all.filter(s => s.provider_id === id)),
          base44.entities.Program.list().then(all => all.filter(p => p.operator_organization_id === id))
        ]);

        const deps = [];
        if (dependentSolutions.length > 0) deps.push(`${dependentSolutions.length} solutions`);
        if (dependentPrograms.length > 0) deps.push(`${dependentPrograms.length} programs`);

        if (deps.length > 0) {
          throw new Error(`Cannot delete organization: ${deps.join(', ')} depend on it. Update or delete them first.`);
        }
        return base44.entities.Organization.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Deleted successfully', ar: 'تم الحذف بنجاح' }));
    },
    onError: (error) => {
      toast.error(error.message || t({ en: 'Delete failed', ar: 'فشل الحذف' }));
    }
  });

  const handleCreate = (entity) => {
    setSelectedEntity({ entity, mode: 'create' });
    if (entity === 'Region') {
      setFormData({ name_en: '', name_ar: '', code: '', description_en: '', description_ar: '', region_type: 'mixed', coordinates: {} });
    } else if (entity === 'City') {
      setFormData({ region_id: '', name_en: '', name_ar: '', population: 0, is_municipality: true, coordinates: {} });
    } else if (entity === 'Organization') {
      setFormData({ name_en: '', name_ar: '', org_type: 'company', partnership_status: 'none', is_partner: false });
    }
    setDialogOpen(true);
  };

  const handleEdit = (entity, item) => {
    setSelectedEntity({ entity, mode: 'edit', id: item.id });
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (selectedEntity.mode === 'create') {
      createMutation.mutate({ entity: selectedEntity.entity, data: formData });
    } else {
      updateMutation.mutate({ entity: selectedEntity.entity, id: selectedEntity.id, data: formData });
    }
  };

  const EntityTable = ({ data, entity, columns, onEdit, onDelete, filters }) => {
    const [localSearch, setLocalSearch] = useState('');
    const [localFilters, setLocalFilters] = useState({});

    const filtered = data.filter(item => {
      const searchMatch = !localSearch || Object.values(item).some(val =>
        String(val).toLowerCase().includes(localSearch.toLowerCase())
      );

      const filtersMatch = !filters || filters.every(filter => {
        const filterValue = localFilters[filter.key];
        if (!filterValue || filterValue === 'all') return true;
        
        if (filter.key === 'region_id') {
          return item.region_id === filterValue;
        }
        if (filter.key === 'org_type') {
          return item.org_type === filterValue;
        }
        if (filter.key === 'is_active') {
          return item.is_active === (filterValue === 'true');
        }
        return true;
      });

      return searchMatch && filtersMatch;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search...', ar: 'بحث...' })}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>

          {filters?.map(filter => (
            <Select
              key={filter.key}
              value={localFilters[filter.key] || 'all'}
              onValueChange={(val) => setLocalFilters({...localFilters, [filter.key]: val})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label[language]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
                {filter.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <Button onClick={() => handleCreate(entity)} className="bg-gradient-to-r from-blue-600 to-teal-600">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add New', ar: 'إضافة جديد' })}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                    {col.label[language]}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">
                  {t({ en: 'Actions', ar: 'الإجراءات' })}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(entity, item)}
                        className="hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(t({ en: 'Delete this item?', ar: 'حذف هذا العنصر؟' }))) {
                            onDelete(entity, item.id);
                          }
                        }}
                        className="hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 text-center">
          {t({ en: `${filtered.length} of ${data.length} items`, ar: `${filtered.length} من ${data.length} عنصر` })}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-teal-600 to-purple-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Data Management Hub', ar: 'مركز إدارة البيانات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Unified interface with AI enrichment & integrity checking', ar: 'واجهة موحدة مع الإثراء الذكي وفحص السلامة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Regions', ar: 'المناطق' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{regions.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Cities', ar: 'المدن' })}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{cities.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Organizations', ar: 'المنظمات' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{organizations.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="regions">
            <MapPin className="h-4 w-4 mr-2" />
            {t({ en: 'Regions', ar: 'المناطق' })}
          </TabsTrigger>
          <TabsTrigger value="cities">
            <Building2 className="h-4 w-4 mr-2" />
            {t({ en: 'Cities', ar: 'المدن' })}
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building2 className="h-4 w-4 mr-2" />
            {t({ en: 'Organizations', ar: 'المنظمات' })}
          </TabsTrigger>
          <TabsTrigger value="embeddings">
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI Embeddings', ar: 'التضمينات الذكية' })}
          </TabsTrigger>
          <TabsTrigger value="integrity">
            <Database className="h-4 w-4 mr-2" />
            {t({ en: 'Integrity', ar: 'السلامة' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                {t({ en: 'Regions Management', ar: 'إدارة المناطق' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable
                data={regions}
                entity="Region"
                columns={[
                  { key: 'code', label: { en: 'Code', ar: 'الرمز' } },
                  { key: 'name_en', label: { en: 'Name (EN)', ar: 'الاسم (EN)' } },
                  { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
                  { 
                    key: 'population', 
                    label: { en: 'Population', ar: 'السكان' },
                    render: (item) => item.population ? `${(item.population / 1000000).toFixed(1)}M` : '-'
                  }
                ]}
                onEdit={handleEdit}
                onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                {t({ en: 'Cities Management', ar: 'إدارة المدن' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable
                data={cities}
                entity="City"
                columns={[
                  { key: 'name_en', label: { en: 'Name (EN)', ar: 'الاسم (EN)' } },
                  { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
                  {
                    key: 'region_id',
                    label: { en: 'Region', ar: 'المنطقة' },
                    render: (item) => {
                      const region = regions.find(r => r.id === item.region_id);
                      return region?.name_en || item.region_id;
                    }
                  },
                  { 
                    key: 'population', 
                    label: { en: 'Population', ar: 'السكان' },
                    render: (item) => item.population ? `${(item.population / 1000).toFixed(0)}K` : '-'
                  },
                ]}
                filters={[
                  {
                    key: 'region_id',
                    label: { en: 'Region', ar: 'المنطقة' },
                    options: regions.map(r => ({ value: r.id, label: r.name_en }))
                  }
                ]}
                onEdit={handleEdit}
                onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                {t({ en: 'Organizations Management', ar: 'إدارة المنظمات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable
                data={organizations}
                entity="Organization"
                columns={[
                  {
                    key: 'name_en',
                    label: { en: 'Name (EN)', ar: 'الاسم (EN)' },
                    render: (item) => (
                      <Link to={createPageUrl(`OrganizationDetail?id=${item.id}`)} className="text-blue-600 hover:underline">
                        {item.name_en}
                      </Link>
                    )
                  },
                  { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
                  {
                    key: 'org_type',
                    label: { en: 'Type', ar: 'النوع' },
                    render: (item) => <Badge variant="outline">{item.org_type?.replace(/_/g, ' ')}</Badge>
                  },
                  {
                    key: 'data_score',
                    label: { en: 'Data Score', ar: 'درجة البيانات' },
                    render: (item) => {
                      const score = calculateDataScore(item);
                      const color = score >= 80 ? 'bg-green-100 text-green-700' :
                                    score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700';
                      return <Badge className={color}>{score}%</Badge>;
                    }
                  },
                  {
                    key: 'is_active',
                    label: { en: 'Status', ar: 'الحالة' },
                    render: (item) => item.is_active ?
                      <Badge className="bg-green-100 text-green-700">Active</Badge> :
                      <Badge variant="outline">Inactive</Badge>
                  },
                ]}
                filters={[
                  {
                    key: 'org_type',
                    label: { en: 'Type', ar: 'النوع' },
                    options: [
                      { value: 'ministry', label: 'Ministry' },
                      { value: 'municipality', label: 'Municipality' },
                      { value: 'agency', label: 'Agency' },
                      { value: 'university', label: 'University' },
                      { value: 'research_center', label: 'Research Center' },
                      { value: 'company', label: 'Company' },
                      { value: 'startup', label: 'Startup' },
                      { value: 'sme', label: 'SME' },
                      { value: 'ngo', label: 'NGO' },
                      { value: 'international_org', label: 'International Org' }
                    ]
                  },
                  {
                    key: 'is_active',
                    label: { en: 'Status', ar: 'الحالة' },
                    options: [
                      { value: 'true', label: 'Active' },
                      { value: 'false', label: 'Inactive' }
                    ]
                  }
                ]}
                onEdit={handleEdit}
                onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embeddings">
          <div className="space-y-6">
            <EmbeddingManager entities={embeddingStats} />
            <SemanticSearchPanel />
          </div>
        </TabsContent>

        <TabsContent value="integrity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-red-600" />
                  {t({ en: 'Data Integrity Check', ar: 'فحص سلامة البيانات' })}
                </div>
                {(() => {
                  const { orphanedCities, orphanedOrgs } = getOrphanedRecords();
                  const qualityIssues = getDataQualityIssues();
                  const hasIssues = orphanedCities.length > 0 || orphanedOrgs.length > 0 || qualityIssues.length > 0;
                  return hasIssues && (
                    <Button
                      onClick={handleAIAnalyze}
                      disabled={aiFixing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {aiFixing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {t({ en: '✨ AI Analyze', ar: '✨ تحليل ذكي' })}
                    </Button>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiFixResults && (
                <div className="space-y-4">
                  <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-blue-900">
                        {t({ en: 'AI Analysis Complete', ar: 'اكتمل التحليل الذكي' })}
                      </h3>
                      {aiFixResults.total_issues > 0 && (
                        <div className="flex gap-2">
                          <Badge className="bg-red-100 text-red-700">
                            {aiFixResults.critical_count || 0} {t({ en: 'critical', ar: 'حرج' })}
                          </Badge>
                          <Badge variant="outline">
                            {aiFixResults.total_issues} {t({ en: 'total', ar: 'إجمالي' })}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-blue-700">{aiFixResults.summary}</p>
                  </div>

                  {aiFixResults.city_fixes?.map((fix, i) => {
                    const severityColor = fix.action === 'DELETE' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50';
                    return (
                      <div key={i} className={`p-4 border rounded-lg ${severityColor}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{fix.city_name}</p>
                              <Badge variant="outline" className="text-xs">City</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              <span className="font-medium">Action:</span> {fix.action}
                              {fix.target_region_name && ` → ${fix.target_region_name}`}
                              {fix.estimated_population && ` (Pop: ${fix.estimated_population.toLocaleString()})`}
                            </p>
                            <p className="text-sm text-slate-700 mt-2 italic">{fix.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => applyFixMutation.mutate({ type: 'city', fix, index: i })}
                              disabled={applyFixMutation.isPending}
                            >
                              {applyFixMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              {t({ en: 'Apply', ar: 'تطبيق' })}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAiFixResults(prev => ({
                                  ...prev,
                                  city_fixes: prev.city_fixes.filter((_, idx) => idx !== i)
                                }));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {aiFixResults.org_fixes?.map((fix, i) => {
                    const severityColors = {
                      'DELETE': 'border-red-200 bg-red-50',
                      'FIX_PARTNERSHIP': 'border-orange-200 bg-orange-50',
                      'VERIFY': 'border-green-200 bg-green-50',
                      'ENRICH_DATA': 'border-blue-200 bg-blue-50',
                      'REASSIGN': 'border-yellow-200 bg-yellow-50',
                      'NULLIFY': 'border-slate-200 bg-slate-50'
                    };
                    const severityColor = severityColors[fix.action] || 'border-slate-200 bg-white';

                    return (
                      <div key={i} className={`p-4 border rounded-lg ${severityColor}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{fix.org_name}</p>
                              <Badge variant="outline" className="text-xs">Organization</Badge>
                              {fix.issue_type && (
                                <Badge className="text-xs bg-slate-700 text-white">{fix.issue_type}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              <span className="font-medium">Action:</span> {fix.action}
                            </p>
                            <p className="text-sm text-slate-700 mt-2 italic">{fix.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => applyFixMutation.mutate({ type: 'org', fix, index: i })}
                              disabled={applyFixMutation.isPending}
                            >
                              {applyFixMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              {t({ en: 'Apply', ar: 'تطبيق' })}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAiFixResults(prev => ({
                                  ...prev,
                                  org_fixes: prev.org_fixes.filter((_, idx) => idx !== i)
                                }));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {aiFixResults && (!aiFixResults.city_fixes?.length && !aiFixResults.org_fixes?.length) && (
                    <div className="text-center py-8">
                      <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-slate-600">{t({ en: 'All issues resolved!', ar: 'تم حل جميع المشاكل!' })}</p>
                    </div>
                  )}
                </div>
              )}

              {(() => {
                const { orphanedCities, orphanedOrgs } = getOrphanedRecords();
                const dataQualityIssues = getDataQualityIssues();
                const hasIssues = orphanedCities.length > 0 || orphanedOrgs.length > 0 || dataQualityIssues.length > 0;

                return !aiFixResults && (hasIssues ? (
                  <>
                    {dataQualityIssues.map((issue, idx) => {
                      const issueConfig = {
                        duplicate_organizations: {
                          title: { en: 'Duplicate Organizations', ar: 'منظمات مكررة' },
                          desc: { en: 'Similar organization names detected', ar: 'تم اكتشاف أسماء منظمات متشابهة' },
                          color: 'red'
                        },
                        duplicate_cities: {
                          title: { en: 'Duplicate Cities', ar: 'مدن مكررة' },
                          desc: { en: 'Duplicate city entries', ar: 'مدخلات مدن مكررة' },
                          color: 'red'
                        },
                        partnership_mismatch: {
                          title: { en: 'Partnership Inconsistencies', ar: 'تعارضات الشراكة' },
                          desc: { en: 'Mismatched partnership flags', ar: 'علامات شراكة متضاربة' },
                          color: 'orange'
                        },
                        incomplete_profile: {
                          title: { en: 'Incomplete Profiles', ar: 'ملفات غير مكتملة' },
                          desc: { en: 'Missing critical info', ar: 'معلومات حرجة مفقودة' },
                          color: 'blue'
                        },
                        unverified_partners: {
                          title: { en: 'Unverified Partners', ar: 'شركاء غير موثقين' },
                          desc: { en: 'Pending verification', ar: 'بانتظار التوثيق' },
                          color: 'red'
                        },
                        missing_population: {
                          title: { en: 'Missing Population', ar: 'سكان مفقودون' },
                          desc: { en: 'Need population data', ar: 'تحتاج بيانات سكانية' },
                          color: 'slate'
                        },
                        funding_inconsistency: {
                          title: { en: 'Funding Inconsistency', ar: 'تعارض التمويل' },
                          desc: { en: 'Funding stage lacks details', ar: 'مرحلة تمويل بدون تفاصيل' },
                          color: 'orange'
                        },
                        compliance_data_missing: {
                          title: { en: 'Missing Compliance', ar: 'امتثال مفقود' },
                          desc: { en: 'Need compliance data', ar: 'تحتاج بيانات امتثال' },
                          color: 'red'
                        }
                      };

                      const config = issueConfig[issue.type] || {};

                      return (
                        <div key={idx} className="p-4 border rounded-lg bg-slate-50">
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            {config.title?.[language]} ({issue.count})
                            <Badge>{issue.severity}</Badge>
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {config.desc?.[language]}
                          </p>
                          <div className="text-xs text-slate-500">
                            {t({ en: 'Click AI Analyze for fixes', ar: 'اضغط تحليل ذكي للحلول' })}
                          </div>
                        </div>
                      );
                    })}

                    {orphanedCities.length > 0 && (
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h3 className="font-semibold text-red-900 mb-2">
                          {t({ en: 'Orphaned Cities', ar: 'مدن يتيمة' })} ({orphanedCities.length})
                        </h3>
                        <p className="text-sm text-red-700 mb-3">
                          {t({ en: 'Reference deleted regions', ar: 'تشير إلى مناطق محذوفة' })}
                        </p>
                      </div>
                    )}

                    {orphanedOrgs.length > 0 && (
                      <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <h3 className="font-semibold text-orange-900 mb-2">
                          {t({ en: 'Orphaned Organizations', ar: 'منظمات يتيمة' })} ({orphanedOrgs.length})
                        </h3>
                        <p className="text-sm text-orange-700">
                          {t({ en: 'Reference deleted regions/cities', ar: 'تشير إلى مناطق/مدن محذوفة' })}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      {t({ en: 'All Good!', ar: 'كل شيء على ما يرام!' })}
                    </h3>
                    <p className="text-slate-600">
                      {t({ en: 'No orphaned records. Data integrity maintained.', ar: 'لا توجد سجلات يتيمة. سلامة البيانات محفوظة.' })}
                    </p>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Create/Edit Dialog with AI Enrich */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedEntity?.mode === 'create' ?
                  t({ en: `Create ${selectedEntity?.entity}`, ar: `إنشاء ${selectedEntity?.entity}` }) :
                  t({ en: `Edit ${selectedEntity?.entity}`, ar: `تعديل ${selectedEntity?.entity}` })}
              </DialogTitle>
              {selectedEntity?.mode === 'create' && (selectedEntity?.entity === 'Region' || selectedEntity?.entity === 'City') && (
                <Button
                  onClick={selectedEntity.entity === 'Region' ? handleAIEnrichRegion : handleAIEnrichCity}
                  disabled={enriching || (selectedEntity.entity === 'Region' && !formData.name_en) || (selectedEntity.entity === 'City' && (!formData.name_en || !formData.region_id))}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {enriching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'AI Enrich', ar: 'إثراء ذكي' })}
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEntity?.entity === 'Region' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Name (EN)', ar: 'الاسم (EN)' })} *
                    </label>
                    <Input value={formData.name_en || ''} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Name (AR)', ar: 'الاسم (AR)' })} *
                    </label>
                    <Input value={formData.name_ar || ''} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} dir="rtl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Code', ar: 'الرمز' })} *
                    </label>
                    <Input value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Textarea value={formData.description_en || ''} onChange={(e) => setFormData({...formData, description_en: e.target.value})} placeholder="Description (EN)" rows={2} />
                  <Textarea value={formData.description_ar || ''} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} placeholder="الوصف (AR)" rows={2} dir="rtl" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Select value={formData.region_type || 'mixed'} onValueChange={(v) => setFormData({...formData, region_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" value={formData.population || ''} onChange={(e) => setFormData({...formData, population: parseInt(e.target.value)})} placeholder="Population" />
                  <Input type="number" value={formData.area_sqkm || ''} onChange={(e) => setFormData({...formData, area_sqkm: parseFloat(e.target.value)})} placeholder="Area (km²)" />
                  <Input value={formData.governor_name || ''} onChange={(e) => setFormData({...formData, governor_name: e.target.value})} placeholder="Governor" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" step="0.0001" value={formData.coordinates?.latitude || ''} onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, latitude: parseFloat(e.target.value)}})} placeholder="Latitude" />
                  <Input type="number" step="0.0001" value={formData.coordinates?.longitude || ''} onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, longitude: parseFloat(e.target.value)}})} placeholder="Longitude" />
                </div>
              </>
            )}
            {selectedEntity?.entity === 'City' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Region *</label>
                    <Select value={formData.region_id || ''} onValueChange={(val) => setFormData({...formData, region_id: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name (EN) *</label>
                    <Input value={formData.name_en || ''} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name (AR) *</label>
                    <Input value={formData.name_ar || ''} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} dir="rtl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Population</label>
                    <Input type="number" value={formData.population || ''} onChange={(e) => setFormData({...formData, population: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input type="number" value={formData.area_sqkm || ''} onChange={(e) => setFormData({...formData, area_sqkm: parseFloat(e.target.value)})} placeholder="Area (km²)" />
                  <Input type="number" step="0.0001" value={formData.coordinates?.latitude || ''} onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, latitude: parseFloat(e.target.value)}})} placeholder="Latitude" />
                  <Input type="number" step="0.0001" value={formData.coordinates?.longitude || ''} onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, longitude: parseFloat(e.target.value)}})} placeholder="Longitude" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input value={formData.mayor_name || ''} onChange={(e) => setFormData({...formData, mayor_name: e.target.value})} placeholder="Mayor" />
                  <Input value={formData.city_website || ''} onChange={(e) => setFormData({...formData, city_website: e.target.value})} placeholder="Website" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_municipality} onCheckedChange={(checked) => setFormData({...formData, is_municipality: checked})} />
                  <label className="text-sm">{t({ en: 'Has municipality', ar: 'لديها بلدية' })}</label>
                </div>
              </>
            )}
            {selectedEntity?.entity === 'Organization' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input value={formData.name_en || ''} onChange={(e) => setFormData({...formData, name_en: e.target.value})} placeholder="Name (EN)" />
                  <Input value={formData.name_ar || ''} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} placeholder="Name (AR)" dir="rtl" />
                </div>
                <Select value={formData.org_type || ''} onValueChange={(val) => setFormData({...formData, org_type: val})}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ministry">Ministry</SelectItem>
                    <SelectItem value="municipality">Municipality</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="email" value={formData.contact_email || ''} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} placeholder="Email" />
              </>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(DataManagementHub, { requireAdmin: true });