import React from "react";
import { Breadcrumbs } from "components/breadcrumbs";
import { Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Layout from "../components/layout";
import { useCart } from "components/cart";
import { ImageDisplay } from "components/ImageDisplay";
import LilyCard, { InCart } from "components/lilyCard";
import { getImageUrls } from "components/Image";
import {
  Button,
  Heading,
} from "components/ui";
import type { AhsDisplay } from "../lib/cultivarDisplay";
import {
  getCatalogListings,
  getPublicSnapshot,
  type PublicImage,
  type PublicListingCard,
  type PublicSnapshot,
} from "../lib/publicSnapshot";
import { formatCurrency, formatShortDate } from "../lib/format";
import { cacheAtEdge } from "lib/cdnCache";

const traitLabels: Partial<Record<keyof AhsDisplay, string>> = {
  hybridizer: "Hybridizer",
  year: "Year",
  parentage: "Parentage",
  ploidy: "Ploidy",
  scapeHeight: "Scape height",
  color: "Color",
  bloomHabit: "Bloom habit",
  bloomSeason: "Bloom season",
  bloomSize: "Bloom size",
  branches: "Branches",
  budcount: "Bud count",
  flower: "Flower",
  foliage: "Foliage",
  foliageType: "Foliage type",
  form: "Form",
  fragrance: "Fragrance",
  sculpting: "Sculpting",
  seedlingNum: "Seedling #",
};

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

type DisplayListing = PublicListingCard;

type RelatedListings = {
  heading: string;
  href: string;
  linkLabel: string;
  listings: DisplayListing[];
};

type Props = {
  listing: DisplayListing;
  /** Lowercased parent name to listing slug, for parents that are in this catalog. */
  parentLinks: Record<string, string>;
  related: RelatedListings | null;
};

const LilyTemplate = ({ listing, parentLinks, related }: Props) => {
  const description = `${
    (listing.description ? `Description: ${listing.description.trim()}` : "") +
    (listing.price ? `, Price: ${listing.price}` : ", Price: Display only") +
    objectKeys(traitLabels)
      .map((trait) => {
        if (listing.ahsListing && getKeyValue(listing.ahsListing, trait)) {
          return `${getKeyValue(traitLabels, trait)}: ${getKeyValue(
            listing.ahsListing,
            trait
          )}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(", ")
  }, Updated: ${formatDistanceToNow(new Date(listing.updatedAt), {
    addSuffix: true,
  })}`.substring(0, 160);
  const title = `${listing.title} Daylily`;
  const {
    title: name,
    price,
    description: publicNote,
    updatedAt,
    ahsListing: ahsData,
    images,
    lists,
  } = listing;
  const listName = lists[0]?.title;
  const listSlug = lists[0]?.slug;
  const { addOrUpdateProduct, getQuantity } = useCart();
  const inCart = getQuantity(listing.id);
  const [justAdded, setJustAdded] = React.useState(false);
  // The phone bar appears only once the inline price and button scroll above
  // the screen, so price and Add never show twice at once.
  const purchaseRef = React.useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = React.useState(false);
  React.useEffect(() => {
    setShowBar(false);
    const row = purchaseRef.current;
    if (!row) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [listing.id, price]);
  React.useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [justAdded]);
  const addToCart = () => {
    if (!cartItem) return;
    addOrUpdateProduct(cartItem);
    setJustAdded(true);
  };

  const allImages: PublicImage[] =
    images.length > 0
      ? images
      : ahsData?.ahsImageUrl
      ? [
          {
            id: `${listing.id}:ahs-fallback`,
            url: ahsData.ahsImageUrl,
            order: 0,
          },
        ]
      : [];

  const image = allImages.length > 0 ? allImages[0].url : "";
  const cartItem = listing.price && {
    id: listing.id,
    name: listing.title,
    price: listing.price,
    image: allImages[0] ? getImageUrls(allImages[0]).thumb : null,
  };

  return (
    <Layout phoneActionBar={Boolean(cartItem)}>
      <Head>
        <title key="title">{title}</title>
        <meta property="og:title" content={title} key="og:title" />
        <meta
          name="description"
          content={description.substring(0, 160)}
          key="description"
        />
        <meta
          property="og:description"
          content={description.substring(0, 160)}
          key="og:description"
        />
        <meta property="og:type" content="article" key="og:type" />
        <meta property="og:image" content={image} key="og:image" />
        <meta
          name="og:image:alt"
          content={`${title} image`}
          key="og:image:alt"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
          key="twitter:card"
        />
        <meta
          name="twitter:image:alt"
          content={`${title} image`}
          key="twitter:image:alt"
        />
      </Head>
      <Breadcrumbs
        items={[
          { label: "Catalogs", href: "/catalogs" },
          ...(listName && listSlug
            ? [{ label: listName, href: `/catalog/${listSlug}` }]
            : []),
          { label: name },
        ]}
      />
      {/* Title and details share one column beside the photo, so a tall photo
          never opens a gap between them. On phones the column dissolves and
          the order becomes title, photo, details. */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start lg:gap-x-12">
        <div className="order-2 w-full md:order-none md:sticky md:top-28 md:col-start-1 md:row-start-1">
          <ImageDisplay images={allImages} title={name} />
        </div>
        <div className="contents md:col-start-2 md:row-start-1 md:flex md:min-w-0 md:flex-col md:gap-6">
          <div className="order-1 flex flex-col gap-3 md:order-none">
            <Heading level={1}>{name}</Heading>
            {ahsData && (ahsData.hybridizer || ahsData.year) && (
              <p className="-mt-1 m-0 text-muted-foreground">
                {[ahsData.hybridizer, ahsData.year].filter(Boolean).join(", ")}
              </p>
            )}
            {price ? (
              <div ref={purchaseRef} className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <p className="m-0 text-heading-2 font-bold tabular-nums text-foreground-emphasis">
                  {formatCurrency(price)}
                </p>
                {cartItem && (
                  <AddButton title={listing.title} justAdded={justAdded} onClick={addToCart} />
                )}
                {inCart > 0 && (
                  <span className="flex items-center gap-3">
                    <InCart quantity={inCart} />
                    <Link href="/cart" className="text-meta font-semibold text-foreground-emphasis underline underline-offset-4 hover:text-link-hover">
                      View cart
                    </Link>
                  </span>
                )}
                <span role="status" className="sr-only">
                  {justAdded ? `Added ${listing.title} to Cart` : ""}
                </span>
              </div>
            ) : (
              <p className="m-0 text-muted-foreground">Display only</p>
            )}
            {cartItem && showBar && (
              <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 py-3 md:hidden">
                <div className="mx-auto flex max-w-page items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-meta text-muted-foreground">{name}</span>
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-bold tabular-nums text-foreground-emphasis">
                        {formatCurrency(cartItem.price)}
                      </span>
                      {inCart > 0 && <InCart quantity={inCart} />}
                    </span>
                  </div>
                  <AddButton title={listing.title} justAdded={justAdded} onClick={addToCart} />
                </div>
              </div>
            )}
          </div>
          <div className="order-3 flex w-full min-w-0 flex-col gap-6 md:order-none">
            {publicNote && (
              <p className="m-0 text-foreground-emphasis">{publicNote}</p>
            )}
            {updatedAt && (
              <p className="m-0 text-meta text-subtle-foreground">
                Updated {formatShortDate(updatedAt)}
              </p>
            )}
            {ahsData && (
              <section className="flex flex-col rounded-lg border-stroke border-card-border bg-card p-5">
                <Heading level={2}>
                  <span className="block text-heading-4">Details</span>
                </Heading>
                <dl className="m-0 mt-4 flex flex-wrap gap-x-6 gap-y-4">
                  {getDetailFields(ahsData).map((field) => (
                    <div key={field.label} className="flex min-w-0 max-w-full flex-col gap-0.5">
                      <dt className="text-meta text-muted-foreground">
                        {field.label}
                      </dt>
                      <dd className="m-0 break-words text-foreground-emphasis">
                        {field.key === "parentage" ? (
                          <Parentage text={field.value} links={parentLinks} />
                        ) : (
                          field.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>
      {related && (
        <section aria-labelledby="related-heading" className="mt-10 flex flex-col gap-6 border-t border-border pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Heading level={2} id="related-heading">
              {related.heading}
            </Heading>
            <Link href={related.href} className="font-semibold text-foreground-emphasis underline-offset-4 hover:underline">
              {related.linkLabel}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.listings.map((item) => (
              <LilyCard key={item.id} lily={item} headingLevel={3} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default LilyTemplate;

function AddButton({
  title,
  justAdded,
  onClick,
}: {
  title: string;
  justAdded: boolean;
  onClick: () => void;
}) {
  return (
    <Button styleType="primary" aria-label={`Add ${title} to Cart`} onClick={onClick}>
      {justAdded ? "Added" : "Add to Cart"}
      {justAdded ? (
        <Check aria-hidden="true" className="shrink-0 size-4.5" />
      ) : (
        <ShoppingCart aria-hidden="true" className="shrink-0 size-4.5" />
      )}
    </Button>
  );
}

const PARENTAGE_DELIMITER = /(\(|\)|×|\s+x\s+)/i;

/** Parent names that are also in this catalog become links; the rest stays text. */
function Parentage({ text, links }: { text: string; links: Record<string, string> }) {
  return (
    <>
      {text.split(PARENTAGE_DELIMITER).map((part, index) => {
        const slug = links[part.trim().toLowerCase()];
        if (!slug) return <React.Fragment key={index}>{part}</React.Fragment>;
        const [, before, name, after] = part.match(/^(\s*)(.*?)(\s*)$/) ?? ["", "", part, ""];
        return (
          <React.Fragment key={index}>
            {before}
            <Link href={`/${slug}`} className="text-link underline underline-offset-4 hover:text-link-hover">
              {name}
            </Link>
            {after}
          </React.Fragment>
        );
      })}
    </>
  );
}

const getParentNames = (parentage: string | null | undefined) =>
  (parentage ?? "")
    .split(PARENTAGE_DELIMITER)
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== "x" && !PARENTAGE_DELIMITER.test(part));

function getParentLinks(snapshot: PublicSnapshot, listing: DisplayListing) {
  const names = new Set(getParentNames(listing.ahsListing?.parentage).map((name) => name.toLowerCase()));
  const links: Record<string, string> = {};
  if (names.size === 0) return links;
  for (const card of Object.values(snapshot.cardsById)) {
    const key = card.title.trim().toLowerCase();
    if (names.has(key) && card.slug !== listing.slug && !links[key]) links[key] = card.slug;
  }
  return links;
}

const RELATED_COUNT = 4;

const relatedRank = (card: DisplayListing) =>
  (card.images.length > 0 ? 2 : 0) + (card.price ? 1 : 0);

function pickRelated(cards: DisplayListing[], listing: DisplayListing) {
  return cards
    .filter((card) => card.id !== listing.id)
    .map((card, index) => ({ card, index }))
    .sort(
      (a, b) =>
        relatedRank(b.card) - relatedRank(a.card) ||
        b.card.updatedAt.localeCompare(a.card.updatedAt) ||
        a.index - b.index
    )
    .map(({ card }) => card);
}

/** Same hybridizer first; otherwise the listing's own catalog. */
function getRelatedListings(snapshot: PublicSnapshot, listing: DisplayListing): RelatedListings | null {
  const hybridizer = listing.ahsListing?.hybridizer?.trim();
  if (hybridizer) {
    const matches = pickRelated(
      getCatalogListings(snapshot, "all").filter(
        (card) => card.ahsListing?.hybridizer?.trim().toLowerCase() === hybridizer.toLowerCase()
      ),
      listing
    );
    if (matches.length > 0) {
      return {
        heading: `More by ${hybridizer}`,
        href: `/catalog/search?hybridizer=${encodeURIComponent(hybridizer)}`,
        linkLabel: `See all ${matches.length + 1}`,
        listings: matches.slice(0, RELATED_COUNT),
      };
    }
  }
  const list = listing.lists[0];
  if (!list) return null;
  const matches = pickRelated(getCatalogListings(snapshot, list.slug), listing);
  if (matches.length === 0) return null;
  return {
    heading: `More from ${list.title.trim()}`,
    href: `/catalog/${list.slug}`,
    linkLabel: "View catalog",
    listings: matches.slice(0, RELATED_COUNT),
  };
}

// Each field takes its natural width and wraps in reading order.
const detailKeys: Array<keyof AhsDisplay> = [
  "bloomSize", "scapeHeight", "bloomSeason", "form", "ploidy", "foliageType",
  "rebloom", "bloomHabit", "fragrance", "budcount", "branches", "flower",
  // Hybridizer and year already sit under the title.
  "sculpting", "foliage", "seedlingNum", "parentage", "color",
];

const formatTraitValue = (value: AhsDisplay[keyof AhsDisplay]) =>
  typeof value === "boolean"
    ? value
      ? "Yes"
      : "No"
    : String(value).split("|").join(" / ");

function getDetailFields(ahsData: AhsDisplay) {
  return detailKeys
    .filter((key) => typeof ahsData[key] === "boolean" || Boolean(ahsData[key]))
    .map((key) => ({
      key,
      label: key === "flower" ? "Flower type" : traitLabels[key] ?? "Rebloom",
      value: formatTraitValue(ahsData[key]),
    }));
}

export const getServerSideProps: GetServerSideProps<Props, { listing: string }> = async (context) => {
  const slug = context.params?.listing;
  if (!slug) {
    return {
      notFound: true,
    };
  }

  const snapshot = await getPublicSnapshot();
  const listing = snapshot.detailsBySlug[slug];

  if (!listing) {
    return {
      notFound: true,
    };
  }

  cacheAtEdge(context.res);
  return {
    props: {
      listing,
      parentLinks: getParentLinks(snapshot, listing),
      related: getRelatedListings(snapshot, listing),
    },
  };
};
