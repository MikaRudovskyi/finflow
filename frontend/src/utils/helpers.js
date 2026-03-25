export const CURRENCY = { UAH: '₴', USD: '$', EUR: '€', GBP: '£' };

export function fmt(amount, currency = 'UAH') {
  const sym = CURRENCY[currency] || '₴';
  return sym + Number(amount).toLocaleString('uk-UA', { minimumFractionDigits: 0 });
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function fmtShortDate(d) {
  return new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit', month: 'short',
  });
}

export const CAT_META = {
  'Зарплата':   { color: '#2dd4a0', icon: '💼' },
  'Фріланс':    { color: '#5b9cf6', icon: '💻' },
  'Інвестиції': { color: '#a78bfa', icon: '📈' },
  'Подарунок':  { color: '#f5b942', icon: '🎁' },
  'Продукти':   { color: '#f97070', icon: '🛒' },
  'Транспорт':  { color: '#f5b942', icon: '🚌' },
  'Комунальні': { color: '#a78bfa', icon: '💡' },
  'Розваги':    { color: '#fb923c', icon: '🎬' },
  "Здоров'я":   { color: '#34d399', icon: '💊' },
  'Ресторани':  { color: '#f472b6', icon: '🍽️' },
  'Одяг':       { color: '#60a5fa', icon: '👕' },
  'Освіта':     { color: '#818cf8', icon: '📚' },
  'Інше':       { color: '#9ca3af', icon: '📦' },
};

export function catColor(name) { return CAT_META[name]?.color || '#9ca3af'; }
export function catIcon(name)  { return CAT_META[name]?.icon  || '📦'; }

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  window.URL.revokeObjectURL(url);
}