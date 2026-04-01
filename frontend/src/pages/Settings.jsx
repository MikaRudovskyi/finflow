import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { PageHeader, Card, FormGroup, Input, Select, Button } from '../components/layout/UI';
import styles from './Settings.module.css';

const API_DOCS = [
  ['POST', '/api/auth/register',           'Register'],
  ['POST', '/api/auth/login',              'Login'],
  ['GET',  '/api/transactions',            'List transactions'],
  ['POST', '/api/transactions',            'Create transaction'],
  ['GET',  '/api/budgets',                 'Budgets + spending'],
  ['GET',  '/api/analytics/summary',       'Monthly summary'],
  ['GET',  '/api/analytics/monthly',       'Monthly statistics'],
  ['GET',  '/api/transactions/export/csv', 'Export CSV'],
];

export default function Settings() {
  const { t }              = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [form, setForm]    = useState({
    name:     user?.name     || '',
    currency: user?.currency || 'UAH',
  });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', currency: user.currency || 'UAH' });
  }, [user]);

  const mutation = useMutation({
    mutationFn: (d) => authAPI.update(d),
    onSuccess: (res) => { updateUser(res.data.user); toast.success(t('settings.saved')); },
    onError:   ()    => toast.error(t('settings.error')),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className={styles.page}>
      <PageHeader title={t('settings.title')} />

      <Card className={styles.card}>
        <div className={styles.sectionTitle}>{t('settings.profile')}</div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
          <FormGroup label={t('settings.name')}>
            <Input value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormGroup>
          <FormGroup label={t('settings.email')}>
            <Input value={user?.email || ''} disabled style={{ opacity: .55, cursor: 'not-allowed' }} />
          </FormGroup>
          <FormGroup label={t('settings.currency')}>
            <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
              <option value="UAH">UAH — Гривня ₴</option>
              <option value="USD">USD — Dollar $</option>
              <option value="EUR">EUR — Euro €</option>
              <option value="GBP">GBP — Pound £</option>
            </Select>
          </FormGroup>
          <Button type="submit" disabled={mutation.isPending} className={styles.saveBtn}>
            {mutation.isPending ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </form>
      </Card>

      <Card className={styles.card}>
        <div className={styles.sectionTitle}>{t('settings.apiDocs')}</div>
        <div className={styles.apiList}>
          {API_DOCS.map(([method, path, label]) => (
            <div key={path} className={styles.apiRow}>
              <span className={styles.apiMethod} style={{
                background: method === 'GET' ? 'var(--blue-dim)'  : 'var(--green-dim)',
                color:      method === 'GET' ? 'var(--blue)'      : 'var(--green)',
              }}>
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
