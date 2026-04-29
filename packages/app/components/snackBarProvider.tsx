import { Badge } from "components/ui";
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
        () => setAlerts(() => alerts.slice(0, alerts.length - 1)),
        AUTO_DISMISS
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeAlertIds, alerts]);

  const addAlert = useCallback(
    (content: string) => setAlerts(() => [content, ...alerts]),
    [alerts]
  );

  const value = useMemo(() => ({ addAlert }), [addAlert]);

  return (
    <SnackBarContext.Provider value={value}>
      {children}
      <div className="fixed bottom-0 z-20 flex flex-col items-start justify-center gap-2 text-ro-text-high">
        {alerts.map((alert, i) => (
          <Badge
            key={i}
            className="border border-ro-success bg-ro-surface text-ro-text-high"
          >
            <p className="m-0 rounded-full border border-ro-blue bg-ro-surface2 px-6 py-2 text-base">
              {alert}
            </p>
          </Badge>
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
