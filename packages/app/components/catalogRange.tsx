import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { catalogRangeFields, parseRange, type CatalogRangeKey, type RangeBounds } from "lib/catalogRanges";

export function CatalogRange({ field, value, bounds, onChange }: {
  field: CatalogRangeKey;
  value: string;
  bounds: RangeBounds;
  onChange: (value: string) => void;
}) {
  const { label, unit, integerOnly } = catalogRangeFields[field];
  const initial = parseRange(value);
  const [draft, setDraft] = React.useState<[string, string]>([
    String(initial?.[0] ?? bounds.min), String(initial?.[1] ?? bounds.max),
  ]);
  React.useEffect(() => {
    const range = parseRange(value);
    setDraft([String(range?.[0] ?? bounds.min), String(range?.[1] ?? bounds.max)]);
  }, [value, bounds.min, bounds.max]);
  const serialize = (numbers: [number, number]) => {
    const min = numbers[0] === bounds.min ? "" : String(numbers[0]);
    const max = numbers[1] === bounds.max ? "" : String(numbers[1]);
    return min || max ? `${min}:${max}` : "";
  };
  const numbers: [number, number] = [Number(draft[0] || bounds.min), Number(draft[1] || bounds.max)];
  const selection = serialize(numbers);
  const invalid = !parseRange(numbers.join(":")) || (integerOnly && numbers.some((number) => !Number.isInteger(number)));
  const errorId = `${field}-error`;
  const commit = () => {
    if (invalid) return;
    setDraft([String(numbers[0]), String(numbers[1])]);
    if (selection !== value) onChange(selection);
  };
  const sliderMin = invalid ? bounds.min : Math.min(bounds.min, numbers[0]);
  const sliderMax = invalid ? Math.max(bounds.max, bounds.min + 1) : Math.max(sliderMin + 1, bounds.max, numbers[1]);
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="mb-2 text-meta text-muted-foreground">{label}{unit && ` (${unit})`}</legend>
      <Slider.Root
        min={sliderMin}
        max={sliderMax}
        step={1}
        value={invalid ? [bounds.min, bounds.max] : numbers}
        onValueChange={(numbers) => setDraft([String(numbers[0]), String(numbers[1])])}
        onValueCommit={(numbers) => onChange(serialize([numbers[0], numbers[1]]))}
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
              step={1}
              aria-label={`${label} ${bound.toLowerCase()}`}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              value={draft[index]}
              onChange={(event) => setDraft((current) => index === 0 ? [event.target.value, current[1]] : [current[0], event.target.value])}
              onBlur={commit}
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } }}
              className="min-h-control-compact w-full min-w-0 text-base"
            />
          </label>
        ))}
      </div>
      {invalid && <p id={errorId} role="alert" className="m-0 text-meta text-destructive">Use nonnegative {integerOnly ? "whole numbers" : "numbers"}, with minimum no greater than maximum.</p>}
      {(value || selection) && <button type="button" onClick={() => { setDraft([String(bounds.min), String(bounds.max)]); onChange(""); }} className="min-h-control-compact self-start bg-transparent text-meta text-muted-foreground underline underline-offset-4">Clear {label.toLowerCase()}</button>}
    </fieldset>
  );
}
