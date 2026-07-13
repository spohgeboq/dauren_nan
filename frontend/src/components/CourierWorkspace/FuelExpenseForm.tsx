import React, { useState } from 'react';
import styles from './CourierWorkspace.module.css';
import { Fuel, XCircle, CheckCircle } from 'lucide-react';
import { saveOfflineAction } from '../../utils/offlineQueue';

interface FuelExpenseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const FuelExpenseForm: React.FC<FuelExpenseFormProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setIsSubmitting(true);
    const body = {
      category: 'FUEL',
      amount: Number(amount),
      paymentMethod: 'CASH',
      description: 'Бензин курьера',
      date: new Date().toISOString()
    };

    try {
      if (!navigator.onLine) {
        saveOfflineAction('http://localhost:5000/api/expenses', 'POST', body);
        onSuccess();
        return;
      }

      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        onSuccess();
      } else {
        saveOfflineAction('http://localhost:5000/api/expenses', 'POST', body);
        onSuccess();
      }
    } catch (e) {
      saveOfflineAction('http://localhost:5000/api/expenses', 'POST', body);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}><Fuel size={24} style={{ marginRight: '0.5rem', color: 'var(--primary-gold)' }} /> Заправка</h2>
          <button className={styles.closeBtn} onClick={onClose}><XCircle size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Сумма (тенге)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="Например: 5000"
              className={styles.input}
              required
            />
          </div>
          
          <button type="submit" className={styles.confirmBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : <><CheckCircle size={20} style={{ marginRight: '0.5rem' }} /> Отправить</>}
          </button>
        </form>
      </div>
    </div>
  );
};
