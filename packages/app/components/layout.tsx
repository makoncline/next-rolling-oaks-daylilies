import React from "react";
import Head from "next/head";
import { siteConfig } from "../siteConfig";
import { useCart } from "./cart";
import { Nav, Space } from "@packages/design-system";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/assets/logo-square.png";
import { useRouter } from "next/router";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { asPath } = useRouter();
  const { title, description, baseUrl } = siteConfig;
  const { numItems } = useCart();
  return (
    <>
      <Head>
        <title key="title">{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="og:site_name" property="og:site_name" content={title} />
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
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content={`/assets/logo.png`} />
        <meta
          key="og:image:alt"
          name="og:image:alt"
          content={`${title} logo`}
        />
        <meta key="og:url" property="og:url" content={baseUrl + asPath} />
        <meta key="canonical" property="canonical" content={baseUrl + asPath} />
        <meta
          key="twitter:card"
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          key="twitter:image:alt"
          name="twitter:image:alt"
          content={`${title} logo`}
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Space
        direction="column"
        center
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--surface-1)",
          opacity: 0.9,
        }}
      >
        <Space
          direction="column"
          block
          center
          style={{ maxWidth: "60rem" }}
          as="main"
        >
          <Nav
            logo={
              <Link href="/">
                <Image
                  src={logo}
                  alt="logo"
                  placeholder="blur"
                  width={64}
                  height={64}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </Link>
            }
          >
            <Link href="/catalogs">Catalogs</Link>
            <Link href="/catalog/search">Search</Link>
            <Link href="/cart">
              {`Cart ${numItems ? ` (${numItems})` : ""}`}
            </Link>
          </Nav>
        </Space>
      </Space>
      <Space direction="column" center>
        <Space
          direction="column"
          block
          center
          style={{ maxWidth: "60rem" }}
          as="main"
        >
          {children}
        </Space>
      </Space>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </>
  );
};

export default Layout;
