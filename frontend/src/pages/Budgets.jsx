import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { budgetsAPI } from '../services/api';
import { useFmt } from '../hooks/useFmt';
import { translateCategory } from '../utils/helpers';
import { PageHeader, Card, Button, Modal, FormGroup, Input, Select, Spinner } from '../components/layout/UI';
import styles from './Budgets.module.css';

const BUDGET_DEFAULTS = [
  { category: 'Продукти',   icon: '🛒', color: '#f97070' },
  { category: 'Транспорт',  icon: '🚌', color: '#f5b942' },
  { category: 'Ресторани',  icon: '🍽️', color: '#f472b6' },
  { category: 'Розваги',    icon: '🎬', color: '#fb923c' },
  { category: 'Комунальні', icon: '💡', color: '#a78bfa' },
  { category: "Здоров'я",   icon: '💊', color: '#34d399' },
  { category: 'Одяг',       icon: '👕', color: '#60a5fa' },
  { category: 'Освіта',     icon: '📚', color: '#818cf8' },
];

export default function Budgets() {
  const fmt          = useFmt();
  const { t, i18n } = useTranslation();
  const qc           = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Продукти', limitAmount: '', period: 'monthly', icon: '🛒', color: '#f97070' });

  const { data, isLoading } = useQuery({ queryKey: ['budgets'], queryFn: () => budgetsAPI.getAll().then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: (d) => budgetsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['budgets']); toast.success(t('budgets.created')); setShowModal(false); },
    onError: (e) => toast.error(e.response?.data?.error || t('common.error')),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => budgetsAPI.remove(id),
    onSuccess: () => { qc.invalidateQueries(['budgets']); toast.success(t('budgets.deleted')); },
  });

  const setCat = (cat) => {
    const meta = BUDGET_DEFAULTS.find(b => b.category === cat);
    setForm(f => ({ ...f, category: cat, icon: meta?.icon || '📦', color: meta?.color || '#9ca3af' }));
  };
  const submit = (e) => {
    e.preventDefault();
    if (!form.limitAmount) return toast.error(t('common.error'));
    createMutation.mutate({ ...form, limitAmount: parseFloat(form.limitAmount) });
  };

  const budgets = data?.budgets || [];
  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader title={t('budgets.title')} subtitle={t('budgets.subtitle')} action={<Button onClick={() => setShowModal(true)}>{t('budgets.new')}</Button>} />

      {budgets.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎯</div>
            <p>{t('budgets.empty')}</p>
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setShowModal(true)}>{t('budgets.createFirst')}</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {budgets.map(b => {
            const pct      = Math.min(b.percentage, 100);
            const over     = b.spent > b.limitAmount;
            const barColor = over ? 'var(--red)' : pct > 75 ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={b._id} className={styles.card}>
                <div className={styles.head}>
                  <span className={styles.icon}>{b.icon}</span>
                  <div style={{ flex: 1 }}>
                    {/* Translated category name */}
                    <div className={styles.name}>{translateCategory(b.category, i18n.language)}</div>
                    <div className={styles.period}>
                      {b.period === 'monthly' ? t('budgets.monthly') : b.period === 'weekly' ? t('budgets.weekly') : t('budgets.yearly')}
                    </div>
                  </div>
                  <button className={styles.del} onClick={() => { if (window.confirm(t('budgets.confirmDelete'))) deleteMutation.mutate(b._id); }}>✕</button>
                </div>
                <div className={styles.spent} style={{ color: over ? 'var(--red)' : 'var(--text)' }}>{fmt(b.spent)}</div>
                <div className={styles.track}><div className={styles.fill} style={{ width: `${pct}%`, background: barColor }} /></div>
                <div className={styles.nums}>
                  <span>{over ? `⚠ +${fmt(b.spent - b.limitAmount)}` : `${t('budgets.remaining')} ${fmt(b.limitAmount - b.spent)}`}</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{pct}% / {fmt(b.limitAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t('budgets.newTitle')}>
        <form onSubmit={submit}>
          <FormGroup label={t('common.category')}>
            <Select value={form.category} onChange={e => setCat(e.target.value)}>
              {/* Show translated names in dropdown, store original Ukrainian value */}
              {BUDGET_DEFAULTS.map(b => (
                <option key={b.category} value={b.category}>
                  {b.icon} {translateCategory(b.category, i18n.language)}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label={t('budgets.limit')}>
            <Input type="number" min="1" placeholder="5000" value={form.limitAmount} onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))} required />
          </FormGroup>
          <FormGroup label={t('common.period')}>
            <Select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
              <option value="monthly">{t('budgets.monthly')}</option>
              <option value="weekly">{t('budgets.weekly')}</option>
              <option value="yearly">{t('budgets.yearly')}</option>
            </Select>
          </FormGroup>
          <div className={styles.modalActions}>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.saving') : t('common.create')}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
