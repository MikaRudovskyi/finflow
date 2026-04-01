import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'ua', countryCode: 'ua', label: 'Українська', useFlag: true  },
  { code: 'en', countryCode: 'gb', label: 'English',    useFlag: true  },
  { code: 'ja', countryCode: 'jp', label: '日本語',      useFlag: true  },
  { code: 'fi', countryCode: 'fi', label: 'Suomi',      useFlag: true  },
  { code: 'ru', countryCode: null, label: 'Русский',    useFlag: false },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(v => !v)}>
        {current.useFlag
          ? <span className={`fi fi-${current.countryCode}`} style={{ width: 20, height: 15, display: 'inline-block' }} />
          : <span style={{ fontSize: 16, lineHeight: 1 }}>🌐</span>
        }
        <span className={styles.label}>{current.label}</span>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>▾</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`${styles.option} ${lang.code === i18n.language ? styles.active : ''}`}
              onClick={() => select(lang.code)}
            >
              {lang.useFlag
                ? <span className={`fi fi-${lang.countryCode}`} style={{ width: 20, height: 15, display: 'inline-block' }} />
                : <span style={{ fontSize: 16, lineHeight: 1 }}>🌐</span>
              }
              <span>{lang.label}</span>
              {lang.code === i18n.language && <span className={styles.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
