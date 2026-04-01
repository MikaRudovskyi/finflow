import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { analyticsAPI, transactionsAPI } from '../services/api';
import { fmtShortDate, catColor, translateCategory } from '../utils/helpers';
import { useFmt } from '../hooks/useFmt';
import { PageHeader, KpiCard, Card, Button, Spinner } from '../components/layout/UI';
import TransactionModal from '../components/transactions/TransactionModal';
import styles from './Dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const fmt                   = useFmt();
  const { t, i18n }           = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const now = new Date();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => analyticsAPI.summary({ year: now.getFullYear(), month: now.getMonth() + 1 }).then(r => r.data),
  });
  const { data: monthly }    = useQuery({ queryKey: ['monthly'],    queryFn: () => analyticsAPI.monthly({ months: 6 }).then(r => r.data) });
  const { data: byCategory } = useQuery({ queryKey: ['byCategory', now.getFullYear(), now.getMonth() + 1], queryFn: () => analyticsAPI.byCategory({ year: now.getFullYear(), month: now.getMonth() + 1 }).then(r => r.data) });
  const { data: txData, refetch } = useQuery({ queryKey: ['transactions', { limit: 8 }], queryFn: () => transactionsAPI.getAll({ limit: 8 }).then(r => r.data) });

  const monthLabels = [], incomeData = [], expenseData = [];
  if (monthly?.monthly) {
    const map = {};
    monthly.monthly.forEach(m => {
      const key = `${m._id.year}-${m._id.month}`;
      if (!map[key]) map[key] = { income: 0, expense: 0, label: `${m._id.month}/${String(m._id.year).slice(2)}` };
      map[key][m._id.type] = m.total;
    });
    Object.values(map).forEach(v => { monthLabels.push(v.label); incomeData.push(v.income); expenseData.push(v.expense); });
  }

  const CHART_OPTS = {
    responsive: true,
    plugins: { legend: { labels: { color: '#8a8f9a', font: { family: 'DM Sans' } } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#8a8f9a' } },
      y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#8a8f9a', callback: v => fmt(v) } },
    },
  };

  const barData = {
    labels: monthLabels,
    datasets: [
      { label: t('common.income'),  data: incomeData,  backgroundColor: 'rgba(45,212,160,.25)', borderColor: '#2dd4a0', borderWidth: 1.5, borderRadius: 5 },
      { label: t('common.expense'), data: expenseData, backgroundColor: 'rgba(249,112,112,.2)',  borderColor: '#f97070', borderWidth: 1.5, borderRadius: 5 },
    ],
  };

  const cats = byCategory?.categories || [];
  const doughnutData = {
    labels: cats.map(c => translateCategory(c._id, i18n.language)),
    datasets: [{ data: cats.map(c => c.total), backgroundColor: cats.map(c => catColor(c._id) + 'bb'), borderColor: cats.map(c => catColor(c._id)), borderWidth: 1.5 }],
  };

  const txns = txData?.transactions || [];
  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={now.toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}
        action={<Button onClick={() => setShowModal(true)}>{t('dashboard.addTransaction')}</Button>}
      />

      <div className={styles.kpiGrid}>
        <KpiCard label={t('dashboard.balance')}        value={fmt(summary?.balance  || 0)} color="var(--green)" />
        <KpiCard label={t('dashboard.monthlyIncome')}  value={fmt(summary?.income   || 0)} />
        <KpiCard label={t('dashboard.monthlyExpense')} value={fmt(summary?.expense  || 0)} color="var(--red)" />
        <KpiCard label={t('dashboard.saved')}          value={fmt(summary?.saved    || 0)} color="var(--blue)"
          change={`${summary?.savingsRate || 0}% ${t('dashboard.savingsRate')}`} changeDir="up" />
      </div>

      <div className={styles.chartsRow}>
        <Card><div className={styles.cardTitle}>{t('dashboard.incomeVsExpense')}</div><Bar data={barData} options={CHART_OPTS} /></Card>
        <Card>
          <div className={styles.cardTitle}>{t('dashboard.expensesByCategory')}</div>
          {cats.length > 0
            ? <Doughnut data={doughnutData} options={{ cutout: '65%', plugins: { legend: { position: 'right', labels: { color: '#8a8f9a', boxWidth: 10, padding: 8, font: { family: 'DM Sans', size: 11 } } } } }} />
            : <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>{t('dashboard.noExpenses')}</p>
          }
        </Card>
      </div>

      <Card>
        <div className={styles.cardTitle}>{t('dashboard.recentTransactions')}</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('common.date')}</th>
                <th>{t('common.description')}</th>
                <th>{t('common.category')}</th>
                <th>{t('common.type')}</th>
                <th style={{ textAlign: 'right' }}>{t('common.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t2 => (
                <tr key={t2._id}>
                  <td className={styles.tdMuted}>{fmtShortDate(t2.date)}</td>
                  <td>{t2.note || '—'}</td>
                  <td>
                    <span className={styles.catCell}>
                      <span className={styles.dot} style={{ background: catColor(t2.category) }} />
                      {translateCategory(t2.category, i18n.language)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${t2.type === 'income' ? styles.income : styles.expense}`}>
                      {t2.type === 'income' ? `▲ ${t('common.income')}` : `▼ ${t('common.expense')}`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: t2.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                      {t2.type === 'income' ? '+' : '−'}{fmt(t2.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); refetch(); }} />}
    </div>
  );
}
