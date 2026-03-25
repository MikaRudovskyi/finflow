import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import styles from './Auth.module.css';

export default function Register() {
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Пароль мінімум 6 символів');
    try {
      await register(form.name, form.email, form.password);
      toast.success('Акаунт створено!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Помилка реєстрації');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><img src="logo.png" alt="FinFlow Logo" /></span>
          FinFlow
        </div>
        <h2 className={styles.title}>Створити акаунт</h2>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.group}>
            <label>Ім'я</label>
            <input name="name" placeholder="Олексій Коваленко"
              value={form.name} onChange={handle} required />
          </div>
          <div className={styles.group}>
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className={styles.group}>
            <label>Пароль</label>
            <input name="password" type="password" placeholder="Мінімум 6 символів"
              value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Створення...' : 'Зареєструватись'}
          </button>
        </form>

        <p className={styles.alt}>
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}
