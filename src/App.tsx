import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Context/AuthContext';
import { SidebarProvider } from '@/Context/SidebarContext';
import { NavigationProvider } from '@/Context/NavigationContext';
import { ProtectedRoute } from '@/Components/Ui/ProtectedRoute';
// Importar layout principal
import { AppLayout } from './Components/Layout/AppLayout';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Login } from '@/Pages/Auth/Login';
import RolesList from '@/Pages/Roles/RolesList';
import RoleForm from '@/Pages/Roles/RoleForm';
import StructureList from '@/Pages/Structure/StructureList';
import StructureCreation from '@/Pages/Structure/StructureCreation';
import StructureEditForm from '@/Pages/Structure/StructureEditForm';
import UsersList from '@/Pages/Users/UsersList';
import AccreditationProgress from '@/Pages/Accreditation/AccreditationProgress';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <SidebarProvider>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              
              {/* Layout principal con sidebar para rutas protegidas */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Página de inicio */}
                <Route path="/" element={
                  <ScreenContainer
                    title="Sistema de Acreditación y Autoevaluación de Carreras"
                    description="Gestión de procesos de acreditación y autoevaluación"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-5 border-b border-gray-200">
                          <h2 className="text-xl font-semibold text-gray-900">Acreditación de Carreras</h2>
                          <p className="mt-1 text-sm text-gray-600">
                            Procesos de acreditación con SINAES
                          </p>
                        </div>
                        <div className="px-6 py-4">
                          <ul className="divide-y divide-gray-200">
                            <li className="py-3 text-sm">
                              Documentación y evidencias del proceso
                            </li>
                            <li className="py-3 text-sm">
                              Seguimiento de compromisos de mejora
                            </li>
                            <li className="py-3 text-sm">
                              Estado y avance del proceso
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-5 border-b border-gray-200">
                          <h2 className="text-xl font-semibold text-gray-900">Autoevaluación</h2>
                          <p className="mt-1 text-sm text-gray-600">
                            Ciclos de autoevaluación de las carreras
                          </p>
                        </div>
                        <div className="px-6 py-4">
                          <ul className="divide-y divide-gray-200">
                            <li className="py-3 text-sm">
                              Recopilación de información y datos
                            </li>
                            <li className="py-3 text-sm">
                              Generación de reportes e informes
                            </li>
                            <li className="py-3 text-sm">
                              Seguimiento de planes de mejora
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </ScreenContainer>
                } />

                {/* Roles - Solo SuperUsuario */}
                <Route
                  path="/roles/listar"
                  element={
                    <ProtectedRoute requireRole="SuperUsuario">
                      <RolesList />
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
                  path="/estructura/editar/formulario"
                  element={
                    <ProtectedRoute>
                      <StructureEditForm />
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



                {/* Usuarios - Todos los autenticados */}
                <Route
                  path="/usuarios/listar"
                  element={
                    <ProtectedRoute>
                      <UsersList />
                    </ProtectedRoute>
                  }
                />

                {/* Redirigir cualquier ruta no encontrada */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </SidebarProvider>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;