import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 text-meta text-subtle-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 && (
              <ChevronRight aria-hidden="true" className="shrink-0 size-3.5" />
            )}
            {item.href ? (
              <Link href={item.href} className="text-muted-foreground hover:text-foreground-emphasis hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-muted-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
