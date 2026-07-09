import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Search, Plus, Trash2, Edit2, 
  Truck, CarFront, Wrench, CheckCircle2, User, Fuel, Boxes, X
} from 'lucide-react';
import styles from './FleetModule.module.css';
import { api } from '../utils/api';

type VehicleStatus = 'active' | 'repair';

interface DriverUser {
  id: number;
  name: string;
}

interface Vehicle {
  id: string | number;
  brandModel: string;
  licensePlate: string;
  capacityTrays: number;
  driverId: number | null;
  driver?: DriverUser | null;
  status: VehicleStatus;
  fuelConsumption: number; // liters per 100km
}

interface FleetModuleProps {
  onBack: () => void;
}

const FleetModule: React.FC<FleetModuleProps> = ({ onBack }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState({
    brandModel: '',
    licensePlate: '',
    capacityTrays: '',
    driverId: '',
    status: 'active' as VehicleStatus,
    fuelConsumption: ''
  });

  const fetchFleetData = async () => {
    try {
      const drvs = await api.get('/users?role=DRIVER');
      setDrivers(drvs);

      const fleet = await api.get('/vehicles');
      const mapped = fleet.map((v: any) => ({
        id: v.id,
        brandModel: v.brandModel,
        licensePlate: v.licensePlate,
        capacityTrays: v.capacityTrays,
        driverId: v.driverId,
        driver: v.driver,
        status: v.status === 'REPAIR' ? 'repair' : 'active',
        fuelConsumption: v.fuelConsumption,
      }));
      setVehicles(mapped);
    } catch (err) {
      console.error('Error fetching fleet data:', err);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      (v.brandModel || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (v.licensePlate || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicles, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      repair: vehicles.filter(v => v.status === 'repair').length,
    };
  }, [vehicles]);

  const deleteVehicle = async (id: string | number) => {
    if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        setVehicles(prev => prev.filter(v => v.id !== id));
      } catch (err) {
        console.error('Error deleting vehicle:', err);
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      brandModel: '',
      licensePlate: '',
      capacityTrays: '',
      driverId: '',
      status: 'active',
      fuelConsumption: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingId(v.id);
    setFormData({
      brandModel: v.brandModel,
      licensePlate: v.licensePlate,
      capacityTrays: v.capacityTrays.toString(),
      driverId: v.driverId ? v.driverId.toString() : '',
      status: v.status,
      fuelConsumption: v.fuelConsumption.toString()
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandModel.trim() || !formData.licensePlate.trim()) return;

    try {
      const payload = {
        brandModel: formData.brandModel,
        licensePlate: formData.licensePlate.toUpperCase(),
        capacityTrays: parseInt(formData.capacityTrays) || 0,
        driverId: formData.driverId ? parseInt(formData.driverId) : null,
        status: formData.status === 'repair' ? 'REPAIR' : 'ACTIVE',
        fuelConsumption: parseFloat(formData.fuelConsumption) || 0
      };

      if (editingId !== null) {
        const saved = await api.patch(`/vehicles/${editingId}`, payload);
        const mapped: Vehicle = {
          id: saved.id,
          brandModel: saved.brandModel,
          licensePlate: saved.licensePlate,
          capacityTrays: saved.capacityTrays,
          driverId: saved.driverId,
          driver: saved.driver,
          status: saved.status === 'REPAIR' ? 'repair' : 'active',
          fuelConsumption: saved.fuelConsumption,
        };
        setVehicles(prev => prev.map(v => v.id === editingId ? mapped : v));
      } else {
        const saved = await api.post('/vehicles', payload);
        const mapped: Vehicle = {
          id: saved.id,
          brandModel: saved.brandModel,
          licensePlate: saved.licensePlate,
          capacityTrays: saved.capacityTrays,
          driverId: saved.driverId,
          driver: saved.driver,
          status: saved.status === 'REPAIR' ? 'repair' : 'active',
          fuelConsumption: saved.fuelConsumption,
        };
        setVehicles([mapped, ...vehicles]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving vehicle:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to format license plate nicely
  const renderLicensePlate = (plate: string) => {
    const parts = plate.split(' ');
    if (parts.length >= 3) {
      return (
        <div className={styles.licensePlateBox}>
          <span className={styles.plateNumber}>{parts[0]}</span>
          <span className={styles.plateLetters}>{parts[1]}</span>
          <div className={styles.plateRegionBox}>
            <span className={styles.plateRegion}>{parts[2]}</span>
            <span className={styles.plateKz}>KZ</span>
          </div>
        </div>
      );
    }
    // Fallback if formatting doesn't match XX XXX XX
    return <div className={styles.licensePlateBoxFallback}>{plate}</div>;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Автопарк</h1>
        </div>
        
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Всего авто</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>На линии</span>
            <span className={styles.statValueActive}>{stats.active}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>На ремонте</span>
            <span className={styles.statValueRepair}>{stats.repair}</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Top Panel */}
        <div className={styles.topPanel}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Поиск по марке или гос. номеру..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.primaryBtn} onClick={openAddModal}>
            <Plus size={18} />
            Добавить автомобиль
          </button>
        </div>

        {/* Grid Area */}
        <div className={styles.grid}>
          {filteredVehicles.map(v => {
            const isRepair = v.status === 'repair';
            return (
              <div key={v.id} className={`${styles.card} ${isRepair ? styles.cardRepair : ''}`}>
                
                <div className={styles.cardHeader}>
                  <div className={styles.brandBox}>
                    <div className={`${styles.iconBox} ${isRepair ? styles.iconBoxRepair : ''}`}>
                      {v.capacityTrays > 50 ? <Truck size={24} /> : <CarFront size={24} />}
                    </div>
                    <div className={styles.brandInfo}>
                      <h3 className={styles.brandName}>{v.brandModel}</h3>
                      <div className={styles.statusBadgeBox}>
                        {isRepair ? (
                          <span className={styles.statusBadgeRepair}>
                            <Wrench size={12} /> На ремонте
                          </span>
                        ) : (
                          <span className={styles.statusBadgeActive}>
                            <CheckCircle2 size={12} /> Активна
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => openEditModal(v)} title="Редактировать">
                      <Edit2 size={16} />
                    </button>
                    <button className={styles.iconBtn} onClick={() => deleteVehicle(v.id)} title="Удалить">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {renderLicensePlate(v.licensePlate)}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoCol}>
                      <span className={styles.infoLabel}><Boxes size={14}/> Вместимость</span>
                      <span className={styles.infoValue}>{v.capacityTrays} лотков</span>
                    </div>
                    <div className={styles.infoCol}>
                      <span className={styles.infoLabel}><Fuel size={14}/> Расход</span>
                      <span className={styles.infoValue}>{v.fuelConsumption} л / 100км</span>
                    </div>
                  </div>
                  <div className={styles.driverRow}>
                    <span className={styles.infoLabel}><User size={14}/> Водитель</span>
                    <span className={`${styles.infoValue} ${!v.driver?.name ? styles.driverFree : ''}`}>
                      {v.driver?.name || 'Свободна'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
          
          {filteredVehicles.length === 0 && (
            <div className={styles.emptyState}>
              <p>Автомобили не найдены</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Редактировать авто' : 'Новый автомобиль'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.modalForm}>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Марка и модель *</label>
                  <input 
                    type="text" 
                    name="brandModel"
                    className={styles.formInput} 
                    value={formData.brandModel}
                    onChange={handleChange}
                    placeholder="Например: ГАЗель Next"
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Гос. номер *</label>
                  <input 
                    type="text" 
                    name="licensePlate"
                    className={styles.formInput} 
                    value={formData.licensePlate}
                    onChange={handleChange}
                    placeholder="777 VIP 02"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Вместимость (лотков)</label>
                  <input 
                    type="number" 
                    name="capacityTrays"
                    className={styles.formInput} 
                    value={formData.capacityTrays}
                    onChange={handleChange}
                    placeholder="120"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Расход (л/100км)</label>
                  <input 
                    type="number"
                    step="0.1" 
                    name="fuelConsumption"
                    className={styles.formInput} 
                    value={formData.fuelConsumption}
                    onChange={handleChange}
                    placeholder="16.5"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Статус автомобиля</label>
                <select 
                  name="status"
                  className={styles.formSelect}
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Активна (На линии)</option>
                  <option value="repair">На ремонте</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Закрепленный водитель</label>
                <select 
                  name="driverId"
                  className={styles.formSelect}
                  value={formData.driverId}
                  onChange={handleChange}
                >
                  <option value="">Свободна</option>
                  {drivers.map(drv => (
                    <option key={drv.id} value={drv.id}>{drv.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? 'Сохранить изменения' : 'Добавить авто'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetModule;
