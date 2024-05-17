import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Head from "next/head";
import Layout from "../../components/layout";
import BackToTop from "../../components/backToTop";
import download from "../../lib/download";
import Paginate from "../../components/paginate";
import LilyCard from "../../components/lilyCard";
import { GetStaticProps, NextPage } from "next";
import { ahs_data, lilies, lists, Prisma } from "@prisma/client";
import { useSnackBar } from "../../components/snackBarProvider";
import slugify from "slugify";
import { siteConfig } from "../../siteConfig";
import { prisma } from "../../prisma/db";
import {
  Button,
  FancyHeading,
  FormWrapper,
  Heading,
  Space,
} from "@packages/design-system";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";

const SearchPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  title,
  description,
  listings,
}) => {
  const defaultFilters = {
    name: "",
    list: "",
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
  const [paginate, setPaginate] = useState({
    limit: 24,
    page: pageNum ? pageNum - 1 : 0,
  });
  useEffect(() => {
    setPaginate({
      limit: 24,
      page: pageNum ? pageNum - 1 : 0,
    });
  }, [pageNum]);
  const [filters, setFilters] = useState({
    ...defaultFilters,
    name: query.name ? query.name.toString() : "",
    char: query.char ? query.char.toString() : "",
    list: query.list ? query.list.toString() : "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, filterKey: string) => {
    const newValue = e.target.value;
    setFilters((prevFilters) => ({ ...prevFilters, [filterKey]: newValue }));
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, [filterKey]: newValue },
      },
      undefined,
      { shallow: true }
    );
  };

  const sortAlphaNum = (a: string | number, b: string | number) =>
    `${a}`.localeCompare(`${b}`, "en", { numeric: true }) < 0 ? -1 : 1;

  const filterByName = (lilyArr: Listing[]) => {
    if (!filters.name) return listings;
    return lilyArr.filter((node: Listing) => {
      return node.name.toLowerCase().includes(filters.name.toLowerCase());
    });
  };

  const filterByList = (lilyArr: Listing[]) => {
    if (!filters.list) return lilyArr;
    if (filters.list.toLowerCase() === "no list") {
      return lilyArr.filter((node: Listing) => {
        return node.lists === null;
      });
    }
    return lilyArr.filter((node: Listing) => {
      return node.lists?.name
        .toLowerCase()
        .includes(filters.list.toLowerCase());
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
    if (filters.char) filtered = filtered && filterByFirstChar(filtered);
    if (filters.list) filtered = filtered && filterByList(filtered);
    if (filters.list) filtered = filtered && filterByList(filtered);
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

  const topRef = React.useRef<HTMLDivElement>(null);
  const handlePageChange = () => {
    window.scrollTo(0, 0);
  };
  const numResults = filteredLilies?.length || 0;
  useSearchChange(numResults, filters);
  const isSearch = title === "Search";
  return (
    <Layout>
      <Head>
        <title key="title">{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        {description ? (
          <>
            <meta
              key="description"
              name="description"
              content={description.substring(0, 160)}
            />
            <meta
              key="og:description"
              property="og:description"
              content={description.substring(0, 160)}
            />
          </>
        ) : null}
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:image"
          property="og:image"
          content={`${siteConfig.baseUrl}/logo.png`}
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
                      {listings &&
                        filteredLilies &&
                        Array.from(
                          new Set(
                            listings.map(({ lists }) =>
                              lists ? lists.name : "No List"
                            )
                          )
                        )
                          .sort((a, b) => sortAlphaNum(a, b))
                          .map((list, i) => (
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
                    {listings &&
                      Array.from(
                        new Set(
                          listings
                            .filter(
                              (lily: Listing) => lily.ahs_data?.hybridizer
                            )
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
                    {listings &&
                      filteredLilies &&
                      Array.from(
                        new Set(
                          listings
                            .filter(
                              (lily: Listing) =>
                                lily.ahs_data && lily.ahs_data.year
                            )
                            .map(
                              (lily: Listing) =>
                                lily.ahs_data && lily.ahs_data.year
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
                    {listings &&
                      filteredLilies &&
                      Array.from(
                        new Set(
                          listings
                            .filter(
                              (lily: Listing) => lily.ahs_data?.foliage_type
                            )
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
                    {listings &&
                      filteredLilies &&
                      Array.from(
                        new Set(
                          listings
                            .filter(
                              (lily: Listing) => lily.ahs_data?.bloom_season
                            )
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
                    removeQueryParam();
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
              clearFilters();
              removeQueryParam();
            }}
            block
          >
            {`${showFilters ? "Hide" : "Show"} Search and Filters`}
          </Button>
        </Space>
      </FormWrapper>
      <Space direction="column" ref={topRef} block>
        <Space direction="column">
          {filteredLilies.length > paginate.limit && (
            <Paginate
              page={paginate.page}
              pages={pages || 0}
              paginate={paginate}
              setPaginate={setPaginate}
              onPageChange={handlePageChange}
            />
          )}
        </Space>
        <LilyWrapper>
          {displayLilies.map((node: Listing) => {
            if (!node) return;
            return (
              <React.Fragment key={node.id}>
                <LilyCard lily={node} />
              </React.Fragment>
            );
          })}
        </LilyWrapper>
        {displayLilies.length < 1 && <p>No results found for this search...</p>}
        {filteredLilies.length > paginate.limit && (
          <Paginate
            page={paginate.page}
            pages={pages || 0}
            paginate={paginate}
            setPaginate={setPaginate}
            onPageChange={handlePageChange}
          />
        )}
        {filters.name === "download" && (
          <Button onClick={() => downloadTxtFile()}>download data</Button>
        )}
      </Space>
      <BackToTop />
    </Layout>
  );
};
export default SearchPage;

const LilyWrapper = styled.div`
  // flex wrap

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--size-4);
`;

const useSearchChange = (numResults: number, filters: any) => {
  const [prevNum, setPrevNum] = React.useState(numResults);
  const addAlert = useSnackBar().addAlert;
  useEffect(() => {
    if (numResults !== prevNum) {
      addAlert && addAlert(`${numResults.toLocaleString()} results`);
      setPrevNum(numResults);
    }
  }, [addAlert, filters, numResults, prevNum]);
};

export async function getStaticPaths() {
  const lists = await prisma.lists.findMany({
    where: { user_id: siteConfig.userId },
    select: { id: true, name: true },
  });
  const paths = lists.map((list) => ({
    params: {
      catalog: slugify(list.name, { lower: true }),
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

const defaultList: lists = {
  id: 0,
  user_id: siteConfig.userId,
  name: "All",
  intro: "",
  bio: "",
  created_at: new Date(),
  updated_at: new Date(),
};

type Props = {
  title: string;
  description: string;
  listings: (lilies & {
    ahs_data: ahs_data | null;
    lists: lists | null;
  })[];
};
export type Listing = Props["listings"][number];

export const getStaticProps: GetStaticProps<Props> = async (context: any) => {
  const catalog = context.params.catalog;
  let listingsWhere: Prisma.liliesWhereInput | undefined = {
    user_id: siteConfig.userId,
  };
  let list: lists | undefined = undefined;
  if (catalog === "for-sale") {
    listingsWhere = { ...listingsWhere, price: { gt: 0 } };
    list = { ...defaultList, name: "For Sale", intro: "" };
  } else if (catalog === "all") {
    list = { ...defaultList, name: "All", intro: "" };
  } else if (catalog === "search") {
    list = { ...defaultList, name: "Search", intro: "" };
  } else {
    const listIds = await prisma.lists.findMany({
      where: { user_id: siteConfig.userId },
      select: { id: true, name: true },
    });
    const listId = listIds.find(
      (node) => slugify(node.name, { lower: true }) === catalog
    )?.id;
    listingsWhere = { ...listingsWhere, list_id: listId };
    list = await prisma.lists.findFirstOrThrow({ where: { id: listId } });
  }
  if (!list) {
    throw new Error("List not found");
  }
  const listings = await prisma.lilies.findMany({
    orderBy: { name: "desc" },
    include: { ahs_data: true, lists: true },
    where: listingsWhere,
  });
  const title = list.name;
  const description = list.intro;
  return {
    props: JSON.parse(
      JSON.stringify({
        title,
        description,
        listings: listings,
      })
    ),
  };
};

const FullWidthSelect = styled.select`
  width: 100%;
`;
