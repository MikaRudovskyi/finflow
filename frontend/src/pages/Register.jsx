import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';
import styles from './Auth.module.css';

export default function Register() {
  const { t }                 = useTranslation();
  const { register, loading } = useAuthStore();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error(t('auth.passwordTooShort'));
    try {
      await register(form.name, form.email, form.password);
      toast.success(t('auth.accountCreated'));
    } catch (err) {
      toast.error(err.response?.data?.error || t('auth.registerError'));
    }
  };

  return (
    <div className={styles.page}>
        <div className={styles.langRow}>
          <LanguageSwitcher />
        </div>
      <div className={styles.box}>

        <div className={styles.logo}>💰 FinFlow</div>
        <h2 className={styles.title}>{t('auth.register')}</h2>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.group}>
            <label>{t('auth.name')}</label>
            <input name="name" placeholder={t('auth.namePlaceholder')}
              value={form.name} onChange={handle} required />
          </div>
          <div className={styles.group}>
            <label>{t('auth.email')}</label>
            <input name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className={styles.group}>
            <label>{t('auth.password')}</label>
            <input name="password" type="password" placeholder={t('auth.passwordHint')}
              value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? t('auth.registerLoading') : t('auth.registerBtn')}
          </button>
        </form>

        <p className={styles.alt}>
          {t('auth.hasAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}