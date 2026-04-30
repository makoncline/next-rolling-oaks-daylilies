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

const AUTO_DISMISS = 500;

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
        className="pointer-events-none fixed bottom-4 left-4 z-20 flex max-w-[calc(100vw-2rem)] flex-col items-start justify-center gap-2 text-ro-text-high"
        role="status"
        aria-live="polite"
      >
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="rounded-md border border-ro-border bg-ro-surface2 px-4 py-2 text-sm font-semibold shadow-lg shadow-black/30"
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
