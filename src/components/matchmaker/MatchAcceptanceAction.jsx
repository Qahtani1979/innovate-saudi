import { useState } from 'react';
import { useMatchMutations } from '@/hooks/useMatchMutations';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function MatchAcceptanceAction({ match, onChange }) {
    const { t, isRTL } = useLanguage();
    const [feedback, setFeedback] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'accept' or 'reject'

    const { updateMatchStatus } = useMatchMutations();

    const handleAction = (type) => {
        setActionType(type);
        setIsDialogOpen(true);
    };

    const submitAction = () => {
        if (actionType === 'reject' && !feedback.trim()) {
            toast.error(t({ en: 'Please provide a reason for rejection', ar: 'يرجى تقديم سبب للرفض' }));
            return;
        }

        const status = actionType === 'accept' ? 'accepted' : 'rejected';

        updateMatchStatus.mutate({
            matchId: match.id,
            status,
            feedback
        }, {
            onSuccess: (data) => {
                toast.success(
                    actionType === 'accept'
                        ? t({ en: 'Match accepted successfully', ar: 'تم قبول المطابقة بنجاح' })
                        : t({ en: 'Match rejected', ar: 'تم رفض المطابقة' })
                );
                setIsDialogOpen(false);
                setFeedback('');
                if (onChange) onChange(data);
            }
        });
    };

    if (!match) return null;

    // Read-only view if already acted upon
    if (match.status === 'accepted' || match.status === 'rejected') {
        return (
            <Card className={`border ${match.status === 'accepted' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        {match.status === 'accepted' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                        ) : (
                            <XCircle className="h-6 w-6 text-red-600 mt-1" />
                        )}
                        <div>
                            <h4 className="font-semibold text-lg">
                                {match.status === 'accepted'
                                    ? t({ en: 'Match Accepted', ar: 'تم قبول المطابقة' })
                                    : t({ en: 'Match Rejected', ar: 'تم رفض المطابقة' })}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                                {t({ en: 'Action taken on', ar: 'تم اتخاذ الإجراء في' })}: {new Date(match.municipality_action_date).toLocaleDateString()}
                            </p>
                            {match.municipality_feedback && (
                                <div className="mt-3 p-3 bg-white/50 rounded border border-black/5 text-sm">
                                    <strong>{t({ en: 'Feedback:', ar: 'الملاحظات:' })}</strong> {match.municipality_feedback}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {t({ en: 'Municipality Action Required', ar: 'مطلوب إجراء من الأمانة' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-semibold">{t({ en: 'Match Rationale', ar: 'مبررات المطابقة' })}</span>
                            </div>
                            {match.match_rationale || t({ en: 'AI compatibility score indicates high potential.', ar: 'تشير درجة توافق الذكاء الاصطناعي إلى إمكانات عالية.' })}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">{t({ en: 'Match Score', ar: 'درجة المطابقة' })}:</span>
                            <Badge variant="outline" className="text-lg font-bold text-blue-600">
                                {match.match_score}%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3 justify-end border-t pt-4">
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() => handleAction('reject')}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t({ en: 'Reject Match', ar: 'رفض المطابقة' })}
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction('accept')}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t({ en: 'Accept & Request Proposal', ar: 'قبول وطلب عرض' })}
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'accept'
                                ? t({ en: 'Confirm Match Acceptance', ar: 'تأكيد قبول المطابقة' })
                                : t({ en: 'Confirm Match Rejection', ar: 'تأكيد رفض المطابقة' })}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-600">
                            {actionType === 'accept'
                                ? t({ en: 'By accepting, you invite the provider to submit a formal proposal for this challenge. Please provide any specific requirements below.', ar: 'بقبولك، أنت تدعو المزود لتقديم عرض رسمي لهذا التحدي. يرجى تقديم أي متطلبات محددة أدناه.' })
                                : t({ en: 'Please provide a reason for rejecting this match to help improve future recommendations.', ar: 'يرجى تقديم سبب رفض هذه المطابقة للمساعدة في تحسين التوصيات المستقبلية.' })}
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {actionType === 'accept'
                                    ? t({ en: 'Notes / Requirements (Optional)', ar: 'ملاحظات / متطلبات (اختياري)' })
                                    : t({ en: 'Rejection Reason (Required)', ar: 'سبب الرفض (مطلوب)' })}
                            </label>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={actionType === 'accept'
                                    ? t({ en: 'e.g., Focus on phase 1 implementation...', ar: 'مثال: التركيز على تنفيذ المرحلة الأولى...' })
                                    : t({ en: 'e.g., Solution too expensive, mismatch in technology...', ar: 'مثال: الحل مكلف للغاية، عدم تطابق في التكنولوجيا...' })}
                                className="h-32"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            {t({ en: 'Cancel', ar: 'إلغاء' })}
                        </Button>
                        <Button
                            onClick={submitAction}
                            disabled={updateMatchStatus.isPending}
                            variant={actionType === 'reject' ? 'destructive' : 'default'}
                            className={actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {updateMatchStatus.isPending && <FileText className="h-4 w-4 mr-2 animate-spin" />}
                            {t({ en: 'Submit Decision', ar: 'إرسال القرار' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
