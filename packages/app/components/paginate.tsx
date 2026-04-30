import React from "react";
import { useRouter } from "next/router";
import { Button, Space } from "components/ui";

const Paginate: React.FC<{
  page: number;
  pages: number;
  onPageChange?: () => void;
  label?: string;
}> = ({
  page,
  pages,
  onPageChange,
  label = "Catalog Pagination",
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
    router.replace(
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
      <Space block center className="justify-between">
        <Button
          as="a"
          href={getPageHref(previousPage)}
          rel={page > 0 ? "prev" : undefined}
          className="shrink-0"
          aria-label={`${label} Previous Page`}
          onClick={(event) => {
            event.preventDefault();
            handlePageChange(previousPage);
          }}
        >
          ⬅
        </Button>
        <form
          className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:flex-none"
          onSubmit={handlePageSubmit}
        >
          <span className="shrink-0">Page</span>
          <input
            key={page}
            aria-label={`${label} Page Number`}
            className="w-20 min-w-0"
            defaultValue={page + 1}
            inputMode="numeric"
            max={pages + 1}
            min={1}
            name="page"
            type="number"
          />
          <span className="shrink-0">of {pages + 1}</span>
          <Button type="submit" className="shrink-0">
            Go
          </Button>
        </form>
        <Button
          as="a"
          href={getPageHref(nextPage)}
          rel={page < pages ? "next" : undefined}
          className="shrink-0"
          aria-label={`${label} Next Page`}
          onClick={(event) => {
            event.preventDefault();
            handlePageChange(nextPage);
          }}
        >
          ➡
        </Button>
      </Space>
    </nav>
  );
};

export default Paginate;
