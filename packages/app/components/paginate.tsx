import React from "react";
import { Icon } from "@iconify/react";
import styled from "styled-components";
import arrowLeft from "@iconify/icons-si-glyph/arrow-left";
import arrowRight from "@iconify/icons-si-glyph/arrow-right";
import Select from "./select";
import { useRouter } from "next/router";

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
    <StyledPaginate>
      <div className="pagination">
        <button
          className="back"
          aria-label="page back"
          onClick={() => handlePageChange(page > 0 ? page - 1 : 0)}
        >
          <Icon icon={arrowLeft} />
        </button>
        <div className="text">
          <p>Page</p>
          <div className="select">
            <Select
              aria-label="page select"
              name="pages"
              className="page-select"
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
            </Select>
          </div>
          <p>of {pages + 1}</p>
        </div>
        <button
          className="forward"
          aria-label="page forward"
          onClick={() => handlePageChange(page + 1 <= pages ? page + 1 : pages)}
        >
          <Icon icon={arrowRight} />
        </button>
      </div>
    </StyledPaginate>
  );
};

export default Paginate;

const StyledPaginate = styled.div`
  display: block;
  .select {
    margin: 0 0.5rem;
  }
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--text-high);
    background: none;
    border: none;
    font-size: 1rem;
    height: 2rem;
    width: 3rem;
    margin: 0 1rem;
    border-radius: 3rem;
    background-color: var(--bg-2);
    &:hover {
      background-color: var(--bg-shine);
      box-shadow: 0 0 0 1px rgb(var(--rgb-purple));
      cursor: pointer;
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
    }
  }
  .pagination {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .text {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    @media (max-width: 500px) {
      display: grid;
      grid-template-columns: auto auto;
      grid-template-rows: auto auto;
      justify-content: space-between;
      .back {
        grid-area: 1/1/2/2;
        margin: 0;
        justify-self: flex-start;
      }
      .forward {
        grid-area: 1/2/2/3;
        margin: 0;
        justify-self: flex-end;
      }
      .text {
        grid-area: 2/1/3/3;
      }
    }
  }
`;
