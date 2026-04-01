import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';
import styles from './Auth.module.css';

export default function Login() {
  const { t }              = useTranslation();
  const { login, loading } = useAuthStore();
  const [form, setForm]    = useState({ email: '', password: '' });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success(t('auth.welcomeBack'));
    } catch (err) {
      toast.error(err.response?.data?.error || t('auth.loginError'));
    }
  };

  return (
    <div className={styles.page}>
        <div className={styles.langRow}>
          <LanguageSwitcher />
        </div>
      <div className={styles.box}>

        <div className={styles.logo}>💰 FinFlow</div>
        <h2 className={styles.title}>{t('auth.login')}</h2>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.group}>
            <label>{t('auth.email')}</label>
            <input name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className={styles.group}>
            <label>{t('auth.password')}</label>
            <input name="password" type="password" placeholder={t('auth.passwordPlaceholder')}
              value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? t('auth.loginLoading') : t('auth.loginBtn')}
          </button>
        </form>

        <p className={styles.alt}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link>
        </p>
      </div>
    </div>
  );
}