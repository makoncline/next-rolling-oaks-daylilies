import React from "react";
import { useRouter } from "next/router";
import { Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

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
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const { events } = useRouter();

  React.useEffect(() => setContainer(document.getElementById("app-root")), []);

  React.useEffect(() => {
    const close = () => setIsOpen(false);
    events.on("routeChangeComplete", close);
    return () => events.off("routeChangeComplete", close);
  }, [events]);

  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const linkClass =
    "[&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:rounded-md [&>a]:px-3 [&>a]:py-2 [&>a]:font-medium [&>a]:text-muted-foreground [&>a]:transition-colors [&>a:hover]:bg-secondary [&>a:hover]:text-foreground-emphasis [&>a[aria-current=page]]:text-foreground-emphasis";
  const links = React.Children.map(children, (child, index) => (
    <li key={index} className={linkClass}>{child}</li>
  ));

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <nav className="w-full" aria-label="Main">
        <div className="flex min-h-header w-full items-center justify-between gap-4">
          <div className="mr-auto min-w-0">{logo}</div>
          <ul className="m-0 hidden list-none flex-row items-center gap-1 p-0 md:flex">
            {links}
          </ul>
          <div className="flex shrink-0 items-center md:hidden">{mobileActions}</div>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-md bg-transparent text-2xl text-foreground-emphasis hover:bg-secondary md:hidden"
              aria-label="Toggle navigation"
            >
              <Menu aria-hidden="true" className="shrink-0 size-6" strokeWidth={1.75} />
            </button>
          </Dialog.Trigger>
        </div>
      </nav>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-background md:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-background px-4 pb-safe-bottom pt-safe-top text-foreground sm:px-8 md:hidden"
          onOpenAutoFocus={(event) => { event.preventDefault(); closeRef.current?.focus(); }}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) setIsOpen(false);
          }}
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex min-h-header shrink-0 items-center justify-between gap-4 border-b border-border">
            <div className="mr-auto min-w-0">{logo}</div>
            <div className="flex shrink-0 items-center">{mobileActions}</div>
            <Dialog.Close asChild>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation"
                className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-transparent text-foreground-emphasis hover:bg-secondary"
              >
                <X aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </button>
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ul className="-mx-3 m-0 flex list-none flex-col gap-1 p-0 pt-3 text-lg [&>li>a]:py-3">
              {links}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
