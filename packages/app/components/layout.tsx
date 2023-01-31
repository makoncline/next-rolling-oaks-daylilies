import React from "react";
import Head from "next/head";
import { SnackBarProvider } from "./snackBarProvider";
import { siteConfig } from "../siteConfig";
import { useRouter } from "next/router";
import { CartProvider, useCart } from "./cart";
import { Link, Nav, Space, SquareImage } from "@packages/design-system";
import { Image } from "./Image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();
  const { title, description, baseUrl } = siteConfig;
  const { numItems } = useCart();
  return (
    <CartProvider>
      <SnackBarProvider>
        <Head>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta property="og:site_name" content={title} />

          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={`/assets/logo.png`} />
          <meta name="og:image:alt" content={`${title} logo`} />
          <meta property="og:url" content={baseUrl + pathname} />
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
                  <SquareImage width="64px">
                    <Image src="/assets/logo-square.png" alt="logo" />
                  </SquareImage>
                </Link>
              }
            >
              <Link href="/catalogs">Catalogs</Link>
              <Link href="/catalog/search">Search</Link>
              <Link href="/cart">Cart {numItems ? ` (${numItems})` : ""}</Link>
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
      </SnackBarProvider>
    </CartProvider>
  );
};

export default Layout;
