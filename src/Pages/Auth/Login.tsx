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
import { cn } from "@/Utils/ClassNames";
import IsotipoSAAC from "@/Assets/IsotipoSAAC.svg?react";
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

  const inputBase =
    "w-full h-full pl-11 text-[0.95rem] tracking-[0.5px] rounded-corner border-2 bg-white/75 font-poppins transition-all duration-300 focus:outline-none peer placeholder-transparent disabled:opacity-50 disabled:cursor-not-allowed";

  const labelBase = cn(
    "absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none",
    "text-[0.95rem] font-medium text-slate transition-all duration-300",
    "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-azul-una-2",
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75",
    "floating-label-halo"
  );

  const inputBorderNormal =
    "border-slate-light focus:border-azul-una-2 focus:shadow-[0_0_0_3px_rgba(43,87,218,0.1)]";
  const inputBorderError =
    "border-rojo-una shadow-[0_0_0_3px_rgba(200,16,46,0.1)]";
  const labelErrorColor =
    "text-rojo-una peer-[:not(:placeholder-shown)]:text-rojo-una peer-focus:text-rojo-una";

  return (
    <div
      className="min-h-screen flex w-full bg-cover bg-center relative overflow-hidden items-center justify-center p-5 gap-[60px] [html:has(&)]:overflow-y-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 100%), url('/Images/Fondo login.png')",
      }}
    >
      {/* Card */}
      <div className="bg-white/75 backdrop-blur-[20px] flex flex-col items-center justify-start px-[60px] pt-10 pb-[60px] relative w-full max-w-[480px] rounded-corner-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[1] flex-shrink-0">
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
            <div className="relative h-12 flex items-center">
              <span className="absolute left-[14px] top-1/2 -translate-y-1/2 z-[2] text-slate">
                {SystemIcons.users.user({ size: "sm" })}
              </span>
              <input
                id="cedula"
                type="text"
                value={cedula}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, cedula: e.target.value }))
                }
                required
                disabled={loading}
                placeholder=""
                className={cn(
                  inputBase,
                  "pr-4",
                  error ? inputBorderError : inputBorderNormal
                )}
              />
              <label
                htmlFor="cedula"
                className={cn(labelBase, error && labelErrorColor)}
              >
                Identificación
              </label>
            </div>

            {/* Contraseña */}
            <div className="relative h-12 flex items-center">
              <span className="absolute left-[14px] top-1/2 -translate-y-1/2 z-[2] text-slate">
                {SystemIcons.auth.lock({ size: "sm" })}
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
                disabled={loading}
                placeholder=""
                className={cn(
                  inputBase,
                  "pr-[70px]",
                  error ? inputBorderError : inputBorderNormal
                )}
              />
              <label
                htmlFor="password"
                className={cn(labelBase, error && labelErrorColor)}
              >
                Contraseña
              </label>
              <button
                type="button"
                className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate text-[0.75rem] font-semibold uppercase tracking-[0.5px] transition-colors duration-200 hover:text-azul-una-2 disabled:opacity-50 disabled:cursor-not-allowed p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute -right-6 top-1/2 -translate-y-1/2 cursor-help text-slate">
                    {SystemIcons.interface.informationCircle({ size: "sm" })}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Ingrese la contraseña que emplea en los demás sistemas de la
                  universidad
                </TooltipContent>
              </Tooltip>
            </div>

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
