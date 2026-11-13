import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "components/ui";

const Paginate: React.FC<{
  page: number;
  pages: number;
  onPageChange?: () => void;
  label?: string;
  /** The page-number jump; the top of a list only needs Previous and Next. */
  showPageJump?: boolean;
}> = ({
  page,
  pages,
  onPageChange,
  label = "Catalog Pagination",
  showPageJump = true,
}) => {
  const router = useRouter();

  const getPageHref = (newPage: number) => {
    const newQuery = { ...router.query };
    delete newQuery.catalog;

    if (newPage === 0) {
      delete newQuery.page;
    } else {
      newQuery.page = String(newPage + 1);
    }

    const params = new URLSearchParams();
    Object.entries(newQuery).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const pathname = router.asPath.split("?")[0];
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const handlePageChange = (newPage: number) => {
    const clampedPage = Math.min(Math.max(newPage, 0), pages);
    if (onPageChange) {
      onPageChange();
    }
    const newQuery = { ...router.query };
    delete newQuery.catalog;
    if (clampedPage === 0) {
      delete newQuery.page;
    } else {
      newQuery.page = String(clampedPage + 1);
    }
    // Pages are navigation: push, so Back returns to the previous page.
    router.push(
      {
        pathname: router.asPath.split("?")[0],
        query: newQuery,
      },
      undefined,
      {
        shallow: true,
      }
    );
  };

  const handlePageSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const requestedPage = Number(formData.get("page"));
    if (Number.isFinite(requestedPage)) {
      handlePageChange(requestedPage - 1);
    }
  };

  const previousPage = page > 0 ? page - 1 : 0;
  const nextPage = page + 1 <= pages ? page + 1 : pages;

  return (
    <nav aria-label={label}>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <Button
          as="a"
          size="compact"
          href={getPageHref(previousPage)}
          rel={page > 0 ? "prev" : undefined}
          aria-disabled={page === 0}
          tabIndex={page === 0 ? -1 : undefined}
          aria-label={`${label} Previous Page`}
          onClick={(event) => {
            event.preventDefault();
            if (page > 0) handlePageChange(previousPage);
          }}
        >
          <ChevronLeft aria-hidden="true" className="shrink-0 size-4" />
        </Button>
        {showPageJump ? (
          <form
            className="flex min-w-0 items-center justify-center gap-2 text-meta tabular-nums"
            onSubmit={handlePageSubmit}
          >
            <span className="shrink-0 text-muted-foreground">Page</span>
            <input
              key={page}
              aria-label={`${label} Page Number`}
              className="min-h-control-compact w-14 px-2 py-1 text-center text-base tabular-nums sm:text-meta"
              defaultValue={page + 1}
              inputMode="numeric"
              max={pages + 1}
              min={1}
              name="page"
              type="number"
            />
            <span className="shrink-0 text-muted-foreground">of {pages + 1}</span>
            <Button type="submit" size="compact">
              Go
            </Button>
          </form>
        ) : (
          <p className="m-0 shrink-0 text-meta tabular-nums text-muted-foreground">
            Page {page + 1} of {pages + 1}
          </p>
        )}
        <Button
          as="a"
          size="compact"
          href={getPageHref(nextPage)}
          rel={page < pages ? "next" : undefined}
          aria-disabled={page === pages}
          tabIndex={page === pages ? -1 : undefined}
          aria-label={`${label} Next Page`}
          onClick={(event) => {
            event.preventDefault();
            if (page < pages) handlePageChange(nextPage);
          }}
        >
          <ChevronRight aria-hidden="true" className="shrink-0 size-4" />
        </Button>
      </div>
    </nav>
  );
};

export default Paginate;
