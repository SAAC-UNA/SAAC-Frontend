import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './Context/NavigationContext';
import { Layout } from './Components/Layout/Index';
import { HomePage } from './Pages/Index';
import { RolesRepository, RoleForm } from './Pages/Roles';
import StructureList from './Pages/Structure/StructureList';
import StructureCreation from './Pages/Structure/StructureCreation';
import StructureEditForm from './Pages/Structure/StructureEditForm';
import { StructureRepository } from './Pages/Structure';

const App: React.FC = () => {
  return (
    <Router>
      <NavigationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/roles/crear" element={<RoleForm />} />
            <Route path="/roles/editar/:id" element={<RoleForm />} />
            <Route path="/roles/listar" element={<RolesRepository />} />
            <Route path="/estructura/listar" element={<StructureRepository />} />
            <Route path="/estructura/crear" element={<StructureCreation />} />
            <Route path="/estructura/editar/formulario" element={<StructureEditForm />} />
            {/* Aquí se pueden agregar más rutas en el futuro */}
          </Routes>
        </Layout>
      </NavigationProvider>
    </Router>
  );
};

export default App;