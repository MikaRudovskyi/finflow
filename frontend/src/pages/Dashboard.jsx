import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { analyticsAPI, transactionsAPI } from '../services/api';
import { fmtShortDate, catColor } from '../utils/helpers';
import { useFmt } from '../hooks/useFmt';
import { PageHeader, KpiCard, Card, Button, Spinner } from '../components/layout/UI';
import TransactionModal from '../components/transactions/TransactionModal';
import styles from './Dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const fmt = useFmt();
  const [showModal, setShowModal] = useState(false);
  const now = new Date();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => analyticsAPI.summary({ year: now.getFullYear(), month: now.getMonth() + 1 }).then(r => r.data),
  });

  const { data: monthly } = useQuery({
    queryKey: ['monthly'],
    queryFn: () => analyticsAPI.monthly({ months: 6 }).then(r => r.data),
  });

  const { data: byCategory } = useQuery({
    queryKey: ['byCategory', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => analyticsAPI.byCategory({ year: now.getFullYear(), month: now.getMonth() + 1 }).then(r => r.data),
  });

  const { data: txData, refetch } = useQuery({
    queryKey: ['transactions', { limit: 8 }],
    queryFn: () => transactionsAPI.getAll({ limit: 8 }).then(r => r.data),
  });

  const monthLabels = [], incomeData = [], expenseData = [];
  if (monthly?.monthly) {
    const map = {};
    monthly.monthly.forEach(m => {
      const key = `${m._id.year}-${m._id.month}`;
      if (!map[key]) map[key] = { income: 0, expense: 0, label: `${m._id.month}/${String(m._id.year).slice(2)}` };
      map[key][m._id.type] = m.total;
    });
    Object.values(map).forEach(v => {
      monthLabels.push(v.label);
      incomeData.push(v.income);
      expenseData.push(v.expense);
    });
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
      { label: 'Дохід',   data: incomeData,  backgroundColor: 'rgba(45,212,160,.25)', borderColor: '#2dd4a0', borderWidth: 1.5, borderRadius: 5 },
      { label: 'Витрати', data: expenseData, backgroundColor: 'rgba(249,112,112,.2)',  borderColor: '#f97070', borderWidth: 1.5, borderRadius: 5 },
    ],
  };

  const cats = byCategory?.categories || [];
  const doughnutData = {
    labels: cats.map(c => c._id),
    datasets: [{
      data: cats.map(c => c.total),
      backgroundColor: cats.map(c => catColor(c._id) + 'bb'),
      borderColor:     cats.map(c => catColor(c._id)),
      borderWidth: 1.5,
    }],
  };

  const txns = txData?.transactions || [];
  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard"
        subtitle={now.toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}
        action={<Button onClick={() => setShowModal(true)}>+ Транзакція</Button>}
      />

      <div className={styles.kpiGrid}>
        <KpiCard label="Баланс"         value={fmt(summary?.balance  || 0)} color="var(--green)" />
        <KpiCard label="Дохід (місяць)" value={fmt(summary?.income   || 0)} />
        <KpiCard label="Витрати (міс.)" value={fmt(summary?.expense  || 0)} color="var(--red)" />
        <KpiCard label="Заощаджено"     value={fmt(summary?.saved    || 0)} color="var(--blue)"
          change={`${summary?.savingsRate || 0}% від доходу`} changeDir="up" />
      </div>

      <div className={styles.chartsRow}>
        <Card>
          <div className={styles.cardTitle}>Доходи vs Витрати</div>
          <Bar data={barData} options={CHART_OPTS} />
        </Card>
        <Card>
          <div className={styles.cardTitle}>Витрати за категоріями</div>
          {cats.length > 0
            ? <Doughnut data={doughnutData} options={{
                cutout: '65%',
                plugins: { legend: { position: 'right', labels: { color: '#8a8f9a', boxWidth: 10, padding: 8, font: { family: 'DM Sans', size: 11 } } } },
              }} />
            : <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Немає витрат</p>
          }
        </Card>
      </div>

      <Card>
        <div className={styles.cardTitle}>Останні транзакції</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th><th>Опис</th><th>Категорія</th><th>Тип</th>
                <th style={{ textAlign: 'right' }}>Сума</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t._id}>
                  <td className={styles.tdMuted}>{fmtShortDate(t.date)}</td>
                  <td>{t.note || '—'}</td>
                  <td>
                    <span className={styles.catCell}>
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
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                      {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); refetch(); }}
        />
      )}
    </div>
  );
}
