import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './Context/NavigationContext';
import { Layout } from './Components/Layout/Index';
import { HomePage, RolesCreatePage, RolesEditPage, RolesListPage, UsersPage } from './Pages/Index';
import StructureRepository from './Pages/Structure/StructureRepository';
import StructureCreation from './Pages/Structure/StructureCreation';
import StructureDeletion from './Pages/Structure/StructureDeletion';
import StructureEditList from './Pages/Structure/StructureEditList';
import StructureEditForm from './Pages/Structure/StructureEditForm';

const App: React.FC = () => {
  return (
    <Router>
      <NavigationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/roles/crear" element={<RolesCreatePage />} />
            <Route path="/roles/editar/:id" element={<RolesEditPage />} />
            <Route path="/roles/listar" element={<RolesListPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/estructura/repositorio" element={<StructureRepository />} />
            <Route path="/estructura/crear" element={<StructureCreation />} />
            <Route path="/estructura/eliminar" element={<StructureDeletion />} />
            <Route path="/estructura/editar" element={<StructureEditList />} />
            <Route path="/estructura/editar/formulario" element={<StructureEditForm />} />
            {/* Aquí se pueden agregar más rutas en el futuro */}
          </Routes>
        </Layout>
      </NavigationProvider>
    </Router>
  );
};

export default App;