import React from "react";
import Layout from "../components/layout";
import ContactForm from "../components/contactForm";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";

import home1 from "../public/assets/home-1.jpeg";
import gardenBed from "../public/assets/orange-daylily-bed.jpg";
import gardenVisitor from "../public/assets/built-to-endure-garden-visitor.jpg";
import Link from "next/link";
import { Button, Heading } from "components/ui";
import { formatCurrency } from "../lib/format";
import { siteConfig } from "../siteConfig";
import LilyCard from "components/lilyCard";
import {
  getCatalogListings,
  getPublicSnapshot,
  type PublicListingCard,
} from "../lib/publicSnapshot";

const INTRODUCTIONS_SLUG = "kay-cline's-introductions";
// Fills full rows in both the two- and three-column layouts.
const FEATURED_COUNT = 6;

type Props = {
  introductions: PublicListingCard[];
  introductionCount: number;
};

const { minimumOrder, shipping } = siteConfig;

const orderTerms: [string, string][] = [
  ["Minimum order", formatCurrency(minimumOrder)],
  [
    "Shipping",
    `${formatCurrency(shipping.baseRate)} for up to ${shipping.baseItems} plants, ${formatCurrency(shipping.ratePerAdd)} for each additional plant`,
  ],
  ["Ships", "Monday or Tuesday by USPS Priority Mail, to arrive before the weekend"],
  ["Not shipped to", "California or outside the United States"],
  ["Payment", "Check payable to Kay Cline, PayPal, or Venmo (@Karen-Cline-13)"],
];

const Home: NextPage<Props> = ({ introductions, introductionCount }) => {
  return (
    <Layout
      hero={
        <section className="relative isolate">
          <div className="relative h-64 sm:h-80 md:absolute md:inset-0 md:h-full">
            <Image
              src={home1}
              placeholder="blur"
              alt="Daylilies in bloom at Rolling Oaks"
              preload
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-hero-mobile md:bg-hero-desktop" />
          </div>
          <div className="relative mx-auto w-full max-w-page px-4 pb-8 sm:px-8 md:flex md:min-h-120 md:items-center md:py-16">
            <div className="flex max-w-lg flex-col items-start gap-5">
              <Heading level={1}>
                <span className="block text-hero">Rolling Oaks Daylilies</span>
              </Heading>
              <p className="m-0 text-heading-3 leading-snug text-foreground-emphasis">
                Shop Our Stunning Collection of Named Daylilies and Seedlings.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button as="a" href="/catalog/for-sale" styleType="primary">
                  Shop Daylilies for Sale
                </Button>
                <Button as="a" href="/catalogs">
                  View Catalogs
                </Button>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <section
        aria-label="About Rolling Oaks Daylilies"
        className="grid items-center gap-10 md:grid-cols-12 lg:gap-14"
      >
        <div className="flex flex-col items-start gap-5 md:col-span-6 lg:col-span-5">
          <p className="m-0 text-foreground lg:text-lg">
            Welcome to Rolling Oaks Daylilies, where you’ll find a stunning
            collection of over 1000 named daylilies and unique seedlings. Our
            hybridizing focus is double and white daylilies, including a wide
            variety of forms like spiders and unusual doubles. As an AHS Display
            Garden, we pride ourselves on delivering the highest quality plants
            to our customers.
          </p>
        </div>
        <figure className="m-0 md:col-span-6 lg:col-span-7">
          <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-tile">
            <Image
              src={gardenBed}
              placeholder="blur"
              alt="A bed of ruffled orange daylilies in bloom"
              fill
              sizes="(min-width: 1200px) 680px, (min-width: 1024px) 56vw, (min-width: 768px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      </section>

      {introductions.length > 0 && (
        <section aria-labelledby="introductions-heading" className="mt-section flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="flex flex-col gap-2">
              <Heading level={2} id="introductions-heading">
                Kay Cline’s Introductions
              </Heading>
              <p className="m-0 text-muted-foreground">
                Daylilies hybridized and registered by Kay Cline, newest first.
              </p>
            </div>
            <Link
              href={`/catalog/${INTRODUCTIONS_SLUG}`}
              className="font-semibold text-foreground-emphasis underline-offset-4 hover:underline"
            >
              See all {introductionCount}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8">
            {introductions.map((listing) => (
              <LilyCard key={listing.id} lily={listing} headingLevel={3} variant="compact" />
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="ordering-heading"
        className="mt-section grid gap-8 md:grid-cols-12 md:gap-10 lg:gap-14"
      >
        <div className="flex flex-col gap-4 md:col-span-6 lg:col-span-7">
          <Heading level={2} id="ordering-heading">
            Ordering and Shipping
          </Heading>
          <p className="m-0">
            Add plants to your cart and send me the list. Nothing is charged
            online: I’ll confirm availability and reply with your total before
            you pay. You can also ask about plants marked display only.
          </p>
          <p className="m-0">
            List prices are for double fans, which sometimes share one root
            system and may include small dormant plants.
          </p>
          <p className="m-0 text-muted-foreground">
            Our mild southern climate is perfect for daylilies, but{" "}
            <a href="https://www.daylilies.org/ahs_dictionary/daylily_rust.html">
              daylily rust
            </a>{" "}
            can overwinter here, so I cannot guarantee rust-free plants.
          </p>
        </div>
        <dl className="m-0 divide-y divide-card-border self-start rounded-lg border-stroke border-card-border bg-card px-5 sm:px-6 md:col-span-6 lg:col-span-5">
          {orderTerms.map(([term, detail]) => (
            <div key={term} className="grid gap-0.5 py-3.5 sm:grid-cols-5 sm:gap-4">
              <dt className="text-meta text-muted-foreground sm:col-span-2">
                {term}
              </dt>
              <dd className="m-0 text-meta font-semibold text-foreground-emphasis sm:col-span-3">
                {detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Phones read intro, form, then photo; wider screens put the photo under the intro. */}
      <section
        aria-labelledby="contact-heading"
        className="mt-section grid gap-8 md:grid-cols-12 md:items-start md:gap-x-10 lg:gap-x-14"
      >
        <div className="flex flex-col gap-4 md:col-span-5 md:row-start-1 md:pt-2">
          <Heading level={2} id="contact-heading">
            Contact Me
          </Heading>
          <p className="m-0 text-muted-foreground">
            Ask about availability, a plant on the display-only list, or
            directions to the garden.
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 font-semibold">
            <li>
              <a href="tel:+1-601-590-1349">1-601-590-1349</a>
            </li>
            <li>
              <a href="mailto:kaymcline@gmail.com">kaymcline@gmail.com</a>
            </li>
          </ul>
          <div>
            <Button
              as="a"
              href="https://goo.gl/maps/BKg722pc9e52"
              target="_blank"
            >
              Get Directions
            </Button>
          </div>
        </div>
        <div
          id="contact"
          className="-mx-4 border-y border-card-border bg-card px-4 py-6 sm:mx-0 sm:rounded-lg sm:border-stroke sm:p-8 md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1"
        >
          <ContactForm cta="Send Me a Message" successPath="/thanks" />
        </div>
        <figure className="m-0 flex flex-col gap-2 md:col-span-5 md:row-start-2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-tile">
            <Image
              src={gardenVisitor}
              placeholder="blur"
              alt="A green lizard resting on a Built to Endure daylily bloom"
              fill
              sizes="(min-width: 1200px) 440px, (min-width: 768px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="text-meta text-muted-foreground">
            <Link
              href="/built-to-endure"
              className="font-semibold text-foreground-emphasis hover:underline"
            >
              Built to Endure
            </Link>
            , with a garden visitor
          </figcaption>
        </figure>
      </section>
    </Layout>
  );
};

export default Home;

const yearOf = (listing: PublicListingCard) =>
  parseInt(listing.ahsListing?.year || "", 10) || 0;

export const getServerSideProps: GetServerSideProps<Props> = async ({ res }) => {
  const snapshot = await getPublicSnapshot();
  const all = getCatalogListings(snapshot, INTRODUCTIONS_SLUG);
  // Photographed plants first, then newest registration, then for sale.
  const introductions = all
    .map((listing, index) => ({ listing, index }))
    .sort(
      (a, b) =>
        Number(b.listing.images.length > 0) - Number(a.listing.images.length > 0) ||
        yearOf(b.listing) - yearOf(a.listing) ||
        Number(Boolean(b.listing.price)) - Number(Boolean(a.listing.price)) ||
        a.index - b.index
    )
    .slice(0, FEATURED_COUNT)
    .map(({ listing }) => listing);

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return { props: { introductions, introductionCount: all.length } };
};
