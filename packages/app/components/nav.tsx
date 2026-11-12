import React from "react";
import { useRouter } from "next/router";
import { Menu, X } from "lucide-react";

export function Nav({
  logo,
  mobileActions,
  children,
}: {
  logo: React.ReactNode;
  mobileActions: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const navMenuId = React.useId();
  const { events } = useRouter();
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const close = () => setIsOpen(false);
    events.on("routeChangeComplete", close);
    return () => events.off("routeChangeComplete", close);
  }, [events]);

  React.useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

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

  const linkClass =
    "[&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:rounded-md [&>a]:px-3 [&>a]:py-2 [&>a]:font-medium [&>a]:text-muted-foreground [&>a]:transition-colors [&>a:hover]:bg-secondary [&>a:hover]:text-foreground-emphasis [&>a[aria-current=page]]:text-foreground-emphasis";

  return (
    <nav className="w-full" aria-label="Main">
      <div className="flex min-h-header w-full items-center justify-between gap-4">
        <div className="mr-auto min-w-0">{logo}</div>
        <ul className="m-0 hidden list-none flex-row items-center gap-1 p-0 md:flex">
          {React.Children.map(children, (child, index) => (
            <li key={index} className={linkClass}>
              {child}
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center md:hidden">{mobileActions}</div>
        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-md bg-transparent text-2xl text-foreground-emphasis hover:bg-secondary md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-controls={navMenuId}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X aria-hidden="true" className="shrink-0 size-6" strokeWidth={1.75} />
          ) : (
            <Menu aria-hidden="true" className="shrink-0 size-6" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {isOpen && (
        <div
          id={navMenuId}
          className="h-screen overscroll-contain border-t border-border md:hidden"
        >
          <ul className="-mx-3 m-0 flex list-none flex-col gap-1 p-0 pt-3 text-lg [&>li>a]:py-3">
            {React.Children.map(children, (child, index) => (
              <li key={index} className={linkClass}>
                {child}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
