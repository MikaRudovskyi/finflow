import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import styles from './Auth.module.css';

export default function Login() {
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Ласкаво просимо!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Помилка входу');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}><img src="logo.png" alt="FinFlow Logo" /></span>
            FinFlow
          </div>
        <h2 className={styles.title}>Увійти в акаунт</h2>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.group}>
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className={styles.group}>
            <label>Пароль</label>
            <input name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <p className={styles.alt}>
          Немає акаунту? <Link to="/register">Зареєструватись</Link>
        </p>
      </div>
    </div>
  );
}
