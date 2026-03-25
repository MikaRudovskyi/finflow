import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ФФ';

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
          aria-label="Меню"
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

        <span className={styles.sectionLabel}>Головна</span>
        <NavItem to="/"             icon="📊" label="Dashboard"   end />
        <NavItem to="/transactions" icon="↕️" label="Транзакції"      />

        <div className={styles.spacer} />
        <span className={styles.sectionLabel}>Планування</span>
        <NavItem to="/budgets" icon="🎯" label="Бюджети"     />
        <NavItem to="/savings" icon="🏦" label="Заощадження" />
        <NavItem to="/reports" icon="📈" label="Звіти"       />

        <div className={styles.spacer} />
        <NavItem to="/settings" icon="⚙️" label="Налаштування" />

        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'Користувач'}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Вийти">⏻</button>
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