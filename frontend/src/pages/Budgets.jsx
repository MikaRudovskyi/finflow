import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { budgetsAPI } from '../services/api';
import { useFmt } from '../hooks/useFmt';
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
  const fmt = useFmt();
  const qc  = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    category: 'Продукти', limitAmount: '', period: 'monthly', icon: '🛒', color: '#f97070',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsAPI.getAll().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => budgetsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['budgets']); toast.success('Бюджет створено'); setShowModal(false); },
    onError:   (e) => toast.error(e.response?.data?.error || 'Помилка'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetsAPI.remove(id),
    onSuccess: () => { qc.invalidateQueries(['budgets']); toast.success('Бюджет видалено'); },
  });

  const setCat = (cat) => {
    const meta = BUDGET_DEFAULTS.find(b => b.category === cat);
    setForm(f => ({ ...f, category: cat, icon: meta?.icon || '📦', color: meta?.color || '#9ca3af' }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.limitAmount) return toast.error('Введіть ліміт');
    createMutation.mutate({ ...form, limitAmount: parseFloat(form.limitAmount) });
  };

  const budgets = data?.budgets || [];
  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Бюджети"
        subtitle="Контроль витрат за категоріями"
        action={<Button onClick={() => setShowModal(true)}>+ Новий бюджет</Button>}
      />

      {budgets.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎯</div>
            <p>У вас ще немає бюджетів</p>
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setShowModal(true)}>Створити перший бюджет</Button>
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
                    <div className={styles.name}>{b.category}</div>
                    <div className={styles.period}>
                      {b.period === 'monthly' ? 'Місяць' : b.period === 'weekly' ? 'Тиждень' : 'Рік'}
                    </div>
                  </div>
                  <button className={styles.del}
                    onClick={() => { if (window.confirm('Видалити бюджет?')) deleteMutation.mutate(b._id); }}>✕</button>
                </div>
                <div className={styles.spent} style={{ color: over ? 'var(--red)' : 'var(--text)' }}>
                  {fmt(b.spent)}
                </div>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <div className={styles.nums}>
                  <span>{over ? `⚠ +${fmt(b.spent - b.limitAmount)}` : `Залишок ${fmt(b.limitAmount - b.spent)}`}</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{pct}% / {fmt(b.limitAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Новий бюджет">
        <form onSubmit={submit}>
          <FormGroup label="Категорія">
            <Select value={form.category} onChange={e => setCat(e.target.value)}>
              {BUDGET_DEFAULTS.map(b => (
                <option key={b.category} value={b.category}>{b.icon} {b.category}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Ліміт">
            <Input type="number" min="1" placeholder="5000"
              value={form.limitAmount} onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))} required />
          </FormGroup>
          <FormGroup label="Період">
            <Select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
              <option value="monthly">Місяць</option>
              <option value="weekly">Тиждень</option>
              <option value="yearly">Рік</option>
            </Select>
          </FormGroup>
          <div className={styles.modalActions}>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Збереження...' : 'Створити'}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Скасувати</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
