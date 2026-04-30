import React from "react";
import { useRouter } from "next/router";
import { Button, Space } from "components/ui";

const Paginate: React.FC<{
  page: number;
  pages: number;
  paginate: {
    limit: number;
    page: number;
  };
  setPaginate: ({ limit, page }: { limit: number; page: number }) => void;

  onPageChange?: () => void;
  label?: string;
}> = ({
  page,
  pages,
  paginate,
  setPaginate,
  onPageChange,
  label = "Catalog Pagination",
}) => {
  const router = useRouter();
  const pageArray = [];
  for (let i = 0; i <= pages; i++) {
    pageArray.push(i);
  }

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
    if (onPageChange) {
      onPageChange();
    }
    const newQuery = { ...router.query };
    delete newQuery.catalog;
    if (newPage === 0) {
      delete newQuery.page;
    } else {
      newQuery.page = String(newPage + 1);
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
    setPaginate({
      ...paginate,
      page: newPage,
    });
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
        <Space center gap="xsmall" className="min-w-0 flex-1 sm:flex-none">
          <span className="shrink-0">Page</span>
          <select
            aria-label={`${label} Page Select`}
            className="w-24 min-w-0 sm:w-28"
            onChange={(e) => handlePageChange(parseInt(e.target.value))}
            value={page}
          >
            {pageArray &&
              pageArray.length &&
              pageArray.map((i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
          </select>
          <span className="shrink-0">of {pages + 1}</span>
        </Space>
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
