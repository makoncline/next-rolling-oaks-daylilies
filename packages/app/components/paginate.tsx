import React from "react";
import { useRouter } from "next/router";
import { Button, Space } from "@packages/design-system";

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
    router.replace(
      {
        pathname: router.asPath.split("?")[0],
        query: { page: newPage + 1 },
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
    <Space block>
      <Button
        aria-label="previous page"
        onClick={() => handlePageChange(page > 0 ? page - 1 : 0)}
      >
        ⬅
      </Button>
      <Space block center gap="xsmall">
        <span>Page</span>
        <select
          aria-label="page select"
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
        <span>of {pages + 1}</span>
      </Space>
      <Button
        aria-label="next forward"
        onClick={() => handlePageChange(page + 1 <= pages ? page + 1 : pages)}
      >
        ➡
      </Button>
    </Space>
  );
};

export default Paginate;
