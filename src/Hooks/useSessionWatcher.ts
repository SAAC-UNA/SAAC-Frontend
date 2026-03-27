import { useEffect, useState } from "react";
import { authService } from "@/Services/AuthService";
import { useToast } from "@/Hooks/useToast";

const EXPIRATION_CHECK_INTERVAL = 60 * 1000; // 1 minuto
const WARNING_THRESHOLD = 3 * 60 * 1000; // 3 minutos

export const useSessionWatcher = () => {
  const toast = useToast();
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const expirationTime = authService.getSessionExpiration();
      if (!expirationTime) {
        return;
      }

      const now = new Date().getTime();
      const timeLeft = expirationTime - now;

      if (timeLeft <= WARNING_THRESHOLD && timeLeft > 0 && !warningShown) {
        const minutesLeft = Math.round(timeLeft / (60 * 1000));
        toast.warning(
          `Tu sesión expirará en aproximadamente ${minutesLeft} minutos.`,
        );
        setWarningShown(true);
      }
    };

    const intervalId = setInterval(
      checkSessionExpiration,
      EXPIRATION_CHECK_INTERVAL,
    );

    return () => clearInterval(intervalId);
  }, [toast, warningShown]);
};
