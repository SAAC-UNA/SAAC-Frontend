import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Context/AuthContext';
import { SidebarProvider } from '@/Context/SidebarContext';
import { NavigationProvider } from '@/Context/NavigationContext';
import { ToastProvider } from './Context/ToastContext';
import { ProtectedRoute } from '@/Components/Ui/ProtectedRoute';
// Layouts
import { AppLayout } from './Components/Layout/AppLayout';
// Auth
import { Login } from '@/Pages/Auth/Login';
// Roles
import RoleForm from '@/Pages/Roles/RoleForm';
// Roles
import { RolesRepository } from './Pages/Roles';
// Users
import { UsersRepository, EditUserPage } from './Pages/Users';
// Structure
import StructureList from '@/Pages/Structure/StructureList';
import StructureCreation from '@/Pages/Structure/StructureCreation';
import StructureEditForm from '@/Pages/Structure/StructureEditForm';
// Structure
import StructureEditList from './Pages/Structure/StructureEditList';
// Otros
import AccreditationProgress from '@/Pages/Accreditation/AccreditationProgress';
import { HomePage } from './Pages/Index';
import { EvidenceAssignment } from './Pages/EvidenceAssignment';
 
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
                <Route path="/" element={<HomePage />} />  {/* ← Cambiar por HomePage */}
 
                {/* Roles - Solo SuperUsuario */}
                <Route
                  path="/roles/listar"
                  element={
                    <ProtectedRoute requireRole="SuperUsuario">
                      <RolesRepository />  {/* ← Cambiar a RolesRepository si lo necesitan */}
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
                      <UsersRepository />  {/* ← Cambiar a UsersRepository */}
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
                {/* ← AGREGAR ESTAS RUTAS NUEVAS */}
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
 
                {/* ← AGREGAR RUTA DE EVIDENCIAS */}
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
              </Route>
            </Routes>
          </SidebarProvider>
        </NavigationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
 
export default App;