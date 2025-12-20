import ChallengeSubmissionWizard from '@/components/ChallengeSubmissionWizard';
import ChallengeReviewWorkflow from '@/components/ChallengeReviewWorkflow';
import ChallengeTreatmentPlan from '@/components/ChallengeTreatmentPlan';
import ChallengeResolutionWorkflow from '@/components/ChallengeResolutionWorkflow';
import ChallengeToRDWizard from '@/components/ChallengeToRDWizard';
import ChallengeArchiveWorkflow from '@/components/ChallengeArchiveWorkflow';

export default function ChallengeWorkflowModals({
  challenge,
  showSubmission,
  showReview,
  showTreatment,
  showResolution,
  showRDConversion,
  showArchive,
  onCloseSubmission,
  onCloseReview,
  onCloseTreatment,
  onCloseResolution,
  onCloseRDConversion,
  onCloseArchive
}) {
  return (
    <>
      {showSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeSubmissionWizard challenge={challenge} onClose={onCloseSubmission} />
          </div>
        </div>
      )}
      
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeReviewWorkflow challenge={challenge} onClose={onCloseReview} />
          </div>
        </div>
      )}
      
      {showTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ChallengeTreatmentPlan challenge={challenge} onClose={onCloseTreatment} />
          </div>
        </div>
      )}
      
      {showResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ChallengeResolutionWorkflow challenge={challenge} onClose={onCloseResolution} />
          </div>
        </div>
      )}
      
      {showRDConversion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ChallengeToRDWizard challenge={challenge} onClose={onCloseRDConversion} />
          </div>
        </div>
      )}
      
      {showArchive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeArchiveWorkflow challenge={challenge} onClose={onCloseArchive} />
          </div>
        </div>
      )}
    </>
  );
}
