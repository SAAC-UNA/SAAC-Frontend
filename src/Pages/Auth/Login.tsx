/**
 * Login - Página de inicio de sesión
 * Login con cédula y contraseña
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { useToast } from "@/Hooks/useToast";
import { ValidationError } from "@/Services/AuthService";
import { Input } from "@/Components/Ui/Forms/Input";
import IsotipoSAAC from "@/Assets/IsotipoSAAC.svg?react";
import { Grainient } from "@/Components/Ui/Backgrounds/Grainient";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/Components/Ui/Feedback/Tooltip";

export const Login = () => {
  const [formState, setFormState] = useState({
    cedula: "",
    password: "",
    error: "",
    loading: false,
  });
  const { cedula, password, error, loading } = formState;
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, error: "", loading: true }));

    try {
      await login({ cedula, password });
      navigate("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      setFormState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      if (err instanceof ValidationError) {
        err.messages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(errorMessage);
      }
      return;
    }
    setFormState((prev) => ({ ...prev, loading: false }));
  };

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden items-center justify-center p-5 gap-[60px] [html:has(&)]:overflow-y-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 isolate">
        <div className="absolute inset-0 bg-blanco-una/25 z-10" />
        <Grainient
          color1="#cd1719"
          color2="#f8f9fa"
          color3="#cd1719"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
      {/* Card */}
      <div className="bg-white flex flex-col items-center justify-start px-[60px] pt-10 pb-[60px] relative w-full max-w-[480px] rounded-corner-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[1] flex-shrink-0">
        <div className="w-full max-w-[380px]">
          <IsotipoSAAC
            aria-label="SAAC Logo"
            className="w-auto mx-auto mb-2.5 block drop-shadow-sm text-rojo-una"
            style={{ height: "calc(var(--size-icon-logo) * 3)" }}
          />
          <h1 className="text-[1.5rem] font-bold text-negro-una mb-2 text-center">
            Bienvenido a SAAC
          </h1>
          <p className="size-form-helper text-gris-una-2 mb-[30px] text-center">
            Ingrese con sus credenciales institucionales
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-5">
            {/* Cédula */}
            <Input
              id="cedula"
              type="text"
              label="Identificación"
              value={cedula}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, cedula: e.target.value }))
              }
              disabled={loading}
              error={error || undefined}
              className="h-12 border-2"
              leftIcon={SystemIcons.users.user({ size: "sm" })}
            />

            {/* Contraseña */}
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              value={password}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              disabled={loading}
              error={error || undefined}
              className="h-12 border-2 pr-24"
              leftIcon={SystemIcons.auth.lock({ size: "sm" })}
              rightElement={
                <>
                  <button
                    type="button"
                    className="bg-transparent border-none cursor-pointer text-slate text-[0.75rem] font-semibold uppercase tracking-[0.5px] transition-colors duration-200 hover:text-azul-una-2 disabled:opacity-50 disabled:cursor-not-allowed p-0 leading-none flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-slate">
                        {SystemIcons.interface.informationCircle({ size: "sm" })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Ingrese la contraseña que emplea en los demás sistemas de la
                      universidad
                    </TooltipContent>
                  </Tooltip>
                </>
              }
            />

            <div className="text-center">
              <a
                href="https://recuperacion.una.ac.cr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rojo-una text-[0.85rem] no-underline mx-auto inline-block transition-all duration-200 hover:underline hover:text-rojo-una-2"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className="w-full flex items-center justify-center gap-5 mt-2.5">
              <button
                type="submit"
                className="btn-pill-fill"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Ingresar"}
              </button>
            </div>
          </form>
        </div>

        <footer className="absolute bottom-5 left-0 right-0 text-center text-slate text-[0.75rem] font-normal tracking-[0.3px]">
          © {new Date().getFullYear()} — SAAC · Universidad Nacional de Costa
          Rica
        </footer>
      </div>
    </div>
  );
};
