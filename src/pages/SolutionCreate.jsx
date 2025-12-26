import SolutionCreateWizard from '../components/solutions/SolutionCreateWizard';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionCreate() {
  return <SolutionCreateWizard />;
}

// pc-3: Added requiredRoles for role-based access control
export default ProtectedPage(SolutionCreate, { 
  requiredPermissions: ['solution_create'],
  requiredRoles: ['provider', 'admin', 'municipality_staff', 'deputyship_staff', 'solution_provider']
});
