import styles from './UI.module.css';

export function Card({ children, className = '', style }) {
  return <div className={`${styles.card} ${className}`} style={style}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Button({ children, variant = 'primary', onClick, type = 'button', disabled, className = '', style }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

export function Badge({ type }) {
  return (
    <span className={`${styles.badge} ${type === 'income' ? styles.income : styles.expense}`}>
      {type === 'income' ? '▲ Дохід' : '▼ Витрата'}
    </span>
  );
}

export function Spinner() {
  return <div className={styles.spinner} />;
}

export function KpiCard({ label, value, change, changeDir, color }) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue} style={color ? { color } : undefined}>{value}</div>
      {change && (
        <div className={`${styles.kpiChange} ${changeDir === 'up' ? styles.up : styles.down}`}>
          {change}
        </div>
      )}
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export function Input(props) {
  return <input className={styles.input} {...props} />;
}

export function Select({ children, ...props }) {
  return <select className={styles.select} {...props}>{children}</select>;
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalTitle}>{title}</div>
        {children}
      </div>
    </div>
  );
}
