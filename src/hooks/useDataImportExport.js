import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ENTITY_DEFINITIONS = {
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
        templateColumns: ['name_en', 'name_ar', 'provider_type', 'website_url', 'contact_email', 'contact_phone', 'country', 'city', 'cr_number'],
        aiSchema: {
            type: 'object',
            properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                provider_type: { type: 'string' },
                website_url: { type: 'string' },
                contact_email: { type: 'string' },
                country: { type: 'string' },
                city: { type: 'string' }
            },
            required: ['name_en']
        },
        relations: { organization_id: 'organizations' },
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
        requiredColumns: ['name'],
        templateColumns: ['name', 'name_ar', 'description', 'description_ar', 'domain', 'status', 'start_date', 'end_date', 'capacity', 'municipality_id', 'living_lab_id'],
        aiSchema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                name_ar: { type: 'string' },
                description: { type: 'string' },
                domain: { type: 'string' },
                status: { type: 'string' }
            },
            required: ['name']
        },
        relations: { municipality_id: 'municipalities', living_lab_id: 'living_labs' },
        hasDeleted: false
    },
    living_labs: {
        label: 'Living Labs',
        table: 'living_labs',
        requiredColumns: ['name_en'],
        templateColumns: ['name_en', 'name_ar', 'description_en', 'description_ar', 'domain', 'status', 'location', 'contact_name', 'contact_email', 'municipality_id', 'region_id'],
        aiSchema: {
            type: 'object',
            properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                description_en: { type: 'string' },
                domain: { type: 'string' },
                status: { type: 'string' },
                location: { type: 'string' }
            },
            required: ['name_en']
        },
        relations: { municipality_id: 'municipalities', region_id: 'regions' },
        hasDeleted: false
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
        requiredColumns: ['name_en'],
        templateColumns: ['name_en', 'name_ar', 'description_en', 'description_ar', 'vision_en', 'vision_ar', 'status', 'start_year', 'end_year', 'municipality_id'],
        aiSchema: {
            type: 'object',
            properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                description_en: { type: 'string' },
                vision_en: { type: 'string' },
                status: { type: 'string' },
                start_year: { type: 'number' },
                end_year: { type: 'number' }
            },
            required: ['name_en']
        },
        relations: { municipality_id: 'municipalities' },
        hasDeleted: false
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

export function useDataImportExport() {
    const queryClient = useQueryClient();

    const exportHistory = useQuery({
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

    const importHistory = useQuery({
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

    const handleExport = async ({ exportEntity, exportFilters, selectedFields, exportFormat, lookups }) => {
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

            const { data, error } = await query.limit(50000); // Reasonable limit for browser

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.error('No data to export');
                return;
            }

            // Filter to selected fields only
            const fieldsToExport = selectedFields.length > 0 ? selectedFields : Object.keys(data[0]);

            const { sectors, municipalities, regions, providers } = lookups;

            const filteredData = data.map(row => {
                const filtered = {};
                fieldsToExport.forEach(field => {
                    let value = row[field];
                    // Resolve foreign key names
                    if (field.endsWith('_id') && value) {
                        const lookupTable = field.replace('_id', '');
                        if (lookupTable === 'sector' && sectors?.length) {
                            const sector = sectors.find(s => s.id === value);
                            filtered[field.replace('_id', '_name')] = sector?.name_en || '';
                        } else if (lookupTable === 'municipality' && municipalities?.length) {
                            const muni = municipalities.find(m => m.id === value);
                            filtered[field.replace('_id', '_name')] = muni?.name_en || '';
                        } else if (lookupTable === 'region' && regions?.length) {
                            const region = regions.find(r => r.id === value);
                            filtered[field.replace('_id', '_name')] = region?.name_en || '';
                        } else if (lookupTable === 'provider' && providers?.length) {
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
            throw error;
        }
    };

    const checkDuplicates = async (records, entityDef) => {
        const duplicates = [];
        const codeCol = entityDef.templateColumns?.includes('code') ? 'code' : null;

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

    return {
        ENTITY_DEFINITIONS,
        exportHistory,
        importHistory,
        handleExport,
        checkDuplicates,
        handleImport: async ({ importEntity, data }) => {
            const entityDef = ENTITY_DEFINITIONS[importEntity];
            if (!entityDef) throw new Error('Invalid entity type');

            const { error } = await supabase
                .from(entityDef.table)
                .insert(data);

            if (error) throw error;

            await supabase.from('access_logs').insert({
                action: 'data_import',
                entity_type: importEntity,
                metadata: {
                    count: data.length,
                    method: 'direct'
                }
            });

            queryClient.invalidateQueries(['import-history']);
            return data.length;
        },
        downloadTemplate: (entityKey) => {
            const def = ENTITY_DEFINITIONS[entityKey];
            if (!def) return;

            const headers = def.templateColumns.join(',');
            const blob = new Blob(['\ufeff' + headers], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${entityKey}_template.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    };
}
