import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Context/AuthContext';
import { NavigationProvider } from '@/Context/NavigationContext';
import { ToastProvider } from './Context/ToastContext';
import { ProtectedRoute } from '@/Components/Ui/ProtectedRoute';
import { Layout } from './Components/Layout/Index';
import { Login } from '@/Pages/Auth/Login';
import RoleForm from '@/Pages/Roles/RoleForm';
import { RolesRepository } from './Pages/Roles';
import { UsersRepository, EditUserPage } from './Pages/Users';
import StructureList from '@/Pages/Structure/StructureList';
import StructureCreation from '@/Pages/Structure/StructureCreation';
import StructureEditForm from '@/Pages/Structure/StructureEditForm';
import StructureEditList from './Pages/Structure/StructureEditList';
import AccreditationProgress from '@/Pages/Accreditation/AccreditationProgress';
import { HomePage } from './Pages/Index';
import { EvidenceAssignment } from './Pages/EvidenceAssignment';
 
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NavigationProvider>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
             
              {/* Rutas protegidas con Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        {/* Página de inicio */}
                        <Route path="/" element={<HomePage />} />
 
                        {/* Roles - Solo SuperUsuario */}
                        <Route
                          path="/roles/listar"
                          element={
                            <ProtectedRoute requireRole="SuperUsuario">
                              <RolesRepository />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/roles/crear"
                          element={
                            <ProtectedRoute requireRole="SuperUsuario">
                              <RoleForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/roles/editar/:id"
                          element={
                            <ProtectedRoute requireRole="SuperUsuario">
                              <RoleForm />
                            </ProtectedRoute>
                          }
                        />
 
                        {/* Usuarios - Todos los autenticados */}
                        <Route
                          path="/usuarios/listar"
                          element={
                            <ProtectedRoute>
                              <UsersRepository />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/usuarios/editar/:id"
                          element={
                            <ProtectedRoute>
                              <EditUserPage />
                            </ProtectedRoute>
                          }
                        />
 
                        {/* Estructura - Todos los autenticados */}
                        <Route
                          path="/estructura/listar"
                          element={
                            <ProtectedRoute>
                              <StructureList />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/estructura/crear"
                          element={
                            <ProtectedRoute>
                              <StructureCreation />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/estructura/editar"
                          element={
                            <ProtectedRoute>
                              <StructureEditList />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/estructura/editar/formulario"
                          element={
                            <ProtectedRoute>
                              <StructureEditForm />
                            </ProtectedRoute>
                          }
                        />
 
                        {/* Evidencias */}
                        <Route
                          path="/evidencias/asignar"
                          element={
                            <ProtectedRoute>
                              <EvidenceAssignment />
                            </ProtectedRoute>
                          }
                        />
 
                        {/* Avance de Acreditación - Todos los autenticados */}
                        <Route
                          path="/acreditacion/avance"
                          element={
                            <ProtectedRoute>
                              <AccreditationProgress />
                            </ProtectedRoute>
                          }
                        />
 
                        {/* Redirigir cualquier ruta no encontrada */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </NavigationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
 
export default App;