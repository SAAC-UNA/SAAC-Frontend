import React from "react";
import { Card, ScreenContainer } from "@/Components/Ui/Index";
import { getIconByName } from "@/Components/Ui/Icons/SystemIcons";
import { CARD_HOVER_SHADOWS } from "@/Constants/CardHoverShadows";
import { TYPOGRAPHY } from "@/Constants/Typography";

const TEAM_MEMBERS = [
  {
    name: "Cristina Zúñiga Cárdenas",
    accentClassName: "bg-error",
    numberClassName: "text-error",
    hoverClassName: CARD_HOVER_SHADOWS.error,
  },
  {
    name: "Ian Villegas Jiménez",
    accentClassName: "bg-warning",
    numberClassName: "text-warning",
    hoverClassName: CARD_HOVER_SHADOWS.warning,
  },
  {
    name: "José Jara Arias",
    accentClassName: "bg-info",
    numberClassName: "text-info",
    hoverClassName: CARD_HOVER_SHADOWS.info,
  },
  {
    name: "Marisol Hidalgo Murillo",
    accentClassName: "bg-teal",
    numberClassName: "text-teal",
    hoverClassName: CARD_HOVER_SHADOWS.teal,
  },
  {
    name: "Naydelin Jirón Castellón",
    accentClassName: "bg-naranja",
    numberClassName: "text-naranja",
    hoverClassName: CARD_HOVER_SHADOWS.naranja,
  },
] as const;

const InstitutionalHomePage: React.FC = () => {
  return (
    <ScreenContainer variant="full-width" className="space-y-8 pt-4 md:pt-6">
      <section className="mx-auto mt-6 w-full max-w-screen-xl px-1 md:mt-8 md:px-2">
        <div className="text-center">
          <p className={`${TYPOGRAPHY.badge} font-bold uppercase text-rojo-una-2`}>
            Créditos del proyecto
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-negro-una md:text-4xl">
            Acerca de SAAC-UNA
          </h1>
          <p
            className={`mx-auto mt-3 max-w-2xl ${TYPOGRAPHY.pageSubtitle} text-gris-una`}
          >
            Sistema de Acreditación y Autoevaluación de Carreras de la Sección
            Regional Central Occidente, Campus Alajuela.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-5 px-1 md:px-2 xl:grid-cols-12">
        <Card className="relative overflow-hidden p-5 xl:col-span-4">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-rojo-una-2" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`${TYPOGRAPHY.badge} font-bold uppercase tracking-wide text-rojo-una-2`}>
                Información institucional
              </p>
              <h2 className="mt-2 text-2xl font-bold text-negro-una">
                SAAC-UNA
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-corner bg-rojo-una-2/10 text-rojo-una-2">
              {getIconByName("information-circle", "md")}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-4">
              <span className="mt-2 h-2 w-2 rounded-full bg-rojo-una-2" />
              <div>
                <p className={`${TYPOGRAPHY.form.label} font-bold uppercase text-gris-una-3`}>
                  Sede
                </p>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-gris-una`}>
                  Sección Regional Central Occidente
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-4">
              <span className="mt-2 h-2 w-2 rounded-full bg-rojo-una-2" />
              <div>
                <p className={`${TYPOGRAPHY.form.label} font-bold uppercase text-gris-una-3`}>
                  Campus
                </p>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-gris-una`}>
                  Alajuela
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-4">
              <span className="mt-2 h-5 w-0.5 rounded-full bg-rojo-una-2" />
              <div>
                <p className={`${TYPOGRAPHY.form.label} font-bold uppercase text-gris-una-3`}>
                  Propósito
                </p>
                <p className={`mt-1 ${TYPOGRAPHY.body} leading-relaxed text-gris-una`}>
                  Brindar una herramienta administrativa para organizar,
                  consultar y gestionar información asociada a los procesos de
                  acreditación institucional y académica.
                </p>
              </div>
            </div>
          </div>

        </Card>

        <Card className="p-5 xl:col-span-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`${TYPOGRAPHY.badge} font-bold uppercase tracking-wide text-rojo-una-2`}>
                Equipo de desarrollo
              </p>
              <h2 className="mt-2 text-2xl font-bold text-negro-una">
                Créditos
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-rojo-una-2/10 px-4 py-2 text-sm font-bold text-rojo-una-2">
              {TEAM_MEMBERS.length} personas
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={member.name}
                className={`relative overflow-hidden rounded-corner bg-gris-50/80 p-4 shadow-sm transition-all duration-200 ${member.hoverClassName} ${
                  index === TEAM_MEMBERS.length - 1 ? "md:col-span-2 xl:col-span-1" : ""
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${member.accentClassName}`}
                />
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-corner bg-blanco-una text-lg font-bold shadow-sm ${member.numberClassName}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold leading-snug text-negro-una">
                      {member.name}
                    </p>
                    <p className={`${TYPOGRAPHY.form.helper} mt-1 font-semibold text-gris-una`}>
                      Integrante del proyecto
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-corner bg-gris-50/80 px-5 py-3 text-center">
            <p className={`${TYPOGRAPHY.body} font-semibold text-gris-una`}>
              Desarrollado como parte del compromiso académico con la{" "}
              <span className="font-bold text-negro-una">
                Universidad Nacional (UNA).
              </span>
            </p>
          </div>
        </Card>
      </section>
    </ScreenContainer>
  );
};

export default InstitutionalHomePage;
