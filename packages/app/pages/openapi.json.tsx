import type { GetServerSideProps } from "next";
import { siteConfig } from "../siteConfig";

const OpenApiJson = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const schema = {
    openapi: "3.1.0",
    info: {
      title: "Rolling Oaks Daylilies Public Catalog API",
      version: "1.0.0",
      description:
        "Public API for discovering Rolling Oaks Daylilies catalog data and submitting customer inquiries. Catalog data is public and read-only. Ordering and availability still require direct confirmation.",
    },
    servers: [{ url: siteConfig.baseUrl }],
    paths: {
      "/api/catalogs": {
        get: {
          summary: "List public catalogs",
          responses: {
            "200": {
              description: "Public catalog summaries",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/api/catalog/{catalog}": {
        get: {
          summary: "List public listings in a catalog",
          parameters: [
            {
              name: "catalog",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 100, default: 24 },
            },
            ...[
              "name",
              "list",
              "char",
              "hybridizer",
              "year",
              "ploidy",
              "color",
              "form",
              "foliageType",
              "note",
              "fragrance",
              "bloomSize",
              "scapeHeight",
              "bloomSeason",
              "price",
            ].map((name) => ({
              name,
              in: "query",
              schema: { type: "string" },
            })),
          ],
          responses: {
            "200": {
              description: "Paginated public listing cards",
              content: { "application/json": { schema: { type: "object" } } },
            },
            "404": { description: "Catalog not found" },
          },
        },
      },
      "/api/listings/{listing}": {
        get: {
          summary: "Get public listing details",
          parameters: [
            {
              name: "listing",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Public listing details",
              content: { "application/json": { schema: { type: "object" } } },
            },
            "404": { description: "Listing not found" },
          },
        },
      },
      "/api/forms": {
        post: {
          summary: "Submit a contact or cart availability inquiry",
          description:
            "Sends an email inquiry to Rolling Oaks Daylilies. Agents should only call this endpoint after explicit user review and confirmation.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["formName", "name", "email"],
                  properties: {
                    formName: { enum: ["contact", "cart"] },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    message: { type: "string" },
                    cartText: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Inquiry sent" },
            "400": { description: "Invalid form submission" },
            "500": { description: "Could not send message" },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "Check public app and snapshot health",
          responses: {
            "200": {
              description: "Service health",
              content: { "application/json": { schema: { type: "object" } } },
            },
            "503": { description: "Service unavailable" },
          },
        },
      },
    },
  };

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/vnd.oai.openapi+json");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(JSON.stringify(schema));
  res.end();

  return { props: {} };
};

export default OpenApiJson;
