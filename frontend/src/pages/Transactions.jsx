import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transactionsAPI } from '../services/api';
import { fmtDate, catColor, downloadBlob } from '../utils/helpers';
import { useFmt } from '../hooks/useFmt';
import { PageHeader, Card, Button, Spinner } from '../components/layout/UI';
import TransactionModal from '../components/transactions/TransactionModal';
import styles from './Transactions.module.css';

export default function Transactions() {
  const fmt = useFmt();
  const qc  = useQueryClient();
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [page,       setPage]       = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', { typeFilter, catFilter, page }],
    queryFn: () => transactionsAPI.getAll({
      type:     typeFilter || undefined,
      category: catFilter  || undefined,
      limit: 30, page,
    }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionsAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries(['transactions']);
      qc.invalidateQueries(['summary']);
      toast.success('Транзакцію видалено');
    },
    onError: () => toast.error('Помилка видалення'),
  });

  const handleExport = async () => {
    try {
      const res = await transactionsAPI.exportCSV();
      downloadBlob(res.data, 'finflow-transactions.csv');
      toast.success('CSV файл завантажено');
    } catch { toast.error('Помилка експорту'); }
  };

  const txns = (data?.transactions || []).filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.note?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const cats = [...new Set((data?.transactions || []).map(t => t.category))];

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Транзакції"
        subtitle={`${data?.total || 0} записів`}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={handleExport}>⬇ CSV</Button>
            <Button onClick={() => setShowModal(true)}>+ Нова</Button>
          </div>
        }
      />

      <Card>
        <div className={styles.filters}>
          <input
            className={styles.search}
            placeholder="🔍  Пошук..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className={styles.sel} value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">Всі типи</option>
            <option value="income">Доходи</option>
            <option value="expense">Витрати</option>
          </select>
          <select className={styles.sel} value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">Всі категорії</option>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th><th>Опис</th><th>Категорія</th><th>Тип</th>
                <th style={{ textAlign: 'right' }}>Сума</th><th></th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 && (
                <tr><td colSpan={6}>
                  <div className={styles.empty}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                    Транзакцій не знайдено
                  </div>
                </td></tr>
              )}
              {txns.map(t => (
                <tr key={t._id}>
                  <td className={styles.muted}>{fmtDate(t.date)}</td>
                  <td>{t.note || '—'}</td>
                  <td>
                    <span className={styles.cat}>
                      <span className={styles.dot} style={{ background: catColor(t.category) }} />
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${t.type === 'income' ? styles.income : styles.expense}`}>
                      {t.type === 'income' ? '▲ Дохід' : '▼ Витрата'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={styles.amount} style={{ color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <button className={styles.iconBtn} onClick={() => setEditing(t)}>✏️</button>
                      <button className={styles.iconBtn} style={{ color: 'var(--red)' }}
                        onClick={() => { if (window.confirm('Видалити?')) deleteMutation.mutate(t._id); }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(data?.pages || 1) > 1 && (
          <div className={styles.pagination}>
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Назад</Button>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>Стор. {page} / {data.pages}</span>
            <Button variant="ghost" disabled={page >= (data?.pages || 1)} onClick={() => setPage(p => p + 1)}>Далі →</Button>
          </div>
        )}
      </Card>

      {(showModal || editing) && (
        <TransactionModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}
