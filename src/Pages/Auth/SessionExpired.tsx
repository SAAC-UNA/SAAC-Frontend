import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/IsotipoSAAC.svg";
import { Button } from "@/Components/Ui/Buttons/Button";

const REDIRECT_SECONDS = 5;

export const SessionExpired = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const goToLoginNow = () => {
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-slate-900/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <img
          src={logo}
          alt="Logo SAAC"
          className="mx-auto mb-3 block h-[72px] w-[72px] object-contain"
        />
        <h2
          id="session-expired-title"
          className="m-0 text-[1.35rem] font-extrabold uppercase tracking-wide text-slate-900"
        >
          SESIÓN EXPIRADA
        </h2>
        <p className="mx-auto mb-5 mt-3 max-w-[40ch] font-bold uppercase leading-relaxed tracking-[0.01em] text-slate-700">
          Su sesión ha expirado. Se le redirigirá al inicio de sesión en{" "}
          {secondsLeft} segundo{secondsLeft === 1 ? "" : "s"}.
        </p>
        <div className="flex justify-center">
          <Button variant="secondary" size="md" onClick={goToLoginNow}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};
