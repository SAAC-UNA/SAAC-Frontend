import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const REDIRECT_SECONDS = 4;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  borderRadius: "16px",
  background: "#ffffff",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.2)",
  border: "1px solid #e2e8f0",
  padding: "24px",
};

export const SessionExpired = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

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
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div style={modalStyle}>
        <h2
          id="session-expired-title"
          style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}
        >
          Sesion expirada
        </h2>
        <p
          style={{
            marginTop: "12px",
            marginBottom: 0,
            color: "#334155",
            lineHeight: 1.5,
          }}
        >
          Tu sesion ha expirado. Seras redirigido al inicio de sesion en{" "}
          {secondsLeft} segundo{secondsLeft === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  );
};
