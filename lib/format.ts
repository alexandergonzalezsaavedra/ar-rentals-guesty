export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatWeekdayLong(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat('es-CO', { weekday: 'long' }).format(date),
  );
}

export function formatMonthShort(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat('es-CO', { month: 'short' })
      .format(date)
      .replace('.', ''),
  );
}

export function formatDateLong(date: Date): string {
  const month = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(
    date,
  );

  return `${formatWeekdayLong(date)} ${date.getDate()} de ${month} de ${date.getFullYear()}`;
}
