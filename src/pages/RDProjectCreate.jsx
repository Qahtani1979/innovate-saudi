import RDProjectCreateWizard from '../components/rd/RDProjectCreateWizard';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RDProjectCreate() {
  return <RDProjectCreateWizard />;
}

export default ProtectedPage(RDProjectCreate, { requiredPermissions: ['rd_project_create'] });