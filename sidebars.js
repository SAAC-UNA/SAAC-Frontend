const sidebars = {
  manualSidebar: [
    "index",
    {
      type: "category",
      label: "Administracion",
      link: { type: "doc", id: "administracion/index" },
      items: [
        "administracion/roles",
        "administracion/usuarios",
        "administracion/bitacora",
      ],
    },
    {
      type: "category",
      label: "Acreditacion",
      link: { type: "doc", id: "acreditacion/index" },
      items: [
        "acreditacion/gestion-acreditacion",
        "acreditacion/modelos-acreditacion",
        "acreditacion/ciclos-acreditacion",
        "acreditacion/procesos-acreditacion",
        "acreditacion/estructura-institucional",
      ],
    },
    {
      type: "category",
      label: "Entregables",
      link: { type: "doc", id: "entregables/index" },
      items: [
        "entregables/asignar-entregables",
        "entregables/mis-entregas",
        "entregables/buscar-entregables",
      ],
    },
    {
      type: "category",
      label: "Ampliacion",
      link: { type: "doc", id: "ampliacion/index" },
      items: ["ampliacion/mis-solicitudes", "ampliacion/gestionar-solicitudes"],
    },
    {
      type: "category",
      label: "Compromisos de Mejora",
      link: { type: "doc", id: "compromisos/index" },
      items: ["compromisos/compromisos-mejora"],
    },
    {
      type: "category",
      label: "Evaluacion",
      link: { type: "doc", id: "evaluacion/index" },
      items: ["evaluacion/aprobacion-bloques"],
    },
    {
      type: "category",
      label: "Informes",
      link: { type: "doc", id: "informes/index" },
      items: ["informes/gestion-enlaces", "informes/informes-acreditacion"],
    },
    {
      type: "category",
      label: "Referencias",
      items: [
        "referencias/navegacion-permisos",
        "referencias/como-ejecutar-manual",
        "referencias/plantilla-modulo",
      ],
    },
  ],
};

export default sidebars;
