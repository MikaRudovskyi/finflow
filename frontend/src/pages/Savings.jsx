import { useState } from 'react';
import { useFmt } from '../hooks/useFmt';
import { PageHeader, Button, Modal, FormGroup, Input } from '../components/layout/UI';
import styles from './Savings.module.css';

const INITIAL_GOALS = [
  { id: 1, name: 'Авто',         icon: '🚗', target: 250000, current: 87500,  color: 'var(--blue)'   },
  { id: 2, name: 'Відпустка',    icon: '✈️', target: 30000,  current: 22000,  color: 'var(--amber)'  },
  { id: 3, name: 'Навчання',     icon: '📚', target: 15000,  current: 15000,  color: 'var(--green)'  },
  { id: 4, name: 'Надзвичайний', icon: '🛡️', target: 100000, current: 40000,  color: 'var(--purple)' },
  { id: 5, name: 'Ноутбук',      icon: '💻', target: 45000,  current: 18000,  color: 'var(--blue)'   },
  { id: 6, name: 'Квартира',     icon: '🏠', target: 500000, current: 67000,  color: 'var(--amber)'  },
];

const COLORS = ['var(--blue)', 'var(--green)', 'var(--amber)', 'var(--purple)', 'var(--red)'];

export default function Savings() {
  const fmt = useFmt();
  const [goals,     setGoals]     = useState(INITIAL_GOALS);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ name: '', icon: '🏦', target: '', current: '', color: 'var(--blue)' });

  const totalSaved  = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target,  0);
  const totalPct    = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const doneCount   = goals.filter(g => g.current >= g.target).length;

  const addGoal = (e) => {
    e.preventDefault();
    setGoals(g => [...g, {
      id: Date.now(), name: form.name, icon: form.icon || '🏦',
      target: parseFloat(form.target), current: parseFloat(form.current) || 0, color: form.color,
    }]);
    setShowModal(false);
    setForm({ name: '', icon: '🏦', target: '', current: '', color: 'var(--blue)' });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className={styles.page}>
      <PageHeader
        title="Заощадження"
        subtitle="Цілі та прогрес"
        action={<Button onClick={() => setShowModal(true)}>+ Нова ціль</Button>}
      />

      <div className={styles.hero}>
        <div>
          <div className={styles.heroLabel}>Загальні заощадження</div>
          <div className={styles.heroAmount}>{fmt(totalSaved)}</div>
          <div className={styles.heroSub}>з {fmt(totalTarget)} загальної цілі</div>
        </div>
        <div className={styles.heroRight}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Прогрес</div>
          <div className={styles.heroRate}>{totalPct}%</div>
          <div className={styles.heroSub}>{doneCount} цілей виконано</div>
        </div>
      </div>

      <div className={styles.grid}>
        {goals.map(g => {
          const pct  = Math.min(Math.round((g.current / g.target) * 100), 100);
          const done = g.current >= g.target;
          return (
            <div key={g.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.goalIcon}>{g.icon}</span>
                <button className={styles.delBtn}
                  onClick={() => { if (window.confirm('Видалити ціль?')) setGoals(gs => gs.filter(x => x.id !== g.id)); }}>✕</button>
              </div>
              <div className={styles.goalName}>{g.name}</div>
              <div className={styles.goalSub}>Ціль: {fmt(g.target)}</div>
              <div className={styles.goalAmount} style={{ color: done ? 'var(--green)' : g.color }}>
                {fmt(g.current)}{done && <span className={styles.check}>✓</span>}
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${pct}%`, background: done ? 'var(--green)' : g.color }} />
              </div>
              <div className={styles.pctRow}>
                <span style={{ color: 'var(--text3)', fontSize: 11 }}>
                  {done ? 'Виконано!' : `ще ${fmt(g.target - g.current)}`}
                </span>
                <span className={styles.pct} style={{ color: done ? 'var(--green)' : g.color }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Нова ціль заощадження">
        <form onSubmit={addGoal}>
          <div className={styles.formRow}>
            <FormGroup label="Назва цілі">
              <Input placeholder="Напр. Відпустка, Авто..." value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </FormGroup>
            <FormGroup label="Іконка">
              <Input placeholder="🏦" value={form.icon} onChange={e => set('icon', e.target.value)} />
            </FormGroup>
          </div>
          <div className={styles.formRow}>
            <FormGroup label="Цільова сума">
              <Input type="number" min="1" placeholder="50000" value={form.target}
                onChange={e => set('target', e.target.value)} required />
            </FormGroup>
            <FormGroup label="Вже накопичено">
              <Input type="number" min="0" placeholder="0" value={form.current}
                onChange={e => set('current', e.target.value)} />
            </FormGroup>
          </div>
          <FormGroup label="Колір">
            <div className={styles.colorRow}>
              {COLORS.map((c, i) => (
                <button key={i} type="button"
                  className={`${styles.colorDot} ${form.color === c ? styles.colorSelected : ''}`}
                  style={{ background: c }} onClick={() => set('color', c)} />
              ))}
            </div>
          </FormGroup>
          <div className={styles.modalActions}>
            <Button type="submit">Створити</Button>
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Скасувати</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
