import React from "react";
import { Card, ScreenContainer } from "@/Components/Ui/Index";
import { getIconByName } from "@/Components/Ui/Icons/SystemIcons";
import { CARD_HOVER_SHADOWS } from "@/Constants/CardHoverShadows";
import { TYPOGRAPHY } from "@/Constants/Typography";

const TEAM_MEMBERS = [
  {
    name: "Naydelin Jirón Castellón",
    role: "SCRUM Master IC 2025",
    iconName: "shield",
    numberClassName: "text-naranja",
    hoverClassName: CARD_HOVER_SHADOWS.naranja,
  },
  {
    name: "Ian Villegas Jiménez",
    role: "SCRUM Master IIC 2025",
    iconName: "shield",
    numberClassName: "text-verde",
    hoverClassName: CARD_HOVER_SHADOWS.verde,
  },
  {
    name: "José Jara Arias",
    role: "SCRUM Master IC 2026",
    iconName: "shield",
    numberClassName: "text-info",
    hoverClassName: CARD_HOVER_SHADOWS.info,
  },
  {
    name: "Marisol Hidalgo Murillo",
    role: "Desarrolladora",
    iconName: "computer",
    numberClassName: "text-rose",
    hoverClassName: CARD_HOVER_SHADOWS.rose,
  },
  {
    name: "Cristina Zúñiga Cárdenas",
    role: "Desarrolladora",
    iconName: "computer",
    numberClassName: "text-error",
    hoverClassName: CARD_HOVER_SHADOWS.error,
  },
] as const;

const InstitutionalHomePage: React.FC = () => {
  return (
    <ScreenContainer variant="full-width" className="space-y-8 pt-4 md:pt-6">
      <section className="mx-auto mt-6 w-full max-w-screen-xl px-1 md:mt-8 md:px-2">
        <div className="text-center">
          <h1 className="mt-2 text-3xl font-bold leading-tight text-negro-una md:text-4xl">
            Acerca de SAAC UNA
          </h1>
          <p
            className={`mx-auto mt-3 max-w-2xl ${TYPOGRAPHY.pageSubtitle} text-gris-una`}
          >
            Sistema de Acreditación y Autoevaluación de Carreras
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-5 px-1 md:px-2 xl:grid-cols-12">
        <Card className="relative overflow-hidden p-5 xl:col-span-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`${TYPOGRAPHY.pageTitle} font-bold text-negro-una mb-3`}>
                Información institucional
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div>
                <p className={`${TYPOGRAPHY.form.label} font-bold uppercase text-negro-una`}>
                  Sede
                </p>
                <p className={`mt-1 ${TYPOGRAPHY.body} font-normal text-gris-una`}>
                  Sección Regional Central Occidente
                </p>
              </div>
            </div>

            <div>
              <div>
                <p className={`${TYPOGRAPHY.form.label} font-bold uppercase text-negro-una`}>
                  Campus
                </p>
                <p className={`mt-1 ${TYPOGRAPHY.body} font-normal text-gris-una`}>
                  Alajuela
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-4">
              <span className="h-full w-0.5 rounded-full bg-rojo-una-2" />
              <div>
                <p className={`${TYPOGRAPHY.form.label} font-bold uppercase text-negro-una`}>
                  Propósito
                </p>
                <p className={`mt-1 ${TYPOGRAPHY.body} leading-relaxed font-normal text-gris-una`}>
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
              <p className={`${TYPOGRAPHY.pageTitle} font-bold text-negro-una mb-3`}>
                Equipo de desarrollo
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:flex xl:flex-wrap xl:justify-center">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className={`relative overflow-hidden rounded-corner bg-gris-50/80 p-4 shadow-sm transition-all duration-200 xl:w-[calc((100%_-_2rem)/3)] ${member.hoverClassName}`}
              >
                <div className="grid min-h-[4.25rem] grid-cols-[3rem_minmax(0,1fr)] grid-rows-[2.75rem_1.25rem] gap-x-4">
                  <div
                    className={`row-span-2 flex h-12 w-12 items-center justify-center self-center rounded-corner bg-blanco-una shadow-sm ${member.numberClassName}`}
                  >
                    {getIconByName(member.iconName, "lg")}
                  </div>
                  <p className="line-clamp-2 min-w-0 self-center font-bold leading-snug text-negro-una">
                    {member.name}
                  </p>
                  <p className={`${TYPOGRAPHY.form.helper} min-w-0 self-start font-normal leading-5 text-gris-una`}>
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 px-5 py-3 text-center">
            <p className={`${TYPOGRAPHY.body} font-normal text-gris-una`}>
              Desarrollado como parte del compromiso académico del Laboratorio de Innovación y Emprendimiento
            </p>
          </div>
        </Card>
      </section>
    </ScreenContainer>
  );
};

export default InstitutionalHomePage;
