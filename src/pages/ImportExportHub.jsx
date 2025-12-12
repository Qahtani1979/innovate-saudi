import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { 
  Upload, Download, FileSpreadsheet, FileText, Database, 
  Loader2, CheckCircle, AlertCircle, FileUp, RefreshCw,
  History, Settings, Wand2, Filter, Calendar, XCircle, Sparkles
} from 'lucide-react';
import AIDataUploader from '@/components/ai-uploader/AIDataUploader';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

// Complete entity definitions with all columns and relations
const ENTITY_DEFINITIONS = {
  challenges: {
    label: 'Challenges',
    table: 'challenges',
    requiredColumns: ['title_en'],
    templateColumns: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'problem_statement_en', 'category', 'challenge_type', 'priority', 'status', 'source', 'strategic_goal', 'budget_estimate', 'timeline_estimate', 'sector_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        problem_statement_en: { type: 'string' },
        category: { type: 'string' },
        challenge_type: { type: 'string' },
        priority: { type: 'string', enum: ['tier_1', 'tier_2', 'tier_3'] },
        status: { type: 'string' },
        source: { type: 'string' },
        budget_estimate: { type: 'number' }
      },
      required: ['title_en']
    },
    relations: { sector_id: 'sectors', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  solutions: {
    label: 'Solutions',
    table: 'solutions',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'tagline_en', 'solution_type', 'maturity_level', 'pricing_model', 'deployment_options', 'implementation_time', 'provider_id', 'status'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        solution_type: { type: 'string' },
        maturity_level: { type: 'string' },
        pricing_model: { type: 'string' },
        provider_id: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: { provider_id: 'providers' },
    hasDeleted: true
  },
  pilots: {
    label: 'Pilots',
    table: 'pilots',
    requiredColumns: ['title_en'],
    templateColumns: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'pilot_type', 'stage', 'status', 'start_date', 'end_date', 'budget', 'challenge_id', 'solution_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        pilot_type: { type: 'string' },
        stage: { type: 'string' },
        status: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
        budget: { type: 'number' }
      },
      required: ['title_en']
    },
    relations: { challenge_id: 'challenges', solution_id: 'solutions', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  programs: {
    label: 'Programs',
    table: 'programs',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'program_type', 'status', 'start_date', 'end_date', 'budget', 'sector_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        program_type: { type: 'string' },
        status: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' }
      },
      required: ['name_en']
    },
    relations: { sector_id: 'sectors', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  providers: {
    label: 'Providers',
    table: 'providers',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'provider_type', 'company_size', 'website', 'email', 'phone', 'country', 'city', 'status'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        provider_type: { type: 'string' },
        company_size: { type: 'string' },
        website: { type: 'string' },
        email: { type: 'string' },
        country: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: {},
    hasDeleted: true
  },
  organizations: {
    label: 'Organizations',
    table: 'organizations',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'organization_type', 'website', 'email', 'phone', 'country', 'city'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        organization_type: { type: 'string' },
        website: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: {},
    hasDeleted: true
  },
  rd_projects: {
    label: 'R&D Projects',
    table: 'rd_projects',
    requiredColumns: ['title_en'],
    templateColumns: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'project_type', 'status', 'start_date', 'end_date', 'budget', 'sector_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        project_type: { type: 'string' },
        status: { type: 'string' },
        budget: { type: 'number' }
      },
      required: ['title_en']
    },
    relations: { sector_id: 'sectors', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  sandboxes: {
    label: 'Sandboxes',
    table: 'sandboxes',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'sandbox_type', 'status', 'start_date', 'end_date', 'sector_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        sandbox_type: { type: 'string' },
        status: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: { sector_id: 'sectors', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  living_labs: {
    label: 'Living Labs',
    table: 'living_labs',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'lab_type', 'status', 'location', 'capacity', 'sector_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        lab_type: { type: 'string' },
        status: { type: 'string' },
        location: { type: 'string' },
        capacity: { type: 'number' }
      },
      required: ['name_en']
    },
    relations: { sector_id: 'sectors', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  case_studies: {
    label: 'Case Studies',
    table: 'case_studies',
    requiredColumns: ['title_en'],
    templateColumns: ['title_en', 'title_ar', 'description_en', 'description_ar', 'challenge_description', 'solution_description', 'implementation_details', 'results_achieved', 'lessons_learned', 'entity_type', 'entity_id', 'sector_id', 'municipality_id', 'is_published', 'is_featured'],
    aiSchema: {
      type: 'object',
      properties: {
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        challenge_description: { type: 'string' },
        solution_description: { type: 'string' },
        results_achieved: { type: 'string' },
        lessons_learned: { type: 'string' }
      },
      required: ['title_en']
    },
    relations: { sector_id: 'sectors', municipality_id: 'municipalities' },
    hasDeleted: false
  },
  events: {
    label: 'Events',
    table: 'events',
    requiredColumns: ['title_en'],
    templateColumns: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'event_type', 'status', 'start_date', 'end_date', 'location', 'max_participants', 'is_public'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        event_type: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
        location: { type: 'string' }
      },
      required: ['title_en']
    },
    relations: {},
    hasDeleted: true
  },
  municipalities: {
    label: 'Municipalities',
    table: 'municipalities',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'region_id', 'population', 'area', 'is_active'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        population: { type: 'number' }
      },
      required: ['name_en']
    },
    relations: { region_id: 'regions' },
    hasDeleted: false,
    exportOnly: true
  },
  sectors: {
    label: 'Sectors',
    table: 'sectors',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon', 'color', 'is_active'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: {},
    hasDeleted: false
  },
  regions: {
    label: 'Regions',
    table: 'regions',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'is_active'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: {},
    hasDeleted: false
  },
  cities: {
    label: 'Cities',
    table: 'cities',
    requiredColumns: ['name_en', 'name_ar'],
    templateColumns: ['name_en', 'name_ar', 'region_id', 'municipality_id', 'population', 'is_active'],
    aiSchema: {
      type: 'object',
      properties: {
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        population: { type: 'number' }
      },
      required: ['name_en', 'name_ar']
    },
    relations: { region_id: 'regions', municipality_id: 'municipalities' },
    hasDeleted: false
  },
  strategic_plans: {
    label: 'Strategic Plans',
    table: 'strategic_plans',
    requiredColumns: ['title_en'],
    templateColumns: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'plan_type', 'status', 'start_date', 'end_date', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        plan_type: { type: 'string' },
        status: { type: 'string' }
      },
      required: ['title_en']
    },
    relations: { municipality_id: 'municipalities' },
    hasDeleted: true
  },
  rd_calls: {
    label: 'R&D Calls',
    table: 'rd_calls',
    requiredColumns: ['title_en'],
    templateColumns: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'call_type', 'status', 'start_date', 'end_date', 'budget', 'sector_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        call_type: { type: 'string' },
        status: { type: 'string' },
        budget: { type: 'number' }
      },
      required: ['title_en']
    },
    relations: { sector_id: 'sectors' },
    hasDeleted: true
  },
  citizen_ideas: {
    label: 'Citizen Ideas',
    table: 'citizen_ideas',
    requiredColumns: ['title'],
    templateColumns: ['title', 'description', 'category', 'status', 'municipality_id', 'is_published'],
    aiSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        status: { type: 'string' }
      },
      required: ['title']
    },
    relations: { municipality_id: 'municipalities' },
    hasDeleted: false,
    exportOnly: true
  },
  contracts: {
    label: 'Contracts',
    table: 'contracts',
    requiredColumns: ['title_en', 'contract_code'],
    templateColumns: ['contract_code', 'title_en', 'title_ar', 'contract_type', 'status', 'contract_value', 'currency', 'start_date', 'end_date', 'provider_id', 'pilot_id', 'municipality_id'],
    aiSchema: {
      type: 'object',
      properties: {
        contract_code: { type: 'string' },
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        contract_type: { type: 'string' },
        contract_value: { type: 'number' },
        currency: { type: 'string' }
      },
      required: ['title_en', 'contract_code']
    },
    relations: { provider_id: 'providers', pilot_id: 'pilots', municipality_id: 'municipalities' },
    hasDeleted: true
  },
  budgets: {
    label: 'Budgets',
    table: 'budgets',
    requiredColumns: ['name_en', 'total_amount'],
    templateColumns: ['budget_code', 'name_en', 'name_ar', 'total_amount', 'allocated_amount', 'spent_amount', 'currency', 'fiscal_year', 'status', 'entity_type', 'entity_id'],
    aiSchema: {
      type: 'object',
      properties: {
        budget_code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        total_amount: { type: 'number' },
        currency: { type: 'string' },
        fiscal_year: { type: 'number' }
      },
      required: ['name_en', 'total_amount']
    },
    relations: {},
    hasDeleted: true
  },
  tags: {
    label: 'Tags',
    table: 'tags',
    requiredColumns: ['name_en'],
    templateColumns: ['name_en', 'name_ar', 'category', 'color', 'is_active'],
    aiSchema: {
      type: 'object',
      properties: {
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        category: { type: 'string' },
        color: { type: 'string' }
      },
      required: ['name_en']
    },
    relations: {},
    hasDeleted: false
  },
  kpi_references: {
    label: 'KPI References',
    table: 'kpi_references',
    requiredColumns: ['name_en'],
    templateColumns: ['code', 'name_en', 'name_ar', 'description_en', 'unit', 'category', 'target_value', 'sector_id'],
    aiSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        unit: { type: 'string' },
        category: { type: 'string' },
        target_value: { type: 'number' }
      },
      required: ['name_en']
    },
    relations: { sector_id: 'sectors' },
    hasDeleted: false
  }
};

const EXPORTABLE_ENTITIES = Object.entries(ENTITY_DEFINITIONS).map(([value, def]) => ({
  value,
  label: def.label,
  table: def.table
}));

const IMPORTABLE_ENTITIES = Object.entries(ENTITY_DEFINITIONS)
  .filter(([_, def]) => !def.exportOnly)
  .map(([value, def]) => ({
    value,
    label: def.label,
    table: def.table
  }));

function ImportExportHub() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ai-uploader');
  
  // Export state
  const [exportEntity, setExportEntity] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    includeDeleted: false,
    publishedOnly: false,
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [selectedFields, setSelectedFields] = useState([]);
  
  // Import state
  const [importEntity, setImportEntity] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [useAIExtraction, setUseAIExtraction] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Reference data for foreign key lookups
  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors-lookup'],
    queryFn: async () => {
      const { data } = await supabase.from('sectors').select('id, name_en, code').eq('is_active', true);
      return data || [];
    }
  });
  
  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-lookup'],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('id, name_en, code').eq('is_active', true);
      return data || [];
    }
  });
  
  const { data: regions = [] } = useQuery({
    queryKey: ['regions-lookup'],
    queryFn: async () => {
      const { data } = await supabase.from('regions').select('id, name_en, code').eq('is_active', true);
      return data || [];
    }
  });
  
  const { data: providers = [] } = useQuery({
    queryKey: ['providers-lookup'],
    queryFn: async () => {
      const { data } = await supabase.from('providers').select('id, name_en, code').eq('is_deleted', false);
      return data || [];
    }
  });

  // Export & Import history
  const { data: exportHistory = [] } = useQuery({
    queryKey: ['export-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('access_logs')
        .select('*')
        .eq('action', 'data_export')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    }
  });

  const { data: importHistory = [] } = useQuery({
    queryKey: ['import-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('access_logs')
        .select('*')
        .eq('action', 'data_import')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    }
  });

  // Get available fields for selected export entity
  const availableFields = useMemo(() => {
    if (!exportEntity || !ENTITY_DEFINITIONS[exportEntity]) return [];
    return ENTITY_DEFINITIONS[exportEntity].templateColumns;
  }, [exportEntity]);

  // Reset selected fields when entity changes
  React.useEffect(() => {
    if (availableFields.length > 0) {
      setSelectedFields(availableFields);
    }
  }, [availableFields]);

  const handleExport = async () => {
    if (!exportEntity) {
      toast.error('Please select an entity to export');
      return;
    }

    setExporting(true);
    try {
      const entityDef = ENTITY_DEFINITIONS[exportEntity];
      let query = supabase.from(entityDef.table).select('*');

      // Apply is_deleted filter
      if (entityDef.hasDeleted && !exportFilters.includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      // Apply published filter
      if (exportFilters.publishedOnly) {
        query = query.eq('is_published', true);
      }

      // Apply status filter
      if (exportFilters.status) {
        query = query.eq('status', exportFilters.status);
      }

      // Apply date range filter
      if (exportFilters.dateFrom) {
        query = query.gte('created_at', exportFilters.dateFrom);
      }
      if (exportFilters.dateTo) {
        query = query.lte('created_at', exportFilters.dateTo + 'T23:59:59');
      }

      const { data, error } = await query.limit(50000);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No data to export');
        setExporting(false);
        return;
      }

      // Filter to selected fields only
      const fieldsToExport = selectedFields.length > 0 ? selectedFields : Object.keys(data[0]);
      const filteredData = data.map(row => {
        const filtered = {};
        fieldsToExport.forEach(field => {
          let value = row[field];
          // Resolve foreign key names
          if (field.endsWith('_id') && value) {
            const lookupTable = field.replace('_id', '');
            if (lookupTable === 'sector' && sectors.length) {
              const sector = sectors.find(s => s.id === value);
              filtered[field.replace('_id', '_name')] = sector?.name_en || '';
            } else if (lookupTable === 'municipality' && municipalities.length) {
              const muni = municipalities.find(m => m.id === value);
              filtered[field.replace('_id', '_name')] = muni?.name_en || '';
            } else if (lookupTable === 'region' && regions.length) {
              const region = regions.find(r => r.id === value);
              filtered[field.replace('_id', '_name')] = region?.name_en || '';
            } else if (lookupTable === 'provider' && providers.length) {
              const provider = providers.find(p => p.id === value);
              filtered[field.replace('_id', '_name')] = provider?.name_en || '';
            }
          }
          filtered[field] = value;
        });
        return filtered;
      });

      const filename = `${exportEntity}-${new Date().toISOString().split('T')[0]}`;
      
      if (exportFormat === 'csv') {
        const headers = Object.keys(filteredData[0]);
        const csvContent = [
          headers.join(','),
          ...filteredData.map(row => 
            headers.map(h => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',')
          )
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${filename}.csv`);
      } else {
        const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${filename}.json`);
      }

      // Log export
      await supabase.from('access_logs').insert({
        action: 'data_export',
        entity_type: exportEntity,
        metadata: { 
          format: exportFormat, 
          count: data.length,
          filters: exportFilters,
          fields: selectedFields.length
        }
      });

      toast.success(`Exported ${data.length} ${entityDef.label} records`);
      queryClient.invalidateQueries(['export-history']);
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    setValidationErrors([]);
    
    // Preview CSV content
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const lines = text.split('\n').slice(0, 6);
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
      });
      setImportPreview({ headers, rows, totalLines: text.split('\n').filter(l => l.trim()).length - 1 });
    } else if (file.name.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      setImportPreview({ 
        headers: items.length > 0 ? Object.keys(items[0]) : [],
        rows: items.slice(0, 5),
        totalLines: items.length
      });
    }
  };

  const validateImportData = (records, entityDef) => {
    const errors = [];
    const requiredCols = entityDef.requiredColumns || [];
    
    records.forEach((record, index) => {
      requiredCols.forEach(col => {
        if (!record[col] || record[col].toString().trim() === '') {
          errors.push(`Row ${index + 1}: Missing required field "${col}"`);
        }
      });
    });
    
    return errors;
  };

  const checkDuplicates = async (records, entityDef) => {
    const duplicates = [];
    const codeCol = entityDef.templateColumns.includes('code') ? 'code' : null;
    
    if (codeCol) {
      const codes = records.map(r => r[codeCol]).filter(Boolean);
      if (codes.length > 0) {
        const { data } = await supabase
          .from(entityDef.table)
          .select('code')
          .in('code', codes);
        
        if (data && data.length > 0) {
          duplicates.push(...data.map(d => d.code));
        }
      }
    }
    
    return duplicates;
  };

  // AI-powered import using base44
  const aiImportMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const entityDef = ENTITY_DEFINITIONS[importEntity];
      
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: entityDef.aiSchema
      });

      if (extracted.status === 'success' && extracted.output) {
        const data = Array.isArray(extracted.output) ? extracted.output : [extracted.output];
        
        // Validate before insert
        const errors = validateImportData(data, entityDef);
        if (errors.length > 0) {
          throw new Error(`Validation failed: ${errors.slice(0, 3).join('; ')}`);
        }
        
        const { error } = await supabase.from(entityDef.table).insert(data);
        if (error) throw error;
        
        // Log import
        await supabase.from('access_logs').insert({
          action: 'data_import',
          entity_type: importEntity,
          metadata: { count: data.length, method: 'ai', filename: file.name }
        });
        
        return { success: true, count: data.length };
      }
      throw new Error(extracted.details || 'AI extraction failed');
    },
    onSuccess: (data) => {
      toast.success(t({ en: `${data.count} records imported with AI`, ar: `تم استيراد ${data.count} سجل بالذكاء الاصطناعي` }));
      queryClient.invalidateQueries([importEntity]);
      queryClient.invalidateQueries(['import-history']);
      setImportFile(null);
      setImportPreview(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleImport = async () => {
    if (!importEntity || !importFile) {
      toast.error('Please select entity and file');
      return;
    }

    const entityDef = ENTITY_DEFINITIONS[importEntity];

    // Use AI extraction for PDF/Excel files or when explicitly enabled
    if (useAIExtraction || importFile.name.endsWith('.pdf') || importFile.name.endsWith('.xlsx')) {
      aiImportMutation.mutate(importFile);
      return;
    }

    setImporting(true);
    setValidationErrors([]);
    
    try {
      const text = await importFile.text();
      let records = [];

      if (importFile.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        records = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = parseCSVLine(line);
          return headers.reduce((obj, h, i) => {
            const val = values[i];
            // Handle empty strings as null
            obj[h] = val === '' || val === undefined ? null : val;
            return obj;
          }, {});
        });
      } else {
        const data = JSON.parse(text);
        records = Array.isArray(data) ? data : [data];
      }

      // Validate data
      const errors = validateImportData(records, entityDef);
      if (errors.length > 0) {
        setValidationErrors(errors.slice(0, 10));
        toast.error(`Validation failed: ${errors.length} error(s) found`);
        setImporting(false);
        return;
      }

      // Check for duplicates
      const duplicates = await checkDuplicates(records, entityDef);
      if (duplicates.length > 0) {
        toast.warning(`Found ${duplicates.length} duplicate code(s): ${duplicates.slice(0, 3).join(', ')}...`);
      }

      // Remove id fields and clean data
      records = records.map(r => {
        const { id, created_at, updated_at, ...rest } = r;
        // Remove empty string values for non-required fields
        Object.keys(rest).forEach(key => {
          if (rest[key] === '') rest[key] = null;
        });
        return rest;
      });

      const { error } = await supabase.from(entityDef.table).insert(records);

      if (error) throw error;

      // Log import
      await supabase.from('access_logs').insert({
        action: 'data_import',
        entity_type: importEntity,
        metadata: { count: records.length, method: 'direct', filename: importFile.name }
      });

      toast.success(`Imported ${records.length} records to ${entityDef.label}`);
      queryClient.invalidateQueries([importEntity]);
      queryClient.invalidateQueries(['import-history']);
      setImportFile(null);
      setImportPreview(null);
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  // Proper CSV line parser that handles quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const downloadTemplate = (entityValue) => {
    const entityDef = ENTITY_DEFINITIONS[entityValue];
    if (!entityDef) {
      toast.error('Entity template not found');
      return;
    }
    
    const csv = entityDef.templateColumns.join(',');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${entityValue}-template.csv`);
    toast.success('Template downloaded');
  };

  const isImportPending = importing || aiImportMutation.isPending;

  return (
    <PageLayout>
      <PageHeader 
        title={{ en: "Import & Export Hub", ar: "مركز الاستيراد والتصدير" }}
        subtitle={{ en: "Centralized data import and export management with validation", ar: "إدارة مركزية لاستيراد وتصدير البيانات مع التحقق" }}
        icon={Database}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="ai-uploader" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t({ en: "AI Uploader", ar: "الرافع الذكي" })}
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t({ en: "Export", ar: "تصدير" })}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t({ en: "Import", ar: "استيراد" })}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t({ en: "History", ar: "السجل" })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-uploader" className="space-y-6">
          <AIDataUploader 
            onComplete={(results) => {
              queryClient.invalidateQueries();
              toast.success(`Successfully imported ${results?.inserted || 0} records`);
            }}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  {t({ en: "Export Data", ar: "تصدير البيانات" })}
                </CardTitle>
                <CardDescription>
                  {t({ en: "Export entity data to CSV or JSON format with filters", ar: "تصدير بيانات الكيان بتنسيق CSV أو JSON مع الفلاتر" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ en: "Select Entity", ar: "اختر الكيان" })}</Label>
                  <Select value={exportEntity} onValueChange={setExportEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: "Choose entity to export", ar: "اختر الكيان للتصدير" })} />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORTABLE_ENTITIES.map(entity => (
                        <SelectItem key={entity.value} value={entity.value}>
                          {entity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: "Export Format", ar: "تنسيق التصدير" })}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={exportFormat === 'csv' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat('csv')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV/Excel
                    </Button>
                    <Button
                      variant={exportFormat === 'json' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat('json')}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <Label className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {t({ en: "Filters", ar: "الفلاتر" })}
                  </Label>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="include-deleted"
                      checked={exportFilters.includeDeleted}
                      onCheckedChange={(checked) => setExportFilters(f => ({ ...f, includeDeleted: checked }))}
                    />
                    <Label htmlFor="include-deleted" className="text-sm">
                      {t({ en: "Include deleted records", ar: "تضمين السجلات المحذوفة" })}
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="published-only"
                      checked={exportFilters.publishedOnly}
                      onCheckedChange={(checked) => setExportFilters(f => ({ ...f, publishedOnly: checked }))}
                    />
                    <Label htmlFor="published-only" className="text-sm">
                      {t({ en: "Published only", ar: "المنشور فقط" })}
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{t({ en: "From Date", ar: "من تاريخ" })}</Label>
                      <Input
                        type="date"
                        value={exportFilters.dateFrom}
                        onChange={(e) => setExportFilters(f => ({ ...f, dateFrom: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t({ en: "To Date", ar: "إلى تاريخ" })}</Label>
                      <Input
                        type="date"
                        value={exportFilters.dateTo}
                        onChange={(e) => setExportFilters(f => ({ ...f, dateTo: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  disabled={!exportEntity || exporting}
                  className="w-full"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: "Export Data", ar: "تصدير البيانات" })}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: "Field Selection", ar: "اختيار الحقول" })}</CardTitle>
                <CardDescription>
                  {t({ en: "Choose which fields to include in export", ar: "اختر الحقول للتضمين في التصدير" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exportEntity && availableFields.length > 0 ? (
                  <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-2">
                      <div className="flex gap-2 mb-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFields(availableFields)}
                        >
                          {t({ en: "Select All", ar: "تحديد الكل" })}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFields([])}
                        >
                          {t({ en: "Clear All", ar: "إلغاء الكل" })}
                        </Button>
                      </div>
                      {availableFields.map(field => (
                        <div key={field} className="flex items-center gap-2">
                          <Checkbox 
                            id={`field-${field}`}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFields([...selectedFields, field]);
                              } else {
                                setSelectedFields(selectedFields.filter(f => f !== field));
                              }
                            }}
                          />
                          <Label htmlFor={`field-${field}`} className="text-sm font-mono">
                            {field}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ en: "Select an entity to see available fields", ar: "اختر كيانًا لرؤية الحقول المتاحة" })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Export Grid */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: "Quick Export", ar: "تصدير سريع" })}</CardTitle>
              <CardDescription>
                {t({ en: "One-click export for common entities", ar: "تصدير بنقرة واحدة للكيانات الشائعة" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {EXPORTABLE_ENTITIES.slice(0, 12).map(entity => (
                  <Button
                    key={entity.value}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExportEntity(entity.value);
                      setExportFormat('csv');
                    }}
                    className="text-xs"
                  >
                    {entity.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  {t({ en: "Import Data", ar: "استيراد البيانات" })}
                </CardTitle>
                <CardDescription>
                  {t({ en: "Upload CSV, JSON, Excel or PDF files with validation", ar: "رفع ملفات CSV أو JSON أو Excel أو PDF مع التحقق" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ en: "Target Entity", ar: "الكيان المستهدف" })}</Label>
                  <Select value={importEntity} onValueChange={setImportEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: "Choose target entity", ar: "اختر الكيان المستهدف" })} />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPORTABLE_ENTITIES.map(entity => (
                        <SelectItem key={entity.value} value={entity.value}>
                          {entity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: "Upload File", ar: "رفع الملف" })}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Input
                      type="file"
                      accept=".csv,.json,.xlsx,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="import-file"
                    />
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {importFile ? importFile.name : t({ en: "Click to upload CSV, JSON, Excel or PDF", ar: "انقر لرفع CSV أو JSON أو Excel أو PDF" })}
                      </p>
                    </label>
                  </div>
                </div>

                {importFile && (importFile.name.endsWith('.csv') || importFile.name.endsWith('.json')) && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <Label htmlFor="ai-extraction" className="text-sm cursor-pointer flex-1">
                      {t({ en: "Use AI extraction for better field mapping", ar: "استخدم الذكاء الاصطناعي لتخطيط أفضل للحقول" })}
                    </Label>
                    <Button
                      variant={useAIExtraction ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseAIExtraction(!useAIExtraction)}
                    >
                      {useAIExtraction ? t({ en: "On", ar: "مفعل" }) : t({ en: "Off", ar: "معطل" })}
                    </Button>
                  </div>
                )}

                {importPreview && (
                  <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                    <p className="font-medium">
                      {t({ en: "Preview", ar: "معاينة" })}: {importPreview.totalLines} {t({ en: "records", ar: "سجل" })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t({ en: "Fields", ar: "الحقول" })}: {importPreview.headers.slice(0, 8).join(', ')}{importPreview.headers.length > 8 ? '...' : ''}
                    </p>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
                    <p className="font-medium text-destructive flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4" />
                      {t({ en: "Validation Errors", ar: "أخطاء التحقق" })}
                    </p>
                    <ul className="text-xs text-destructive/80 space-y-1">
                      {validationErrors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={handleImport} 
                  disabled={!importEntity || !importFile || isImportPending}
                  className="w-full"
                >
                  {isImportPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : useAIExtraction || importFile?.name.endsWith('.pdf') || importFile?.name.endsWith('.xlsx') ? (
                    <Wand2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {useAIExtraction || importFile?.name.endsWith('.pdf') || importFile?.name.endsWith('.xlsx')
                    ? t({ en: "Import with AI", ar: "استيراد بالذكاء الاصطناعي" })
                    : t({ en: "Import Data", ar: "استيراد البيانات" })}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: "Import Templates", ar: "قوالب الاستيراد" })}</CardTitle>
                <CardDescription>
                  {t({ en: "Download templates with all required column headers", ar: "تحميل القوالب مع جميع عناوين الأعمدة المطلوبة" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  <div className="grid grid-cols-2 gap-2 pr-4">
                    {IMPORTABLE_ENTITIES.map(entity => (
                      <Button
                        key={entity.value}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplate(entity.value)}
                        className="justify-start text-xs"
                      >
                        <Download className="h-3 w-3 mr-1 shrink-0" />
                        <span className="truncate">{entity.label}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Required Fields Info */}
          {importEntity && ENTITY_DEFINITIONS[importEntity] && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: "Required Fields", ar: "الحقول المطلوبة" })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ENTITY_DEFINITIONS[importEntity].requiredColumns.map(col => (
                    <Badge key={col} variant="destructive">{col}</Badge>
                  ))}
                  <span className="text-muted-foreground text-sm ml-2">
                    {t({ en: "These fields must have values", ar: "هذه الحقول يجب أن تحتوي على قيم" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t({ en: "Export History", ar: "سجل التصدير" })}
                </CardTitle>
                <CardDescription>
                  {t({ en: "Recent data export operations", ar: "عمليات تصدير البيانات الأخيرة" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exportHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ en: "No export history yet", ar: "لا يوجد سجل تصدير حتى الآن" })}
                  </p>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {exportHistory.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="font-medium capitalize text-sm">{log.entity_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()} • {log.metadata?.count || 0} records
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {log.metadata?.format?.toUpperCase() || 'CSV'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t({ en: "Import History", ar: "سجل الاستيراد" })}
                </CardTitle>
                <CardDescription>
                  {t({ en: "Recent data import operations", ar: "عمليات استيراد البيانات الأخيرة" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ en: "No import history yet", ar: "لا يوجد سجل استيراد حتى الآن" })}
                  </p>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {importHistory.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium capitalize text-sm">{log.entity_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()} • {log.metadata?.count || 0} records
                              </p>
                            </div>
                          </div>
                          <Badge variant={log.metadata?.method === 'ai' ? 'default' : 'secondary'}>
                            {log.metadata?.method === 'ai' ? 'AI' : 'Direct'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(ImportExportHub, { requiredPermissions: ['data.import', 'data.export', 'admin'] });
