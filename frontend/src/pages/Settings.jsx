import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { PageHeader, Card, FormGroup, Input, Select, Button } from '../components/layout/UI';
import styles from './Settings.module.css';

const API_DOCS = [
  ['POST', '/api/auth/register',           'Реєстрація'],
  ['POST', '/api/auth/login',              'Вхід'],
  ['GET',  '/api/transactions',            'Список транзакцій'],
  ['POST', '/api/transactions',            'Нова транзакція'],
  ['GET',  '/api/budgets',                 'Бюджети + витрати'],
  ['GET',  '/api/analytics/summary',       'Зведення місяця'],
  ['GET',  '/api/analytics/monthly',       'Статистика по місяцях'],
  ['GET',  '/api/transactions/export/csv', 'Експорт CSV'],
];

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name:     user?.name     || '',
    currency: user?.currency || 'UAH',
  });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', currency: user.currency || 'UAH' });
  }, [user]);

  const mutation = useMutation({
    mutationFn: (d) => authAPI.update(d),
    onSuccess: (res) => { updateUser(res.data.user); toast.success('Профіль оновлено'); },
    onError:   ()    => toast.error('Помилка збереження'),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className={styles.page}>
      <PageHeader title="Налаштування" />

      <Card className={styles.card}>
        <div className={styles.sectionTitle}>Профіль</div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
          <FormGroup label="Ім'я">
            <Input value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormGroup>
          <FormGroup label="Email">
            <Input value={user?.email || ''} disabled style={{ opacity: .55, cursor: 'not-allowed' }} />
          </FormGroup>
          <FormGroup label="Валюта">
            <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
              <option value="UAH">UAH — Гривня ₴</option>
              <option value="USD">USD — Долар $</option>
              <option value="EUR">EUR — Євро €</option>
              <option value="GBP">GBP — Фунт £</option>
            </Select>
          </FormGroup>
          <Button type="submit" disabled={mutation.isPending} className={styles.saveBtn}>
            {mutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        </form>
      </Card>

      <Card className={styles.card}>
        <div className={styles.sectionTitle}>API Ендпоінти</div>
        <div className={styles.apiList}>
          {API_DOCS.map(([method, path, label]) => (
            <div key={path} className={styles.apiRow}>
              <span
                className={styles.apiMethod}
                style={{
                  background: method === 'GET' ? 'var(--blue-dim)'  : 'var(--green-dim)',
                  color:      method === 'GET' ? 'var(--blue)'      : 'var(--green)',
                }}
              >
                {method}
              </span>
              <code className={styles.apiPath}>{path}</code>
              <span className={styles.apiLabel}>{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
