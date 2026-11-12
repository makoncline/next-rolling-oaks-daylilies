import React from "react";

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type UnstyledProps<Props> = Omit<Props, "className" | "style"> & {
  className?: never;
  style?: never;
};

type SpaceProps = {
  direction?: "column" | "row";
  gap?: "none" | "xsmall" | "small" | "medium" | "large";
  children: React.ReactNode;
  center?: boolean;
  align?: "start";
  responsive?: boolean;
  block?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
} & UnstyledProps<React.HTMLAttributes<HTMLElement>>;

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
      align,
      responsive = false,
      block = false,
      as = "div",
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
          center && "items-center",
          align === "start" && "items-start",
          center && "justify-center",
          block && "w-full",
          "max-w-full"
        ),
      },
      children
    );
  }
);
Space.displayName = "Space";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = {
  level: HeadingLevel;
  children: React.ReactNode;
} & UnstyledProps<React.HTMLAttributes<HTMLHeadingElement>>;

export function Heading({ level, children, ...props }: HeadingProps) {
  return React.createElement(
    `h${level}`,
    { className: "text-foreground-emphasis", ...props },
    children
  );
}

export function FancyHeading({ level, children, ...props }: HeadingProps) {
  return React.createElement(
    `h${level}`,
    {
      className: "m-0 w-full text-foreground-emphasis",
      ...props,
    },
    children
  );
}

type ButtonProps = {
  children: React.ReactNode;
  block?: boolean;
  styleType?: "primary" | "default";
  size?: "default" | "compact";
  danger?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
} & UnstyledProps<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      children,
      block = false,
      styleType = "default",
      size = "default",
      danger = false,
      as = "button",
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
          "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border-stroke border-transparent font-semibold leading-tight no-underline transition-colors hover:cursor-pointer hover:no-underline active:translate-y-press disabled:cursor-not-allowed disabled:border-transparent disabled:bg-secondary disabled:text-subtle-foreground disabled:active:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:text-subtle-foreground aria-disabled:hover:bg-secondary aria-disabled:active:translate-y-0",
          size === "compact"
            ? "min-h-control-compact gap-1.5 px-3 text-meta"
            : "min-h-control px-5 py-button-y text-base",
          styleType === "primary"
            ? danger
              ? "bg-destructive text-destructive-foreground hover:text-destructive-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground"
            : danger
            ? "bg-transparent text-destructive-text hover:bg-secondary hover:text-destructive-text"
            : "bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground",
          block && "w-full"
        ),
      },
      children
    );
  }
);
Button.displayName = "Button";

export function Badge({
  children,
  ...props
}: UnstyledProps<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className="inline-flex w-max items-center whitespace-nowrap rounded-sm bg-secondary px-badge-x py-badge-y text-meta font-medium leading-normal text-muted-foreground"
      {...props}
    >
      {children}
    </div>
  );
}

export function Hr() {
  return <hr className="my-0 h-stroke w-full border-0 bg-border" />;
}

export function Spinner() {
  return (
    <span
      data-ui="spinner"
      className="inline-block size-4 animate-spinner rounded-full border-focus border-r-transparent motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

export function PropertyList({
  children,
  divider,
  column,
}: {
  children: React.ReactNode;
  divider?: boolean;
  column?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap",
        divider && "gap-y-3 [&>:not(:last-child)]:border-r-stroke [&>:not(:last-child)]:border-r-border [&>:not(:last-child)]:pr-5 [&>:not(:first-child)]:pl-5",
        column && "flex-col [&>:not(:last-child)]:pb-4"
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
    <div className={cx(
      "flex",
      inline
        ? "flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-6 [&>:first-child]:shrink-0 sm:[&>:first-child]:basis-32"
        : "flex-col gap-0.5"
    )}>
      {label && <div className="text-meta text-muted-foreground">{label}</div>}
      <div className="min-w-0 text-foreground-emphasis">{children}</div>
    </div>
  );
}

type AlertType = "success" | "danger";

function AlertRoot({
  type,
  children,
}: {
  type: AlertType;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        // Keep descendant colors below Heading utility specificity.
        "flex w-full max-w-136 flex-col gap-4 py-2 [:where(&)_:is(h1,h2,h3)]:m-0 [:where(&)_:is(h1,h2,h3)]:text-alert-heading [:where(&)_p]:m-0",
        type === "success"
          ? "[:where(&)_:is(h1,h2,h3)]:text-success-text"
          : "[:where(&)_:is(h1,h2,h3)]:text-destructive-text"
      )}
      data-ui="alert"
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
}: {
  children: React.ReactNode;
  level?: HeadingLevel;
}) {
  return <Heading level={level}>{children}</Heading>;
}

function AlertBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export const Alert = Object.assign(AlertRoot, {
  Heading: AlertHeading,
  Body: AlertBody,
});

export function FormWrapper({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-form">{children}</div>;
}

export function Form({
  children,
  formId,
  ...props
}: {
  formId: string;
  children: React.ReactNode;
} & UnstyledProps<React.FormHTMLAttributes<HTMLFormElement>>) {
  return (
    <form id={formId} className="w-full" {...props}>
      <div className="flex flex-col items-stretch justify-center gap-4">
        {children}
      </div>
    </form>
  );
}

type FieldProps = {
  type?: "text" | "password" | "email" | "number";
  showLabel?: boolean;
  children: string;
  rows?: number;
} & (
  | ({ textarea?: false } & UnstyledProps<
      Omit<React.ComponentPropsWithRef<"input">, "children" | "type">
    >)
  | ({ textarea: true } & UnstyledProps<
      Omit<React.ComponentPropsWithRef<"textarea">, "children">
    >)
);

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
}: FieldProps) {
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
    <div className={cx("w-full flex-col gap-1.5", hidden ? "hidden" : "flex")}>
      <label
        htmlFor={fieldId}
        hidden={!showLabel}
        className="text-meta font-medium text-foreground"
      >
        {required ? (
          <span className="mr-1 font-bold text-required" aria-hidden="true">
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
          autoComplete={inferredAutoComplete}
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
          autoComplete={inferredAutoComplete}
          spellCheck={inferredSpellCheck}
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
    <div className="text-destructive-text" role="alert" aria-live="polite">
      {children}
    </div>
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
