
export const formatDate = (isoDateString: string): string => {
  if (!isoDateString) return 'N/A';
  try {
    return new Date(isoDateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

export const formatMonthYear = (yyyymm: string): string => {
  if (!yyyymm || !/^\d{4}-\d{2}$/.test(yyyymm)) return 'N/A';
  const [year, month] = yyyymm.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency, // Consider making this configurable if needed
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};
