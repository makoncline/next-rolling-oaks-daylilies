import { Badge } from "@packages/design-system";
import React, {
  createContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import styled from "styled-components";

export const SnackBarContext = createContext<
  | {
      addAlert: (content: string) => void;
    }
  | undefined
>(undefined);

const AUTO_DISMISS = 1500;

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
      <SnackBarContainer>
        {alerts.map((alert) => (
          <Badge>
            <p>{alert}</p>
          </Badge>
        ))}
      </SnackBarContainer>
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

const SnackBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  margin: auto;

  color: var(--text-high);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  p {
    margin: 0 0 2.5px 10px;
    background-color: var(--bg-shine);
    border: 1px solid rgb(var(--rgb-blue));
    border-radius: 3rem;
    font-size: 1rem;
    padding: 0.5rem 1.5rem;
  }
`;
