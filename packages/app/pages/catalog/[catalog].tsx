import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Head from "next/head";
import Layout from "../../components/layout";
import Select from "../../components/select";
import BackToTop from "../../components/backToTop";
import download from "../../lib/download";
import Paginate from "../../components/paginate";
import Button from "../../components/button";
import LilyCard from "../../components/lilyCard";
import Input from "../../components/input";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { ahs_data, lilies, Prisma } from "@prisma/client";
import { useSnackBar } from "../../components/snackBarProvider";
import slugify from "slugify";
import { siteConfig } from "../../siteConfig";
import { prisma } from "../../prisma/db";

type SearchPageProps = {
  title: string;
  description: string;
  listings: Listing[];
};
export type Listing = lilies & {
  ahs_data: ahs_data | null;
};
const SearchPage: NextPage<SearchPageProps> = ({
  title,
  description,
  listings,
}) => {
  const defaultFilters = {
    name: "",
    char: "",
    hybridizer: "",
    year: "",
    ploidy: "",
    color: "",
    form: "",
    foliageType: "",
    note: "",
    fragrance: "",
    bloomSize: "",
    scapeHeight: "",
    bloomSeason: "",
    price: "",
  };
  const router = useRouter();
  const { query } = router;

  const page = query.page;
  const pageString = page && Array.isArray(page) ? page[0] : page;
  const pageNum = pageString && parseInt(pageString);
  const [filters, setFilters] = useState(defaultFilters);
  const [paginate, setPaginate] = useState({
    limit: 24,
    page: pageNum ? pageNum - 1 : 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    setPaginate({
      limit: 24,
      page: pageNum ? pageNum - 1 : 0,
    });
  }, [pageNum]);

  const sortAlphaNum = (a: string | number, b: string | number) =>
    `${a}`.localeCompare(`${b}`, "en", { numeric: true }) < 0 ? -1 : 1;

  const filterByName = (lilyArr: Listing[]) => {
    if (!filters.name) return listings;
    return lilyArr.filter((node: Listing) => {
      return node.name.toLowerCase().includes(filters.name.toLowerCase());
    });
  };

  const filterByColor = (lilyArr: Listing[]) => {
    if (!filters.color) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return node.ahs_data?.color
        ?.toLowerCase()
        .includes(filters.color.toLowerCase());
    });
  };

  const filterByNote = (lilyArr: Listing[]) => {
    if (!filters.note) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return (
        node.public_note &&
        node.public_note.toLowerCase().includes(filters.note.toLowerCase())
      );
    });
  };

  const filterByFirstChar = (lilyArr: Listing[]) => {
    if (!filters.char) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return node.name
        .substring(0, 1)
        .toLowerCase()
        .includes(filters.char.toLowerCase());
    });
  };

  const filterByHybridizer = (lilyArr: Listing[]) => {
    if (!filters.hybridizer) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return (
        node.ahs_data?.hybridizer &&
        node.ahs_data.hybridizer
          .toLowerCase()
          .includes(filters.hybridizer.toLowerCase())
      );
    });
  };

  const filterByYear = (lilyArr: Listing[]) => {
    if (!filters.year) return lilyArr;
    return lilyArr
      .filter((node: Listing) => node.ahs_data?.year)
      .filter((node: Listing) => {
        return (
          node.ahs_data?.year &&
          node.ahs_data.year.toLowerCase().includes(filters.year.toLowerCase())
        );
      });
  };
  const filterByPloidy = (lilyArr: Listing[]) => {
    if (!filters.ploidy) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return (
        node.ahs_data?.ploidy &&
        node.ahs_data.ploidy
          .toLowerCase()
          .includes(filters.ploidy.toLowerCase())
      );
    });
  };
  const filterByForm = (lilyArr: Listing[]) => {
    if (!filters.form) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return (
        node.ahs_data?.form &&
        node.ahs_data.form.toLowerCase().includes(filters.form.toLowerCase())
      );
    });
  };
  const filterByFoliageType = (lilyArr: Listing[]) => {
    if (!filters.foliageType) return lilyArr;
    return lilyArr.filter((node: Listing) => {
      return (
        node.ahs_data?.foliage_type &&
        node.ahs_data.foliage_type
          .toLowerCase()
          .includes(filters.foliageType.toLowerCase())
      );
    });
  };
  const filterByFragrance = (lilyArr: Listing[]) => {
    if (!filters.fragrance) return lilyArr;
    return lilyArr.filter((node) => {
      return (
        node.ahs_data?.fragrance &&
        node.ahs_data.fragrance
          .toLowerCase()
          .includes(filters.fragrance.toLowerCase())
      );
    });
  };
  const filterByBloomSeason = (lilyArr: Listing[]) => {
    if (!filters.bloomSeason) return lilyArr;
    return lilyArr.filter((node) => {
      return (
        node.ahs_data?.bloom_season &&
        node.ahs_data.bloom_season.toLowerCase() ===
          filters.bloomSeason.toLowerCase()
      );
    });
  };
  const filterByBloomSize = (lilyArr: Listing[]) => {
    if (!filters.bloomSize) return lilyArr;
    let low = 0;
    let high = 1000;
    switch (filters.bloomSize) {
      case "miniature":
        low = 0;
        high = 3;
        break;
      case "small":
        low = 3;
        high = 4.5;
        break;
      case "large":
        low = 4.5;
        high = 7;
        break;
      case "extraLarge":
        low = 7;
        high = 1000;
        break;
      default:
        break;
    }
    return lilyArr.filter((node) => {
      const size =
        node.ahs_data?.bloom_size &&
        parseInt(node.ahs_data.bloom_size.toLowerCase().split(/[^\d.]/)[0]);
      return size && size > low && size <= high;
    });
  };

  const filterByScapeHeight = (lilyArr: Listing[]) => {
    if (!filters.scapeHeight) return lilyArr;
    let low = 0;
    let high = 1000;
    switch (filters.scapeHeight) {
      case "miniature":
        low = 0;
        high = 10;
        break;
      case "short":
        low = 10.1;
        high = 20;
        break;
      case "medium":
        low = 20.1;
        high = 30;
        break;
      case "tall":
        low = 30.1;
        high = 40;
        break;
      case "extraTall":
        low = 40.1;
        high = 1000;
        break;
      default:
        break;
    }
    return lilyArr.filter((node) => {
      const size =
        node.ahs_data?.scape_height &&
        parseInt(node.ahs_data.scape_height.toLowerCase().split(/[^\d.]/)[0]);
      return size && size > low && size <= high;
    });
  };

  const filterByPrice = (lilyArr: Listing[]) => {
    if (!filters.price) return lilyArr;
    let low = 0;
    let high = 1000;
    switch (filters.price) {
      case "one":
        low = 0;
        high = 9.99;
        break;
      case "two":
        low = 10;
        high = 19.99;
        break;
      case "three":
        low = 20;
        high = 29.99;
        break;
      case "four":
        low = 30;
        high = 39.99;
        break;
      case "five":
        low = 40;
        high = 49.99;
        break;
      case "six":
        low = 50;
        high = 999;
        break;
      default:
        break;
    }
    return lilyArr.filter((node) => {
      const price = node.price as unknown as number;
      return price && price > low && price <= high;
    });
  };

  const filterLilies = () => {
    let filtered = listings;
    if (filters.name) filtered = filtered && filterByName(filtered);
    if (filters.color) filtered = filtered && filterByColor(filtered);
    if (filters.char) filtered = filtered && filterByFirstChar(filtered);
    if (filters.note) filtered = filtered && filterByNote(filtered);
    if (filters.hybridizer) filtered = filtered && filterByHybridizer(filtered);
    if (filters.year) filtered = filtered && filterByYear(filtered);
    if (filters.ploidy) filtered = filtered && filterByPloidy(filtered);
    if (filters.form) filtered = filtered && filterByForm(filtered);
    if (filters.foliageType)
      filtered = filtered && filterByFoliageType(filtered);
    if (filters.fragrance) filtered = filtered && filterByFragrance(filtered);
    if (filters.bloomSize) filtered = filtered && filterByBloomSize(filtered);
    if (filters.scapeHeight)
      filtered = filtered && filterByScapeHeight(filtered);
    if (filters.bloomSeason)
      filtered = filtered && filterByBloomSeason(filtered);
    if (filters.price) filtered = filtered && filterByPrice(filtered);
    const sorted =
      filtered &&
      filtered.sort((a: Listing, b: Listing) => sortAlphaNum(a.name, b.name));
    return sorted;
  };

  const filteredLilies = filterLilies();

  const displayLilies =
    listings &&
    filteredLilies &&
    filteredLilies.slice(
      paginate.page * paginate.limit,
      (paginate.page + 1) * paginate.limit
    );

  const pages =
    listings.length &&
    filteredLilies &&
    Math.floor(filteredLilies.length / paginate.limit);

  const removeQueryParam = () => {
    const { asPath } = router;
    router.replace({ pathname: asPath, query: null }, undefined, {
      shallow: true,
    });
  };

  function clearFilters() {
    setFilters(defaultFilters);
    removeQueryParam();
  }

  function downloadTxtFile() {
    const output = listings && download(listings);
    const element = document.createElement("a");
    const file = output && new Blob([output], { type: "text/plain" });
    element.href = URL.createObjectURL(file as Blob);
    element.download = `catalog_data_${new Date().toISOString()}.tsv`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const url = typeof window !== "undefined" ? window.location.href : "";
  const topRef = React.useRef<HTMLDivElement>(null);
  const handlePageChange = () => {
    topRef.current?.scrollIntoView();
  };

  return (
    <Layout>
      <SearchChange
        filters={filters}
        numResults={filteredLilies?.length || 0}
      />
      <Style>
        <Head>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          {description ? (
            <>
              <meta name="description" content={description} />
              <meta property="og:description" content={description} />
            </>
          ) : null}
          <meta property="og:type" content="website" />
          <meta property="og:image" content={`${baseUrl}/logo.png`} />
          <meta property="og:image:width" content="800" />
          <meta property="og:image:height" content="800" />
          <meta name="og:image:alt" content={`${title} image`} />
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image:alt" content={`${title} image`} />
        </Head>
        <div className="top">
          <h1>
            <hr />
            <span>{title}</span>
          </h1>
          {description}
          {showFilters && (
            <div className="filter">
              {/* First char filter */}
              <br />
              <label htmlFor="letters">First character of name is:</label>
              <Select
                name="letters"
                value={filters.char}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  {
                    setFilters({ ...filters, char: e.target.value });
                    removeQueryParam();
                  }
                }}
              >
                <option key="char-none" value="">
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings.map(({ name }) =>
                        name.substring(0, 1).toUpperCase()
                      )
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a, b))
                    .map((char, i) => (
                      <option key={`char-${i}`} value={char}>
                        {char}
                      </option>
                    ))}
              </Select>
              {/* Name filter */}
              <br />
              <label htmlFor="search">Name includes:</label>
              <Input
                name="search"
                placeholder="Enter daylily name here..."
                onChange={(e) => {
                  removeQueryParam();
                  setFilters({ ...filters, name: e.target.value });
                }}
                value={filters.name}
              />
              {/* Color filter */}
              <br />
              <label htmlFor="color">Color includes:</label>
              <Input
                name="color"
                placeholder="Enter daylily color here..."
                onChange={(e) => {
                  setFilters({ ...filters, color: e.target.value });
                  removeQueryParam();
                }}
                value={filters.color}
              />
              {/* Hybridizer filter */}
              <br />
              <label htmlFor="hybridizer">Hybridizer is:</label>
              <Select
                name="hybridizer"
                value={filters.hybridizer}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilters({ ...filters, hybridizer: e.target.value });
                  removeQueryParam();
                }}
              >
                <option key="hybridizer-none" value="">
                  All
                </option>
                {listings &&
                  Array.from(
                    new Set(
                      listings
                        .filter((lily: Listing) => lily.ahs_data?.hybridizer)
                        .map((lily: Listing) => lily.ahs_data?.hybridizer)
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .map((hybridizer, i) => (
                      <option
                        key={`hybridizer-${i}`}
                        value={hybridizer as string}
                      >
                        {hybridizer}
                      </option>
                    ))}
              </Select>
              {/* Year filter */}
              <br />
              <label htmlFor="year">Year is:</label>
              <Select
                name="year"
                value={filters.year}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilters({ ...filters, year: e.target.value });
                  removeQueryParam();
                }}
              >
                <option key="year-none" value="">
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings
                        .filter(
                          (lily: Listing) => lily.ahs_data && lily.ahs_data.year
                        )
                        .map(
                          (lily: Listing) => lily.ahs_data && lily.ahs_data.year
                        )
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .reverse()
                    .map((year, i) => (
                      <option key={`year-${i}`} value={year as string}>
                        {year}
                      </option>
                    ))}
              </Select>
              {/* Ploidy filter */}
              <br />
              <label htmlFor="ploidy">Ploidy is:</label>
              <Select
                name="ploidy"
                value={filters.ploidy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilters({ ...filters, ploidy: e.target.value });
                  removeQueryParam();
                }}
              >
                <option key="ploidy-none" value="">
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings
                        .filter(
                          (lily: Listing) =>
                            lily.ahs_data && lily.ahs_data.ploidy
                        )
                        .map(
                          (lily: Listing) =>
                            lily.ahs_data && lily.ahs_data.ploidy
                        )
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .map((ploidy, i) => (
                      <option key={`ploidy-${i}`} value={ploidy as string}>
                        {ploidy}
                      </option>
                    ))}
              </Select>
              {/* Form filter */}
              <br />
              <label htmlFor="form">Form is:</label>
              <Select
                name="form"
                value={filters.form}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilters({ ...filters, form: e.target.value });
                  removeQueryParam();
                }}
              >
                <option key="form-none" value="">
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings
                        .filter((lily: Listing) => lily.ahs_data?.form)
                        .map((lily: Listing) => lily.ahs_data?.form)
                        .map((form) => form && form.split(" ")[0])
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .map((form, i) => (
                      <option key={`form-${i}`} value={form as string}>
                        {form}
                      </option>
                    ))}
              </Select>
              {/* Foliage type filter */}
              <br />
              <label htmlFor="foliageType">Foliage type is:</label>
              <Select
                name="foliageType"
                value={filters.foliageType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilters({
                    ...filters,
                    foliageType: e.target.value,
                  });
                  removeQueryParam();
                }}
              >
                <option key="foliageType-none" value="">
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings
                        .filter((lily: Listing) => lily.ahs_data?.foliage_type)
                        .map((lily: Listing) => lily.ahs_data?.foliage_type)
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .map((foliageType, i) => (
                      <option
                        key={`foliageType-${i}`}
                        value={foliageType as string}
                      >
                        {foliageType}
                      </option>
                    ))}
              </Select>
              {/* Fragrance filter */}
              <br />
              <label htmlFor="fragrance">Fragrance is:</label>
              <Select
                name="fragrance"
                value={filters.fragrance}
                onChange={(e) => {
                  setFilters({ ...filters, fragrance: e.target.value });
                  removeQueryParam();
                }}
              >
                <option key="fragrance-none" value={""}>
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings
                        .filter(
                          (lily) => lily.ahs_data && lily.ahs_data.fragrance
                        )
                        .map((lily) => lily.ahs_data?.fragrance)
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .map((fragrance, i) => (
                      <option
                        key={"fragrance-" + i}
                        value={fragrance as string}
                      >
                        {fragrance}
                      </option>
                    ))}
              </Select>
              {/* bloomSize filter */}
              <br />
              <label htmlFor="bloomSize">Bloom size is:</label>
              <Select
                name="bloomSize"
                value={filters.bloomSize}
                onChange={(e) => {
                  setFilters({ ...filters, bloomSize: e.target.value });
                  removeQueryParam();
                }}
              >
                <option value={""}>All</option>
                <option value="miniature">{`Miniature (up to 3")`}</option>
                <option value="small">{`Small (3" - 4.5")`}</option>
                <option value="large">{`Large (4.5" - 7")`}</option>
                <option value="extraLarge">{`Extra-Large (more than 7")`}</option>
              </Select>
              {/* scapeHeight filter */}
              <br />
              <label htmlFor="scapeHeight">Scape Height is:</label>
              <Select
                name="scapeHeight"
                value={filters.scapeHeight}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    scapeHeight: e.target.value,
                  });
                  removeQueryParam();
                }}
              >
                <option value={""}>All</option>
                <option value="miniature">{`Miniature (up to 10")`}</option>
                <option value="short">{`Short (10" - 20")`}</option>
                <option value="medium">{`Medium (20" - 30")`}</option>
                <option value="tall">{`Tall (30" - 40")`}</option>
                <option value="extraTall">{`Extra-Tall (more than 40")`}</option>
              </Select>
              {/* Bloom Season filter */}
              <br />
              <label htmlFor="bloomSeason">Bloom Season is:</label>
              <Select
                name="bloomSeason"
                value={filters.bloomSeason}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilters({
                    ...filters,
                    bloomSeason: e.target.value,
                  });
                  removeQueryParam();
                }}
              >
                <option key="bloomSeason-none" value="">
                  All
                </option>
                {listings &&
                  filteredLilies &&
                  Array.from(
                    new Set(
                      listings
                        .filter((lily: Listing) => lily.ahs_data?.bloom_season)
                        .map((lily: Listing) => lily.ahs_data?.bloom_season)
                    )
                  )
                    .sort((a, b) => sortAlphaNum(a + "", b + ""))
                    .map((bloomSeason, i) => (
                      <option
                        key={`bloomSeason-${i}`}
                        value={bloomSeason as string}
                      >
                        {bloomSeason}
                      </option>
                    ))}
              </Select>
              {/* Price filter */}
              <br />
              <label htmlFor="price">Price is:</label>
              <Select
                name="price"
                value={filters.price}
                onChange={(e) => {
                  setFilters({ ...filters, price: e.target.value });
                  removeQueryParam();
                }}
              >
                <option value={""}>All</option>
                <option value="one">{`up to $9.99`}</option>
                <option value="two">{`$10 - $19.99`}</option>
                <option value="three">{`$20 - $29.99`}</option>
                <option value="four">{`$30 - $39.99`}</option>
                <option value="five">{`$40 - $49.99`}</option>
                <option value="six">{`more than $50`}</option>
              </Select>
              {/* Note filter */}
              <br />
              <label htmlFor="note">Note includes:</label>
              <Input
                name="note"
                placeholder="Enter daylily note text here..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFilters({ ...filters, note: e.target.value });
                  removeQueryParam();
                }}
                value={filters.note}
              />
              <br />
              <Button
                onClick={() => {
                  clearFilters();
                  removeQueryParam();
                }}
                look="secondary"
                fullWidth
                label="clear filters"
              >
                Clear Filters
              </Button>
            </div>
          )}
          <Button
            onClick={() => {
              setShowFilters((prev) => !prev);
              clearFilters();
              removeQueryParam();
            }}
            look="secondary"
            fullWidth
            label="toggle search and filter"
          >
            {showFilters ? "Hide" : "Show"} Search and Filters
          </Button>
        </div>
        <div className="lilies-container" ref={topRef}>
          <div className="lilies-container--top">
            {pages && pages > 0 ? (
              <h2>
                {title} - page {paginate.page + 1} of {pages + 1}
              </h2>
            ) : (
              <h2>{title}</h2>
            )}
            {filteredLilies && filteredLilies.length > paginate.limit && (
              <Paginate
                page={paginate.page}
                pages={pages || 0}
                paginate={paginate}
                setPaginate={setPaginate}
                onPageChange={handlePageChange}
              />
            )}
          </div>
          <div className="lilies" id="lilies">
            {displayLilies &&
              displayLilies.map((node: Listing) => {
                if (!node) return;
                return <LilyCard key={node.id} lily={node} />;
              })}
          </div>
          {displayLilies && !displayLilies.length && (
            <p>No results found for this search...</p>
          )}
        </div>
        <div className="bottom">
          {filteredLilies && filteredLilies.length > paginate.limit && (
            <Paginate
              page={paginate.page}
              pages={pages || 0}
              paginate={paginate}
              setPaginate={setPaginate}
              onPageChange={handlePageChange}
            />
          )}
          {filters.name === "download" && (
            <button onClick={() => downloadTxtFile()}>download data</button>
          )}
        </div>
        <BackToTop />
      </Style>
    </Layout>
  );
};
export default SearchPage;

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

const SearchChange = ({
  numResults,
  filters,
}: {
  numResults: number;
  filters: any;
}) => {
  const [prevNum, setPrevNum] = React.useState(numResults);
  const addAlert = useSnackBar().addAlert;
  useEffect(() => {
    if (numResults !== prevNum) {
      addAlert && addAlert(`${numResults.toLocaleString()} results`);
      setPrevNum(numResults);
    }
  }, [addAlert, filters, numResults, prevNum]);

  return <></>;
};

export async function getStaticPaths() {
  const lists = await prisma.lists.findMany({
    where: { user_id: siteConfig.userId },
    select: { id: true, name: true },
  });
  const paths = lists.map((list) => ({
    params: {
      catalog: slugify(list.name),
    },
  }));
  paths.push({ params: { catalog: "all" } });
  paths.push({ params: { catalog: "search" } });
  paths.push({ params: { catalog: "for-sale" } });
  return {
    paths: paths,
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  const catalog = context.params.catalog;
  let listingsWhere: Prisma.liliesWhereInput | undefined = {
    user_id: siteConfig.userId,
  };
  let list: any = undefined;
  if (catalog === "for-sale") {
    listingsWhere = { ...listingsWhere, price: { gt: 0 } };
    list = { name: "For Sale", intro: "" };
  } else if (catalog === "all") {
    list = { name: "All", intro: "" };
  } else if (catalog === "search") {
    list = { name: "Search", intro: "" };
  } else {
    const listIds = await prisma.lists.findMany({
      where: { user_id: siteConfig.userId },
      select: { id: true, name: true },
    });
    const listId = listIds.find((node) => slugify(node.name) === catalog)?.id;
    list = await prisma.lists.findFirstOrThrow({ where: { id: listId } });
    listingsWhere = { ...listingsWhere, list_id: listId };
  }
  const listings = await prisma.lilies.findMany({
    orderBy: { name: "desc" },
    include: { ahs_data: true },
    where: listingsWhere,
  });
  const title = list.name;
  const description = list.description;

  return {
    props: JSON.parse(
      JSON.stringify({
        title,
        description,
        listings: listings,
      })
    ),
  };
}
