import { useQuery } from '@tanstack/react-query';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { analyticsAPI, transactionsAPI } from '../services/api';
import { catColor, downloadBlob } from '../utils/helpers';
import { useFmt } from '../hooks/useFmt';
import { PageHeader, Card, Button, Spinner } from '../components/layout/UI';
import toast from 'react-hot-toast';
import styles from './Reports.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend);

export default function Reports() {
  const fmt = useFmt();
  const now = new Date();

  const { data: monthly, isLoading } = useQuery({
    queryKey: ['monthly-12'],
    queryFn: () => analyticsAPI.monthly({ months: 12 }).then(r => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ['byCategory-report', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => analyticsAPI.byCategory({ year: now.getFullYear(), month: now.getMonth() + 1 }).then(r => r.data),
  });

  const labels = [], incomeArr = [], expenseArr = [], balanceArr = [];
  let runningBalance = 0;
  if (monthly?.monthly) {
    const map = {};
    monthly.monthly.forEach(m => {
      const key = `${m._id.year}-${String(m._id.month).padStart(2, '0')}`;
      if (!map[key]) map[key] = { income: 0, expense: 0, label: `${m._id.month}/${String(m._id.year).slice(2)}` };
      map[key][m._id.type] = m.total;
    });
    Object.values(map).forEach(v => {
      labels.push(v.label);
      incomeArr.push(v.income);
      expenseArr.push(v.expense);
      runningBalance += v.income - v.expense;
      balanceArr.push(runningBalance);
    });
  }

  const SCALE_OPTS = {
    x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#8a8f9a', maxRotation: 45 } },
    y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#8a8f9a', callback: v => fmt(v) } },
  };
  const LEGEND = { labels: { color: '#8a8f9a', font: { family: 'DM Sans', size: 12 }, boxWidth: 12 } };

  const lineData = {
    labels,
    datasets: [{
      label: 'Баланс', data: balanceArr,
      borderColor: '#2dd4a0', backgroundColor: 'rgba(45,212,160,.08)',
      fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: '#2dd4a0',
    }],
  };

  const barData = {
    labels,
    datasets: [
      { label: 'Дохід',   data: incomeArr,  backgroundColor: 'rgba(45,212,160,.25)', borderColor: '#2dd4a0', borderWidth: 1.5, borderRadius: 5 },
      { label: 'Витрати', data: expenseArr, backgroundColor: 'rgba(249,112,112,.2)',  borderColor: '#f97070', borderWidth: 1.5, borderRadius: 5 },
    ],
  };

  const cats   = catData?.categories || [];
  const maxCat = cats[0]?.total || 1;

  const handleExport = async () => {
    try {
      const res = await transactionsAPI.exportCSV();
      downloadBlob(res.data, `finflow-${now.getFullYear()}-${now.getMonth() + 1}.csv`);
      toast.success('Звіт завантажено');
    } catch { toast.error('Помилка завантаження'); }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Звіти"
        subtitle="Аналітика за 12 місяців"
        action={<Button variant="ghost" onClick={handleExport}>⬇ CSV звіт</Button>}
      />

      <div className={styles.chartsRow}>
        <Card>
          <div className={styles.cardTitle}>Тренд балансу (12 міс.)</div>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: LEGEND }, scales: SCALE_OPTS }} />
        </Card>
        <Card>
          <div className={styles.cardTitle}>Доходи vs Витрати</div>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: LEGEND }, scales: SCALE_OPTS }} />
        </Card>
      </div>

      <Card>
        <div className={styles.cardTitle}>Топ витрат цього місяця</div>
        {cats.length === 0 ? (
          <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '28px 0', fontSize: 14 }}>
            Немає даних за цей місяць
          </p>
        ) : (
          <div className={styles.catList}>
            {cats.map(c => {
              const pct = Math.round((c.total / maxCat) * 100);
              return (
                <div key={c._id} className={styles.catRow}>
                  <div className={styles.catHead}>
                    <span className={styles.catDot} style={{ background: catColor(c._id) }} />
                    <span className={styles.catName}>{c._id}</span>
                    <span className={styles.catAmt} style={{ color: catColor(c._id) }}>{fmt(c.total)}</span>
                  </div>
                  <div className={styles.catTrack}>
                    <div className={styles.catFill} style={{ width: `${pct}%`, background: catColor(c._id) }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
