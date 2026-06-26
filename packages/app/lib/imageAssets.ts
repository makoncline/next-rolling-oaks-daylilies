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
  originalUrl: string | null;
  order: number;
};

export type ResolvedPublicImage = {
  id: string;
  url: string;
  order: number;
};

const assetUrl = (asset: Pick<ResolvableImageAsset, "displayUrl" | "originalUrl">) =>
  asset.displayUrl ?? asset.originalUrl;

export const resolveUploadedListingImages = (
  images: ResolvableListingImage[],
  imageAssets: ResolvableImageAsset[]
): ResolvedPublicImage[] => {
  const assetsByLegacyImageId = new Map(
    imageAssets
      .filter((asset) => asset.legacyImageId)
      .map((asset) => [asset.legacyImageId, asset])
  );

  const legacyImages = images.map((image) => {
    const asset = assetsByLegacyImageId.get(image.id);

    return {
      id: image.id,
      url: asset ? assetUrl(asset) ?? image.url : image.url,
      order: image.order,
    };
  });

  const directAssetImages = imageAssets
    .filter((asset) => !asset.legacyImageId)
    .map((asset) => {
      const url = assetUrl(asset);

      return url
        ? {
            id: asset.id,
            url,
            order: asset.order,
          }
        : null;
    })
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
  const generatedUrl = generatedAsset ? assetUrl(generatedAsset) : null;

  if (generatedAsset && generatedUrl) {
    return {
      id: generatedAsset.id,
      url: generatedUrl,
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
