import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch";
import {
  MapPin, Building2, Plus, Loader2, Globe, Briefcase, Sparkles, Database, Landmark, Target
} from 'lucide-react';
import LookupDataManager from '../components/admin/LookupDataManager';
import StrategyLookupsTab from '../components/admin/lookup/StrategyLookupsTab';
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
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

// Import tab components
import { RegionsTab } from '@/components/data-management/RegionsTab';
import { CitiesTab } from '@/components/data-management/CitiesTab';
import { MunicipalitiesTab } from '@/components/data-management/MunicipalitiesTab';
import { OrganizationsTab } from '@/components/data-management/OrganizationsTab';
import { IntegrityTab } from '@/components/data-management/IntegrityTab';

function DataManagementHub() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const { invokeAI, isLoading: enriching } = useAIWithFallback();

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

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('municipalities').select('id');
      if (error) throw error;
      return data || [];
    }
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

    const result = await invokeAI({
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

    if (result.success) {
      setFormData({ ...formData, ...result.data });
      toast.success(t({ en: '✅ Data enriched', ar: '✅ تم الإثراء' }));
    }
  };

  const handleAIEnrichCity = async () => {
    if (!formData.name_en || !formData.region_id) {
      toast.error(t({ en: 'Please enter city name and region', ar: 'يرجى إدخال اسم المدينة والمنطقة' }));
      return;
    }

    const regionName = regions.find(r => r.id === formData.region_id)?.name_en || '';

    const result = await invokeAI({
      prompt: `Provide data for Saudi city: ${formData.name_en} in ${regionName}

Using web search:
1. Arabic name
2. Population
3. Area (km²)
4. Coordinates (lat, lng)
5. Mayor name
6. Website URL
7. Economic indicators (GDP per capita, unemployment rate, key industries)`,
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

    if (result.success) {
      setFormData({ ...formData, ...result.data });
      toast.success(t({ en: '✅ Data enriched', ar: '✅ تم الإثراء' }));
    }
  };

  const handleAIEnrichMunicipality = async () => {
    if (!formData.name_en) {
      toast.error(t({ en: 'Please enter municipality name first', ar: 'يرجى إدخال اسم البلدية أولاً' }));
      return;
    }

    const regionName = formData.region_id ? regions.find(r => r.id === formData.region_id)?.name_en : '';

    const result = await invokeAI({
      prompt: `Provide data for Saudi municipality: ${formData.name_en}${regionName ? ` in ${regionName}` : ''}

Using web search:
1. Arabic name
2. Population estimate
3. Area (km²)
4. Geographic center coordinates (lat, lng)
5. Municipality type (national/regional/city/district)
6. Contact email and phone
7. Website URL
8. Mayor/Leader name`,
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
          municipality_type: { type: 'string' },
          contact_email: { type: 'string' },
          contact_phone: { type: 'string' },
          website: { type: 'string' },
          mayor_name: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setFormData({ ...formData, ...result.data });
      toast.success(t({ en: '✅ Data enriched', ar: '✅ تم الإثراء' }));
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

  // Generic mutations
  const createMutation = useMutation({
    mutationFn: async ({ entity, data }) => {
      if (entity === 'Region') return base44.entities.Region.create(data);
      if (entity === 'City') return base44.entities.City.create(data);
      if (entity === 'Organization') return base44.entities.Organization.create(data);
      if (entity === 'Municipality') {
        const { error } = await supabase.from('municipalities').insert([data]);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setDialogOpen(false);
      setFormData({});
      toast.success(t({ en: 'Created successfully', ar: 'تم الإنشاء بنجاح' }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ entity, id, data }) => {
      if (entity === 'Region') return base44.entities.Region.update(id, data);
      if (entity === 'City') return base44.entities.City.update(id, data);
      if (entity === 'Organization') return base44.entities.Organization.update(id, data);
      if (entity === 'Municipality') {
        const { error } = await supabase.from('municipalities').update(data).eq('id', id);
        if (error) throw error;
        return data;
      }
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
      } else if (entity === 'Municipality') {
        const { error } = await supabase.from('municipalities').delete().eq('id', id);
        if (error) throw error;
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
    } else if (entity === 'Municipality') {
      setFormData({ name_en: '', name_ar: '', municipality_type: 'city', region_id: '', population: 0, coordinates: {} });
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

  return (
    <PageLayout>
      <PageHeader
        icon={Database}
        title={{ en: 'Data Management Hub', ar: 'مركز إدارة البيانات' }}
        description={{ en: 'Unified interface with AI enrichment & integrity checking', ar: 'واجهة موحدة مع الإثراء الذكي وفحص السلامة' }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Regions', ar: 'المناطق' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{regions.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/30 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Cities', ar: 'المدن' })}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{cities.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{municipalities.length}</p>
              </div>
              <Landmark className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Organizations', ar: 'المنظمات' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{organizations.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="regions">
            <MapPin className="h-4 w-4 mr-2" />
            {t({ en: 'Regions', ar: 'المناطق' })}
          </TabsTrigger>
          <TabsTrigger value="cities">
            <Building2 className="h-4 w-4 mr-2" />
            {t({ en: 'Cities', ar: 'المدن' })}
          </TabsTrigger>
          <TabsTrigger value="municipalities">
            <Landmark className="h-4 w-4 mr-2" />
            {t({ en: 'Municipalities', ar: 'البلديات' })}
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building2 className="h-4 w-4 mr-2" />
            {t({ en: 'Organizations', ar: 'المنظمات' })}
          </TabsTrigger>
          <TabsTrigger value="lookups">
            <Briefcase className="h-4 w-4 mr-2" />
            {t({ en: 'Lookups', ar: 'القوائم' })}
          </TabsTrigger>
          <TabsTrigger value="strategy-lookups">
            <Target className="h-4 w-4 mr-2" />
            {t({ en: 'Strategy', ar: 'الاستراتيجية' })}
          </TabsTrigger>
          <TabsTrigger value="quality">
            <Globe className="h-4 w-4 mr-2" />
            {t({ en: 'Quality', ar: 'الجودة' })}
          </TabsTrigger>
          <TabsTrigger value="embeddings">
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI', ar: 'الذكاء' })}
          </TabsTrigger>
          <TabsTrigger value="integrity">
            <Database className="h-4 w-4 mr-2" />
            {t({ en: 'Integrity', ar: 'السلامة' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions">
          <RegionsTab
            regions={regions}
            onEdit={handleEdit}
            onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
            onAdd={handleCreate}
          />
        </TabsContent>

        <TabsContent value="cities">
          <CitiesTab
            cities={cities}
            regions={regions}
            onEdit={handleEdit}
            onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
            onAdd={handleCreate}
          />
        </TabsContent>

        <TabsContent value="municipalities">
          <MunicipalitiesTab
            regions={regions}
            onEdit={handleEdit}
            onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
            onAdd={handleCreate}
          />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationsTab
            organizations={organizations}
            onEdit={handleEdit}
            onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
            onAdd={handleCreate}
            calculateDataScore={calculateDataScore}
          />
        </TabsContent>

        <TabsContent value="lookups">
          <LookupDataManager />
        </TabsContent>

        <TabsContent value="strategy-lookups">
          <StrategyLookupsTab />
        </TabsContent>

        {/* Quality Tab - Migrated from DataQualityDashboard */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {t({ en: 'Data Quality Dashboard', ar: 'لوحة جودة البيانات' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const challengeCompleteness = challenges.length > 0 
                    ? Math.round((challenges.filter(c => c.title_en && c.description_en && c.sector && c.municipality_id).length / challenges.length) * 100) 
                    : 0;
                  const solutionCompleteness = solutions.length > 0
                    ? Math.round((solutions.filter(s => s.title_en && s.description_en && s.provider_id).length / solutions.length) * 100)
                    : 0;
                  
                  const metrics = [
                    { label: { en: 'Challenge Data Quality', ar: 'جودة بيانات التحديات' }, value: challengeCompleteness, total: challenges.length },
                    { label: { en: 'Solution Data Quality', ar: 'جودة بيانات الحلول' }, value: solutionCompleteness, total: solutions.length },
                  ];
                  
                  return metrics.map((metric, i) => {
                    const color = metric.value >= 80 ? 'green' : metric.value >= 50 ? 'yellow' : 'red';
                    return (
                      <Card key={i} className={`border-2 ${color === 'green' ? 'border-green-200 bg-green-50' : color === 'yellow' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <Database className={`h-8 w-8 text-${color}-600`} />
                            <span className={`text-2xl font-bold ${color === 'green' ? 'text-green-600' : color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {metric.value}%
                            </span>
                          </div>
                          <p className="font-medium text-slate-900">{metric.label[language]}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {t({ en: `${metric.total} records analyzed`, ar: `${metric.total} سجل محلل` })}
                          </p>
                          <div className="w-full bg-white rounded-full h-2 mt-3">
                            <div 
                              className={`h-2 rounded-full transition-all ${color === 'green' ? 'bg-green-600' : color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600'}`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })()}
              </div>
              
              {/* Quality Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t({ en: 'Data Quality Issues', ar: 'مشاكل جودة البيانات' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-900">
                      {challenges.filter(c => !c.title_en).length} {t({ en: 'challenges missing title', ar: 'تحدي بدون عنوان' })}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">
                      {challenges.filter(c => !c.municipality_id).length} {t({ en: 'challenges not linked to municipality', ar: 'تحدي غير مرتبط ببلدية' })}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">
                      {solutions.filter(s => !s.provider_id).length} {t({ en: 'solutions missing provider', ar: 'حلول بدون مزود' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
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
          <IntegrityTab
            regions={regions}
            cities={cities}
            organizations={organizations}
            getOrphanedRecords={getOrphanedRecords}
            getDataQualityIssues={getDataQualityIssues}
            calculateDataScore={calculateDataScore}
          />
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
              {selectedEntity?.mode === 'create' && ['Region', 'City', 'Municipality'].includes(selectedEntity?.entity) && (
                <Button
                  onClick={
                    selectedEntity.entity === 'Region' ? handleAIEnrichRegion :
                    selectedEntity.entity === 'City' ? handleAIEnrichCity :
                    handleAIEnrichMunicipality
                  }
                  disabled={enriching || (selectedEntity.entity === 'Region' && !formData.name_en) || (selectedEntity.entity === 'City' && (!formData.name_en || !formData.region_id)) || (selectedEntity.entity === 'Municipality' && !formData.name_en)}
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
            {selectedEntity?.entity === 'Municipality' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name (EN) *</label>
                    <Input value={formData.name_en || ''} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name (AR) *</label>
                    <Input value={formData.name_ar || ''} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} dir="rtl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Region</label>
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
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={formData.municipality_type || 'city'} onValueChange={(val) => setFormData({...formData, municipality_type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">{t({ en: 'National', ar: 'وطنية' })}</SelectItem>
                        <SelectItem value="regional">{t({ en: 'Regional', ar: 'إقليمية' })}</SelectItem>
                        <SelectItem value="city">{t({ en: 'City', ar: 'مدينة' })}</SelectItem>
                        <SelectItem value="district">{t({ en: 'District', ar: 'بلدية فرعية' })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Population</label>
                    <Input type="number" value={formData.population || ''} onChange={(e) => setFormData({...formData, population: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">MII Score</label>
                    <Input type="number" min="0" max="100" value={formData.mii_score || ''} onChange={(e) => setFormData({...formData, mii_score: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Area (km²)</label>
                    <Input type="number" value={formData.area_sqkm || ''} onChange={(e) => setFormData({...formData, area_sqkm: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Email</label>
                    <Input type="email" value={formData.contact_email || ''} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                    <Input value={formData.contact_phone || ''} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website</label>
                    <Input value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mayor Name</label>
                    <Input value={formData.mayor_name || ''} onChange={(e) => setFormData({...formData, mayor_name: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" step="0.0001" value={formData.coordinates?.latitude || ''} onChange={(e) => setFormData({...formData, coordinates: {...(formData.coordinates || {}), latitude: parseFloat(e.target.value)}})} placeholder="Latitude" />
                  <Input type="number" step="0.0001" value={formData.coordinates?.longitude || ''} onChange={(e) => setFormData({...formData, coordinates: {...(formData.coordinates || {}), longitude: parseFloat(e.target.value)}})} placeholder="Longitude" />
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
    </PageLayout>
  );
}

export default ProtectedPage(DataManagementHub, { requireAdmin: true });
