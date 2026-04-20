import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
  import("./Pages/AccreditationReport").then((m) => ({ default: m.AccreditationReportAdminPage })),
);
const AccreditationReportPublicPage = lazy(() =>
  import("./Pages/AccreditationReport").then((m) => ({ default: m.AccreditationReportPublicPage })),
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

/**
 * RedirectToState - Redirige rutas antiguas con :id pasando el ID por navigation state.
 * Mantiene compatibilidad con links/bookmarks que contengan el ID en la URL,
 * sin exponerlo de nuevo en la URL de destino.
 */
const RedirectToState = ({ to }: { to: string }) => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={to} state={{ id: id ? Number(id) : undefined }} replace />;
};

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
              <Route
                path="/p/:token"
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
                            {/* Redirects de compatibilidad - Roles */}
                            <Route path="/roles/listar" element={<Navigate to={ROUTES.ROLES} replace />} />
                            <Route path="/roles/crear" element={<Navigate to={ROUTES.ROLES_NEW} replace />} />
                            <Route path="/roles/editar/:id" element={<RedirectToState to={ROUTES.ROLES_EDIT} />} />

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
                            {/* Redirects de compatibilidad - Usuarios */}
                            <Route path="/usuarios/listar" element={<Navigate to={ROUTES.USERS} replace />} />
                            <Route path="/usuarios/editar/:id" element={<RedirectToState to={ROUTES.USERS_EDIT} />} />

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
                            <Route path="/estructura/listar" element={<Navigate to={ROUTES.STRUCTURE} replace />} />

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
                            {/* Redirects de compatibilidad - Evidencias */}
                            <Route path="/mis-evidencias-asignadas" element={<Navigate to={ROUTES.EVIDENCE_MY} replace />} />
                            <Route path="/evidencias/busqueda-avanzada" element={<Navigate to={ROUTES.EVIDENCE_SEARCH} replace />} />

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
                            {/* Redirect de compatibilidad - Solicitudes */}
                            <Route path="/solicitudes-ampliacion/mis-solicitudes" element={<Navigate to={ROUTES.EXTENSION_REQUESTS_MY} replace />} />

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
                            {/* Redirects de compatibilidad - Compromisos */}
                            <Route path="/compromisos/listar" element={<Navigate to={ROUTES.COMMITMENTS} replace />} />
                            <Route path="/compromisos/crear" element={<Navigate to={ROUTES.COMMITMENTS_NEW} replace />} />
                            <Route path="/compromisos/ver/:id" element={<RedirectToState to={ROUTES.COMMITMENTS_DETAIL} />} />
                            <Route path="/compromisos/editar/:id" element={<RedirectToState to={ROUTES.COMMITMENTS_EDIT} />} />

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
                            <Route path="/procesos-acreditacion/listar" element={<Navigate to={ROUTES.ACCREDITATION_PROCESSES} replace />} />

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
                            <Route path="/gestion-informes" element={<Navigate to={ROUTES.REPORTS} replace />} />

                            {/* Resolución SINAES — Admin (requiere permisos de reportes) */}
                            <Route
                              path={ROUTES.SINAES_ADMIN}
                              element={
                                <ProtectedRoute
                                  requireCapabilities={[CAPABILITIES.REPORTS_ACCESS]}
                                  requirePermissions={REPORTS_ACCESS_PERMISSIONS}
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
