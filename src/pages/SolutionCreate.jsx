import React from 'react';
import SolutionCreateWizard from '../components/solutions/SolutionCreateWizard';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionCreate() {
  return <SolutionCreateWizard />;
}

export default ProtectedPage(SolutionCreate, { requiredPermissions: ['solution_create'] });