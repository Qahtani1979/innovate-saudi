import React from 'react';
import ProgramCreateWizard from '../components/programs/ProgramCreateWizard';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramCreatePage() {
  return <ProgramCreateWizard />;
}

export default ProtectedPage(ProgramCreatePage, {
  requiredPermissions: ['program_create']
});