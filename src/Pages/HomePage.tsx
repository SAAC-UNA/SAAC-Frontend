import React from "react";
import { ScreenContainer, FlipWords } from "@/Components/Ui/Index";
import { motion } from "framer-motion";
import { OSS_HERO_CONTAINER, OSS_HERO_ITEM } from "@/Constants/Animations";

const CodeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
    />
  </svg>
);

const PaintIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
    />
  </svg>
);

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
    />
  </svg>
);

const MonitorIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
    />
  </svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);

export const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
    />
  </svg>
);

const developers = [
  {
    name: "Ian Villegas Jiménez",
    role: "Desarrollador",
    icon: <CodeIcon className="w-6 h-6 text-azul-una" />,
  },
  {
    name: "Marisol Hidalgo Murillo",
    role: "Desarrolladora",
    icon: <PaintIcon className="w-6 h-6 text-rojo-una" />,
  },
  {
    name: "José Jara Arias",
    role: "Desarrollador",
    icon: <DatabaseIcon className="w-6 h-6 text-warning" />,
  },
  {
    name: "Cristina Zúñiga Cárdenas",
    role: "Desarrolladora",
    icon: <MonitorIcon className="w-6 h-6 text-info" />,
  },
  {
    name: "Naydelin Jirón Castellón",
    role: "Desarrolladora",
    icon: <SparkleIcon className="w-6 h-6 text-verde" />,
  },
];

const HomePage: React.FC = () => {
  return (
    <ScreenContainer>
      <motion.div
        variants={OSS_HERO_CONTAINER}
        initial="initial"
        animate="animate"
        className="relative flex flex-col items-center justify-center w-full min-h-[64vh] p-2"
      >
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-7 flex flex-col items-center w-full">
            <motion.div variants={OSS_HERO_ITEM} className="mb-6 relative">
              <div className="absolute inset-0 bg-rojo-una/30 blur-2xl rounded-full scale-150" />
              <div className="relative flex items-center justify-center w-15 h-15 rounded-[1.5rem] bg-gradient-to-br from-rojo-una to-rojo-una-2 shadow-xl ring-6 ring-white/50">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              variants={OSS_HERO_ITEM}
              className="text-2xl md:text-3xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 tracking-tight leading-[1.1] mb-6 max-w-4xl"
            >
              Sistema de Acreditación y Autoevaluación de Carreras
            </motion.h1>

            <motion.div
              variants={OSS_HERO_ITEM}
              className="flex flex-wrap items-center justify-center gap-3 mb-6"
            >
              <span className="px-5 py-2 rounded-full backdrop-blur-md bg-white/50 text-rojo-una font-black text-xs tracking-[0.2em] uppercase border border-rojo-una/20 shadow-sm">
                SAAC
              </span>
              <span className="px-5 py-2 rounded-full backdrop-blur-md bg-white/50 text-azul-una font-bold text-xs tracking-[0.1em] uppercase border border-azul-una/20 shadow-sm">
                Universidad Nacional
              </span>
            </motion.div>

            <motion.p
              variants={OSS_HERO_ITEM}
              className="text-base md:text-lg font-medium text-gray-500 max-w-2xl"
            >
              Sección Regional Central Occidente, Campus Alajuela
            </motion.p>

            <motion.p
              variants={OSS_HERO_ITEM}
              className="mt-3 text-sm font-medium text-gray-400"
            >
              Gestión de{" "}
              <FlipWords
                words={[
                  "Acreditaciones",
                  "Evidencias",
                  "Carreras",
                  "Compromisos",
                  "Reportes",
                ]}
                duration={2800}
                className="font-bold text-azul-una"
              />
            </motion.p>
          </div>

          {/* Developers Section */}
          <motion.div variants={OSS_HERO_ITEM} className="w-full mt-1">
            <div className="text-center mb-6">
              <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">
                Diseñado y desarrollado por
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {developers.map((dev, i) => (
                <motion.div
                  key={dev.name}
                  initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    delay: 0.35 + i * 0.07,
                  }}
                  whileHover={{ y: -6, scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative flex items-center pr-6 pl-2.5 py-2.5 rounded-full bg-white/70 border border-white/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] backdrop-blur-xl hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 border border-white shadow-sm flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
                    {dev.icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="text-sm font-extrabold text-gray-800 tracking-tight leading-none mb-1">
                      {dev.name}
                    </h4>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-gray-400">
                      {dev.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </ScreenContainer>
  );
};

export default HomePage;
