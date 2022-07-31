import React from "react";
import { Icon } from "@iconify/react";
import styled from "styled-components";
import arrowLeft from "@iconify/icons-si-glyph/arrow-left";
import arrowRight from "@iconify/icons-si-glyph/arrow-right";
import Select from "./select";
import { useRouter } from "next/router";
import { Button, IconButton, Space } from "@packages/design-system";

const Paginate: React.FC<{
  page: number;
  pages: number;
  paginate: {
    limit: number;
    page: number;
  };
  setPaginate: React.Dispatch<
    React.SetStateAction<{
      limit: number;
      page: number;
    }>
  >;
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
        <p>Page</p>
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
        <p>of {pages + 1}</p>
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
