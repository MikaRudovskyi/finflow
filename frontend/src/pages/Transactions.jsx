import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { transactionsAPI } from '../services/api';
import { fmtDate, catColor, downloadBlob, translateCategory } from '../utils/helpers';
import { useFmt } from '../hooks/useFmt';
import { PageHeader, Card, Button, Spinner } from '../components/layout/UI';
import TransactionModal from '../components/transactions/TransactionModal';
import styles from './Transactions.module.css';

export default function Transactions() {
  const fmt              = useFmt();
  const { t, i18n }     = useTranslation();
  const qc               = useQueryClient();
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [page,       setPage]       = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', { typeFilter, catFilter, page }],
    queryFn: () => transactionsAPI.getAll({ type: typeFilter || undefined, category: catFilter || undefined, limit: 30, page }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionsAPI.remove(id),
    onSuccess: () => { qc.invalidateQueries(['transactions']); qc.invalidateQueries(['summary']); toast.success(t('transactions.deleted')); },
    onError: () => toast.error(t('transactions.deleteError')),
  });

  const handleExport = async () => {
    try { const res = await transactionsAPI.exportCSV(); downloadBlob(res.data, 'finflow-transactions.csv'); toast.success(t('transactions.exportSuccess')); }
    catch { toast.error(t('transactions.exportError')); }
  };

  const txns = (data?.transactions || []).filter(t2 => {
    if (!search) return true;
    const q = search.toLowerCase();
    // Search in both original and translated category name
    return t2.note?.toLowerCase().includes(q)
      || t2.category.toLowerCase().includes(q)
      || translateCategory(t2.category, i18n.language).toLowerCase().includes(q);
  });

  const cats = [...new Set((data?.transactions || []).map(t2 => t2.category))];

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('transactions.title')}
        subtitle={`${data?.total || 0} ${t('common.records')}`}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={handleExport}>⬇ CSV</Button>
            <Button onClick={() => setShowModal(true)}>{t('transactions.new')}</Button>
          </div>
        }
      />

      <Card>
        <div className={styles.filters}>
          <input className={styles.search} placeholder={`🔍  ${t('common.search')}`} value={search} onChange={e => setSearch(e.target.value)} />
          <select className={styles.sel} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">{t('transactions.allTypes')}</option>
            <option value="income">{t('transactions.incomeType')}</option>
            <option value="expense">{t('transactions.expenseType')}</option>
          </select>
          <select className={styles.sel} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">{t('transactions.allCategories')}</option>
            {/* Show translated category names in dropdown, but store original value */}
            {cats.map(c => (
              <option key={c} value={c}>
                {translateCategory(c, i18n.language)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('common.date')}</th>
                <th>{t('common.description')}</th>
                <th>{t('common.category')}</th>
                <th>{t('common.type')}</th>
                <th style={{ textAlign: 'right' }}>{t('common.amount')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 && (
                <tr><td colSpan={6}>
                  <div className={styles.empty}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                    {t('transactions.notFound')}
                  </div>
                </td></tr>
              )}
              {txns.map(t2 => (
                <tr key={t2._id}>
                  <td className={styles.muted}>{fmtDate(t2.date)}</td>
                  <td>{t2.note || '—'}</td>
                  <td>
                    <span className={styles.cat}>
                      <span className={styles.dot} style={{ background: catColor(t2.category) }} />
                      {/* Translated category name */}
                      {translateCategory(t2.category, i18n.language)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${t2.type === 'income' ? styles.income : styles.expense}`}>
                      {t2.type === 'income' ? `▲ ${t('common.income')}` : `▼ ${t('common.expense')}`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={styles.amount} style={{ color: t2.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {t2.type === 'income' ? '+' : '−'}{fmt(t2.amount)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <button className={styles.iconBtn} onClick={() => setEditing(t2)}>✏️</button>
                      <button className={styles.iconBtn} style={{ color: 'var(--red)' }}
                        onClick={() => { if (window.confirm(t('transactions.confirmDelete'))) deleteMutation.mutate(t2._id); }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(data?.pages || 1) > 1 && (
          <div className={styles.pagination}>
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← {t('common.back')}</Button>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{t('common.page')} {page} / {data.pages}</span>
            <Button variant="ghost" disabled={page >= (data?.pages || 1)} onClick={() => setPage(p => p + 1)}>{t('common.next')} →</Button>
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
