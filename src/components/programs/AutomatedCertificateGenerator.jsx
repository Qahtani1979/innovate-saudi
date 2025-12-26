import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function AutomatedCertificateGenerator({ programId, graduates }) {
  const { language, t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const { triggerEmail } = useEmailTrigger();

  const generateCertificates = async () => {
    setGenerating(true);
    try {
      const certs = graduates.map(g => ({
        participant: g.startup_name,
        name: g.applicant_name,
        email: g.applicant_email,
        achievement: g.program_completion_score >= 90 ? 'Excellence' :
          g.program_completion_score >= 75 ? 'Honor' : 'Completion',
        date: new Date().toLocaleDateString(),
        credential_id: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      setCertificates(certs);
      toast.success(t({ en: `${certs.length} certificates generated`, ar: `تم إنشاء ${certs.length} شهادة` }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setGenerating(false);
    }
  };

  const sendCertificate = async (cert) => {
    try {
      await triggerEmail({
        trigger: 'program.completed',
        recipient_email: cert.email,
        entity_type: 'program',
        entity_id: programId,
        variables: {
          recipientName: cert.name,
          programName: 'Program',
          credentialId: cert.credential_id
        },
        triggered_by: 'system'
      });
      toast.success(t({ en: 'Certificate sent', ar: 'تم إرسال الشهادة' }));
    } catch (error) {
      // toast handled by hook mostly, but safe to keep success here if needed or let hook handle it
    }
  };

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Certificate Generator', ar: 'مولد الشهادات' })}
          </CardTitle>
          <Button onClick={generateCertificates} disabled={generating} size="sm" className="bg-amber-600">
            <Award className="h-4 w-4 mr-2" />
            {t({ en: 'Generate All', ar: 'إنشاء الكل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!certificates.length && !generating && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `Ready to generate certificates for ${graduates.length} graduates`, ar: `جاهز لإنشاء شهادات لـ ${graduates.length} خريج` })}
            </p>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="space-y-3">
            {certificates.map((cert, idx) => (
              <div key={idx} className="p-4 border-2 border-amber-200 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{cert.participant}</h4>
                    <Badge className={
                      cert.achievement === 'Excellence' ? 'bg-amber-100 text-amber-700 mt-2' :
                        cert.achievement === 'Honor' ? 'bg-blue-100 text-blue-700 mt-2' :
                          'bg-slate-100 text-slate-700 mt-2'
                    }>
                      {cert.achievement}
                    </Badge>
                    <p className="text-xs text-slate-600 mt-2">
                      <strong>{t({ en: 'ID:', ar: 'المعرف:' })}</strong> {cert.credential_id}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>{t({ en: 'Date:', ar: 'التاريخ:' })}</strong> {cert.date}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      {t({ en: 'PDF', ar: 'PDF' })}
                    </Button>
                    <Button size="sm" className="bg-blue-600" onClick={() => sendCertificate(cert)}>
                      <Mail className="h-3 w-3 mr-1" />
                      {t({ en: 'Send', ar: 'إرسال' })}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">
                {t({ en: 'All certificates ready!', ar: 'جميع الشهادات جاهزة!' })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}