# SQLite Database Migration

This application has been migrated from PostgreSQL to SQLite for easier local development.

## Key Changes

1. **Schema Changes**:

   - `ahs_data` → `AhsListing`
   - `lilies` → `Listing`
   - `lists` → `List`
   - `users` → `User`

2. **Field Changes**:

   - Snake case to camel case (e.g., `user_id` → `userId`, `updated_at` → `updatedAt`)
   - Renamed some fields (e.g., `name` → `title` in Listing)
   - ID fields are now strings (CUID) instead of integers

3. **Relationship Changes**:
   - Many-to-many between `Listing` and `List` is now more explicit
   - Image handling: changed from array fields to related Image records
   - Authentication: Using Clerk instead of custom auth

## Configuration

The SQLite database is configured in `.env`:

```
LOCAL_DATABASE_URL=file:./db-dev.sqlite
```

## Development

The app now uses the SQLite database by default. When running the app:

```
npm run dev   # Automatically generates SQLite client first
```

## Type Adjustments

When working with database models, use the types from `prisma/generated/sqlite-client` instead of `@prisma/client`. For example:

```typescript
import {
  AhsListing,
  Listing,
  List,
  Image,
} from "../prisma/generated/sqlite-client";
```

## Known Linter Issues

Some TypeScript errors might appear for properties that SQLite expects in a different format. Common issues include:

1. `userId`: Must be a string, not a number (we've updated siteConfig.ts)
2. Property naming: `title` instead of `name`, `description` instead of `public_note`, etc.
3. Nested property access: `ahsListing` instead of `ahs_data`
4. Image handling: `images` array with `url` properties instead of `img_url` array
