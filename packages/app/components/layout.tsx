import React from "react";
import { Mail, MapPin, Phone, ShoppingCart } from "lucide-react";
import Head from "next/head";
import { siteConfig } from "../siteConfig";
import { useCart } from "./cart";
import { Nav } from "components/nav";
import { cx } from "components/ui";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/assets/logo-square.png";
import { useRouter } from "next/router";

const Layout = ({ children, hero, phoneActionBar = false }: {
  children: React.ReactNode;
  hero?: React.ReactNode;
  /** Reserves room below the footer for a page's fixed bottom bar on phones. */
  phoneActionBar?: boolean;
}) => {
  const { asPath } = useRouter();
  const { title, description, baseUrl } = siteConfig;
  const { numItems } = useCart();
  const currentPath = asPath.split(/[?#]/)[0];
  const isCurrent = (href: string) =>
    currentPath === href ? ("page" as const) : undefined;
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
        <meta
          key="og:image"
          property="og:image"
          content={`${baseUrl}/assets/logo.png`}
        />
        <meta
          key="og:image:alt"
          name="og:image:alt"
          content={`${title} logo`}
        />
        <meta key="og:url" property="og:url" content={baseUrl + asPath} />
        <link key="canonical" rel="canonical" href={baseUrl + asPath} />
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
        <meta key="theme-color" name="theme-color" content="#18221d" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <a
        className="fixed -top-2 left-4 z-50 -translate-y-full rounded-md border-stroke border-ring bg-popover px-control-x py-control-y text-popover-foreground focus-visible:top-4 focus-visible:translate-y-0"
        href="#main-content"
      >
        Skip to Main Content
      </a>
      <div className={cx("flex min-h-screen flex-col", phoneActionBar && "pb-16 md:pb-0")}>
        <div className="sticky top-0 z-10 border-b border-border bg-background">
          <header className="mx-auto w-full max-w-page px-4 sm:px-8">
            <Nav
              mobileActions={
                <Link
                  href="/cart"
                  aria-label={`View cart, ${numItems} ${numItems === 1 ? "item" : "items"}`}
                  aria-current={isCurrent("/cart")}
                  className="relative inline-flex size-11 items-center justify-center rounded-md text-foreground-emphasis hover:bg-secondary"
                >
                  <ShoppingCart aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {numItems > 0 && (
                    <span aria-hidden="true" className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-fine font-bold tabular-nums text-primary-foreground">
                      {numItems}
                    </span>
                  )}
                </Link>
              }
              logo={
                <Link
                  href="/"
                  className="-ml-1 flex items-center gap-3 rounded-md p-1"
                >
                  <Image
                    src={logo}
                    alt="Rolling Oaks Daylilies"
                    placeholder="blur"
                    width={64}
                    height={64}
                    className="size-11"
                  />
                  <span
                    aria-hidden="true"
                    className="text-lg font-bold leading-tight tracking-heading text-foreground-emphasis sm:text-xl"
                  >
                    Rolling Oaks Daylilies
                  </span>
                </Link>
              }
            >
              <Link
                href="/catalog/for-sale"
                aria-current={isCurrent("/catalog/for-sale")}
              >
                For Sale
              </Link>
              <Link href="/catalogs" aria-current={isCurrent("/catalogs")}>
                Catalogs
              </Link>
              <Link
                href="/catalog/search"
                aria-current={isCurrent("/catalog/search")}
              >
                Search
              </Link>
              <Link href="/cart" aria-current={isCurrent("/cart")}>
                <ShoppingCart aria-hidden="true" className="shrink-0 size-4.5" strokeWidth={1.75} />
                Cart
                {numItems ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-fine font-bold tabular-nums text-primary-foreground">
                    <span className="sr-only"> (</span>
                    {numItems}
                    <span className="sr-only">)</span>
                  </span>
                ) : null}
              </Link>
            </Nav>
          </header>
        </div>
        <main
          id="main-content"
          className="w-full grow text-left"
        >
          {hero}
          <div className="mx-auto flex w-full max-w-page flex-col items-stretch gap-6 px-4 pt-8 sm:px-8 sm:pt-12">
            {children}
          </div>
        </main>
        <footer className="mt-section border-t border-border bg-background-sunken">
          <div className="mx-auto grid w-full max-w-page gap-8 px-4 py-12 sm:px-8 md:grid-cols-12">
            <div className="flex items-center gap-3 md:col-span-5 md:items-start">
              <Image
                src={logo}
                alt=""
                aria-hidden="true"
                width={64}
                height={64}
                className="size-12"
              />
              <div>
                <p className="m-0 font-bold text-foreground-emphasis">
                  Rolling Oaks Daylilies
                </p>
                <p className="m-0 text-meta text-muted-foreground">
                  AHS Display Garden
                </p>
              </div>
            </div>
            <nav aria-label="Footer" className="md:col-span-3">
              <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-2 p-0 text-meta md:grid-cols-1 [&_a]:text-muted-foreground [&_a:hover]:text-foreground-emphasis">
                <li><Link href="/catalog/for-sale">For Sale</Link></li>
                <li><Link href="/catalogs">View Catalogs</Link></li>
                <li><Link href="/catalog/search">Search</Link></li>
                <li><Link href="/cart">Cart</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </nav>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-meta md:col-span-4 [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2.5 [&_a]:text-muted-foreground [&_a:hover]:text-foreground-emphasis [&_svg]:text-base [&_svg]:text-subtle-foreground">
              <li>
                <a href="tel:+1-601-590-1349">
                  <Phone aria-hidden="true" className="shrink-0 size-4" strokeWidth={1.75} />
                  1-601-590-1349
                </a>
              </li>
              <li>
                <a href="mailto:kaymcline@gmail.com">
                  <Mail aria-hidden="true" className="shrink-0 size-4" strokeWidth={1.75} />
                  kaymcline@gmail.com
                </a>
              </li>
              <li>
                <a href="https://goo.gl/maps/BKg722pc9e52" target="_blank" rel="noreferrer">
                  <MapPin aria-hidden="true" className="shrink-0 size-4" strokeWidth={1.75} />
                  Get Directions
                </a>
              </li>
            </ul>
          </div>
          <div className="mx-auto w-full max-w-page px-4 sm:px-8">
            <div className="border-t border-border py-5">
              <p className="m-0 text-fine text-subtle-foreground">
                Catalog powered by{" "}
                <a href="https://daylilycatalog.com" className="text-muted-foreground hover:text-foreground-emphasis">
                  DaylilyCatalog.com
                </a>
                , where you can build your own daylily website.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
