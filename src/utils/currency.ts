/**
 * Centralized currency formatting utility using Intl.NumberFormat.
 * Avoids hardcoding currency symbols across components.
 */

const formatters: Record<string, Intl.NumberFormat> = {
  INR: new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }),
  EUR: new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }),
  GBP: new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
};

export function formatCurrency(amount: number, currencyCode: 'INR' | 'EUR' | 'GBP' | 'USD' = 'INR'): string {
  const formatter = formatters[currencyCode] || formatters.INR;
  return formatter.format(amount);
}

export function formatCurrencyRange(
  min: number | undefined,
  max: number | undefined,
  currencyCode: 'INR' | 'EUR' | 'GBP' | 'USD' = 'INR'
): string {
  if (min === undefined && max === undefined) return '';
  if (min !== undefined && max !== undefined && min === max) {
    return formatCurrency(min, currencyCode);
  }
  if (min !== undefined && max !== undefined) {
    return `${formatCurrency(min, currencyCode)} – ${formatCurrency(max, currencyCode)}`;
  }
  if (max !== undefined) {
    return `Up to ${formatCurrency(max, currencyCode)}`;
  }
  if (min !== undefined) {
    return `From ${formatCurrency(min, currencyCode)}`;
  }
  return '';
}
