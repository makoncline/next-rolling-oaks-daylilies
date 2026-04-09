
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.5.0
 * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
 */
Prisma.prismaVersion = {
  client: "6.5.0",
  engine: "173f8d54f8d52e692c7e27e72a88314ec7aeff60"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.AhsListingScalarFieldEnum = {
  id: 'id',
  name: 'name',
  hybridizer: 'hybridizer',
  year: 'year',
  scapeHeight: 'scapeHeight',
  bloomSize: 'bloomSize',
  bloomSeason: 'bloomSeason',
  ploidy: 'ploidy',
  foliageType: 'foliageType',
  bloomHabit: 'bloomHabit',
  seedlingNum: 'seedlingNum',
  color: 'color',
  form: 'form',
  parentage: 'parentage',
  ahsImageUrl: 'ahsImageUrl',
  fragrance: 'fragrance',
  budcount: 'budcount',
  branches: 'branches',
  sculpting: 'sculpting',
  foliage: 'foliage',
  flower: 'flower',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CultivarReferenceScalarFieldEnum = {
  id: 'id',
  ahsId: 'ahsId',
  v2AhsCultivarId: 'v2AhsCultivarId',
  normalizedName: 'normalizedName',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.V2AhsCultivarScalarFieldEnum = {
  id: 'id',
  post_id: 'post_id',
  link_normalized_name: 'link_normalized_name',
  post_title: 'post_title',
  post_status: 'post_status',
  introduction_date: 'introduction_date',
  primary_hybridizer_id: 'primary_hybridizer_id',
  primary_hybridizer_name: 'primary_hybridizer_name',
  additional_hybridizers_ids: 'additional_hybridizers_ids',
  additional_hybridizers_names: 'additional_hybridizers_names',
  hybridizer_code_legacy: 'hybridizer_code_legacy',
  seedling_number: 'seedling_number',
  bloom_season_ids: 'bloom_season_ids',
  bloom_season_names: 'bloom_season_names',
  fragrance_ids: 'fragrance_ids',
  fragrance_names: 'fragrance_names',
  bloom_habit_ids: 'bloom_habit_ids',
  bloom_habit_names: 'bloom_habit_names',
  foliage_ids: 'foliage_ids',
  foliage_names: 'foliage_names',
  ploidy_ids: 'ploidy_ids',
  ploidy_names: 'ploidy_names',
  scape_height_in: 'scape_height_in',
  bloom_size_in: 'bloom_size_in',
  bud_count: 'bud_count',
  branches: 'branches',
  color: 'color',
  rebloom: 'rebloom',
  flower_form_ids: 'flower_form_ids',
  flower_form_names: 'flower_form_names',
  double_percentage: 'double_percentage',
  polymerous_percentage: 'polymerous_percentage',
  spider_ratio: 'spider_ratio',
  petal_length_in: 'petal_length_in',
  petal_width_in: 'petal_width_in',
  unusual_forms_ids: 'unusual_forms_ids',
  unusual_forms_names: 'unusual_forms_names',
  parentage: 'parentage',
  images_count: 'images_count',
  last_updated: 'last_updated',
  image_url: 'image_url',
  awards_json: 'awards_json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  slug: 'slug',
  price: 'price',
  description: 'description',
  privateNote: 'privateNote',
  ahsId: 'ahsId',
  cultivarReferenceId: 'cultivarReferenceId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  slug: 'slug',
  logoUrl: 'logoUrl',
  description: 'description',
  content: 'content',
  location: 'location',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImageScalarFieldEnum = {
  id: 'id',
  url: 'url',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  userProfileId: 'userProfileId',
  listingId: 'listingId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkUserId: 'clerkUserId',
  stripeCustomerId: 'stripeCustomerId',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KeyValueScalarFieldEnum = {
  key: 'key',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  AhsListing: 'AhsListing',
  CultivarReference: 'CultivarReference',
  V2AhsCultivar: 'V2AhsCultivar',
  Listing: 'Listing',
  List: 'List',
  UserProfile: 'UserProfile',
  Image: 'Image',
  User: 'User',
  KeyValue: 'KeyValue'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/makon/dev/next-rolling-oaks-daylilies/packages/app/prisma/generated/sqlite-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "/Users/makon/dev/next-rolling-oaks-daylilies/packages/app/prisma/schema.sqlite.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../..",
  "clientVersion": "6.5.0",
  "engineVersion": "173f8d54f8d52e692c7e27e72a88314ec7aeff60",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlite",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "TURSO_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  output          = \"./generated/sqlite-client\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"sqlite\"\n  url      = env(\"TURSO_DATABASE_URL\")\n}\n\nmodel AhsListing {\n  id          String   @id @default(cuid())\n  name        String?\n  hybridizer  String?\n  year        String?\n  scapeHeight String?\n  bloomSize   String?\n  bloomSeason String?\n  ploidy      String?\n  foliageType String?\n  bloomHabit  String?\n  seedlingNum String?\n  color       String?\n  form        String?\n  parentage   String?\n  ahsImageUrl String?\n  fragrance   String?\n  budcount    String?\n  branches    String?\n  sculpting   String?\n  foliage     String?\n  flower      String?\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  cultivarReference CultivarReference?\n  lilies            Listing[]\n}\n\nmodel CultivarReference {\n  id              String   @id\n  ahsId           String?  @unique\n  v2AhsCultivarId String?  @unique\n  normalizedName  String?  @unique\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @updatedAt\n\n  ahsListing    AhsListing?    @relation(fields: [ahsId], references: [id], onDelete: SetNull)\n  listings      Listing[]\n  v2AhsCultivar V2AhsCultivar? @relation(fields: [v2AhsCultivarId], references: [id], onDelete: SetNull)\n\n  @@index([ahsId])\n  @@index([v2AhsCultivarId])\n}\n\nmodel V2AhsCultivar {\n  id                           String   @id\n  post_id                      String?\n  link_normalized_name         String?\n  post_title                   String?\n  post_status                  String?\n  introduction_date            String?\n  primary_hybridizer_id        String?\n  primary_hybridizer_name      String?\n  additional_hybridizers_ids   String?\n  additional_hybridizers_names String?\n  hybridizer_code_legacy       String?\n  seedling_number              String?\n  bloom_season_ids             String?\n  bloom_season_names           String?\n  fragrance_ids                String?\n  fragrance_names              String?\n  bloom_habit_ids              String?\n  bloom_habit_names            String?\n  foliage_ids                  String?\n  foliage_names                String?\n  ploidy_ids                   String?\n  ploidy_names                 String?\n  scape_height_in              Float?\n  bloom_size_in                Float?\n  bud_count                    Int?\n  branches                     Int?\n  color                        String?\n  rebloom                      Int?\n  flower_form_ids              String?\n  flower_form_names            String?\n  double_percentage            Float?\n  polymerous_percentage        Float?\n  spider_ratio                 Float?\n  petal_length_in              Float?\n  petal_width_in               Float?\n  unusual_forms_ids            String?\n  unusual_forms_names          String?\n  parentage                    String?\n  images_count                 Int?\n  last_updated                 String?\n  image_url                    String?\n  awards_json                  String?\n  createdAt                    DateTime @default(now())\n  updatedAt                    DateTime @updatedAt\n\n  cultivarReference CultivarReference?\n\n  @@index([post_id])\n  @@index([link_normalized_name])\n  @@index([post_title])\n  @@index([primary_hybridizer_name])\n}\n\nmodel Listing {\n  id                  String   @id @default(cuid())\n  userId              String\n  title               String\n  slug                String\n  price               Float?\n  description         String?\n  privateNote         String?\n  ahsId               String?\n  cultivarReferenceId String?\n  status              String?\n  createdAt           DateTime @default(now())\n  updatedAt           DateTime @updatedAt\n\n  images Image[]\n\n  ahsListing        AhsListing?        @relation(fields: [ahsId], references: [id])\n  cultivarReference CultivarReference? @relation(fields: [cultivarReferenceId], references: [id], onDelete: SetNull)\n  lists             List[]             @relation(\"ListToListing\")\n  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, slug])\n  @@index([ahsId])\n  @@index([cultivarReferenceId])\n  @@index([userId])\n  @@index([slug])\n}\n\nmodel List {\n  id          String    @id @default(cuid())\n  userId      String\n  title       String\n  description String?\n  status      String?\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n  listings    Listing[] @relation(\"ListToListing\")\n  user        User      @relation(fields: [userId], references: [id])\n\n  @@index([userId])\n}\n\nmodel UserProfile {\n  id          String   @id @default(cuid())\n  userId      String   @unique\n  title       String?\n  slug        String?  @unique\n  logoUrl     String?\n  description String?\n  content     String?\n  location    String?\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  images Image[]\n\n  @@index([slug])\n}\n\nmodel Image {\n  id        String   @id @default(cuid())\n  url       String\n  order     Int      @default(0)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  status    String?\n\n  userProfileId String?\n  listingId     String?\n\n  userProfile UserProfile? @relation(fields: [userProfileId], references: [id])\n  listing     Listing?     @relation(fields: [listingId], references: [id])\n\n  @@index([userProfileId])\n  @@index([listingId])\n}\n\nmodel User {\n  id               String       @id @default(cuid())\n  clerkUserId      String?      @unique\n  stripeCustomerId String?      @unique\n  role             String?      @default(\"USER\")\n  createdAt        DateTime     @default(now())\n  updatedAt        DateTime     @updatedAt\n  listings         Listing[]\n  lists            List[]\n  profile          UserProfile?\n}\n\nmodel KeyValue {\n  key       String   @id\n  value     String // Will store JSON stringified values\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n",
  "inlineSchemaHash": "43bd0ec525590f2754c9a09b7ed43e87c6f195500e0b30fd7e54fb3eca50ae11",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"AhsListing\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"hybridizer\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"year\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scapeHeight\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloomSize\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloomSeason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ploidy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"foliageType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloomHabit\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"seedlingNum\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"color\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"form\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ahsImageUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fragrance\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"budcount\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"branches\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sculpting\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"foliage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"flower\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"cultivarReference\",\"kind\":\"object\",\"type\":\"CultivarReference\",\"relationName\":\"AhsListingToCultivarReference\"},{\"name\":\"lilies\",\"kind\":\"object\",\"type\":\"Listing\",\"relationName\":\"AhsListingToListing\"}],\"dbName\":null},\"CultivarReference\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ahsId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"v2AhsCultivarId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"normalizedName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"ahsListing\",\"kind\":\"object\",\"type\":\"AhsListing\",\"relationName\":\"AhsListingToCultivarReference\"},{\"name\":\"listings\",\"kind\":\"object\",\"type\":\"Listing\",\"relationName\":\"CultivarReferenceToListing\"},{\"name\":\"v2AhsCultivar\",\"kind\":\"object\",\"type\":\"V2AhsCultivar\",\"relationName\":\"CultivarReferenceToV2AhsCultivar\"}],\"dbName\":null},\"V2AhsCultivar\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"post_id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"link_normalized_name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"post_title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"post_status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"introduction_date\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"primary_hybridizer_id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"primary_hybridizer_name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"additional_hybridizers_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"additional_hybridizers_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"hybridizer_code_legacy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"seedling_number\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloom_season_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloom_season_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fragrance_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fragrance_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloom_habit_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bloom_habit_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"foliage_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"foliage_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ploidy_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ploidy_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scape_height_in\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"bloom_size_in\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"bud_count\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"branches\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"color\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rebloom\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"flower_form_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"flower_form_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"double_percentage\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"polymerous_percentage\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"spider_ratio\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"petal_length_in\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"petal_width_in\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"unusual_forms_ids\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"unusual_forms_names\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"images_count\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"last_updated\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"image_url\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"awards_json\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"cultivarReference\",\"kind\":\"object\",\"type\":\"CultivarReference\",\"relationName\":\"CultivarReferenceToV2AhsCultivar\"}],\"dbName\":null},\"Listing\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"price\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"privateNote\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ahsId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"cultivarReferenceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"images\",\"kind\":\"object\",\"type\":\"Image\",\"relationName\":\"ImageToListing\"},{\"name\":\"ahsListing\",\"kind\":\"object\",\"type\":\"AhsListing\",\"relationName\":\"AhsListingToListing\"},{\"name\":\"cultivarReference\",\"kind\":\"object\",\"type\":\"CultivarReference\",\"relationName\":\"CultivarReferenceToListing\"},{\"name\":\"lists\",\"kind\":\"object\",\"type\":\"List\",\"relationName\":\"ListToListing\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ListingToUser\"}],\"dbName\":null},\"List\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"listings\",\"kind\":\"object\",\"type\":\"Listing\",\"relationName\":\"ListToListing\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ListToUser\"}],\"dbName\":null},\"UserProfile\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"logoUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"location\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UserToUserProfile\"},{\"name\":\"images\",\"kind\":\"object\",\"type\":\"Image\",\"relationName\":\"ImageToUserProfile\"}],\"dbName\":null},\"Image\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"url\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userProfileId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"listingId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userProfile\",\"kind\":\"object\",\"type\":\"UserProfile\",\"relationName\":\"ImageToUserProfile\"},{\"name\":\"listing\",\"kind\":\"object\",\"type\":\"Listing\",\"relationName\":\"ImageToListing\"}],\"dbName\":null},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"clerkUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stripeCustomerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"listings\",\"kind\":\"object\",\"type\":\"Listing\",\"relationName\":\"ListingToUser\"},{\"name\":\"lists\",\"kind\":\"object\",\"type\":\"List\",\"relationName\":\"ListToUser\"},{\"name\":\"profile\",\"kind\":\"object\",\"type\":\"UserProfile\",\"relationName\":\"UserToUserProfile\"}],\"dbName\":null},\"KeyValue\":{\"fields\":[{\"name\":\"key\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}
config.compilerWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    TURSO_DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['TURSO_DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.TURSO_DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

