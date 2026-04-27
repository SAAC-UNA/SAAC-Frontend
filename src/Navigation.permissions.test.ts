import { getNavigationItems } from "./Navigation";

describe("Navigation permissions", () => {
  it("permite un rol nuevo sin cambios de codigo si trae permisos validos", () => {
    const items = getNavigationItems({
      roles: ["Coordinador Académico"],
      permissions: ["usuarios.view", "evidencias.view"],
    });

    const ids = items.map((item) => item.id);

    expect(ids).toContain("administracion");
    expect(ids).toContain("evidencias");
    expect(ids).not.toContain("solicitudesAmpliacion");
    expect(ids).not.toContain("acreditacion");
    expect(ids).not.toContain("evaluacion");
  });

  it("muestra Gestion de Acreditacion cuando hay permisos del modulo", () => {
    const items = getNavigationItems({
      roles: ["Encargado de Acreditación"],
      permissions: ["procesos.view", "modelos.view", "ciclos.view"],
      context: {
        cycleId: 1,
      },
    });

    const acreditacion = items.find((item) => item.id === "acreditacion");
    const childIds = acreditacion?.children?.map((child) => child.id) ?? [];

    expect(childIds).toEqual(["gestion-acreditacion"]);
  });

  it("no muestra Gestion de Roles para administrador con roles.view", () => {
    const items = getNavigationItems({
      roles: ["Administrador"],
      permissions: ["roles.view", "roles.assign", "usuarios.view"],
    });

    const administracion = items.find((item) => item.id === "administracion");
    const childIds = administracion?.children?.map((child) => child.id) ?? [];

    expect(childIds).toContain("usuarios");
    expect(childIds).not.toContain("roles");
  });

  it("muestra navegacion reducida para perfil tipo docente", () => {
    const items = getNavigationItems({
      roles: ["Docente"],
      permissions: [
        "evidencias.view",
        "archivos.upload",
        "solicitudes_ampliacion.view",
        "solicitudes_ampliacion.create",
      ],
    });

    const ids = items.map((item) => item.id);

    expect(ids).toContain("inicio");
    expect(ids).toContain("evidencias");
    expect(ids).toContain("solicitudesAmpliacion");
    expect(ids).not.toContain("administracion");
    expect(ids).not.toContain("acreditacion");
    expect(ids).not.toContain("evaluacion");
  });

  it("trata a superusuario como cualquier rol cuando no trae permisos", () => {
    const items = getNavigationItems({
      roles: ["Superusuario"],
      permissions: [],
    });

    const ids = items.map((item) => item.id);

    expect(ids).toEqual(["inicio"]);
  });
});
