import React, { useState } from 'react';
import styles from './OrderModal.module.css';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose }) => {
  const [clientType, setClientType] = useState('Магазин');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div className={styles.header}>
          <h3>Подключение доставки</h3>
          <p>Оставьте заявку, и наш администратор свяжется с вами для согласования маршрута и ассортимента.</p>
        </div>

        <form className={styles.form}>
          <div className={styles.grid}>
            
            <div className={styles.field}>
              <label>Название клиента</label>
              <input type="text" placeholder="Например: Магазин Центральный" />
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
              <label>Телефон</label>
              <input type="tel" placeholder="+7 (___) ___ __ __" />
            </div>

            <div className={styles.field}>
              <label>Контактное лицо (ФИО)</label>
              <input type="text" placeholder="Иванов Иван" />
            </div>

            <div className={`${styles.field} ${styles.colFull}`}>
              <label>Адрес доставки</label>
              <input type="text" placeholder="Улица, дом, особенности проезда" />
            </div>

            <div className={styles.field}>
              <label>Удобное время доставки</label>
              <input type="time" />
            </div>
            
            {/* Empty space for grid alignment if needed, or we can make comment full width */}
            <div className={`${styles.field} ${styles.colFull}`}>
              <label>Комментарий</label>
              <textarea placeholder="Любые дополнительные пожелания" rows={3}></textarea>
            </div>

          </div>

          <button type="submit" className={styles.submitBtn}>
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
