import type { Prisma } from "../prisma/generated/sqlite-client";

export type AhsDisplay = {
  name: string | null;
  hybridizer: string | null;
  year: string | null;
  scapeHeight: string | null;
  bloomSize: string | null;
  bloomSeason: string | null;
  ploidy: string | null;
  foliageType: string | null;
  bloomHabit: string | null;
  seedlingNum: string | null;
  color: string | null;
  form: string | null;
  parentage: string | null;
  ahsImageUrl: string | null;
  fragrance: string | null;
  budcount: string | null;
  branches: string | null;
  sculpting: string | null;
  foliage: string | null;
  flower: string | null;
};

type V2CultivarDisplaySource = {
  post_title?: string | null;
  introduction_date?: string | null;
  primary_hybridizer_name?: string | null;
  additional_hybridizers_names?: string | null;
  hybridizer_code_legacy?: string | null;
  seedling_number?: string | null;
  bloom_season_names?: string | null;
  fragrance_names?: string | null;
  bloom_habit_names?: string | null;
  foliage_names?: string | null;
  ploidy_names?: string | null;
  scape_height_in?: number | null;
  bloom_size_in?: number | null;
  bud_count?: number | null;
  branches?: number | null;
  color?: string | null;
  flower_form_names?: string | null;
  unusual_forms_names?: string | null;
  parentage?: string | null;
  image_url?: string | null;
};

type CultivarReferenceSource = {
  v2AhsCultivar?: V2CultivarDisplaySource | null;
} | null | undefined;

type ListingWithCultivarReference = {
  cultivarReference?: CultivarReferenceSource;
};

const trimToNull = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const extractYear = (value?: string | null) => {
  const trimmed = trimToNull(value);

  if (!trimmed) {
    return null;
  }

  const yearMatch = trimmed.match(/\b\d{4}\b/);
  return yearMatch ? yearMatch[0] : trimmed;
};

const formatNumber = (value?: number | null) => {
  if (value == null) {
    return null;
  }

  return Number.isInteger(value)
    ? `${value}`
    : `${value}`.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
};

const formatInches = (value?: number | null) => {
  const formatted = formatNumber(value);
  return formatted ? `${formatted}"` : null;
};

const pickHybridizer = (cultivar: V2CultivarDisplaySource) => {
  const namedHybridizers = [
    trimToNull(cultivar.primary_hybridizer_name),
    trimToNull(cultivar.additional_hybridizers_names),
  ].filter(Boolean) as string[];

  if (namedHybridizers.length > 0) {
    return Array.from(new Set(namedHybridizers)).join(", ");
  }

  return trimToNull(cultivar.hybridizer_code_legacy);
};

export const fullCultivarDisplaySelect = {
  post_title: true,
  introduction_date: true,
  primary_hybridizer_name: true,
  additional_hybridizers_names: true,
  hybridizer_code_legacy: true,
  seedling_number: true,
  bloom_season_names: true,
  fragrance_names: true,
  bloom_habit_names: true,
  foliage_names: true,
  ploidy_names: true,
  scape_height_in: true,
  bloom_size_in: true,
  bud_count: true,
  branches: true,
  color: true,
  flower_form_names: true,
  unusual_forms_names: true,
  parentage: true,
  image_url: true,
} satisfies Prisma.V2AhsCultivarSelect;

export const hybridizerCultivarDisplaySelect = {
  primary_hybridizer_name: true,
  additional_hybridizers_names: true,
  hybridizer_code_legacy: true,
} satisfies Prisma.V2AhsCultivarSelect;

export const fullCultivarReferenceInclude = {
  v2AhsCultivar: {
    select: fullCultivarDisplaySelect,
  },
} satisfies Prisma.CultivarReferenceInclude;

export const hybridizerCultivarReferenceInclude = {
  v2AhsCultivar: {
    select: hybridizerCultivarDisplaySelect,
  },
} satisfies Prisma.CultivarReferenceInclude;

export function parseLeadingNumber(value?: string | null) {
  const match = value?.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export function mapV2CultivarToAhsDisplay(
  cultivar?: V2CultivarDisplaySource | null
): AhsDisplay | null {
  if (!cultivar) {
    return null;
  }

  const unusualForm = trimToNull(cultivar.unusual_forms_names);
  const flowerForm = trimToNull(cultivar.flower_form_names);

  const display: AhsDisplay = {
    name: trimToNull(cultivar.post_title),
    hybridizer: pickHybridizer(cultivar),
    year: extractYear(cultivar.introduction_date),
    scapeHeight: formatInches(cultivar.scape_height_in),
    bloomSize: formatInches(cultivar.bloom_size_in),
    bloomSeason: trimToNull(cultivar.bloom_season_names),
    ploidy: trimToNull(cultivar.ploidy_names),
    foliageType: trimToNull(cultivar.foliage_names),
    bloomHabit: trimToNull(cultivar.bloom_habit_names),
    seedlingNum: trimToNull(cultivar.seedling_number),
    color: trimToNull(cultivar.color),
    form: unusualForm ?? flowerForm,
    parentage: trimToNull(cultivar.parentage),
    ahsImageUrl: trimToNull(cultivar.image_url),
    fragrance: trimToNull(cultivar.fragrance_names),
    budcount: formatNumber(cultivar.bud_count),
    branches: formatNumber(cultivar.branches),
    sculpting: null,
    foliage: null,
    flower: unusualForm ? flowerForm : null,
  };

  return Object.values(display).some(Boolean) ? display : null;
}

export function mapListingCultivarDisplay<T extends ListingWithCultivarReference>(
  listing: T
) {
  const { cultivarReference, ...rest } = listing;

  return {
    ...rest,
    ahsListing: mapV2CultivarToAhsDisplay(cultivarReference?.v2AhsCultivar),
  } as Omit<T, "cultivarReference"> & {
    ahsListing: AhsDisplay | null;
  };
}
