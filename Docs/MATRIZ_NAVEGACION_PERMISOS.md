# Matriz de Navegacion y Permisos

## Objetivo
Centralizar que se muestra en la navegacion y que rutas son accesibles segun capacidades/permisos, evitando diferencias entre menu y backend (403).

## Regla base
- El frontend decide visibilidad y acceso por capacidades funcionales.
- El backend sigue siendo la fuente de verdad de permisos atómicos, pero expone capacidades derivadas en `auth/me` y `auth/permissions`.
- No se debe depender de nombres de rol para mostrar modulos.
- Si un usuario no cumple la capacidad o el permiso equivalente, el modulo no se muestra y la ruta queda bloqueada.

## Contrato de acceso
| Capa | Fuente | Uso |
|---|---|---|
| Backend | `config/permissions.php` + `config/access.php` | Define permisos atómicos, aliases y capacidades funcionales |
| API | `auth/me` y `auth/permissions` | Expone `all_permissions` y `all_capabilities` |
| Frontend | `src/Utils/Authorization.ts` | Evalua permisos/capacidades sin checks por nombre de rol |
| UI | `Navigation.ts` y `App.tsx` | Oculta menu y bloquea rutas con la misma regla |

## Matriz por modulo
| Modulo/Seccion | Item de menu | Ruta principal | Capacidad funcional | Permisos equivalentes |
|---|---|---|---|
| Inicio | Inicio | `/` | Autenticado | N/A |
| Roles | Roles | `/roles/listar` | `cap.admin.roles.manage` | `roles.create`, `roles.edit`, `roles.delete` |
| Usuarios | Usuarios | `/usuarios/listar` | `cap.admin.users.manage` | `usuarios.create`, `usuarios.edit`, `usuarios.delete` |
| Bitacora | Bitacora del Sistema | `/bitacora` | `cap.audit.view` | `bitacora.view` |
| Entregables | Asignar Entregables | `/evidencias/asignar` | `cap.evidence.assign` | `evidencias.assign`, `asignaciones.create`, `asignaciones.edit` |
| Entregables | Mis Entregas | `/mis-evidencias-asignadas` | `cap.evidence.view` | `evidencias.view`, `asignaciones.view` |
| Entregables | Busqueda de Criterios | `/evidencias/busqueda-avanzada` | `cap.evidence.assign` | `evidencias.assign`, `asignaciones.create`, `asignaciones.edit` |
| Ampliacion | Gestionar Solicitudes | `/solicitudes-ampliacion/gestionar` | `cap.extension.manage` | `solicitudes_ampliacion.approve`, `solicitudes_ampliacion.reject` |
| Ampliacion | Mis Solicitudes | `/solicitudes-ampliacion/mis-solicitudes` | `cap.extension.view` | `solicitudes_ampliacion.view` |
| Acreditacion | Procesos de Acreditacion | `/procesos-acreditacion/listar` | `cap.accreditation.process.view` | `procesos.view` |
| Acreditacion | Gestion de Estructura | `/estructura/listar` | `cap.accreditation.process.view` | `procesos.view` |
| Acreditacion | Modelos de Acreditacion | `/estructura/modelos` | `cap.accreditation.model.view` | `modelos.view` |
| Acreditacion | Ciclos de Acreditacion | `/ciclos-acreditacion` | `cap.accreditation.cycle.view` | `ciclos.view` |
| Evaluacion | Compromisos de Mejora | `/compromisos/listar` | `cap.improvement.access` | `compromisos_mejora.view`, `compromisos_mejora.create`, `compromisos_mejora.edit` |
| Evaluacion | Aprobacion de Bloques | `/aprobacion-bloques` | `cap.approvals.view` | `aprobaciones.view` |
| Evaluacion | Gestion de Informes | `/gestion-informes` | `cap.reports.access` | `reportes.generate`, `reportes.export` |

## Capacidades del backend
| Capacidad | Describe |
|---|---|
| `cap.admin.roles.manage` | Gestion de roles |
| `cap.admin.users.manage` | Gestion de usuarios |
| `cap.audit.view` | Acceso a bitacora |
| `cap.evidence.assign` | Asignar/operar entregables |
| `cap.evidence.view` | Ver entregables asignados |
| `cap.evidence.upload` | Subir archivos |
| `cap.extension.manage` | Gestionar solicitudes de ampliacion |
| `cap.extension.view` | Ver solicitudes propias |
| `cap.accreditation.process.view` | Ver procesos de acreditacion |
| `cap.accreditation.model.view` | Ver modelos |
| `cap.accreditation.cycle.view` | Ver ciclos |
| `cap.improvement.access` | Ver/listar compromisos de mejora |
| `cap.approvals.view` | Ver aprobaciones |
| `cap.reports.access` | Generar/exportar reportes |

## Comportamiento esperado por perfil actual
| Perfil | Debe ver |
|---|---|
| Profesor | Inicio, Entregables (solo Mis Entregas), Ampliacion (Mis Solicitudes) |
| Encargado de Acreditacion | Entregables, Ampliacion, Acreditacion, Aprobacion de Bloques, Informes |
| Asistente de Acreditacion | Entregables, Ampliacion, Aprobacion de Bloques, Informes, Acreditacion de solo lectura |
| Administrador | Usuarios, Entregables, Acreditacion, Evaluacion, Bitacora (si backend lo permite) |
| Superusuario | Todo segun permisos asignados |

## Estado de seeders y usuarios
| Entidad | Estado |
|---|---|
| `PermissionSeeder` | Fuente principal para permisos/roles desde `config/permissions.php` |
| `UserSeeder` | Crea roles desde la config y asigna usuarios LDAP |
| `Ian Enmanuel Villegas Jimenez` | `Encargado de Acreditación` |
| `Marisol Hidalgo Murillo` | `Profesor` |
| `Ana Cristina Zuniga Cardenas` | `Profesor` |
| `Asistente de Acreditacion` | Rol nuevo creado y habilitado |

## Nota importante
Si se crea un rol nuevo, no se requiere cambiar codigo de frontend mientras ese rol reciba las capacidades correctas desde backend o permisos equivalentes dentro del contrato central.
