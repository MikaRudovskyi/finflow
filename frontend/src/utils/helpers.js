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

export const CAT_TRANSLATIONS = {
  'Зарплата':   { en: 'Salary',        ru: 'Зарплата',     ja: '給料',        fi: 'Palkka'        },
  'Фріланс':    { en: 'Freelance',     ru: 'Фриланс',      ja: 'フリーランス',  fi: 'Freelance'     },
  'Інвестиції': { en: 'Investments',   ru: 'Инвестиции',   ja: '投資',         fi: 'Sijoitukset'   },
  'Подарунок':  { en: 'Gift',          ru: 'Подарок',      ja: 'ギフト',       fi: 'Lahja'         },
  'Продукти':   { en: 'Groceries',     ru: 'Продукты',     ja: '食料品',       fi: 'Ruokaostokset' },
  'Транспорт':  { en: 'Transport',     ru: 'Транспорт',    ja: '交通',         fi: 'Liikenne'      },
  'Комунальні': { en: 'Utilities',     ru: 'Коммунальные', ja: '光熱費',       fi: 'Laskut'        },
  'Розваги':    { en: 'Entertainment', ru: 'Развлечения',  ja: '娯楽',         fi: 'Viihde'        },
  "Здоров'я":   { en: 'Health',        ru: 'Здоровье',     ja: '健康',         fi: 'Terveys'       },
  'Ресторани':  { en: 'Restaurants',   ru: 'Рестораны',    ja: 'レストラン',    fi: 'Ravintolat'    },
  'Одяг':       { en: 'Clothing',      ru: 'Одежда',       ja: '衣類',         fi: 'Vaatteet'      },
  'Освіта':     { en: 'Education',     ru: 'Образование',  ja: '教育',         fi: 'Koulutus'      },
  'Інше':       { en: 'Other',         ru: 'Другое',       ja: 'その他',       fi: 'Muut'          },
};

export function translateCategory(name, language) {
  if (!name) return name;
  if (!language || language === 'ua') return name;
  return CAT_TRANSLATIONS[name]?.[language] || name;
}

export function catColor(name) { return CAT_META[name]?.color || '#9ca3af'; }
export function catIcon(name)  { return CAT_META[name]?.icon  || '📦'; }

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  window.URL.revokeObjectURL(url);
}