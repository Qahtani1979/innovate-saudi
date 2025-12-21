import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';

export default function TeamTab({ project, t, language }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Research Team', ar: 'فريق البحث' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {project.principal_investigator && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-900 font-medium mb-1">{t({ en: 'Principal Investigator', ar: 'الباحث الرئيسي' })}</p>
                        <p className="font-semibold text-slate-900">
                            {language === 'ar' && project.principal_investigator.name_ar
                                ? project.principal_investigator.name_ar
                                : (project.principal_investigator.name_en || project.principal_investigator.name)}
                        </p>
                        {(project.principal_investigator.title_en || project.principal_investigator.title) && (
                            <p className="text-sm text-slate-600">
                                {language === 'ar' && project.principal_investigator.title_ar
                                    ? project.principal_investigator.title_ar
                                    : (project.principal_investigator.title_en || project.principal_investigator.title)}
                            </p>
                        )}
                        {project.principal_investigator.email && (
                            <p className="text-sm text-blue-600 mt-1">{project.principal_investigator.email}</p>
                        )}
                        {project.principal_investigator.expertise && project.principal_investigator.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {project.principal_investigator.expertise.map((exp, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {project.team_members && project.team_members.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {project.team_members.map((member, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                    <p className="font-medium text-sm text-slate-900">
                                        {language === 'ar' && member.name_ar ? member.name_ar : (member.name_en || member.name)}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {language === 'ar' && member.role_ar ? member.role_ar : (member.role_en || member.role)}
                                    </p>
                                    {(member.institution_en || member.institution) && (
                                        <p className="text-xs text-slate-500">
                                            {language === 'ar' && member.institution_ar ? member.institution_ar : (member.institution_en || member.institution)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {project.partner_institutions && project.partner_institutions.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Partner Institutions', ar: 'المؤسسات الشريكة' })}:</p>
                        <div className="space-y-2">
                            {project.partner_institutions.map((partner, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                    <p className="font-medium text-sm text-slate-900">
                                        {language === 'ar' && partner.name_ar ? partner.name_ar : (partner.name_en || partner.name)}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {language === 'ar' && partner.role_ar ? partner.role_ar : (partner.role_en || partner.role)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
