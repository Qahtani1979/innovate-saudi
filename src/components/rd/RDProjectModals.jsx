import RDProjectKickoffWorkflow from './RDProjectKickoffWorkflow';
import RDProjectCompletionWorkflow from './RDProjectCompletionWorkflow';
import RDToPilotTransition from './RDToPilotTransition';
import RDProjectMilestoneGate from './RDProjectMilestoneGate';
import RDOutputValidation from './RDOutputValidation';
import RDTRLAdvancement from './RDTRLAdvancement';
import RDToSolutionConverter from './RDToSolutionConverter';
import RDToPolicyConverter from './RDToPolicyConverter';
import TRLAssessmentWorkflow from './TRLAssessmentWorkflow';
import RDProjectFinalEvaluationPanel from './RDProjectFinalEvaluationPanel';

export default function RDProjectModals({
    project,
    showKickoff,
    setShowKickoff,
    showCompletion,
    setShowCompletion,
    showPilotTransition,
    setShowPilotTransition,
    showMilestoneGate,
    setShowMilestoneGate,
    selectedMilestone,
    setSelectedMilestone,
    showOutputValidation,
    setShowOutputValidation,
    showTRLAdvancement,
    setShowTRLAdvancement,
    showSolutionConverter,
    setShowSolutionConverter,
    showPolicyConverter,
    setShowPolicyConverter,
    showTRLAssessment,
    setShowTRLAssessment,
    showFinalEvaluation,
    setShowFinalEvaluation,
    onUpdate
}) {
    return (
        <>
            {showKickoff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <RDProjectKickoffWorkflow project={project} onClose={() => setShowKickoff(false)} />
                    </div>
                </div>
            )}
            {showCompletion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <RDProjectCompletionWorkflow project={project} onClose={() => setShowCompletion(false)} />
                    </div>
                </div>
            )}
            {showPilotTransition && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <RDToPilotTransition project={project} onClose={() => setShowPilotTransition(false)} />
                    </div>
                </div>
            )}
            {showMilestoneGate && selectedMilestone && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <RDProjectMilestoneGate project={project} milestone={selectedMilestone} onClose={() => {
                            setShowMilestoneGate(false);
                            setSelectedMilestone(null);
                        }} />
                    </div>
                </div>
            )}
            {showOutputValidation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
                        <RDOutputValidation project={project} onClose={() => setShowOutputValidation(false)} />
                    </div>
                </div>
            )}
            {showTRLAdvancement && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <RDTRLAdvancement project={project} onClose={() => setShowTRLAdvancement(false)} />
                    </div>
                </div>
            )}
            {showSolutionConverter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <RDToSolutionConverter rdProject={project} onClose={() => setShowSolutionConverter(false)} />
                    </div>
                </div>
            )}
            {showPolicyConverter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <RDToPolicyConverter rdProject={project} onClose={() => setShowPolicyConverter(false)} />
                    </div>
                </div>
            )}
            {showTRLAssessment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
                        <TRLAssessmentWorkflow rdProject={project} onUpdate={onUpdate} />
                    </div>
                </div>
            )}
            {showFinalEvaluation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
                        <RDProjectFinalEvaluationPanel project={project} onClose={() => setShowFinalEvaluation(false)} />
                    </div>
                </div>
            )}
        </>
    );
}
