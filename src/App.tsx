import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Context/AuthContext';
import { NavigationProvider } from '@/Context/NavigationContext';
import { ToastProvider } from './Context/ToastContext';
import { ProtectedRoute } from '@/Components/Ui/ProtectedRoute';
import { Layout } from './Components/Layout/Index';
import { LoadingSpinner } from '@/Components/Ui/Loading';

// Lazy load de páginas para code splitting y mejor rendimiento
import { Login } from '@/Pages/Auth/Login';
const HomePage = lazy(() => import('./Pages/Index').then(m => ({ default: m.HomePage })));
const RoleForm = lazy(() => import('@/Pages/Roles/RoleForm'));
const RolesRepository = lazy(() => import('./Pages/Roles').then(m => ({ default: m.RolesRepository })));
const UsersRepository = lazy(() => import('./Pages/Users').then(m => ({ default: m.UsersRepository })));
const EditUserPage = lazy(() => import('./Pages/Users').then(m => ({ default: m.EditUserPage })));
const StructureList = lazy(() => import('@/Pages/Structure/StructureList'));
const StructureCreation = lazy(() => import('@/Pages/Structure/StructureCreation'));
const StructureEditForm = lazy(() => import('@/Pages/Structure/StructureEditForm'));
const StructureEditList = lazy(() => import('./Pages/Structure/StructureEditList'));
const AccreditationProgress = lazy(() => import('@/Pages/Accreditation/AccreditationProgress'));
const EvidenceAssignment = lazy(() => import('./Pages/EvidenceAssignment').then(m => ({ default: m.EvidenceAssignment })));
const EvidenceUploadPage = lazy(() => import('./Pages/Evidence').then(m => ({ default: m.EvidenceUploadPage })));
const MyEvidenceAssignmentsPage = lazy(() => import('./Pages/EvidenceAssignment/MyEvidenceAssignmentsPage'));
const AuditLogPage = lazy(() => import('@/Pages/AuditLog/AuditLogPage'));

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);
 
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
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                        {/* Página de inicio */}
                        <Route path="/" element={<HomePage />} />
 
                        {/* Roles - Solo Superusuario */}
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

                        {/* Bitácora del Sistema - Solo Superusuario */}
                        <Route
                          path="/bitacora"
                          element={
                            <ProtectedRoute requireRole="SuperUsuario">
                              <AuditLogPage />
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
                        <Route
                          path="/mis-evidencias-asignadas"
                          element={
                            <ProtectedRoute>
                              <MyEvidenceAssignmentsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/evidencias/subir"
                          element={
                            <ProtectedRoute>
                              <EvidenceUploadPage />
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
                      </Suspense>
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