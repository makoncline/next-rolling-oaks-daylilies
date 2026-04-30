import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "./siteConfig";

const markdownPaths = new Set([
  "/",
  "/catalogs",
  "/catalog/all",
  "/catalog/search",
  "/catalog/for-sale",
  "/cart",
  "/blog",
  "/blog/dorothy-and-toto",
]);

const toTokenEstimate = (content: string) =>
  Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length * 1.3));

const getMarkdownForPath = (path: string) => {
  if (path.startsWith("/catalog/")) {
    return `# ${siteConfig.title}

Browse the Rolling Oaks Daylilies catalog.

## Useful Links

- [All Rolling Oaks Daylilies](${siteConfig.baseUrl}/catalog/all)
- [For Sale](${siteConfig.baseUrl}/catalog/for-sale)
- [Search the Catalog](${siteConfig.baseUrl}/catalog/search)
- [Catalog List](${siteConfig.baseUrl}/catalogs)

Catalog pages contain daylily listing cards with names, prices when available,
images, and links to detail pages for each cultivar.
`;
  }

  switch (path) {
    case "/catalogs":
      return `# Rolling Oaks Daylilies Catalogs

Browse daylily catalog groups, including plants for sale and the full Rolling
Oaks collection.

## Useful Links

- [For Sale](${siteConfig.baseUrl}/catalog/for-sale)
- [All Daylilies](${siteConfig.baseUrl}/catalog/all)
- [Search](${siteConfig.baseUrl}/catalog/search)
`;
    case "/cart":
      return `# Rolling Oaks Daylilies Cart

Review selected daylilies before contacting Rolling Oaks Daylilies to confirm
availability and ordering details.
`;
    case "/blog":
      return `# Rolling Oaks Daylilies Blog

- [Dorothy and Toto](${siteConfig.baseUrl}/blog/dorothy-and-toto)
`;
    case "/blog/dorothy-and-toto":
      return `# Dorothy and Toto

An overview of the Dorothy and Toto daylily, including its description,
background history, and awards.
`;
    default:
      return `# Rolling Oaks Daylilies

${siteConfig.description}

Rolling Oaks Daylilies is an AHS Display Garden offering named daylilies and
seedlings, with a hybridizing focus on double and white daylilies.

## Ordering

Customers can browse the catalog, add plants to a cart, and contact Rolling Oaks
Daylilies to confirm availability before payment.

## Useful Links

- [Catalogs](${siteConfig.baseUrl}/catalogs)
- [For Sale](${siteConfig.baseUrl}/catalog/for-sale)
- [Search the Catalog](${siteConfig.baseUrl}/catalog/search)
- [Sitemap](${siteConfig.baseUrl}/sitemap.xml)
- [Agent Guide](${siteConfig.baseUrl}/llms.txt)
`;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accept = request.headers.get("accept") || "";

  if (!accept.includes("text/markdown")) {
    return NextResponse.next();
  }

  if (!markdownPaths.has(pathname) && !pathname.startsWith("/catalog/")) {
    return NextResponse.next();
  }

  const markdown = getMarkdownForPath(pathname);

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Vary": "Accept",
      "X-Markdown-Tokens": String(toTokenEstimate(markdown)),
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/catalogs",
    "/catalog/:path*",
    "/cart",
    "/blog",
    "/blog/:path*",
  ],
};
