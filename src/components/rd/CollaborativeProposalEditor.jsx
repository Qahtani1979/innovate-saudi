import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Users, Save, MessageSquare, History } from 'lucide-react';
import { useRDProposal } from '@/hooks/useRDProposal';
import { useRDProposalComments, useAddRDProposalComment } from '@/hooks/useRDProposalComments';

export default function CollaborativeProposalEditor({ proposalId }) {
  const { language, t } = useLanguage();
  const [editSection, setEditSection] = useState(null);
  const [content, setContent] = useState('');
  const [newComment, setNewComment] = useState('');

  // Hooks
  const { data: proposal, updateProposal } = useRDProposal(proposalId, { refetchInterval: 10000 });
  const { data: comments = [] } = useRDProposalComments(proposalId);
  const addCommentMutation = useAddRDProposalComment();

  const saveSection = () => {
    updateProposal({ [editSection]: content }, {
      onSuccess: () => {
        setEditSection(null);
      }
    });
  };

  const addComment = () => {
    addCommentMutation.mutate({
      rd_proposal_id: proposalId,
      comment_text: newComment,
      section: editSection || 'general'
    }, {
      onSuccess: () => {
        setNewComment('');
      }
    });
  };

  const sections = [
    { key: 'abstract_en', label: t({ en: 'Abstract', ar: 'الملخص' }) },
    { key: 'methodology_en', label: t({ en: 'Methodology', ar: 'المنهجية' }) },
    { key: 'expected_outcomes', label: t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' }) }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {t({ en: 'Collaborative Editor', ar: 'المحرر التعاوني' })}
          <Badge variant="outline" className="ml-auto">
            {comments.length} {t({ en: 'comments', ar: 'تعليق' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(section => (
          <div key={section.key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900">{section.label}</h4>
              {editSection === section.key ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditSection(null)}>
                    {t({ en: 'Cancel', ar: 'إلغاء' })}
                  </Button>
                  <Button size="sm" onClick={saveSection}>
                    <Save className="h-3 w-3 mr-1" />
                    {t({ en: 'Save', ar: 'حفظ' })}
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => {
                  setEditSection(section.key);
                  setContent(proposal?.[section.key] || '');
                }}>
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              )}
            </div>

            {editSection === section.key ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="mb-2"
              />
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {proposal?.[section.key] || t({ en: 'Not yet written', ar: 'لم يتم الكتابة بعد' })}
              </p>
            )}

            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-600">
                  {comments.filter(c => c.section === section.key).length} {t({ en: 'section comments', ar: 'تعليقات القسم' })}
                </span>
              </div>
              {editSection === section.key && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t({ en: 'Add comment...', ar: 'إضافة تعليق...' })}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 text-sm border rounded px-3 py-2"
                  />
                  <Button size="sm" onClick={addComment} disabled={!newComment || addCommentMutation.isPending}>
                    {t({ en: 'Comment', ar: 'تعليق' })}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
            </span>
          </div>
          <div className="space-y-1">
            {comments.slice(0, 3).map(c => (
              <div key={c.id} className="text-xs text-slate-600">
                <span className="font-medium">{c.created_by}</span> commented on {c.section}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}