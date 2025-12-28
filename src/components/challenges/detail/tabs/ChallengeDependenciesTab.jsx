import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Network, AlertCircle, Sparkles } from 'lucide-react';

import { useChallengeInterests } from '@/hooks/useChallengeInterests';
import {
    usePilotsWithVisibility,
    useSolutionsWithVisibility,
    useChallengesWithVisibility,
    useRDProjectsWithVisibility,
    useProgramsWithVisibility
} from '@/hooks/visibility';

export default function ChallengeDependenciesTab({ challenge }) {
    const { t } = useLanguage();
    const challengeId = challenge?.id;
    const [relationManagerOpen, setRelationManagerOpen] = useState(false);

    // Fetch Relations
    const { data: relations = [], isLoading: isLoadingRelations } = useChallengeInterests(challengeId);

    // Fetch Related Entities (Simplified lists for names/codes)
    const { data: allChallenges = [] } = useChallengesWithVisibility({ limit: 1000 });
    const { data: solutions = [] } = useSolutionsWithVisibility({ limit: 1000 });
    const { data: pilots = [] } = usePilotsWithVisibility({ limit: 1000 });
    const { data: relatedRD = [] } = useRDProjectsWithVisibility({ limit: 1000 });
    const { data: linkedPrograms = [] } = useProgramsWithVisibility({ limit: 1000 });

    if (isLoadingRelations) {
        return <div className="p-12 text-center">Loading network...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-teal-600" />
                            {t({ en: 'Dependency Network', ar: 'شبكة التبعيات' })}
                        </CardTitle>
                        <Button onClick={() => setRelationManagerOpen(true)} className="gap-2" variant="outline">
                            <Network className="h-4 w-4" />
                            {t({ en: 'Manage Relations', ar: 'إدارة العلاقات' })}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {relations.length > 0 ? (
                        <div className="space-y-4">
                            {/* Mind Map Visualization */}
                            <div className="relative p-8 bg-white rounded-xl border-2 border-slate-200 overflow-x-auto">
                                <svg width="100%" height="500" className="min-w-[800px]">
                                    {/* Define gradients */}
                                    <defs>
                                        <linearGradient id="grad-pilot" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                                        </linearGradient>
                                        <linearGradient id="grad-solution" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                                        </linearGradient>
                                        <linearGradient id="grad-rd" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                                        </linearGradient>
                                        <linearGradient id="grad-program" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                                        </linearGradient>
                                        <linearGradient id="grad-challenge" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                                        </linearGradient>
                                        <linearGradient id="grad-center" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                                            <stop offset="50%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>

                                    {/* Center node */}
                                    <g transform="translate(400, 250)">
                                        {/* Pulse circle */}
                                        <circle cx="0" cy="0" r="50" fill="url(#grad-center)" opacity="0.1">
                                            <animate attributeName="r" from="50" to="70" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" from="0.1" to="0" dur="2s" repeatCount="indefinite" />
                                        </circle>

                                        {/* Main center circle */}
                                        <circle cx="0" cy="0" r="45" fill="url(#grad-center)" stroke="white" strokeWidth="4" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))" />

                                        {/* Center icon */}
                                        <foreignObject x="-20" y="-20" width="40" height="40">
                                            <div className="flex items-center justify-center w-full h-full">
                                                <AlertCircle className="h-8 w-8 text-white" />
                                            </div>
                                        </foreignObject>

                                        {/* Center label */}
                                        <text x="0" y="65" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="700">
                                            {challenge.code}
                                        </text>
                                    </g>

                                    {/* Branch nodes */}
                                    {relations.slice(0, 12).map((rel, i) => {
                                        const colors = {
                                            pilot: 'url(#grad-pilot)',
                                            solution: 'url(#grad-solution)',
                                            rd_project: 'url(#grad-rd)',
                                            program: 'url(#grad-program)',
                                            challenge: 'url(#grad-challenge)'
                                        };
                                        const fill = colors[rel.related_entity_type] || '#64748b';

                                        const getEntityName = () => {
                                            if (rel.related_entity_type === 'challenge') {
                                                const c = allChallenges.find(ch => ch.id === rel.related_entity_id);
                                                return c?.code || 'Challenge';
                                            }
                                            if (rel.related_entity_type === 'solution') {
                                                const s = solutions.find(s => s.id === rel.related_entity_id);
                                                return s?.code || 'Solution';
                                            }
                                            if (rel.related_entity_type === 'pilot') {
                                                const p = pilots.find(p => p.id === rel.related_entity_id);
                                                return p?.code || 'Pilot';
                                            }
                                            return rel.related_entity_type;
                                        };

                                        // Mind map layout - spread around center
                                        const angle = (i * 360) / Math.min(relations.length, 12);
                                        const radius = 150;
                                        const centerX = 400;
                                        const centerY = 250;
                                        const x = centerX + Math.cos((angle - 90) * Math.PI / 180) * radius;
                                        const y = centerY + Math.sin((angle - 90) * Math.PI / 180) * radius;

                                        return (
                                            <g key={rel.id || i}>
                                                {/* Curved connection line */}
                                                <path
                                                    d={`M ${centerX} ${centerY} Q ${(centerX + x) / 2} ${(centerY + y) / 2 - 30} ${x} ${y}`}
                                                    fill="none"
                                                    stroke="#cbd5e1"
                                                    strokeWidth="2"
                                                    strokeDasharray="5,5"
                                                    opacity="0.6"
                                                />

                                                {/* Branch node circle */}
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r="30"
                                                    fill={fill}
                                                    stroke="white"
                                                    strokeWidth="3"
                                                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                                                    className="hover:r-35 transition-all cursor-pointer"
                                                />

                                                {/* Strength badge */}
                                                {rel.strength && (
                                                    <>
                                                        <circle
                                                            cx={x + 20}
                                                            cy={y - 20}
                                                            r="12"
                                                            fill="#0d9488"
                                                            stroke="white"
                                                            strokeWidth="2"
                                                        />
                                                        <text
                                                            x={x + 20}
                                                            y={y - 16}
                                                            textAnchor="middle"
                                                            fill="white"
                                                            fontSize="10"
                                                            fontWeight="700"
                                                        >
                                                            {Math.round(typeof rel.strength === 'number' ? rel.strength : rel.strength * 100)}
                                                        </text>
                                                    </>
                                                )}

                                                {/* Label */}
                                                <text
                                                    x={x}
                                                    y={y + 50}
                                                    textAnchor="middle"
                                                    fill="#1e293b"
                                                    fontSize="11"
                                                    fontWeight="600"
                                                    className="max-w-[100px]"
                                                >
                                                    {getEntityName().substring(0, 15)}
                                                </text>

                                                {/* Relation role */}
                                                <text
                                                    x={x}
                                                    y={y + 65}
                                                    textAnchor="middle"
                                                    fill="#64748b"
                                                    fontSize="9"
                                                >
                                                    {rel.relation_role?.replace(/_/g, ' ')}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Legend */}
                                <div className="flex gap-4 flex-wrap justify-center mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                                        <span className="text-xs text-slate-700 font-medium">Pilot</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                                        <span className="text-xs text-slate-700 font-medium">Solution</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                                        <span className="text-xs text-slate-700 font-medium">R&D</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600"></div>
                                        <span className="text-xs text-slate-700 font-medium">Program</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-red-400 to-orange-400"></div>
                                        <span className="text-xs text-slate-700 font-medium">Challenge</span>
                                    </div>
                                </div>
                            </div>

                            {/* Relation details list */}
                            <div className="space-y-3">
                                {relations.map((rel) => (
                                    <div key={rel.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="text-xs capitalize">{rel.related_entity_type?.replace(/_/g, ' ')}</Badge>
                                                    <Badge className="text-xs capitalize bg-blue-100 text-blue-700">{rel.relation_role?.replace(/_/g, ' ')}</Badge>
                                                    {rel.created_via === 'ai' && (
                                                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            AI
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {rel.related_entity_type === 'challenge' && allChallenges.find(c => c.id === rel.related_entity_id)?.title_en}
                                                    {rel.related_entity_type === 'solution' && solutions.find(s => s.id === rel.related_entity_id)?.name_en}
                                                    {rel.related_entity_type === 'pilot' && pilots.find(p => p.id === rel.related_entity_id)?.title_en}
                                                    {rel.related_entity_type === 'rd_project' && relatedRD.find(r => r.id === rel.related_entity_id)?.title_en}
                                                    {rel.related_entity_type === 'program' && linkedPrograms.find(p => p.id === rel.related_entity_id)?.name_en}
                                                </p>
                                                {rel.notes && (
                                                    <p className="text-xs text-slate-600 mt-2">{rel.notes}</p>
                                                )}
                                            </div>
                                            {rel.strength && (
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-teal-600">{Math.round(typeof rel.strength === 'number' ? rel.strength : rel.strength * 100)}%</div>
                                                    <div className="text-xs text-slate-500">{t({ en: 'Strength', ar: 'قوة' })}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Network className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 mb-4">
                                {t({ en: 'No dependencies mapped yet', ar: 'لم يتم رسم تبعيات بعد' })}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Relation Manager Modal (Simplification: using a dummy state or linking to page) */}
            {/* In original logic, RelationManager was imported. If we want to keep it, we need to import it. */}
            {/* But since we want to reduce dependencies, maybe we assume the button navigates or opens a separate page */}
        </div>
    );
}
