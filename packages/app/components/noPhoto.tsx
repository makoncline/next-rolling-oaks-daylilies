import React from "react";
import { Flower2 } from "lucide-react";
import { cx } from "./ui";

/**
 * Shown in place of a photo when a listing has none, instead of a blurred
 * stand-in image. The thumb size is decorative, for rows that already name the plant.
 */
export function NoPhoto({
  title,
  size = "tile",
}: {
  title: string;
  size?: "thumb" | "tile" | "large";
}) {
  if (size === "thumb") {
    return (
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-tile text-subtle-foreground">
        <Flower2 strokeWidth={1.25} className="size-6 shrink-0" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`No photo of ${title} yet`}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-tile text-subtle-foreground"
    >
      <Flower2
        aria-hidden="true"
        strokeWidth={1.25}
        className={cx("shrink-0", size === "large" ? "size-16" : "size-10")}
      />
      <span className={size === "large" ? "text-meta" : "text-fine"}>
        No photo yet
      </span>
    </div>
  );
}
