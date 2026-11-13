import React from "react";
import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { CatalogRange } from "./catalogRange";
import { catalogRangeFields, describeRange, type CatalogRangeKey } from "lib/catalogRanges";
import { selectedValues } from "lib/catalogTraits";
import { CatalogFacet } from "./catalogFacet";
import { cx } from "components/ui";
import {
  CATALOG_FILTER_LABELS,
  CATALOG_SORT_OPTIONS,
  getActiveFilterKeys,
  type CatalogFilterKey,
  type CatalogFilterOptions,
  type CatalogFilters,
  type CatalogSort,
} from "lib/catalogSearch";

export type FilterValue = string | boolean;

type FieldDefinition = {
  key: CatalogFilterKey;
  id: string;
  label: string;
  placeholder?: string;
} & (
  | { kind: "range"; key: CatalogRangeKey }
  | { kind: "text" }
  | { kind: "toggle"; key: "rebloom" }
  | { kind: "facet"; options: (options: CatalogFilterOptions) => string[] }
);

type SectionDefinition = {
  id: string;
  title: string;
  fields: FieldDefinition[];
};

const ADVANCED_SECTIONS: SectionDefinition[] = [
  {
    id: "listing",
    title: "Listing",
    fields: [
      {
        key: "name",
        id: "listing-name",
        label: "Name",
        kind: "text",
        placeholder: "Search plant names",
      },
      {
        key: "note",
        id: "note",
        label: "Description",
        kind: "text",
        placeholder: "Search public descriptions",
      },
      {
        key: "price",
        id: "price",
        label: "Price",
        kind: "range",
      },
    ],
  },
  {
    id: "registration",
    title: "Registration",
    fields: [
      {
        key: "hybridizer",
        id: "hybridizer",
        label: "Hybridizer",
        kind: "facet",
        options: (o) => o.hybridizers,
      },
      {
        key: "year",
        id: "year",
        label: "Year",
        kind: "range",
      },
    ],
  },
  {
    id: "bloom",
    title: "Bloom Traits",
    fields: [
      {
        key: "bloomHabit",
        id: "bloomHabit",
        label: "Bloom habit",
        kind: "facet",
        options: (o) => o.bloomHabits,
      },
      {
        key: "bloomSeason",
        id: "bloomSeason",
        label: "Bloom season",
        kind: "facet",
        options: (o) => o.bloomSeasons,
      },
      {
        key: "rebloom",
        id: "rebloom",
        label: CATALOG_FILTER_LABELS.rebloom,
        kind: "toggle",
      },
      {
        key: "scapeHeight",
        id: "scapeHeight",
        label: "Scape height",
        kind: "range",
      },
      {
        key: "bloomSize",
        id: "bloomSize",
        label: "Bloom size",
        kind: "range",
      },
      {
        key: "budcount",
        id: "budcount",
        label: "Bud count",
        kind: "range",
      },
      {
        key: "branches",
        id: "branches",
        label: "Branches",
        kind: "range",
      },
    ],
  },
  {
    id: "plant",
    title: "Classification & Details",
    fields: [
      {
        key: "form",
        id: "form",
        label: "Form",
        kind: "facet",
        options: (o) => o.forms,
      },
      {
        key: "ploidy",
        id: "ploidy",
        label: "Ploidy",
        kind: "facet",
        options: (o) => o.ploidies,
      },
      {
        key: "foliageType",
        id: "foliageType",
        label: "Foliage type",
        kind: "facet",
        options: (o) => o.foliageTypes,
      },
      {
        key: "fragrance",
        id: "fragrance",
        label: "Fragrance",
        kind: "facet",
        options: (o) => o.fragrances,
      },
      {
        key: "color",
        id: "color",
        label: "Color",
        kind: "text",
        placeholder: "Search color descriptions",
      },
      {
        key: "parentage",
        id: "parentage",
        label: "Parentage",
        kind: "text",
        placeholder: "Search parentage",
      },
    ],
  },
];

const countActive = (section: SectionDefinition, filters: CatalogFilters) =>
  section.fields.filter((field) => Boolean(filters[field.key])).length;

const fieldClassName =
  "flex min-w-0 flex-col gap-1.5 [&>label]:text-meta [&>label]:text-muted-foreground [&>input]:min-h-control-compact [&>input]:text-base sm:[&>input]:text-meta";

function FilterField({
  field,
  filters,
  filterOptions,
  onChange,
}: {
  field: FieldDefinition;
  filters: CatalogFilters;
  filterOptions: CatalogFilterOptions;
  onChange: (key: CatalogFilterKey, value: FilterValue) => void;
}) {
  if (field.kind === "toggle") {
    return <QuickToggle id={field.id} label={field.label} checked={filters[field.key]} onChange={(checked) => onChange(field.key, checked)} />;
  }
  const value = String(filters[field.key] || "");
  if (field.kind === "range") {
    return <CatalogRange field={field.key} value={value} bounds={filterOptions.ranges[field.key]} onChange={(next) => onChange(field.key, next)} />;
  }
  if (field.kind === "facet") {
    return <CatalogFacet id={field.id} label={field.label} options={field.options(filterOptions)} value={value} onChange={(next) => onChange(field.key, next)} />;
  }
  return (
    <div className={fieldClassName}>
      <label htmlFor={field.id}>{field.label}</label>
        <input
          id={field.id}
          name={field.id}
          autoComplete="off"
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
    </div>
  );
}

function QuickToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-control-compact cursor-pointer select-none items-center gap-2 rounded-md bg-secondary px-3 text-meta font-medium text-secondary-foreground transition-colors hover:bg-secondary-hover has-checked:bg-primary has-checked:text-primary-foreground"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary-foreground"
      />
      {label}
    </label>
  );
}

function ModeSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex cursor-pointer items-center gap-2 rounded-md bg-transparent px-1 py-1 text-meta text-muted-foreground hover:text-foreground-emphasis"
    >
      Advanced
      <span
        aria-hidden="true"
        className={cx(
          "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-primary" : "bg-border-strong"
        )}
      >
        <span
          className={cx(
            "size-4 rounded-full bg-foreground-emphasis transition-transform",
            checked && "translate-x-4 bg-primary-foreground"
          )}
        />
      </span>
    </button>
  );
}

function AdvancedSection({
  section,
  open,
  onToggle,
  activeCount,
  children,
}: {
  section: SectionDefinition;
  open: boolean;
  onToggle: () => void;
  activeCount: number;
  children: React.ReactNode;
}) {
  const panelId = `filter-section-${section.id}`;
  const countId = `${panelId}-count`;
  return (
    <div className="border-t border-card-border">
      <h3 className="m-0 text-base">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-describedby={activeCount > 0 ? countId : undefined}
          onClick={onToggle}
          className="flex min-h-control w-full cursor-pointer items-center justify-between gap-3 bg-transparent py-2 text-left text-meta font-semibold text-foreground-emphasis"
        >
          <span className="flex items-center gap-2">
            {section.title}
            {activeCount > 0 && (
              <span
                aria-hidden="true"
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-fine font-bold tabular-nums text-primary-foreground"
              >
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cx(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </h3>
      {activeCount > 0 && (
        <span id={countId} hidden>
          {activeCount === 1 ? "1 active filter" : `${activeCount} active filters`}
        </span>
      )}
      <div
        id={panelId}
        hidden={!open}
        className="grid gap-4 pb-5 pt-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1"
      >
        {children}
      </div>
    </div>
  );
}

/** Shared name search for basic and advanced mode. */
export function NameSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <label htmlFor="search" className="sr-only">
        Search by name
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
      />
      <input
        id="search"
        name="search"
        type="search"
        autoComplete="off"
        placeholder="Search by name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-control-compact pl-9 text-base sm:text-meta"
      />
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: CatalogSort;
  onChange: (value: CatalogSort) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:flex-none">
      <label htmlFor="sort" className="sr-only">
        Sort by
      </label>
      <ArrowUpDown
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
      />
      <select
        id="sort"
        name="sort"
        value={value}
        onChange={(event) => onChange(event.target.value as CatalogSort)}
        className="min-h-control-compact w-full min-w-0 pl-9 text-base sm:w-auto sm:text-meta"
      >
        {CATALOG_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value ? option.label : "Sort by name"}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CatalogFilterPanel({
  filters,
  filterOptions,
  isSearch,
  advanced,
  onAdvancedChange,
  onChange,
}: {
  filters: CatalogFilters;
  filterOptions: CatalogFilterOptions;
  isSearch: boolean;
  advanced: boolean;
  onAdvancedChange: (advanced: boolean) => void;
  onChange: (key: CatalogFilterKey, value: FilterValue) => void;
}) {
  const sections = ADVANCED_SECTIONS;
  const [openSections, setOpenSections] = React.useState<Set<string>>(() => {
    const active = sections
      .filter((section) => countActive(section, filters) > 0)
      .map((section) => section.id);
    return new Set(active.length > 0 ? active : [sections[0]?.id]);
  });

  // Keep sections that gain an active filter (e.g. from a shared URL) open.
  const activeSectionKey = sections
    .filter((section) => countActive(section, filters) > 0)
    .map((section) => section.id)
    .join(",");
  React.useEffect(() => {
    if (!activeSectionKey) return;
    setOpenSections((current) => {
      const next = new Set(current);
      activeSectionKey.split(",").forEach((id) => next.add(id));
      return next.size === current.size ? current : next;
    });
  }, [activeSectionKey]);

  const toggleSection = (id: string) =>
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section
      data-ui="filter-panel"
      aria-label="Filters"
      className="flex flex-col gap-4 rounded-lg border-stroke border-card-border bg-card p-5 xl:sticky xl:top-28 xl:col-span-3 xl:max-h-panel xl:self-start xl:overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-meta font-semibold text-foreground-emphasis">Search</span>
        <ModeSwitch checked={advanced} onChange={onAdvancedChange} />
      </div>
      <NameSearchField value={filters.name} onChange={(value) => onChange("name", value)} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick filters">
          {isSearch && <CatalogFacet id="list" label="Lists" options={filterOptions.lists} value={filters.list} onChange={(value) => onChange("list", value)} />}
          {filterOptions.canFilterForSale && (
            <QuickToggle
              id="forSale"
              label={CATALOG_FILTER_LABELS.forSale}
              checked={filters.forSale}
              onChange={(checked) => onChange("forSale", checked)}
            />
          )}
          {filterOptions.canFilterPhoto && (
            <QuickToggle
              id="photo"
              label={CATALOG_FILTER_LABELS.photo}
              checked={filters.photo}
              onChange={(checked) => onChange("photo", checked)}
            />
          )}
        </div>
      </div>

      {advanced && (
        <div className="-mb-1 flex flex-col">
          {sections.map((section) => (
            <AdvancedSection
              key={section.id}
              section={section}
              open={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              activeCount={countActive(section, filters)}
            >
              {section.fields.map((field) => (
                <FilterField
                  key={field.key}
                  field={field}
                  filters={filters}
                  filterOptions={filterOptions}
                  onChange={onChange}
                />
              ))}
            </AdvancedSection>
          ))}
        </div>
      )}
    </section>
  );
}

const describeFilter = (
  key: CatalogFilterKey,
  value: CatalogFilters[CatalogFilterKey]
) => {
  const label = CATALOG_FILTER_LABELS[key];
  if (typeof value === "boolean") return label;
  if (key in catalogRangeFields) return `${label}: ${describeRange(key as CatalogRangeKey, value)}`;
  if (value.includes("|")) return `${label}: ${selectedValues(value).join(", ")}`;
  return `${label}: ${value}`;
};

export function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: CatalogFilters;
  onRemove: (key: CatalogFilterKey) => void;
  onClearAll: () => void;
}) {
  const activeKeys = getActiveFilterKeys(filters);
  if (activeKeys.length === 0) return null;

  return (
    <ul
      aria-label="Active filters"
      className="m-0 flex list-none flex-wrap items-center gap-2 p-0"
    >
      {activeKeys.map((key) => {
        const text = describeFilter(key, filters[key]);
        return (
          <li key={key} className="min-w-0 max-w-full">
            <button
              type="button"
              onClick={() => onRemove(key)}
              aria-label={`Remove filter ${text}`}
              className="flex min-h-control-compact max-w-full cursor-pointer items-center gap-1.5 rounded-md bg-secondary py-1 pl-3 pr-2 text-meta text-secondary-foreground transition-colors hover:bg-secondary-hover"
            >
              <span className="truncate">{text}</span>
              <X aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-control-compact cursor-pointer rounded-md bg-transparent px-2 text-meta font-medium text-muted-foreground underline-offset-4 hover:text-foreground-emphasis hover:underline"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
