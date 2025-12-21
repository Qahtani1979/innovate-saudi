import PolicyImpactTracker from '../PolicyImpactTracker';
import PolicyTabWidget from '../../policy/PolicyTabWidget';

export default function PolicyTab({ project, projectId }) {
    return (
        <div className="space-y-6">
            <PolicyImpactTracker rdProject={project} />
            <PolicyTabWidget entityType="rd_project" entityId={projectId} />
        </div>
    );
}
