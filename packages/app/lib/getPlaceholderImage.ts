export const getPlaceholderImageUrl = (seed?: string | null) =>
  `https://source.boringavatars.com/marble/400/${
    seed || (Math.random() + 1).toString(36).substring(7)
  }?square=true&colors=184b07,29661b,22262a,353b41,22262a,22262a`;
