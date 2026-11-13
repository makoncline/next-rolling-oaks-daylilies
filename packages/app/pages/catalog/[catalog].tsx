import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "components/breadcrumbs";
import { SlidersHorizontal } from "lucide-react";
import Head from "next/head";
import Layout from "../../components/layout";
import BackToTop from "../../components/backToTop";
import Paginate from "../../components/paginate";
import LilyCard from "../../components/lilyCard";
import type { GetServerSideProps, NextPage } from "next";
import { siteConfig } from "../../siteConfig";
import { Button, cx, FancyHeading } from "components/ui";
import {
  ActiveFilterChips,
  CatalogFilterPanel,
  NameSearchField,
  SortSelect,
  type FilterValue,
} from "../../components/catalogFilters";
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
  getCatalogSortFromQuery,
  getActiveFilterKeys,
  hasActiveAdvancedFilters,
  type CatalogFilterKey,
  type CatalogFilterOptions,
  type CatalogFilters,
  type CatalogSort,
} from "../../lib/catalogSearch";
import { formatNumber } from "../../lib/format";

const textFilterKeys = new Set(["name", "color", "note", "parentage"]);
const nonSearchQueryKeys = new Set(["catalog", "filters"]);

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
  const textFilterTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [searchError, setSearchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const pendingFiltersRef = React.useRef<Partial<CatalogFilters>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const modePathRef = React.useRef<string | null>(null);
  const sort = isReady ? getCatalogSortFromQuery(query) : "";

  useEffect(() => {
    if (isReady) {
      const queryFilters = getCatalogFiltersFromQuery(query);
      // Keep text edits until the URL acknowledges them. A quick toggle must
      // not discard a name that is still waiting for the debounce timer.
      for (const key of Object.keys(pendingFiltersRef.current) as CatalogFilterKey[]) {
        if (pendingFiltersRef.current[key] === queryFilters[key]) {
          delete pendingFiltersRef.current[key];
        }
      }
      setFilters({ ...queryFilters, ...pendingFiltersRef.current });
      // A shared link with advanced filters opens in advanced mode once;
      // afterwards the visitor's own switch choice wins.
      if (modePathRef.current !== path) {
        modePathRef.current = path;
        setAdvancedSearch(hasActiveAdvancedFilters(queryFilters));
      }
    }
  }, [query, pathname, isReady, path]);

  useEffect(() => {
    const cancelPending = (_url: string, { shallow }: { shallow: boolean }) => {
      if (shallow) return;
      if (textFilterTimeoutRef.current) clearTimeout(textFilterTimeoutRef.current);
      pendingFiltersRef.current = {};
    };
    router.events.on("routeChangeStart", cancelPending);
    return () => {
      router.events.off("routeChangeStart", cancelPending);
      if (textFilterTimeoutRef.current) clearTimeout(textFilterTimeoutRef.current);
    };
  }, [router.events]);

  useEffect(() => {
    if (!isReady) return;

    const controller = new AbortController();
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (nonSearchQueryKeys.has(key)) return;
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value) {
        params.set(key, value);
      }
    });

    setIsLoading(true);
    setSearchError(false);
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
        if (controller.signal.aborted) return;
        setResult({
          listings: data.listings,
          total: data.pagination.total,
          page: data.pagination.page - 1,
        });
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== "AbortError") {
          setSearchError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [isReady, query, retryCount]);

  const updateFilter = (filterKey: CatalogFilterKey, newValue: FilterValue) => {
    pendingFiltersRef.current = { ...pendingFiltersRef.current, [filterKey]: newValue };
    setFilters((prevFilters) => ({ ...prevFilters, [filterKey]: newValue }));
    if (textFilterTimeoutRef.current) {
      clearTimeout(textFilterTimeoutRef.current);
    }

    const replaceQuery = () => {
      textFilterTimeoutRef.current = null;
      const newQuery = { ...router.query };
      for (const [key, value] of Object.entries(pendingFiltersRef.current)) {
        if (value) newQuery[key] = String(value);
        else delete newQuery[key];
      }
      delete newQuery.page;
      router.replace(
        {
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    };

    if (textFilterKeys.has(filterKey)) {
      textFilterTimeoutRef.current = setTimeout(replaceQuery, 300);
      return;
    }

    replaceQuery();
  };

  const updateSort = (value: CatalogSort) => {
    const newQuery = { ...router.query };
    if (value) newQuery.sort = value;
    else delete newQuery.sort;
    delete newQuery.page;
    router.replace({ query: newQuery }, undefined, { shallow: true });
  };

  const removeFilter = (filterKey: CatalogFilterKey) =>
    updateFilter(
      filterKey,
      typeof defaultCatalogFilters[filterKey] === "boolean" ? false : ""
    );

  const pageLimit = CATALOG_PAGE_LIMIT;
  const lastPage = Math.max(Math.ceil(result.total / pageLimit) - 1, 0);
  const currentPage = Math.min(Math.max(result.page, 0), lastPage);
  const displayLilies = result.listings;
  const pages = lastPage;

  function clearFilters() {
    if (textFilterTimeoutRef.current) {
      clearTimeout(textFilterTimeoutRef.current);
    }
    pendingFiltersRef.current = {};
    setFilters(defaultCatalogFilters);
    // Clearing filters keeps the visitor's chosen order.
    router.replace(
      { pathname: router.asPath.split("?")[0], query: sort ? { sort } : null },
      undefined,
      { shallow: true }
    );
  }

  function toggleFilters() {
    setShowFilters((value) => !value);
  }

  const topRef = React.useRef<HTMLDivElement>(null);
  const handlePageChange = () => {
    if (topRef.current) {
      const topPosition =
        topRef.current.getBoundingClientRect().top + window.scrollY - 120;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollTo({
        top: topPosition,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };
  const numResults = result.total;
  const isSearch = title === "Search";
  const activeFilterCount = getActiveFilterKeys(filters).length;
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
      <div className="flex flex-col gap-2">
        <Breadcrumbs items={[{ label: "Catalogs", href: "/catalogs" }, { label: title }]} />
        <FancyHeading level={1}>{title}</FancyHeading>
        {description ? (
          <p className="m-0 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className={cx("grid w-full grid-cols-1 gap-6", showFilters && "xl:grid-cols-10 xl:gap-8")}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4 xl:col-span-full">
            <NameSearchField
              value={filters.name}
              onChange={(value) => updateFilter("name", value)}
            />
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Button onClick={toggleFilters} aria-expanded={showFilters} size="compact">
                <SlidersHorizontal aria-hidden="true" className="shrink-0 size-4" />
                Filters
              </Button>
              <SortSelect value={sort} onChange={updateSort} />
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:ml-auto sm:w-auto sm:justify-end">
              <div className="flex items-baseline gap-2">
                <p role="status" aria-live="polite" className="m-0 font-semibold tabular-nums text-foreground-emphasis">
                  {formatNumber(numResults)} {numResults === 1 ? "result" : "results"}
                </p>
                {activeFilterCount ? (
                  <p className="m-0 text-meta text-muted-foreground">
                    {activeFilterCount} active{" "}
                    {activeFilterCount === 1 ? "filter" : "filters"}
                  </p>
                ) : null}
              </div>
              {result.total > pageLimit && (
                <Paginate
                  page={currentPage}
                  pages={pages || 0}
                  onPageChange={handlePageChange}
                  label="Top Catalog Pagination"
                  showPageJump={false}
                />
              )}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="xl:col-span-full">
              <ActiveFilterChips
                filters={filters}
                onRemove={removeFilter}
                onClearAll={clearFilters}
              />
            </div>
          )}
          {showFilters && (
            <CatalogFilterPanel
              filters={filters}
              filterOptions={filterOptions}
              isSearch={isSearch}
              advanced={advancedSearch}
              onAdvancedChange={setAdvancedSearch}
              onChange={updateFilter}
            />
          )}
      <div ref={topRef} aria-busy={isLoading} className={cx("flex w-full min-w-0 flex-col gap-6", showFilters && "xl:col-span-7")}>
        {isLoading && (
          <p role="status" aria-live="polite">
            Loading Results…
          </p>
        )}
        {searchError && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border-stroke border-card-border bg-card p-5">
            <p className="m-0">Search results could not load. Please try again.</p>
            <Button size="compact" onClick={() => setRetryCount((count) => count + 1)}>
              Retry search
            </Button>
          </div>
        )}
        {!searchError && <div className={cx("grid w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4", showFilters && "xl:grid-cols-3")}>
          {displayLilies.map((node: DisplayListing, index) => {
            if (!node) return;
            return (
              <React.Fragment key={node.id}>
                <LilyCard lily={node} priority={index < 3} />
              </React.Fragment>
            );
          })}
        </div>}
        {!searchError && !isLoading && displayLilies.length < 1 && (
          <p className="m-0 w-full max-w-none rounded-lg border-stroke border-card-border bg-card px-6 py-12 text-center text-muted-foreground">
            No Results Found for This Search…
          </p>
        )}
        {result.total > pageLimit && (
          <Paginate
            page={currentPage}
            pages={pages || 0}
            onPageChange={handlePageChange}
            label="Bottom Catalog Pagination"
          />
        )}
      </div>
      </div>
      <BackToTop />
    </Layout>
  );
};
export default SearchPage;

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
  const searchResult = getCatalogSearchResult(
    listings,
    filters,
    CATALOG_PAGE_LIMIT,
    getCatalogSortFromQuery(context.query)
  );

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
