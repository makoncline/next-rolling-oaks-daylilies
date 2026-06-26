import type { Prisma } from "../prisma/generated/sqlite-client";

export const listingImageAssetInclude = {
  where: {
    kind: "listing",
    status: "ready",
  },
  orderBy: { order: "asc" },
} satisfies Prisma.ImageAssetFindManyArgs;

export const generatedCultivarImageAssetInclude = {
  where: {
    kind: "cultivar",
    status: "ready",
  },
  orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  take: 1,
} satisfies Prisma.ImageAssetFindManyArgs;

export type ResolvableListingImage = {
  id: string;
  url: string;
  order: number;
};

export type ResolvableImageAsset = {
  id: string;
  legacyImageId: string | null;
  displayUrl: string | null;
  thumbUrl: string | null;
  blurUrl: string | null;
  order: number;
};

export type ResolvedPublicImage = {
  id: string;
  url: string;
  thumbUrl?: string | null;
  blurUrl?: string | null;
  order: number;
};

const isPublicDisplayUrl = (url: string) => {
  try {
    return new URL(url).hostname === "media.daylilycatalog.com";
  } catch {
    return false;
  }
};

const assetToPublicImage = (
  asset: ResolvableImageAsset,
  id = asset.id,
  order = asset.order
): ResolvedPublicImage | null => {
  if (!asset.displayUrl) return null;

  return {
    id,
    url: asset.displayUrl,
    thumbUrl: asset.thumbUrl ?? asset.displayUrl,
    blurUrl: asset.blurUrl,
    order,
  };
};

export const resolveUploadedListingImages = (
  images: ResolvableListingImage[],
  imageAssets: ResolvableImageAsset[]
): ResolvedPublicImage[] => {
  const assetsByLegacyImageId = new Map(
    imageAssets
      .filter((asset) => asset.legacyImageId)
      .map((asset) => [asset.legacyImageId, asset])
  );

  const legacyImages = images
    .map((image) => {
      const asset = assetsByLegacyImageId.get(image.id);
      const assetImage = asset
        ? assetToPublicImage(asset, image.id, image.order)
        : null;

      if (assetImage) {
        return assetImage;
      }

      if (!isPublicDisplayUrl(image.url)) {
        return null;
      }

      return {
        id: image.id,
        url: image.url,
        order: image.order,
      };
    })
    .filter(Boolean) as ResolvedPublicImage[];

  const directAssetImages = imageAssets
    .filter((asset) => !asset.legacyImageId)
    .map((asset) => assetToPublicImage(asset))
    .filter(Boolean) as ResolvedPublicImage[];

  return [...legacyImages, ...directAssetImages].sort(
    (left, right) => left.order - right.order
  );
};

export const resolveCultivarFallbackImage = (
  listingId: string,
  generatedAssets: ResolvableImageAsset[],
  fallbackUrl?: string | null
): ResolvedPublicImage | null => {
  const generatedAsset = generatedAssets[0];
  const generatedImage = generatedAsset
    ? assetToPublicImage(generatedAsset)
    : null;

  if (generatedImage) {
    return {
      ...generatedImage,
      order: 0,
    };
  }

  if (fallbackUrl) {
    return {
      id: `${listingId}:cultivar-fallback`,
      url: fallbackUrl,
      order: 0,
    };
  }

  return null;
};

export const resolveListingPublicImages = ({
  listingId,
  images,
  imageAssets,
  cultivarImageAssets,
  cultivarFallbackUrl,
}: {
  listingId: string;
  images: ResolvableListingImage[];
  imageAssets: ResolvableImageAsset[];
  cultivarImageAssets: ResolvableImageAsset[];
  cultivarFallbackUrl?: string | null;
}): ResolvedPublicImage[] => {
  const uploadedImages = resolveUploadedListingImages(images, imageAssets);

  if (uploadedImages.length > 0) {
    return uploadedImages;
  }

  const cultivarImage = resolveCultivarFallbackImage(
    listingId,
    cultivarImageAssets,
    cultivarFallbackUrl
  );

  return cultivarImage ? [cultivarImage] : [];
};
