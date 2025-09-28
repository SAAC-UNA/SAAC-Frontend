import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './Context/NavigationContext';
import { Layout } from './Components/Layout/Index';
import { HomePage, RolesCreatePage, RolesEditPage, RolesListPage, UsersPage } from './Pages/Index';

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
            {/* Aquí se pueden agregar más rutas en el futuro */}
          </Routes>
        </Layout>
      </NavigationProvider>
    </Router>
  );
};

export default App;