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
}> = ({ page, pages, paginate, setPaginate, onPageChange }) => {
  const router = useRouter();
  const pageArray = [];
  for (let i = 0; i <= pages; i++) {
    pageArray.push(i);
  }
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange();
    }
    const { catalog, ...rest } = router.query;
    const newQuery = { ...rest, page: newPage + 1 };
    if (newPage === 0) {
      delete (newQuery as { page?: number }).page;
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
  return (
    <Space block center className="justify-between">
      <Button
        className="shrink-0"
        aria-label="previous page"
        onClick={() => handlePageChange(page > 0 ? page - 1 : 0)}
      >
        ⬅
      </Button>
      <Space center gap="xsmall" className="min-w-0 flex-1 sm:flex-none">
        <span className="shrink-0">Page</span>
        <select
          aria-label="page select"
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
        className="shrink-0"
        aria-label="next forward"
        onClick={() => handlePageChange(page + 1 <= pages ? page + 1 : pages)}
      >
        ➡
      </Button>
    </Space>
  );
};

export default Paginate;
