import React from "react";

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type SpaceProps = {
  direction?: "column" | "row";
  gap?: "none" | "xsmall" | "small" | "medium" | "large";
  children: React.ReactNode;
  center?: boolean;
  responsive?: boolean;
  block?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

const gapClasses = {
  none: "gap-0",
  xsmall: "gap-2",
  small: "gap-4",
  medium: "gap-8",
  large: "gap-12",
};

export const Space = React.forwardRef<HTMLElement, SpaceProps>(
  (
    {
      direction = "row",
      gap = "small",
      center = false,
      responsive = false,
      block = false,
      as = "div",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return React.createElement(
      as,
      {
        ...props,
        ref,
        className: cx(
          responsive
            ? "grid grid-cols-1 items-start md:grid-cols-2"
            : "flex",
          !responsive && direction === "column" && "flex-col",
          !responsive && direction === "row" && "flex-row",
          gapClasses[gap],
          center && "items-center justify-center",
          block && "w-full",
          "max-w-full",
          className
        ),
        style: props.style,
      },
      children
    );
  }
);
Space.displayName = "Space";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function Heading({
  level,
  children,
  className,
  ...props
}: {
  level: HeadingLevel;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return React.createElement(
    `h${level}`,
    { className: cx("text-ro-text-high", className), ...props },
    children
  );
}

export function FancyHeading({
  level,
  children,
  className,
  ...props
}: {
  level: HeadingLevel;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Heading
      level={level}
      className={cx("fancy-heading text-center", className)}
      {...props}
    >
      <span>{children}</span>
      <Hr />
    </Heading>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  block?: boolean;
  styleType?: "primary" | "default";
  danger?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      children,
      block = false,
      styleType = "default",
      danger = false,
      as = "button",
      className,
      type,
      ...props
    },
    ref
  ) => {
    return React.createElement(
      as,
      {
        ...props,
        ref,
        type: as === "button" ? type || "button" : undefined,
        className: cx(
          "btn",
          styleType === "primary" && "btn-primary",
          danger && "btn-danger",
          block && "w-full",
          className
        ),
      },
      children
    );
  }
);
Button.displayName = "Button";

export function Badge({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("badge", className)} {...props}>
      {children}
    </div>
  );
}

export function Hr(props: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cx("ro-hr", props.className)} {...props} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx("spinner", className)}
      aria-hidden="true"
    />
  );
}

export function PropertyList({
  children,
  divider,
  column,
  className,
}: {
  children: React.ReactNode;
  divider?: boolean;
  column?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "property-list",
        divider && "property-list-divider",
        column && "property-list-column",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PropertyListItem({
  children,
  label,
  inline,
}: {
  children: React.ReactNode;
  label?: string;
  inline?: boolean;
}) {
  return (
    <div className={cx("property-list-item", inline && "property-list-inline")}>
      {label && <div className="property-list-label">{label}</div>}
      <div>{children}</div>
    </div>
  );
}

type AlertType = "success" | "danger";

function AlertRoot({
  type,
  children,
  className,
}: {
  type: AlertType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx("alert", `alert-${type}`, className)}
      role={type === "danger" ? "alert" : "status"}
      aria-live={type === "danger" ? "assertive" : "polite"}
    >
      {children}
    </div>
  );
}

function AlertHeading({
  children,
  level = 1,
  className,
}: {
  children: React.ReactNode;
  level?: HeadingLevel;
  className?: string;
}) {
  return (
    <Heading level={level} className={className}>
      {children}
    </Heading>
  );
}

function AlertBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export const Alert = Object.assign(AlertRoot, {
  Heading: AlertHeading,
  Body: AlertBody,
});

export function FormWrapper({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[30rem]">{children}</div>;
}

export function Form({
  children,
  formId,
  className,
  ...props
}: {
  formId: string;
  children: React.ReactNode;
  className?: string;
} & React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form id={formId} className={cx("max-w-[40rem]", className)} {...props}>
      <div className="flex flex-col items-center justify-center gap-4">
        {children}
      </div>
    </form>
  );
}

export function Field({
  name = "",
  type = "text",
  required = false,
  showLabel = true,
  placeholder = "",
  children,
  hidden,
  textarea = false,
  rows = 6,
  ...props
}: {
  name?: string;
  type?: "text" | "password" | "email" | "number";
  required?: boolean;
  showLabel?: boolean;
  placeholder?: string;
  children: string;
  hidden?: boolean;
  textarea?: boolean;
  rows?: number;
  [key: string]: unknown;
}) {
  const fieldId = name || children.replace(/\s+/g, "-").toLowerCase();
  const inferredType = name === "email" && type === "text" ? "email" : type;
  const inferredAutoComplete =
    props.autoComplete ??
    (name === "email"
      ? "email"
      : name === "name"
      ? "name"
      : textarea
      ? "off"
      : undefined);
  const inferredSpellCheck =
    props.spellCheck ?? (name === "email" ? false : undefined);
  return (
    <div className={cx("field", hidden && "hidden")}>
      <label htmlFor={fieldId} hidden={!showLabel}>
        {required ? (
          <span className="required-marker" aria-hidden="true">
            *
          </span>
        ) : null}
        {children}
      </label>
      {textarea ? (
        <textarea
          id={fieldId}
          name={fieldId}
          placeholder={placeholder}
          autoComplete={inferredAutoComplete as string | undefined}
          rows={rows}
          required={required}
          aria-required={required || undefined}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          name={fieldId}
          type={inferredType}
          placeholder={placeholder}
          autoComplete={inferredAutoComplete as string | undefined}
          spellCheck={inferredSpellCheck as boolean | undefined}
          required={required}
          aria-required={required || undefined}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-ro-danger" role="alert" aria-live="polite">
      {children}
    </div>
  );
}

export function Nav({
  logo,
  children,
}: {
  logo: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const navMenuId = React.useId();

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const closeOnResize = () => setIsOpen(false);
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <nav className="w-full py-2">
      <div className="flex min-h-10 w-full items-center justify-between">
        <div className="mr-auto">{logo}</div>
        <ul className="m-0 hidden list-none flex-row items-center gap-3 p-0 md:flex">
          {React.Children.map(children, (child, index) => (
            <li key={index} className="px-3 py-2">
              {child}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-transparent bg-transparent text-ro-text-high md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-controls={navMenuId}
          aria-expanded={isOpen}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>
      {isOpen && (
        <div id={navMenuId} className="overscroll-contain md:hidden">
          <ul className="flex h-screen list-none flex-col gap-3 p-0">
            {React.Children.map(children, (child, index) => (
              <li key={index} className="px-3 py-2">
                {child}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialValueRef = React.useRef(initialValue);
  const [storedValue, setStoredValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      setStoredValue(initialValueRef.current);
    }
  }, [key]);

  const setValue = React.useCallback(
    (value: T | ((value: T) => T)) => {
      setStoredValue((currentValue) => {
        const valueToStore =
          value instanceof Function ? value(currentValue) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
