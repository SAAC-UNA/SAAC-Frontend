import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/Context/AuthContext";
import { NavigationProvider } from "@/Context/NavigationContext";
import { ToastProvider } from "./Context/ToastContext";
import { ProtectedRoute } from "@/Components/Ui/ProtectedRoute";
import { Layout } from "./Components/Layout/Index";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";

// Lazy load de paginas para code splitting y mejor rendimiento
import { Login } from "@/Pages/Auth/Login";
const HomePage = lazy(() =>
  import("./Pages/Index").then((m) => ({ default: m.HomePage })),
);
const RoleForm = lazy(() => import("@/Pages/Roles/RoleForm"));
const RolesRepository = lazy(() =>
  import("./Pages/Roles").then((m) => ({ default: m.RolesRepository })),
);
const UsersRepository = lazy(() =>
  import("./Pages/Users").then((m) => ({ default: m.UsersRepository })),
);
const EditUserPage = lazy(() =>
  import("./Pages/Users").then((m) => ({ default: m.EditUserPage })),
);
const StructureList = lazy(() => import("@/Pages/Structure/StructureList"));
const EvidenceAssignment = lazy(() =>
  import("./Pages/EvidenceAssignment").then((m) => ({
    default: m.EvidenceAssignment,
  })),
);
const EvidenceUploadPage = lazy(() =>
  import("./Pages/EvidenceUpload").then((m) => ({
    default: m.EvidenceUploadPage,
  })),
);
const EvidenceSearchPage = lazy(() =>
  import("./Pages/EvidenceSearch").then((m) => ({
    default: m.EvidenceSearchPage,
  })),
);
const MyEvidenceAssignmentsPage = lazy(() =>
  import("./Pages/MyEvidence").then((m) => ({
    default: m.MyEvidenceAssignmentsPage,
  })),
);
const AuditLogPage = lazy(() => import("@/Pages/AuditLog/AuditLogPage"));
const ImprovementCommitmentsList = lazy(() =>
  import("./Pages/ImprovementCommitments/ImprovementCommitmentsList").then(
    (m) => ({ default: m.ImprovementCommitmentsList }),
  ),
);
const CreateImprovementCommitment = lazy(
  () => import("./Pages/ImprovementCommitments/CreateImprovementCommitment"),
);
const ImprovementCommitmentDetail = lazy(() =>
  import("./Pages/ImprovementCommitments/ImprovementCommitmentDetail").then(
    (m) => ({ default: m.ImprovementCommitmentDetail }),
  ),
);
const AccreditationProcessList = lazy(() =>
  import("./Pages/AccreditationProcess/AccreditationProcessList").then((m) => ({
    default: m.AccreditationProcessList,
  })),
);
const BlockApproval = lazy(() => import("./Pages/BlockApproval/BlockApproval"));
const FinalReports = lazy(() =>
  import("./Pages/ReportManagement").then((m) => ({ default: m.FinalReports })),
);

// HU-016: Paginas de solicitudes de ampliacion
const ManageExtensionRequestsPage = lazy(() =>
  import("./Pages/ExtensionRequest").then((m) => ({
    default: m.ManageExtensionRequestsPage,
  })),
);
const MyExtensionRequestsPage = lazy(() =>
  import("./Pages/MyExtensionRequest/MyExtensionRequestsPage").then((m) => ({
    default: m.MyExtensionRequestsPage,
  })),
);

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="relative min-h-screen">
    <LoadingSpinner variant="loader" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NavigationProvider>
            <Routes>
              {/* Rutas publicas */}
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas con Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Pagina de inicio */}
                          <Route path="/" element={<HomePage />} />

                          {/* Roles - Solo Superusuario */}
                          <Route
                            path="/roles/listar"
                            element={
                              <ProtectedRoute requireRoles={["Superusuario"]}>
                                <RolesRepository />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/roles/crear"
                            element={
                              <ProtectedRoute requireRoles={["Superusuario"]}>
                                <RoleForm />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/roles/editar/:id"
                            element={
                              <ProtectedRoute requireRoles={["Superusuario"]}>
                                <RoleForm />
                              </ProtectedRoute>
                            }
                          />

                          {/* Bitacora del Sistema - Solo Superusuario */}
                          <Route
                            path="/bitacora"
                            element={
                              <ProtectedRoute requireRoles={["Superusuario"]}>
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
                          {/* Evidencias */}
                          <Route
                            path="/evidencias/asignar"
                            element={
                              <ProtectedRoute
                                requireRoles={[
                                  "Administrador",
                                  "Encargado de Acreditaci\u00f3n",
                                ]}
                              >
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
                          <Route
                            path="/evidencias/busqueda-avanzada"
                            element={
                              <ProtectedRoute>
                                <EvidenceSearchPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* HU-016: Solicitudes de Ampliacion */}
                          <Route
                            path="/solicitudes-ampliacion/gestionar"
                            element={
                              <ProtectedRoute
                                requireRoles={[
                                  "Encargado de Acreditaci\u00f3n",
                                ]}
                              >
                                <ManageExtensionRequestsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/solicitudes-ampliacion/mis-solicitudes"
                            element={
                              <ProtectedRoute>
                                <MyExtensionRequestsPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Compromisos de Mejora - Todos los autenticados */}
                          <Route
                            path="/compromisos/listar"
                            element={
                              <ProtectedRoute>
                                <ImprovementCommitmentsList />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/compromisos/crear"
                            element={
                              <ProtectedRoute>
                                <CreateImprovementCommitment />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/compromisos/ver/:id"
                            element={
                              <ProtectedRoute>
                                <ImprovementCommitmentDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/compromisos/editar/:id"
                            element={
                              <ProtectedRoute>
                                <CreateImprovementCommitment />
                              </ProtectedRoute>
                            }
                          />

                          {/* Procesos de Acreditacion - Todos los autenticados */}
                          <Route
                            path="/procesos-acreditacion/listar"
                            element={
                              <ProtectedRoute>
                                <AccreditationProcessList />
                              </ProtectedRoute>
                            }
                          />

                          {/* Aprobacion de Bloques - Todos los autenticados */}
                          <Route
                            path="/aprobacion-bloques"
                            element={
                              <ProtectedRoute>
                                <BlockApproval />
                              </ProtectedRoute>
                            }
                          />

                          {/* Gestion de Informes - Todos los autenticados */}
                          <Route
                            path="/gestion-informes"
                            element={
                              <ProtectedRoute>
                                <FinalReports />
                              </ProtectedRoute>
                            }
                          />

                          {/* Redirigir cualquier ruta no encontrada */}
                          <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                          />
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
