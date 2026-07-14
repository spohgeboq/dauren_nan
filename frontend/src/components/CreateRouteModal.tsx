import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';
import styles from './CreateRouteModal.module.css';

interface Driver {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
  address: string;
}

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string;
}

const CreateRouteModal: React.FC<CreateRouteModalProps> = ({ isOpen, onClose, onSuccess, selectedDate }) => {
  const [name, setName] = useState('');
  const [driverId, setDriverId] = useState<number | ''>('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeDate, setRouteDate] = useState(selectedDate);

  // Обновляем локальную дату, если поменялся пропс
  useEffect(() => {
    setRouteDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const driversData = await api.get('/users?role=DRIVER');
      setDrivers(driversData);
      
      const clientsData = await api.get('/clients');
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data for modal:', error);
      alert('Ошибка при загрузке данных');
    }
  };

  const handleClientToggle = (clientId: number) => {
    setSelectedClients(prev => 
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !driverId || selectedClients.length === 0) {
      alert('Пожалуйста, заполните все поля и выберите хотя бы одного клиента.');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/routes', {
        name,
        driverId: Number(driverId),
        date: routeDate,
        clientIds: selectedClients
      });
      onSuccess();
      onClose();
      // Reset
      setName('');
      setDriverId('');
      setSelectedClients([]);
    } catch (error: any) {
      console.error('Error creating route:', error);
      alert(error.message || 'Ошибка при создании маршрута');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Создать маршрут</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label>Название маршрута</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Например: Маршрут #1 (Левый берег)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Дата маршрута</label>
            <select 
              className={styles.select}
              value={routeDate}
              onChange={e => setRouteDate(e.target.value)}
            >
              <option value="Сегодня">Сегодня</option>
              <option value="Завтра">Завтра</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Водитель / Курьер</label>
            <select 
              className={styles.select}
              value={driverId}
              onChange={e => setDriverId(Number(e.target.value))}
            >
              <option value="">-- Выберите водителя --</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Точки маршрута (Клиенты)</label>
            <div className={styles.clientList}>
              {clients.map(client => (
                <label key={client.id} className={styles.clientItem}>
                  <input 
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleClientToggle(client.id)}
                  />
                  <span>{client.name} {client.address ? `(${client.address})` : ''}</span>
                </label>
              ))}
            </div>
            <small style={{ color: '#64748b' }}>
              Выберите клиентов, к которым поедет водитель. Система сама проверит их заказы на выбранную дату ({routeDate}) и сформирует накладную на загрузку.
            </small>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </button>
          <button 
            type="button" 
            className={styles.submitBtn} 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Создание...' : 'Создать маршрут'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRouteModal;
