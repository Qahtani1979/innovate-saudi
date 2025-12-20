import ImpactReportGenerator from '@/components/challenges/ImpactReportGenerator';

export default function ChallengeImpactTab({ challenge, challengeId }) {
  return (
    <div className="space-y-6">
      <ImpactReportGenerator 
        challengeId={challengeId} 
        challenge={challenge}
      />
    </div>
  );
}
