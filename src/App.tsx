import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './Context/NavigationContext';
import { ToastProvider } from './Context/ToastContext';
import { Layout } from './Components/Layout/Index';
import { HomePage } from './Pages/Index';
import { RolesRepository, RoleForm } from './Pages/Roles';
import { UsersRepository } from './Pages/Users';
import StructureRepository from './Pages/Structure/StructureList';
import StructureCreation from './Pages/Structure/StructureCreation';
import StructureDeletion from './Pages/Structure/StructureDeletion';
import StructureEditList from './Pages/Structure/StructureEditList';
import StructureEditForm from './Pages/Structure/StructureEditForm';

const App: React.FC = () => {
  return (
    <Router>
      <NavigationProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/roles/crear" element={<RoleForm />} />
              <Route path="/roles/editar/:id" element={<RoleForm />} />
              <Route path="/roles/listar" element={<RolesRepository />} />
              <Route path="/usuarios/listar" element={<UsersRepository />} />

              <Route path="/estructura/repositorio" element={<StructureRepository />} />
              <Route path="/estructura/crear" element={<StructureCreation />} />
              <Route path="/estructura/eliminar" element={<StructureDeletion />} />
              <Route path="/estructura/editar" element={<StructureEditList />} />
              <Route path="/estructura/editar/formulario" element={<StructureEditForm />} />
              {/* Aquí se pueden agregar más rutas en el futuro */}
            </Routes>
          </Layout>
        </ToastProvider>
      </NavigationProvider>
    </Router>
  );
};

export default App;