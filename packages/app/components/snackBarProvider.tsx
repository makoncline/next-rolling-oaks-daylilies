import React, {
  createContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";

export const SnackBarContext = createContext<
  | {
      addAlert: (content: string) => void;
    }
  | undefined
>(undefined);

const AUTO_DISMISS = 3000;

export const SnackBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [alerts, setAlerts] = useState<(string | undefined)[]>([]);

  const activeAlertIds = alerts.join(",");
  useEffect(() => {
    if (activeAlertIds.length > 0) {
      const timer = setTimeout(
        () => setAlerts((currentAlerts) => currentAlerts.slice(0, -1)),
        AUTO_DISMISS
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeAlertIds]);

  const addAlert = useCallback(
    (content: string) =>
      setAlerts((currentAlerts) => [content, ...currentAlerts]),
    []
  );

  const value = useMemo(() => ({ addAlert }), [addAlert]);

  return (
    <SnackBarContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-20 flex flex-col items-start justify-center gap-2 text-popover-foreground"
        data-ui="notifications"
        role="status"
        aria-live="polite"
      >
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="rounded-md border-stroke border-card-border bg-popover px-4 py-2.5 text-meta font-semibold shadow-toast"
          >
            {alert}
          </div>
        ))}
      </div>
    </SnackBarContext.Provider>
  );
};

export const useSnackBar = () => {
  const context = useContext(SnackBarContext);
  if (typeof context === "undefined") {
    throw new Error("useSnackBar must be used inside of a SnackBarProvider");
  }
  return context;
};
