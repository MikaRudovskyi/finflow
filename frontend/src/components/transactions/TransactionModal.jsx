import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { transactionsAPI, categoriesAPI } from '../../services/api';
import { translateCategory } from '../../utils/helpers';
import { Modal, FormGroup, Input, Select, Button } from '../layout/UI';
import styles from './TransactionModal.module.css';

export default function TransactionModal({ onClose, onSaved, existing }) {
  const { t, i18n } = useTranslation();
  const qc          = useQueryClient();
  const today       = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    type:     existing?.type     || 'expense',
    amount:   existing?.amount   || '',
    category: existing?.category || '',
    note:     existing?.note     || '',
    date:     existing?.date ? existing.date.split('T')[0] : today,
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data),
  });
  const categories = (catData?.categories || []).filter(
    c => c.type === form.type || c.type === 'both'
  );

  const mutation = useMutation({
    mutationFn: (data) => existing
      ? transactionsAPI.update(existing._id, data)
      : transactionsAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['transactions']); qc.invalidateQueries(['summary']);
      qc.invalidateQueries(['monthly']);      qc.invalidateQueries(['byCategory']);
      toast.success(existing ? t('transactions.updated') : t('transactions.added'));
      onSaved?.();
    },
    onError: (err) => toast.error(err.response?.data?.error || t('common.error')),
  });

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return toast.error(t('transactions.fillFields'));
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <Modal open onClose={onClose} title={existing ? t('transactions.editTitle') : t('transactions.newTitle')}>
      <form onSubmit={submit}>
        <FormGroup label={t('common.type')}>
          <div className={styles.typeToggle}>
            <button type="button"
              className={`${styles.typeBtn} ${form.type === 'income'  ? styles.income  : ''}`}
              onClick={() => set('type', 'income')}>
              ▲ {t('common.income')}
            </button>
            <button type="button"
              className={`${styles.typeBtn} ${form.type === 'expense' ? styles.expense : ''}`}
              onClick={() => set('type', 'expense')}>
              ▼ {t('common.expense')}
            </button>
          </div>
        </FormGroup>

        <div className={styles.row}>
          <FormGroup label={t('transactions.amountLabel')}>
            <Input type="number" min="0.01" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => set('amount', e.target.value)} required />
          </FormGroup>
          <FormGroup label={t('common.date')}>
            <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          </FormGroup>
        </div>

        <FormGroup label={t('common.category')}>
          <Select value={form.category} onChange={e => set('category', e.target.value)} required>
            <option value="">{t('transactions.categoryPlaceholder')}</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>
                {c.icon} {translateCategory(c.name, i18n.language)}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label={t('transactions.noteLabel')}>
          <Input placeholder={t('transactions.notePlaceholder')}
            value={form.note} onChange={e => set('note', e.target.value)} />
        </FormGroup>

        <div className={styles.actions}>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('common.saving') : (existing ? t('common.save') : t('common.add'))}
          </Button>
          <Button variant="ghost" type="button" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </form>
    </Modal>
  );
}