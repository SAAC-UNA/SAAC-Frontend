import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/Constants/ROUTES";
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
const RoleFormPage = lazy(() => import("@/Pages/Roles/RoleFormPage"));
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
const ContextSelector = lazy(() => import("@/Pages/ContextSelector"));
const AccreditationCyclesPage = lazy(
  () => import("@/Pages/AccreditationCycles/AccreditationCyclesPage"),
);
const EvidenceAssignment = lazy(
  () => import("./Pages/EvidenceAssignment/EvidenceAssignment"),
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
const AccreditationReportAdminPage = lazy(() =>
  import("./Pages/AccreditationReport").then((m) => ({
    default: m.AccreditationReportAdminPage,
  })),
);
const AccreditationReportPublicPage = lazy(() =>
  import("./Pages/AccreditationReport").then((m) => ({
    default: m.AccreditationReportPublicPage,
  })),
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
const PublicFolderPage = lazy(
  () => import("./Pages/PublicFolder/PublicFolderPage"),
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
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route
                path={ROUTES.SESSION_EXPIRED}
                element={<SessionExpired />}
              />
              <Route
                path={ROUTES.PUBLIC_FOLDER}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PublicFolderPage />
                  </Suspense>
                }
              />
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
                            <Route
                              path={ROUTES.CONTEXT_SELECTOR}
                              element={<ContextSelector />}
                            />

                            {/* Roles - Solo Superusuario */}
                            <Route
                              path={ROUTES.ROLES}
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
                              path={ROUTES.ROLES_NEW}
                              element={
                                <ProtectedRoute
                                  requirePermissions={["roles.create"]}
                                >
                                  <RoleFormPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path={ROUTES.ROLES_EDIT}
                              element={
                                <ProtectedRoute
                                  requirePermissions={["roles.edit"]}
                                >
                                  <RoleFormPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Bitacora del Sistema - Solo Superusuario */}
                            <Route
                              path={ROUTES.AUDIT_LOG}
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
                              path={ROUTES.USERS}
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
                              path={ROUTES.USERS_EDIT}
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
                              path={ROUTES.STRUCTURE}
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
                              path={ROUTES.STRUCTURE_MODELS}
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
                              path={ROUTES.ACCREDITATION_CYCLES}
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
                              path={ROUTES.EVIDENCE_ASSIGN}
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
                              path={ROUTES.EVIDENCE_MY}
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
                              path={ROUTES.EVIDENCE_SEARCH}
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
                              path={ROUTES.EXTENSION_REQUESTS_MANAGE}
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
                              path={ROUTES.EXTENSION_REQUESTS_MY}
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
                              path={ROUTES.COMMITMENTS}
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
                              path={ROUTES.COMMITMENTS_NEW}
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
                              path={ROUTES.COMMITMENTS_EDIT}
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
                            <Route
                              path={ROUTES.COMMITMENTS_DETAIL}
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

                            {/* Procesos de Acreditacion - Todos los autenticados */}
                            <Route
                              path={ROUTES.ACCREDITATION_PROCESSES}
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
                              path={ROUTES.BLOCK_APPROVAL}
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
                              path={ROUTES.REPORTS}
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

                            {/* Resolución SINAES — Admin (requiere permisos de reportes) */}
                            <Route
                              path={ROUTES.SINAES_ADMIN}
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[
                                    CAPABILITIES.REPORTS_ACCESS,
                                  ]}
                                  requirePermissions={
                                    REPORTS_ACCESS_PERMISSIONS
                                  }
                                >
                                  <AccreditationReportAdminPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Resolución SINAES — Vista pública (cualquier usuario autenticado) */}
                            <Route
                              path={ROUTES.REPORTS_PUBLIC}
                              element={<AccreditationReportPublicPage />}
                            />

                            {/* Redirigir cualquier ruta no encontrada */}
                            <Route
                              path="*"
                              element={<Navigate to={ROUTES.HOME} replace />}
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
