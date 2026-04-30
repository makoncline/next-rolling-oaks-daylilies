const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const numberFormatter = new Intl.NumberFormat("en-US");

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "short",
  day: "numeric",
});

export const formatCurrency = (value: number | string) =>
  currencyFormatter.format(Number(value));

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatShortDate = (value: string | number | Date) =>
  shortDateFormatter.format(new Date(value));
