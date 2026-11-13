import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { selectedValues } from "lib/catalogTraits";

export function CatalogFacet({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => setContainer(document.getElementById("app-root")), []);
  const [search, setSearch] = React.useState("");
  const selected = selectedValues(value);
  const choices = Array.from(new Set([...options, ...selected]));
  const searchable = choices.length >= 10;
  const visible = choices.filter((option) =>
    !searchable ||
    option.toLowerCase().includes(search.trim().toLowerCase())
  );
  return (
    <Popover.Root onOpenChange={() => setSearch("")}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          aria-label={label}
          className="flex min-h-control-compact max-w-full items-center gap-2 rounded-md border-stroke border-border-strong bg-secondary px-3 py-2 text-meta font-medium text-secondary-foreground hover:bg-secondary-hover"
        >
          <span className="truncate">{label}</span>
          {selected.length > 0 && <span className="font-bold tabular-nums">{selected.length}</span>}
          <ChevronDown aria-hidden="true" className="ml-auto size-4 shrink-0" />
        </button>
      </Popover.Trigger>
      <Popover.Portal container={container}>
        <Popover.Content
          aria-label={label}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 flex w-64 flex-col gap-3 rounded-lg border-stroke border-border-strong bg-popover p-3 text-popover-foreground shadow-toast"
        >
          {searchable && <input
            type="search"
            aria-label={`Search ${label.toLowerCase()} options`}
            placeholder={`Search ${label.toLowerCase()}…`}
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-control-compact w-full text-base"
          />}
          <fieldset className="m-0 flex max-h-64 min-w-0 flex-col overflow-y-auto border-0 p-0">
            <legend className="sr-only">{label}</legend>
            {visible.map((option) => (
              <label key={option} className="flex min-h-control-compact cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-meta hover:bg-secondary-hover">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={(event) => onChange(
                    (event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option)).join("|")
                  )}
                  className="size-4 shrink-0 accent-primary"
                />
                <span>{option}</span>
              </label>
            ))}
            {visible.length === 0 && <p className="m-0 p-2 text-meta text-muted-foreground">No matching options</p>}
          </fieldset>
          {selected.length > 0 && (
            <button type="button" onClick={() => onChange("")} className="min-h-control-compact rounded-md bg-secondary px-3 text-meta text-secondary-foreground hover:bg-secondary-hover">
              Clear {label.toLowerCase()}
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
