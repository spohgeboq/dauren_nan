import React, { useState } from 'react';
import { api } from '../utils/api';
import { Check } from 'lucide-react';
import styles from './OrderModal.module.css';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose }) => {
  const [clientType, setClientType] = useState('Магазин');
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    contactName: '',
    address: '',
    deliveryTime: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSuccessClose = () => {
    setSuccess(false);
    onClose();
    setFormData({
      clientName: '', phone: '', contactName: '', address: '', deliveryTime: '', comment: ''
    });
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/client-requests', {
        ...formData,
        clientType
      });
      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit request', error);
      alert('Ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>

        {success ? (
          <div className={styles.successMessage}>
            <div className={styles.successIconWrapper}>
              <Check size={48} className={styles.successIcon} />
            </div>
            <h3>Заявка отправлена!</h3>
            <p>Мы получили ваши данные. Наш администратор свяжется с вами в ближайшее время для уточнения деталей.</p>
            <button className={styles.successBtn} onClick={handleSuccessClose}>
              Отлично
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h3>Подключение доставки</h3>
              <p>Оставьте заявку, и наш администратор свяжется с вами для согласования маршрута и ассортимента.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.grid}>

                <div className={styles.field}>
                  <label>Название клиента *</label>
                  <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Например: Магазин Центральный" required />
                </div>

                <div className={styles.field}>
                  <label>Тип клиента</label>
                  <div className={styles.radioGroup}>
                    {['Магазин', 'Кафе', 'Сеть'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`${styles.radioBtn} ${clientType === type ? styles.activeRadio : ''}`}
                        onClick={() => setClientType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Телефон *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+7 (___) ___ __ __" required />
                </div>

                <div className={styles.field}>
                  <label>Контактное лицо (ФИО) *</label>
                  <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Иванов Иван" required />
                </div>

                <div className={`${styles.field} ${styles.colFull}`}>
                  <label>Адрес доставки *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Улица, дом, особенности проезда" required />
                </div>

                <div className={styles.field}>
                  <label>Удобное время доставки</label>
                  <input type="time" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} />
                </div>

                <div className={`${styles.field} ${styles.colFull}`}>
                  <label>Комментарий</label>
                  <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Любые дополнительные пожелания" rows={3}></textarea>
                </div>

              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
