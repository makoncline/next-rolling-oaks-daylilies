import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../../components/layout";
import BackToTop from "../../components/backToTop";
import Paginate from "../../components/paginate";
import LilyCard from "../../components/lilyCard";
import type { GetServerSideProps, NextPage } from "next";
import { useSnackBar } from "../../components/snackBarProvider";
import { siteConfig } from "../../siteConfig";
import {
  Button,
  FancyHeading,
  FormWrapper,
  Heading,
  Space,
} from "components/ui";
import { useRouter } from "next/router";
import {
  getCatalogListings,
  getPublicSnapshot,
  type PublicListingCard,
} from "../../lib/publicSnapshot";
import {
  CATALOG_PAGE_LIMIT,
  defaultCatalogFilters,
  getCatalogFilterOptions,
  getCatalogFiltersFromQuery,
  getCatalogSearchResult,
  type CatalogFilterOptions,
  type CatalogFilters,
} from "../../lib/catalogSearch";

type Props = {
  title: string;
  description: string | null;
  initialListings: DisplayListing[];
  initialTotal: number;
  initialPage: number;
  filterOptions: CatalogFilterOptions;
  path: string;
};

const SearchPage: NextPage<Props> = ({
  title,
  description,
  initialListings,
  initialTotal,
  initialPage,
  filterOptions,
  path,
}) => {
  const router = useRouter();
  const { query, pathname, isReady } = router;
  const [filters, setFilters] = useState({
    ...defaultCatalogFilters,
    page: initialPage,
  });
  const [result, setResult] = useState({
    listings: initialListings,
    total: initialTotal,
    page: initialPage,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isReady) {
      setFilters(getCatalogFiltersFromQuery(query));
    }
    if (isReady) {
      setShowFilters(
        Object.keys(query).some((key) => key !== "catalog" && key !== "page")
      );
    }
  }, [query, pathname, isReady]);

  useEffect(() => {
    if (!isReady) return;

    const controller = new AbortController();
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (key === "catalog") return;
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value) {
        params.set(key, value);
      }
    });

    setIsLoading(true);
    fetch(`/api/catalog/${query.catalog}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Catalog search failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setResult({
          listings: data.listings,
          total: data.pagination.total,
          page: data.pagination.page - 1,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [isReady, query]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    filterKey: string
  ) => {
    const newValue = e.target.value;
    setFilters((prevFilters) => ({ ...prevFilters, [filterKey]: newValue }));
    const newQuery = { ...router.query, [filterKey]: newValue };
    if (!newValue) {
      delete newQuery[filterKey];
    }
    if (
      filterKey === "page" &&
      parseInt(newValue) - 1 === defaultCatalogFilters.page
    ) {
      delete newQuery[filterKey];
    } else {
      newQuery.page = "1";
    }
    router.replace(
      {
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const pageLimit = CATALOG_PAGE_LIMIT;
  const lastPage = Math.max(Math.ceil(result.total / pageLimit) - 1, 0);
  const currentPage = Math.min(Math.max(result.page, 0), lastPage);
  const displayLilies = result.listings;
  const pages = lastPage;

  const removeQueryParam = () => {
    const { asPath } = router;
    const pathname = asPath.split("?")[0];
    router.replace({ pathname, query: null }, undefined, {
      shallow: true,
    });
  };

  function clearFilters() {
    setFilters(defaultCatalogFilters);
    removeQueryParam();
  }

  const topRef = React.useRef<HTMLDivElement>(null);
  const handlePageChange = () => {
    if (topRef.current) {
      const topPosition =
        topRef.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: topPosition, behavior: "smooth" });
    }
  };
  const numResults = result.total;
  useSearchChange(numResults, filters);
  const isSearch = title === "Search";
  const canonicalPath =
    currentPage > 0 ? `${path}?page=${currentPage + 1}` : path;
  const previousPath =
    currentPage > 1
      ? `${path}?page=${currentPage}`
      : currentPage === 1
      ? path
      : null;
  const nextPath =
    currentPage < lastPage ? `${path}?page=${currentPage + 2}` : null;
  const seoTitle = getCatalogSeoTitle(title, currentPage);
  const seoDescription = getCatalogSeoDescription(
    title,
    description,
    currentPage
  );
  return (
    <Layout>
      <Head>
        <title key="title">{seoTitle}</title>
        <meta key="og:title" property="og:title" content={seoTitle} />
        <meta
          key="description"
          name="description"
          content={seoDescription.substring(0, 160)}
        />
        <meta
          key="og:description"
          property="og:description"
          content={seoDescription.substring(0, 160)}
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:image"
          property="og:image"
          content={`${siteConfig.baseUrl}/assets/logo.png`}
        />
        <meta key="og:image:width" property="og:image:width" content="800" />
        <meta key="og:image:height" property="og:image:height" content="800" />
        <meta
          key="og:image:alt"
          name="og:image:alt"
          content={`${title} image`}
        />
        <meta
          key="twitter:card"
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          key="twitter:image:alt"
          name="twitter:image:alt"
          content={`${title} image`}
        />
        <link
          key="canonical"
          rel="canonical"
          href={`${siteConfig.baseUrl}${canonicalPath}`}
        />
        {previousPath && (
          <link
            key="prev"
            rel="prev"
            href={`${siteConfig.baseUrl}${previousPath}`}
          />
        )}
        {nextPath && (
          <link
            key="next"
            rel="next"
            href={`${siteConfig.baseUrl}${nextPath}`}
          />
        )}
      </Head>
      <Space direction="column" block center>
        <FancyHeading level={1}>{title}</FancyHeading>
        <p>{description}</p>
      </Space>
      <FormWrapper>
        <Space direction="column">
          {showFilters && (
            <>
              <Heading level={2}>Search and Filter</Heading>
              <Space block direction="column">
                {/* First char filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="letters">First character of name is:</label>
                  <FullWidthSelect
                    name="letters"
                    value={filters.char}
                    onChange={(e) => handleChange(e, "char")}
                  >
                    <option key="char-none" value="">
                      All
                    </option>
                    {filterOptions.chars.map((char, i) => (
                      <option key={`char-${i}`} value={char}>
                        {char}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Name filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="search">Name includes:</label>
                  <input
                    name="search"
                    placeholder="Enter daylily name here..."
                    onChange={(e) => handleChange(e, "name")}
                    value={filters.name}
                  />
                </Space>
                {/* List filter */}
                {isSearch && (
                  <Space block direction="column" gap="xsmall">
                    <label htmlFor="list">On list:</label>
                    <FullWidthSelect
                      name="list"
                      value={filters.list}
                      onChange={(e) => handleChange(e, "list")}
                    >
                      <option key="list-none" value="">
                        Any
                      </option>
                      {filterOptions.lists.map((list, i) => (
                        <option key={`list-${i}`} value={list}>
                          {list}
                        </option>
                      ))}
                    </FullWidthSelect>
                  </Space>
                )}
                {/* Color filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="color">Color includes:</label>
                  <input
                    name="color"
                    placeholder="Enter daylily color here..."
                    onChange={(e) => handleChange(e, "color")}
                    value={filters.color}
                  />
                </Space>
                {/* Hybridizer filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="hybridizer">Hybridizer is:</label>
                  <FullWidthSelect
                    name="hybridizer"
                    value={filters.hybridizer}
                    onChange={(e) => handleChange(e, "hybridizer")}
                  >
                    <option key="hybridizer-none" value="">
                      All
                    </option>
                    {filterOptions.hybridizers.map((hybridizer, i) => (
                      <option key={`hybridizer-${i}`} value={hybridizer}>
                        {hybridizer}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Year filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="year">Year is:</label>
                  <FullWidthSelect
                    name="year"
                    value={filters.year}
                    onChange={(e) => handleChange(e, "year")}
                  >
                    <option key="year-none" value="">
                      All
                    </option>
                    {filterOptions.years.map((year, i) => (
                      <option key={`year-${i}`} value={year}>
                        {year}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Ploidy filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="ploidy">Ploidy is:</label>
                  <FullWidthSelect
                    name="ploidy"
                    value={filters.ploidy}
                    onChange={(e) => handleChange(e, "ploidy")}
                  >
                    <option key="ploidy-none" value="">
                      All
                    </option>
                    {filterOptions.ploidies.map((ploidy, i) => (
                      <option key={`ploidy-${i}`} value={ploidy}>
                        {ploidy}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Form filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="form">Form is:</label>
                  <FullWidthSelect
                    name="form"
                    value={filters.form}
                    onChange={(e) => handleChange(e, "form")}
                  >
                    <option key="form-none" value="">
                      All
                    </option>
                    {filterOptions.forms.map((form, i) => (
                      <option key={`form-${i}`} value={form}>
                        {form}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Foliage type filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="foliageType">Foliage type is:</label>
                  <FullWidthSelect
                    name="foliageType"
                    value={filters.foliageType}
                    onChange={(e) => handleChange(e, "foliageType")}
                  >
                    <option key="foliageType-none" value="">
                      All
                    </option>
                    {filterOptions.foliageTypes.map((foliageType, i) => (
                      <option key={`foliageType-${i}`} value={foliageType}>
                        {foliageType}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Fragrance filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="fragrance">Fragrance is:</label>
                  <FullWidthSelect
                    name="fragrance"
                    value={filters.fragrance}
                    onChange={(e) => handleChange(e, "fragrance")}
                  >
                    <option key="fragrance-none" value={""}>
                      All
                    </option>
                    {filterOptions.fragrances.map((fragrance, i) => (
                      <option key={`fragrance-${i}`} value={fragrance}>
                        {fragrance}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* bloomSize filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="bloomSize">Bloom size is:</label>
                  <FullWidthSelect
                    name="bloomSize"
                    value={filters.bloomSize}
                    onChange={(e) => handleChange(e, "bloomSize")}
                  >
                    <option value={""}>All</option>
                    <option value="miniature">{`Miniature (up to 3")`}</option>
                    <option value="small">{`Small (3" - 4.5")`}</option>
                    <option value="large">{`Large (4.5" - 7")`}</option>
                    <option value="extraLarge">{`Extra-Large (more than 7")`}</option>
                  </FullWidthSelect>
                </Space>
                {/* scapeHeight filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="scapeHeight">Scape Height is:</label>
                  <FullWidthSelect
                    name="scapeHeight"
                    value={filters.scapeHeight}
                    onChange={(e) => handleChange(e, "scapeHeight")}
                  >
                    <option value={""}>All</option>
                    <option value="miniature">{`Miniature (up to 10")`}</option>
                    <option value="short">{`Short (10" - 20")`}</option>
                    <option value="medium">{`Medium (20" - 30")`}</option>
                    <option value="tall">{`Tall (30" - 40")`}</option>
                    <option value="extraTall">{`Extra-Tall (more than 40")`}</option>
                  </FullWidthSelect>
                </Space>
                {/* Bloom Season filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="bloomSeason">Bloom Season is:</label>
                  <FullWidthSelect
                    name="bloomSeason"
                    value={filters.bloomSeason}
                    onChange={(e) => handleChange(e, "bloomSeason")}
                  >
                    <option key="bloomSeason-none" value="">
                      All
                    </option>
                    {filterOptions.bloomSeasons.map((bloomSeason, i) => (
                      <option key={`bloomSeason-${i}`} value={bloomSeason}>
                        {bloomSeason}
                      </option>
                    ))}
                  </FullWidthSelect>
                </Space>
                {/* Price filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="price">Price is:</label>
                  <FullWidthSelect
                    name="price"
                    value={filters.price}
                    onChange={(e) => handleChange(e, "price")}
                  >
                    <option value={""}>All</option>
                    <option value="one">{`up to $9.99`}</option>
                    <option value="two">{`$10 - $19.99`}</option>
                    <option value="three">{`$20 - $29.99`}</option>
                    <option value="four">{`$30 - $39.99`}</option>
                    <option value="five">{`$40 - $49.99`}</option>
                    <option value="six">{`more than $50`}</option>
                  </FullWidthSelect>
                </Space>
                {/* Note filter */}
                <Space block direction="column" gap="xsmall">
                  <label htmlFor="note">Note includes:</label>
                  <input
                    name="note"
                    placeholder="Enter daylily note text here..."
                    onChange={(e) => handleChange(e, "note")}
                    value={filters.note}
                  />
                </Space>
                <Button
                  onClick={() => {
                    clearFilters();
                  }}
                  block
                  danger
                >
                  Clear Filters
                </Button>
              </Space>
            </>
          )}
          <Button
            onClick={() => {
              setShowFilters((prev) => !prev);
            }}
            block
          >
            {`${showFilters ? "Hide" : "Show"} Search and Filters`}
          </Button>
        </Space>
      </FormWrapper>
      <Space direction="column" ref={topRef} block>
        <Space direction="column">
          {result.total > pageLimit && (
            <Paginate
              page={currentPage}
              pages={pages || 0}
              paginate={{ page: currentPage, limit: pageLimit }}
              setPaginate={({ page }) => setFilters({ ...filters, page })}
              onPageChange={handlePageChange}
            />
          )}
        </Space>
        {isLoading && <p>Loading results...</p>}
        <div className="grid w-full grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayLilies.map((node: DisplayListing) => {
            if (!node) return;
            return (
              <React.Fragment key={node.id}>
                <LilyCard lily={node} />
              </React.Fragment>
            );
          })}
        </div>
        {displayLilies.length < 1 && <p>No results found for this search...</p>}
        {result.total > pageLimit && (
          <Paginate
            page={currentPage}
            pages={pages || 0}
            paginate={{ page: currentPage, limit: pageLimit }}
            setPaginate={({ page }) => setFilters({ ...filters, page })}
            onPageChange={handlePageChange}
          />
        )}
      </Space>
      <BackToTop />
    </Layout>
  );
};
export default SearchPage;

const useSearchChange = (numResults: number, filters: CatalogFilters) => {
  const [prevNum, setPrevNum] = React.useState(numResults);
  const addAlert = useSnackBar().addAlert;
  useEffect(() => {
    if (numResults !== prevNum) {
      addAlert?.(`${numResults.toLocaleString()} results`);
      setPrevNum(numResults);
    }
  }, [addAlert, filters, numResults, prevNum]);
};

type DisplayListing = PublicListingCard;

export type ListingType = DisplayListing;

const getCatalogSeoTitle = (title: string, pageIndex: number) => {
  const pageSuffix = pageIndex > 0 ? ` - Page ${pageIndex + 1}` : "";

  if (title === "Search") {
    return `Search Rolling Oaks Daylily Catalog${pageSuffix}`;
  }

  if (title === "For Sale") {
    return `Daylilies For Sale from Rolling Oaks${pageSuffix}`;
  }

  return `${title}${pageSuffix} | Rolling Oaks Daylilies`;
};

const getCatalogSeoDescription = (
  title: string,
  description: string | null,
  pageIndex: number
) => {
  const pageContext = pageIndex > 0 ? ` Page ${pageIndex + 1}.` : "";

  if (title === "Search") {
    return `Search the Rolling Oaks Daylilies catalog by name, hybridizer, color, form, bloom season, height, bloom size, and other daylily traits.${pageContext}`;
  }

  if (title === "For Sale") {
    return `Browse daylilies currently offered for purchase from Rolling Oaks Daylilies, including unique, rare, double, white, spider, and unusual form varieties.${pageContext}`;
  }

  if (description) {
    return `${description}${pageContext}`;
  }

  return `${title} in the Rolling Oaks Daylilies catalog, with cultivar details, photos, and availability information.${pageContext}`;
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { catalog: string }
> = async (context) => {
  const catalog = context.params?.catalog;
  if (!catalog) {
    return {
      notFound: true,
    };
  }

  const snapshot = await getPublicSnapshot();
  const list = snapshot.catalogsBySlug[catalog];

  if (!list) {
    return {
      notFound: true,
    };
  }

  const listings = getCatalogListings(snapshot, catalog);

  const title = list.name;
  const description = list.intro;
  const filterOptions = getCatalogFilterOptions(listings);
  const filters = getCatalogFiltersFromQuery(context.query);
  const searchResult = getCatalogSearchResult(listings, filters);

  return {
    props: {
      title,
      description,
      initialListings: searchResult.listings,
      initialTotal: searchResult.total,
      initialPage: searchResult.page,
      filterOptions,
      path: `/catalog/${catalog}`,
    },
  };
};

const FullWidthSelect = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) => <select className="w-full" {...props} />;
