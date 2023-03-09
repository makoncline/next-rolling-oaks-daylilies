import React from "react";
import Head from "next/head";
import { siteConfig } from "../siteConfig";
import { useRouter } from "next/router";
import { useCart } from "./cart";
import { Nav, Space } from "@packages/design-system";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/assets/logo-square.png";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();
  const { title, description, baseUrl } = siteConfig;
  const { numItems } = useCart();
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:site_name" content={title} />
        <meta name="description" content={description} />
        <meta property="canonical" content={baseUrl + pathname} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`/assets/logo.png`} />
        <meta name="og:image:alt" content={`${title} logo`} />
        <meta property="og:url" content={baseUrl + pathname} />
        <meta property="canonical" content={baseUrl + pathname} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image:alt" content={`${title} logo`} />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Space
        direction="column"
        center
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
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
