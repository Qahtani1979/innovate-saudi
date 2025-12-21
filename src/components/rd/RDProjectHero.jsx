import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    Beaker, Target, Calendar, DollarSign, FileText, Sparkles,
    TrendingUp, CheckCircle2, Users, BookOpen, Award, Send, MessageSquare,
    Clock, Building2, Image, Video, Database, AlertCircle,
    ExternalLink, TestTube, Rocket, Loader2, X, Shield, Lightbulb, Activity
} from 'lucide-react';

export default function RDProjectHero({
    project,
    language,
    t,
    statusInfo,
    StatusIcon,
    user,
    hasPermission,
    onStartKickoff,
    onTRLAdvancement,
    onOutputValidation,
    onCompletion,
    onPilotTransition,
    onFinalEvaluation,
    onSolutionConverter,
    onPolicyConverter,
    onAIInsights
}) {
    return (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            {project.code && (
                                <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                                    {project.code}
                                </Badge>
                            )}
                            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                                <StatusIcon className="h-3 w-3" />
                                {project.status?.replace(/_/g, ' ')}
                            </Badge>
                            {project.trl_current && (
                                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                                    TRL {project.trl_current}
                                </Badge>
                            )}
                            {project.is_featured && (
                                <Badge className="bg-amber-500 text-white">
                                    <Award className="h-3 w-3 mr-1" />
                                    Featured
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-5xl font-bold mb-2">
                            {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                        </h1>
                        {(project.tagline_en || project.tagline_ar) && (
                            <p className="text-xl text-white/90">
                                {language === 'ar' && project.tagline_ar ? project.tagline_ar : project.tagline_en}
                            </p>
                        )}
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{language === 'ar' && project.institution_ar ? project.institution_ar : (project.institution_en || project.institution)}</span>
                            </div>
                            {(project.research_area_en || project.research_area) && (
                                <div className="flex items-center gap-1">
                                    <Beaker className="h-4 w-4" />
                                    <span>{language === 'ar' && project.research_area_ar ? project.research_area_ar : (project.research_area_en || project.research_area)}</span>
                                </div>
                            )}
                            {project.duration_months && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{project.duration_months} {t({ en: 'months', ar: 'شهر' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {project.status === 'approved' && (
                            <Button onClick={onStartKickoff} className="bg-blue-600 hover:bg-blue-700">
                                <Rocket className="h-4 w-4 mr-2" />
                                {t({ en: 'Start Project', ar: 'بدء المشروع' })}
                            </Button>
                        )}
                        {project.status === 'active' && (
                            <>
                                <Button onClick={onTRLAdvancement} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    {t({ en: 'Advance TRL', ar: 'تقدم المستوى' })}
                                </Button>
                                <Button onClick={onOutputValidation} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                                    <Award className="h-4 w-4 mr-2" />
                                    {t({ en: 'Validate Outputs', ar: 'التحقق من المخرجات' })}
                                </Button>
                                <Button onClick={onCompletion} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {t({ en: 'Complete', ar: 'إنهاء' })}
                                </Button>
                                <Button onClick={onPilotTransition} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                                    <TestTube className="h-4 w-4 mr-2" />
                                    {t({ en: 'Pilot', ar: 'تجريب' })}
                                </Button>
                            </>
                        )}
                        {project.status === 'completed' && (
                            <>
                                <Button onClick={onFinalEvaluation} className="bg-purple-600 hover:bg-purple-700">
                                    <Award className="h-4 w-4 mr-2" />
                                    {t({ en: 'Final Eval', ar: 'تقييم نهائي' })}
                                </Button>
                                <Button onClick={onPilotTransition} className="bg-blue-600 hover:bg-blue-700">
                                    <TestTube className="h-4 w-4 mr-2" />
                                    {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
                                </Button>
                                {project.trl_current >= 7 && (
                                    <Button onClick={onSolutionConverter} className="bg-green-600 hover:bg-green-700">
                                        <Lightbulb className="h-4 w-4 mr-2" />
                                        {t({ en: 'Commercialize', ar: 'تسويق' })}
                                    </Button>
                                )}
                                <Button onClick={onPolicyConverter} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                                    <Shield className="h-4 w-4 mr-2" />
                                    {t({ en: 'Policy', ar: 'سياسة' })}
                                </Button>
                            </>
                        )}
                        {(hasPermission('rd_project_edit') || project.created_by === user?.email) && (
                            <Link to={createPageUrl(`RDProjectEdit?id=${project.id}`)}>
                                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                                    {t({ en: 'Edit', ar: 'تعديل' })}
                                </Button>
                            </Link>
                        )}
                        <Button className="bg-white text-emerald-600 hover:bg-white/90" onClick={onAIInsights}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
