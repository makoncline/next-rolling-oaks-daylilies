import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { catalogRangeFields, parseRange, type CatalogRangeKey, type RangeBounds } from "lib/catalogRanges";

export function CatalogRange({ field, value, bounds, onChange }: {
  field: CatalogRangeKey;
  value: string;
  bounds: RangeBounds;
  onChange: (value: string) => void;
}) {
  const { label, unit, step } = catalogRangeFields[field];
  const initial = parseRange(value);
  const [draft, setDraft] = React.useState<[string, string]>([initial?.[0]?.toString() ?? "", initial?.[1]?.toString() ?? ""]);
  React.useEffect(() => {
    const range = parseRange(value);
    setDraft([range?.[0]?.toString() ?? "", range?.[1]?.toString() ?? ""]);
  }, [value]);
  const selection = draft.some(Boolean) ? draft.join(":") : "";
  const invalid = Boolean(selection && (!parseRange(selection) || (step === 1 && draft.some((part) => part && !Number.isInteger(Number(part))))));
  const errorId = `${field}-error`;
  const commit = () => { if (!invalid && selection !== value) onChange(selection); };
  const sliderMin = invalid ? bounds.min : Math.min(bounds.min, Number(draft[0] || bounds.min));
  const sliderMax = invalid ? Math.max(bounds.max, bounds.min + step) : Math.max(sliderMin + step, bounds.max, Number(draft[1] || bounds.max));
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="mb-2 text-meta text-muted-foreground">{label}{unit && ` (${unit})`}</legend>
      <Slider.Root
        min={sliderMin}
        max={sliderMax}
        step={step}
        value={invalid ? [bounds.min, bounds.max] : [Number(draft[0] || bounds.min), Number(draft[1] || bounds.max)]}
        onValueChange={(numbers) => setDraft([String(numbers[0]), String(numbers[1])])}
        onValueCommit={(numbers) => onChange(numbers.join(":"))}
        className="relative flex h-8 w-full touch-none select-none items-center"
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-border-strong">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb aria-label={`${label} minimum`} className="block size-5 rounded-full border-stroke border-primary bg-primary shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
        <Slider.Thumb aria-label={`${label} maximum`} className="block size-5 rounded-full border-stroke border-primary bg-primary shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
      </Slider.Root>
      <div className="grid grid-cols-2 gap-3">
        {(["Minimum", "Maximum"] as const).map((bound, index) => (
          <label key={bound} className="flex min-w-0 flex-col gap-1 text-meta text-muted-foreground">
            {bound}
            <input
              type="number"
              min={0}
              step={step}
              aria-label={`${label} ${bound.toLowerCase()}`}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              placeholder="Any"
              value={draft[index]}
              onChange={(event) => setDraft((current) => index === 0 ? [event.target.value, current[1]] : [current[0], event.target.value])}
              onBlur={commit}
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } }}
              className="min-h-control-compact w-full min-w-0 text-base"
            />
          </label>
        ))}
      </div>
      {invalid && <p id={errorId} role="alert" className="m-0 text-meta text-destructive">Use nonnegative {step === 1 ? "whole numbers" : "numbers"}, with minimum no greater than maximum.</p>}
      {(value || draft.some(Boolean)) && <button type="button" onClick={() => { setDraft(["", ""]); onChange(""); }} className="min-h-control-compact self-start bg-transparent text-meta text-muted-foreground underline underline-offset-4">Clear {label.toLowerCase()}</button>}
    </fieldset>
  );
}
