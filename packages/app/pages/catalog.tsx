import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Helmet from "react-helmet";
import Layout from "../components/layout";
import BackToTop from "../components/backToTop";
import Paginate from "../components/paginate";
import LilyCard from "../components/lilyCard";
import { LilyType, ListType } from "../types/types";
import logoImg from "../images/logo.png";

type CatalogPageContextProps = {
  slug: string;
  list: ListType;
  lilies: LilyType[];
  liliesCount: number;
};

type CatalogPageProps = {
  pageContext: CatalogPageContextProps;
  location: { search: string; href?: string };
};

const CatalogPage: React.FC<CatalogPageProps> = ({ pageContext, location }) => {
  const pageQueryParams = queryString.parse(location.search).page;
  const pageString =
    pageQueryParams && Array.isArray(pageQueryParams)
      ? pageQueryParams[0]
      : pageQueryParams;
  const pageNum = pageString && parseInt(pageString);
  const [paginate, setPaginate] = useState({
    limit: 24,
    page: pageNum ? pageNum - 1 : 0,
  });
  const query = queryString.parse(location.search).page;
  useEffect(() => {
    setPaginate({
      limit: 24,
      page: pageNum ? pageNum - 1 : 0,
    });
  }, [query, location.search]);

  const [lilies, setlilies] = useState<LilyType[] | null>(null);
  const { list } = pageContext;

  useEffect(() => {
    setlilies(pageContext.lilies.sort((a, b) => sortAlphaNum(a.name, b.name)));
  }, [pageContext.lilies]);

  const sortAlphaNum = (a: string | number, b: string | number) =>
    `${a}`.localeCompare(`${b}`, "en", { numeric: true }) < 0 ? -1 : 1;

  const displayLilies =
    lilies &&
    lilies.slice(
      paginate.page * paginate.limit,
      (paginate.page + 1) * paginate.limit
    );

  const pages = lilies?.length && Math.floor(lilies?.length / paginate.limit);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = `${list.name} - Rolling Oaks Daylilies`;
  const description = list.intro;
  return (
    <Layout>
      <Style>
        <Helmet>
          <title>{title}</title>
          <meta property="og:title" content={title} />

          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={`${baseUrl}/logo.png`} />
          <meta property="og:image:width" content="800" />
          <meta property="og:image:height" content="800" />
          <meta name="og:image:alt" content={`${title} image`} />
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image:alt" content={`${title} image`} />
        </Helmet>
        <div className="top">
          <h1>
            <hr />
            <span>{list.name}</span>
          </h1>
          {list.intro && <p className="intro">{list.intro}</p>}
        </div>
        <div className="lilies-container">
          <div className="lilies-container--top">
            {pages && pages > 0 ? (
              <h2>
                {list.name} - page {paginate.page + 1} of {pages + 1}
              </h2>
            ) : (
              <h2>{list.name}</h2>
            )}
            {lilies?.length && lilies.length > paginate.limit && (
              <Paginate
                page={paginate.page}
                pages={pages || 0}
                paginate={paginate}
                setPaginate={setPaginate}
              />
            )}
          </div>
          <div className="lilies" id="lilies">
            {displayLilies &&
              displayLilies.map((node: LilyType) => {
                if (!node) return;
                return <LilyCard key={node.id} lily={node} />;
              })}
          </div>
          {displayLilies && !displayLilies.length && (
            <p>No results found for this search...</p>
          )}
        </div>
        <div className="bottom">
          {lilies?.length && lilies.length > paginate.limit && (
            <Paginate
              page={paginate.page}
              pages={pages || 0}
              paginate={paginate}
              setPaginate={setPaginate}
            />
          )}
        </div>
        <BackToTop />
      </Style>
    </Layout>
  );
};
export default CatalogPage;

// Component Styles
const Style = styled.div`
  margin: 0 1rem;
  .lilies-container--top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    @media (max-width: 768px) {
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
    }
  }
  h2 {
    font-size: 1.17rem;
  }
  h1 {
    position: relative;
    top: 0;
    left: 0;
    text-align: center;
    z-index: 2;
    span {
      background-color: var(--bg-3);
      padding: 0 0.25em;
    }
  }
  h1 hr {
    background: linear-gradient(
      to right,
      rgb(var(--rgb-blue)),
      rgb(var(--rgb-purple))
    );
    height: 1px;
    width: 100%;
    border: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
  .intro {
    display: block;
    margin: auto;
    text-align: center;
    max-width: 35rem;
  }
  .top {
    margin-top: 2rem;
    padding: 1rem;
    background-color: var(--bg-3);
    border-radius: 1.5rem 1.5rem 0 0;
    z-index: -1;
  }
  .bottom {
    padding: 1rem;
    background-color: var(--bg-3);
    border-radius: 0 0 1.5rem 1.5rem;
  }
  .lilies-container {
    padding: 1rem;
    background-color: var(--bg-4);
  }
  .lilies {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, 250px);
    grid-gap: 1rem;
    justify-content: center;
  }
  .filter {
    display: block;
    margin: auto;
    width: 100%;
    max-width: 35rem;
  }
`;
