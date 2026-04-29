import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Head from "next/head";
import Layout from "../../components/layout";
import BackToTop from "../../components/backToTop";
import download from "../../lib/download";
import Paginate from "../../components/paginate";
import LilyCard from "../../components/lilyCard";
import { GetStaticProps, NextPage } from "next";
import { Listing, List, Image } from "../../prisma/generated/sqlite-client";
import { useSnackBar } from "../../components/snackBarProvider";
import { siteConfig } from "../../siteConfig";
import { prisma } from "../../prisma/db";
import { sortTitlesLettersBeforeNumbers } from "../../lib/sort";
import {
  Button,
  FancyHeading,
  FormWrapper,
  Heading,
  Space,
} from "@packages/design-system";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import {
  AhsDisplay,
  fullCultivarReferenceInclude,
  mapListingCultivarDisplay,
  parseLeadingNumber,
} from "../../lib/cultivarDisplay";

type Props = {
  title: string;
  description: string;
  listings: DisplayListing[];
};

const getListSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

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
    page: 0,
  };
  const router = useRouter();
  const { query, pathname, isReady } = router;
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    if (isReady) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        name: query.name ? query.name.toString() : "",
        char: query.char ? query.char.toString() : "",
        list: query.list ? query.list.toString() : "",
        hybridizer: query.hybridizer ? query.hybridizer.toString() : "",
        year: query.year ? query.year.toString() : "",
        ploidy: query.ploidy ? query.ploidy.toString() : "",
        color: query.color ? query.color.toString() : "",
        form: query.form ? query.form.toString() : "",
        foliageType: query.foliageType ? query.foliageType.toString() : "",
        note: query.note ? query.note.toString() : "",
        fragrance: query.fragrance ? query.fragrance.toString() : "",
        bloomSize: query.bloomSize ? query.bloomSize.toString() : "",
        scapeHeight: query.scapeHeight ? query.scapeHeight.toString() : "",
        bloomSeason: query.bloomSeason ? query.bloomSeason.toString() : "",
        price: query.price ? query.price.toString() : "",
        page: query.page ? parseInt(query.page.toString()) - 1 : 0,
      }));
    }
    if (isReady) {
      const { catalog, page, ...rest } = query;
      const queryKeys = Object.keys(rest);
      setShowFilters(queryKeys.length > 0);
    }
  }, [query, pathname, isReady]);
  const [showFilters, setShowFilters] = useState(false);

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
      parseInt(newValue) - 1 === defaultFilters.page
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

  const sortAlphaNum = (a: string | number, b: string | number) =>
    `${a}`.localeCompare(`${b}`, "en", { numeric: true }) < 0 ? -1 : 1;

  const filterByName = (lilyArr: DisplayListing[]) => {
    if (!filters.name) return listings;
    return lilyArr.filter((node: DisplayListing) => {
      return node.title.toLowerCase().includes(filters.name.toLowerCase());
    });
  };

  const filterByList = (lilyArr: DisplayListing[]) => {
    if (!filters.list) return lilyArr;
    if (filters.list.toLowerCase() === "no list") {
      return lilyArr.filter((node: DisplayListing) => {
        return !node.lists || node.lists.length === 0;
      });
    }
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.lists &&
        node.lists.some((list: List) =>
          list.title.toLowerCase().includes(filters.list.toLowerCase())
        )
      );
    });
  };

  const filterByColor = (lilyArr: DisplayListing[]) => {
    if (!filters.color) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return node.ahsListing?.color
        ?.toLowerCase()
        .includes(filters.color.toLowerCase());
    });
  };

  const filterByNote = (lilyArr: DisplayListing[]) => {
    if (!filters.note) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.description &&
        node.description.toLowerCase().includes(filters.note.toLowerCase())
      );
    });
  };

  const filterByFirstChar = (lilyArr: DisplayListing[]) => {
    if (!filters.char) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return node.title
        .substring(0, 1)
        .toLowerCase()
        .includes(filters.char.toLowerCase());
    });
  };

  const filterByHybridizer = (lilyArr: DisplayListing[]) => {
    if (!filters.hybridizer) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.ahsListing?.hybridizer &&
        node.ahsListing.hybridizer
          .toLowerCase()
          .includes(filters.hybridizer.toLowerCase())
      );
    });
  };

  const filterByYear = (lilyArr: DisplayListing[]) => {
    if (!filters.year) return lilyArr;
    return lilyArr
      .filter((node: DisplayListing) => node.ahsListing?.year)
      .filter((node: DisplayListing) => {
        return node.ahsListing?.year?.includes(filters.year);
      });
  };
  const filterByPloidy = (lilyArr: DisplayListing[]) => {
    if (!filters.ploidy) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.ahsListing?.ploidy &&
        node.ahsListing.ploidy
          .toLowerCase()
          .includes(filters.ploidy.toLowerCase())
      );
    });
  };
  const filterByForm = (lilyArr: DisplayListing[]) => {
    if (!filters.form) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.ahsListing?.form &&
        node.ahsListing.form.toLowerCase().includes(filters.form.toLowerCase())
      );
    });
  };
  const filterByFoliageType = (lilyArr: DisplayListing[]) => {
    if (!filters.foliageType) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.ahsListing?.foliageType &&
        node.ahsListing.foliageType
          .toLowerCase()
          .includes(filters.foliageType.toLowerCase())
      );
    });
  };
  const filterByFragrance = (lilyArr: DisplayListing[]) => {
    if (!filters.fragrance) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.ahsListing?.fragrance &&
        node.ahsListing.fragrance
          .toLowerCase()
          .includes(filters.fragrance.toLowerCase())
      );
    });
  };
  const filterByBloomSeason = (lilyArr: DisplayListing[]) => {
    if (!filters.bloomSeason) return lilyArr;
    return lilyArr.filter((node: DisplayListing) => {
      return (
        node.ahsListing?.bloomSeason &&
        node.ahsListing.bloomSeason.toLowerCase() ===
          filters.bloomSeason.toLowerCase()
      );
    });
  };
  const filterByBloomSize = (lilyArr: DisplayListing[]) => {
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
      const size = parseLeadingNumber(node.ahsListing?.bloomSize);
      return size && size > low && size <= high;
    });
  };

  const filterByScapeHeight = (lilyArr: DisplayListing[]) => {
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
      const size = parseLeadingNumber(node.ahsListing?.scapeHeight);
      return size && size > low && size <= high;
    });
  };

  const filterByPrice = (lilyArr: DisplayListing[]) => {
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
      return node.price != null && node.price > low && node.price <= high;
    });
  };

  const filterLilies = () => {
    let filtered = listings;
    if (filters.name) filtered = filtered && filterByName(filtered);
    if (filters.char) filtered = filtered && filterByFirstChar(filtered);
    if (filters.list) filtered = filtered && filterByList(filtered);
    if (filters.color) filtered = filtered && filterByColor(filtered);
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
    const sorted = filtered && sortTitlesLettersBeforeNumbers(filtered);
    return sorted;
  };

  const filteredLilies = filterLilies();

  const pageLimit = 24;
  const displayLilies =
    listings &&
    filteredLilies &&
    filteredLilies.slice(
      filters.page * pageLimit,
      (filters.page + 1) * pageLimit
    );

  const pages =
    listings.length &&
    filteredLilies &&
    Math.floor(filteredLilies.length / pageLimit);

  const removeQueryParam = () => {
    const { asPath } = router;
    const pathname = asPath.split("?")[0];
    router.replace({ pathname, query: null }, undefined, {
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
    if (topRef.current) {
      const topPosition =
        topRef.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: topPosition, behavior: "smooth" });
    }
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
                          listings.map(({ title }) =>
                            title.substring(0, 1).toUpperCase()
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
                        Array.from(
                          new Set(
                            listings.flatMap((listing: DisplayListing) =>
                              listing.lists && listing.lists.length > 0
                                ? listing.lists.map((list: List) => list.title)
                                : ["No List"]
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
                              (lily: DisplayListing) =>
                                lily.ahsListing?.hybridizer
                            )
                            .map(
                              (lily: DisplayListing) =>
                                lily.ahsListing?.hybridizer
                            )
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
                              (lily: DisplayListing) =>
                                lily.ahsListing && lily.ahsListing.year
                            )
                            .map(
                              (lily: DisplayListing) =>
                                lily.ahsListing && lily.ahsListing.year
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
                              (lily: DisplayListing) =>
                                lily.ahsListing && lily.ahsListing.ploidy
                            )
                            .map(
                              (lily: DisplayListing) =>
                                lily.ahsListing && lily.ahsListing.ploidy
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
                            .filter(
                              (lily: DisplayListing) => lily.ahsListing?.form
                            )
                            .map(
                              (lily: DisplayListing) => lily.ahsListing?.form
                            )
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
                              (lily: DisplayListing) =>
                                lily.ahsListing?.foliageType
                            )
                            .map(
                              (lily: DisplayListing) =>
                                lily.ahsListing?.foliageType
                            )
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
                              (lily: DisplayListing) =>
                                lily.ahsListing?.fragrance
                            )
                            .map(
                              (lily: DisplayListing) =>
                                lily.ahsListing?.fragrance
                            )
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
                              (lily: DisplayListing) =>
                                lily.ahsListing?.bloomSeason
                            )
                            .map(
                              (lily: DisplayListing) =>
                                lily.ahsListing?.bloomSeason
                            )
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
          {filteredLilies.length > pageLimit && (
            <Paginate
              page={filters.page}
              pages={pages || 0}
              paginate={{ page: filters.page, limit: pageLimit }}
              setPaginate={({ page, limit }) =>
                setFilters({ ...filters, page })
              }
              onPageChange={handlePageChange}
            />
          )}
        </Space>
        <LilyWrapper>
          {displayLilies.map((node: DisplayListing) => {
            if (!node) return;
            return (
              <React.Fragment key={node.id}>
                <LilyCard lily={node} />
              </React.Fragment>
            );
          })}
        </LilyWrapper>
        {displayLilies.length < 1 && <p>No results found for this search...</p>}
        {filteredLilies.length > pageLimit && (
          <Paginate
            page={filters.page}
            pages={pages || 0}
            paginate={{ page: filters.page, limit: pageLimit }}
            setPaginate={({ page, limit }) => setFilters({ ...filters, page })}
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
  return {
    paths: [],
    fallback: "blocking",
  };
}

type DisplayListing = Listing & {
  ahsListing: AhsDisplay | null;
  lists: List[];
  images: Image[];
};

export type ListingType = DisplayListing;

export const getStaticProps: GetStaticProps<Props> = async (context: any) => {
  const catalog = context.params.catalog;
  let listingsWhere: any = {
    userId: siteConfig.userId,
    OR: [{ status: null }, { NOT: { status: "HIDDEN" } }],
  };
  let list: any = undefined;

  const defaultList = { id: "", title: "", description: "" };

  if (catalog === "for-sale") {
    listingsWhere = { ...listingsWhere, price: { gt: 0 } };
    list = { ...defaultList, title: "For Sale", description: "" };
  } else if (catalog === "all") {
    list = { ...defaultList, title: "All", description: "" };
  } else if (catalog === "search") {
    list = { ...defaultList, title: "Search", description: "" };
  } else {
    const lists = await prisma.list.findMany({
      where: { userId: siteConfig.userId },
    });
    list = lists.find((candidate) => getListSlug(candidate.title) === catalog);

    if (list) {
      listingsWhere = {
        ...listingsWhere,
        lists: { some: { id: list.id } },
      };
    }
  }

  if (!list) {
    return {
      notFound: true,
    };
  }

  const rawListings = await prisma.listing.findMany({
    include: {
      cultivarReference: {
        include: fullCultivarReferenceInclude,
      },
      lists: true,
      images: {
        orderBy: { order: "asc" },
      },
    },
    where: listingsWhere,
  });
  const listings = rawListings.map(mapListingCultivarDisplay);

  const title = list.title;
  const description = list.description;

  return {
    props: JSON.parse(
      JSON.stringify({
        title,
        description,
        listings: listings,
      })
    ),
    revalidate: 60,
  };
};

const FullWidthSelect = styled.select`
  width: 100%;
`;
