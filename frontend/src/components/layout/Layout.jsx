import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { t }            = useTranslation();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'FF';

  const NavItem = ({ to, icon, label, end = false }) => (
    <NavLink
      to={to} end={end}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className={styles.shell}>

      <header className={styles.topbar}>
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <div className={styles.topbarLogo}>
          <span className={styles.logoIcon}><img src="logo.png" alt="FinFlow Logo" /></span> FinFlow
        </div>
        <div className={styles.topbarAvatar}>{initials}</div>
      </header>

      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><img src="logo.png" alt="FinFlow Logo" /></span>
          FinFlow
        </div>

        <span className={styles.sectionLabel}>{t('nav.main')}</span>
        <NavItem to="/"             icon="📊" label={t('nav.dashboard')}    end />
        <NavItem to="/transactions" icon="↕️" label={t('nav.transactions')}     />

        <div className={styles.spacer} />
        <span className={styles.sectionLabel}>{t('nav.planning')}</span>
        <NavItem to="/budgets" icon="🎯" label={t('nav.budgets')}  />
        <NavItem to="/savings" icon="🏦" label={t('nav.savings')}  />
        <NavItem to="/reports" icon="📈" label={t('nav.reports')}  />

        <div className={styles.spacer} />
        <NavItem to="/settings" icon="⚙️" label={t('nav.settings')} />

        <div className={styles.langWrap}>
          <LanguageSwitcher />
        </div>

        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'User'}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title={t('common.logout')}>⏻</button>
        </div>
      </nav>

      <div className={styles.content}>
        <main className={styles.main}>
          <Outlet />
        </main>
        <footer className={styles.footer}>
          © 2026 Mykhailo Rudovskyi. All rights reserved.
        </footer>
      </div>

    </div>
  );
}