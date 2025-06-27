import React from 'react'
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';

const UsersPage = () => {
  return (
    <LayoutDashboard>
      <CardWithTitle title="Gestión de Usuarios" loading={false}>
        {/* Aquí puedes agregar la tabla de usuarios, filtros, etc. */}
        <p>Página de usuarios lista para implementar funcionalidades.</p>
      </CardWithTitle>
    </LayoutDashboard>
  );
}

export default UsersPage;
