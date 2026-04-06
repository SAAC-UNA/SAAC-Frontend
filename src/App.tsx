import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/Context/AuthContext";
import { NavigationProvider } from "@/Context/NavigationContext";
import { ToastProvider } from "./Context/ToastContext";
import { ProtectedRoute } from "@/Components/Ui/ProtectedRoute";
import { RequireOperationalContext } from "@/Components/Ui/RequireOperationalContext";
import { Layout } from "./Components/Layout/Index";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";
import { MANUAL_CONTEXT_APPLIED_EVENT } from "@/Services/GlobalFilterContextService";
import {
  CAPABILITIES,
  EVIDENCE_ASSIGNMENT_PERMISSIONS,
  EVIDENCE_VIEW_PERMISSIONS,
  IMPROVEMENT_COMMITMENT_ACCESS_PERMISSIONS,
  REPORTS_ACCESS_PERMISSIONS,
  ROLE_MANAGEMENT_PERMISSIONS,
  USER_MANAGEMENT_PERMISSIONS,
} from "@/Constants/PermissionCapabilities";

// Lazy load de páginas para code splitting y mejor rendimiento
import { Login } from "@/Pages/Auth/Login";
import { SessionExpired } from "@/Pages/Auth/SessionExpired";
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
const StructureModelsPage = lazy(
  () => import("@/Pages/StructureModels/StructureModelsPage"),
);
const AccreditationCyclesPage = lazy(
  () => import("@/Pages/AccreditationCycles/AccreditationCyclesPage"),
);
const EvidenceAssignment = lazy(
  () => import("./Pages/EvidenceAssignment/EvidenceAssignment"),
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
const CreateImprovementCommitment = lazy(
  () => import("./Pages/ImprovementCommitments/CreateImprovementCommitment"),
);
const ImprovementCommitmentsList = lazy(
  () => import("./Pages/ImprovementCommitments/CompromisosList"),
);
const ImprovementCommitmentDetail = lazy(
  () => import("./Pages/ImprovementCommitments/CompromisoDetalle"),
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
  const [contextRenderKey, setContextRenderKey] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleManualContextApplied = () => {
      if (window.location.pathname === "/") {
        return;
      }

      setContextRenderKey((prev) => prev + 1);
    };

    window.addEventListener(
      MANUAL_CONTEXT_APPLIED_EVENT,
      handleManualContextApplied,
    );

    return () => {
      window.removeEventListener(
        MANUAL_CONTEXT_APPLIED_EVENT,
        handleManualContextApplied,
      );
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NavigationProvider>
            <Routes>
              {/* Rutas publicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/session-expired" element={<SessionExpired />} />

              {/* Rutas protegidas con Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <RequireOperationalContext>
                      <Layout>
                        <Suspense fallback={<PageLoader />}>
                          <Routes key={`context-${contextRenderKey}`}>
                            {/* Pagina de inicio */}
                            <Route path="/" element={<HomePage />} />

                            {/* Roles - Solo Superusuario */}
                            <Route
                              path="/roles/listar"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.ADMIN_ROLES_MANAGE,
                                  ]}
                                  requirePermissions={
                                    ROLE_MANAGEMENT_PERMISSIONS
                                  }
                                >
                                  <RolesRepository />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/roles/crear"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["roles.create"]}
                                >
                                  <RoleForm />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/roles/editar/:id"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["roles.edit"]}
                                >
                                  <RoleForm />
                                </ProtectedRoute>
                              }
                            />

                            {/* Bitacora del Sistema - Solo Superusuario */}
                            <Route
                              path="/bitacora"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["bitacora.view"]}
                                >
                                  <AuditLogPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Usuarios - Todos los autenticados */}
                            <Route
                              path="/usuarios/listar"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.ADMIN_USERS_MANAGE,
                                  ]}
                                  requirePermissions={
                                    USER_MANAGEMENT_PERMISSIONS
                                  }
                                >
                                  <UsersRepository />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/usuarios/editar/:id"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["usuarios.edit"]}
                                >
                                  <EditUserPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Estructura - Todos los autenticados */}
                            <Route
                              path="/estructura/listar"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["procesos.view"]}
                                >
                                  <StructureList />
                                </ProtectedRoute>
                              }
                            />

                            {/* Modelos de Acreditación - Administrador y Superusuario */}
                            <Route
                              path="/estructura/modelos"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["modelos.view"]}
                                >
                                  <StructureModelsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Ciclos de Acreditación - Administrador y Superusuario */}
                            <Route
                              path="/ciclos-acreditacion"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["ciclos.view"]}
                                >
                                  <AccreditationCyclesPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Evidencias */}
                            <Route
                              path="/evidencias/asignar"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.EVIDENCE_ASSIGN,
                                  ]}
                                  requirePermissions={
                                    EVIDENCE_ASSIGNMENT_PERMISSIONS
                                  }
                                >
                                  <EvidenceAssignment />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/mis-evidencias-asignadas"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.EVIDENCE_VIEW,
                                  ]}
                                  requirePermissions={EVIDENCE_VIEW_PERMISSIONS}
                                >
                                  <MyEvidenceAssignmentsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/evidencias/subir"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["archivos.upload"]}
                                >
                                  <EvidenceUploadPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/evidencias/busqueda-avanzada"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.EVIDENCE_ASSIGN,
                                  ]}
                                  requirePermissions={
                                    EVIDENCE_ASSIGNMENT_PERMISSIONS
                                  }
                                >
                                  <EvidenceSearchPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* HU-016: Solicitudes de Ampliación */}
                            <Route
                              path="/solicitudes-ampliacion/gestionar"
                              element={
                                <ProtectedRoute
                                  requirePermissions={[
                                    "solicitudes_ampliacion.approve",
                                    "solicitudes_ampliacion.reject",
                                  ]}
                                >
                                  <ManageExtensionRequestsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/solicitudes-ampliacion/mis-solicitudes"
                              element={
                                <ProtectedRoute
                                  requirePermissions={[
                                    "solicitudes_ampliacion.view",
                                  ]}
                                >
                                  <MyExtensionRequestsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Compromisos de Mejora - Todos los autenticados */}
                            <Route
                              path="/compromisos/listar"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.IMPROVEMENT_ACCESS,
                                  ]}
                                  requirePermissions={
                                    IMPROVEMENT_COMMITMENT_ACCESS_PERMISSIONS
                                  }
                                >
                                  <ImprovementCommitmentsList />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/compromisos/crear"
                              element={
                                <ProtectedRoute
                                  requirePermissions={[
                                    "compromisos_mejora.create",
                                  ]}
                                >
                                  <CreateImprovementCommitment />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/compromisos/ver/:id"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.IMPROVEMENT_ACCESS,
                                  ]}
                                  requirePermissions={
                                    IMPROVEMENT_COMMITMENT_ACCESS_PERMISSIONS
                                  }
                                >
                                  <ImprovementCommitmentDetail />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/compromisos/editar/:id"
                              element={
                                <ProtectedRoute
                                  requirePermissions={[
                                    "compromisos_mejora.edit",
                                  ]}
                                >
                                  <CreateImprovementCommitment />
                                </ProtectedRoute>
                              }
                            />

                            {/* Procesos de Acreditacion - Todos los autenticados */}
                            <Route
                              path="/procesos-acreditacion/listar"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["procesos.view"]}
                                >
                                  <AccreditationProcessList />
                                </ProtectedRoute>
                              }
                            />

                            {/* Aprobacion de Bloques - Todos los autenticados */}
                            <Route
                              path="/aprobacion-bloques"
                              element={
                                <ProtectedRoute
                                  requirePermissions={["aprobaciones.view"]}
                                >
                                  <BlockApproval />
                                </ProtectedRoute>
                              }
                            />

                            {/* Gestión de Informes - Todos los autenticados */}
                            <Route
                              path="/gestion-informes"
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.REPORTS_ACCESS,
                                  ]}
                                  requirePermissions={
                                    REPORTS_ACCESS_PERMISSIONS
                                  }
                                >
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
                    </RequireOperationalContext>
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
