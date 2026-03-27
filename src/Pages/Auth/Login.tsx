/**
 * Login - Página de inicio de sesión
 * Login con cédula y contraseña
 *
 * TODO - hay que estandarizar los estilos del login con lo que ya tenemos en el index general. Si se necesitan nuevos estilos para este caso particular, se pueden añadir en index, pero el global
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext";
import { useSessionWatcher } from "@/Hooks/useSessionWatcher";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { useToast } from "@/Hooks/useToast";
import { ValidationError } from "@/Services/AuthService";
import styles from "./Login.module.css";

export const Login = () => {
  const [formState, setFormState] = useState({
    cedula: "",
    password: "",
    error: "",
    loading: false,
  });
  const cedula = formState.cedula;
  const password = formState.password;
  const error = formState.error;
  const loading = formState.loading;
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  useSessionWatcher();

  useEffect(() => {
    if (searchParams.get("session_expired") === "true") {
      toast.warning(
        "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
      );
      // Opcional: limpiar el parámetro de la URL para que el mensaje no persista en refrescos
      navigate("/login", { replace: true });
    }
  }, [searchParams, toast, navigate]);

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

  // Login rápido para testing - Usando datos del seeder
  // const quickLogin = async (role: 'SuperUsuario' | 'AdminInge' | 'AdminQuimi') => {
  //   const credentials = {
  //     SuperUsuario: { cedula: '101010101', password: 'password' },
  //     AdminInge: { cedula: '203948609', password: 'password' },
  //     AdminQuimi: { cedula: '402290552', password: 'password' }
  //   };

  //   setLoading(true);

  //   try {
  //     await login(credentials[role]);
  //     navigate('/');
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /**
   * ? - qué Left section? ¿Es en caso de que se habilite el diseño del lado derecho?
   * ! - Eliminar lo que no tenga uso real como esto */
  return (
    <div className={styles["login-page"]}>
      {/* Left Section - Branding Text */}
      <div className={styles["login-branding-section"]}>
        <div className={styles["login-branding"]}>
          <div className={styles["login-logo"]}>SAAC</div>
          <h2 className={styles["login-title"]}>
            Sistema de Acreditación y Autoevaluación de las Carreras
          </h2>
          <p className={styles["login-subtitle"]}>
            UNA - Universidad Nacional de Costa Rica
          </p>
        </div>
      </div>

      {/* Right Section - Form Container */}
      <div className={styles["login-form-section"]}>
        <div className={styles["login-form-wrapper"]}>
          <img
            src="src/assets/IsotipoSAAC.svg"
            alt="SAAC Logo"
            className={styles["login-logo-image"]}
          />
          <h1 className={styles["login-form-title"]}>Bienvenido a SAAC</h1>
          <p className={styles["login-form-subtitle"]}>
            Ingrese con sus credenciales institucionales
          </p>

          <form onSubmit={handleSubmit} className={styles["login-form"]}>
            <div
              className={`${styles["login-input-field"]} ${error ? styles["error"] : ""}`}
            >
              <div className={styles["login-input-icon"]}>
                {SystemIcons.interface.user({ size: "sm", color: "#a0aec0" })}
              </div>
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
              />
              <label htmlFor="cedula">Identificación</label>
            </div>

            <div
              className={`${styles["login-input-field-password"]} ${error ? styles["error"] : ""}`}
            >
              <div className={styles["login-input-icon"]}>
                {SystemIcons.interface.lock({ size: "sm", color: "#a0aec0" })}
              </div>
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
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className={styles["login-toggle-password"]}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
              <div className={styles["login-info-tooltip"]}>
                {SystemIcons.interface.infoCircle({
                  size: "sm",
                  color: "#a0aec0",
                })}
                <span className={styles["login-tooltip-text"]}>
                  Ingrese la contraseña que emplea en los demás sistemas de la
                  universidad
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <a
                href="https://recuperacion.una.ac.cr/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles["login-forgot-password"]}
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className={styles["login-btn-container"]}>
              <button
                type="submit"
                className={styles["login-btn"]}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Ingresar"}
              </button>
            </div>
          </form>
        </div>

        <footer className={styles["login-footer"]}>
          © {new Date().getFullYear()} — SAAC · Universidad Nacional de Costa
          Rica
        </footer>
      </div>
    </div>
  );
};
