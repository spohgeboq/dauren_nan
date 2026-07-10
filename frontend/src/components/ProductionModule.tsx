import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Plus, Minus, Factory, Clock, PackageCheck, Scale, X } from 'lucide-react';
import styles from './ProductionModule.module.css';
import { api } from '../utils/api';

interface ProductionTask {
  id: string | number;
  name: string;
  planned: number;
  completed: number;
}

interface BatchLog {
  id: string | number;
  time: string;
  productName: string;
  quantity: number;
  type: 'Готово' | 'Брак';
}

interface ProductionModuleProps {
  onBack: () => void;
}

const ProductionModule: React.FC<ProductionModuleProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New plan form state
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [newPlanProductId, setNewPlanProductId] = useState('');
  const [newPlanQty, setNewPlanQty] = useState('');

  // Modal State for Enter Fact
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [batchType, setBatchType] = useState<'Готово' | 'Брак'>('Готово');

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const dateStr = getTodayDateString();
      const [tasksData, logsData, productsData] = await Promise.all([
        api.get(`/production/tasks?date=${dateStr}`),
        api.get('/production/logs'),
        api.get('/products')
      ]);

      const mappedTasks = (tasksData || []).map((t: any) => ({
        id: t.id,
        name: t.product ? t.product.name : 'Неизвестно',
        planned: t.planned || 0,
        completed: t.completed || 0
      }));

      const mappedLogs = (logsData || []).map((l: any) => ({
        id: l.id,
        time: l.time,
        productName: l.productName || 'Товар',
        quantity: l.quantity || 0,
        type: l.type === 'READY' ? 'Готово' : 'Брак'
      }));

      setTasks(mappedTasks);
      setLogs(mappedLogs);
      setProducts(productsData || []);
    } catch (e) {
      console.error('Failed to load production data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
  const progressPercent = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
  
  // Mocked raw material used: 1 unit roughly uses 0.45kg of raw material
  const rawMaterialsUsed = Math.round(totalCompleted * 0.45);

  const handleOpenModal = (taskId: string | number) => {
    setSelectedTaskId(taskId);
    setInputValue('');
    setBatchType('Готово');
    setIsModalOpen(true);
  };

  const handleFixBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !inputValue) return;
    
    const qty = parseInt(inputValue, 10);
    if (isNaN(qty) || qty <= 0) return;

    try {
      const type = batchType === 'Готово' ? 'READY' : 'DEFECT';
      await api.post('/production/batch', {
        taskId: Number(selectedTaskId),
        quantity: qty,
        type: type
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save batch', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanProductId || !newPlanQty) return;
    const planned = parseInt(newPlanQty, 10);
    if (isNaN(planned) || planned <= 0) return;

    try {
      await api.post('/production/tasks', {
        productId: parseInt(newPlanProductId, 10),
        planned: planned
      });
      setNewPlanProductId('');
      setNewPlanQty('');
      setIsPlanFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create production task', err);
    }
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Производство</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <Factory size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>План на сегодня</span>
              <span className={styles.widgetValue}>{totalPlanned} шт</span>
            </div>
          </div>
          
          <div className={styles.widgetProgress}>
            <div className={styles.progressHeader}>
              <div className={styles.progressIconWrapper}>
                <PackageCheck size={24} />
              </div>
              <div className={styles.progressInfo}>
                <span className={styles.widgetLabel}>Уже испекли</span>
                <span className={styles.widgetValue}>{totalCompleted} шт</span>
              </div>
              <div className={styles.progressPercent}>{progressPercent}%</div>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <Scale size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Списано сырья (авто)</span>
              <span className={styles.widgetValue}>{rawMaterialsUsed} кг</span>
            </div>
          </div>
        </div>

        {/* Two Columns Area */}
        <div className={styles.splitLayout}>
          
          {/* Left Column: Tasks */}
          <div className={styles.tasksCol}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Задание на производство</h2>
              <button 
                className={styles.actionBtn} 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                onClick={() => setIsPlanFormOpen(!isPlanFormOpen)}
              >
                {isPlanFormOpen ? 'Закрыть' : 'Создать план'}
              </button>
            </div>

            {/* Inline Plan Form */}
            {isPlanFormOpen && (
              <form onSubmit={handleCreatePlan} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '180px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Продукт</label>
                  <select 
                    value={newPlanProductId} 
                    onChange={e => setNewPlanProductId(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', outline: 'none' }}
                    required
                  >
                    <option value="">Выберите продукт</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Кол-во (шт)</label>
                  <input 
                    type="number" 
                    value={newPlanQty} 
                    onChange={e => setNewPlanQty(e.target.value)}
                    placeholder="0"
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', outline: 'none' }}
                    min="1"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.actionBtn} 
                  style={{ height: '38px', padding: '0 1.25rem' }}
                >
                  Добавить
                </button>
              </form>
            )}

            {isLoading ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Загрузка...</div>
            ) : (
              <div className={styles.tasksList}>
                {tasks.map(task => {
                  const isDone = task.completed >= task.planned;
                  const left = Math.max(0, task.planned - task.completed);
                  const progress = Math.min(100, Math.round((task.completed / task.planned) * 100)) || 0;

                  return (
                    <div key={task.id} className={`${styles.taskCard} ${isDone ? styles.taskCardDone : ''}`}>
                      <div className={styles.taskInfo}>
                        <h3 className={styles.taskName}>{task.name}</h3>
                        <div className={styles.taskMeta}>
                          План: {task.planned} • Испечено: {task.completed}
                        </div>
                        <div className={styles.taskProgressBg}>
                          <div className={`${styles.taskProgressFill} ${isDone ? styles.fillDone : ''}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      
                      <div className={styles.taskActions}>
                        {!isDone && (
                          <div className={styles.taskLeftBadge}>
                            Осталось: <strong>{left} шт</strong>
                          </div>
                        )}
                        {isDone ? (
                          <div className={styles.doneBadge}>
                            <CheckCircle2 size={16} />
                            Выполнено
                          </div>
                        ) : (
                          <button 
                            className={styles.actionBtn}
                            onClick={() => handleOpenModal(task.id)}
                          >
                            Ввести факт
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                    Заданий на сегодня нет. Создайте новый план!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: History */}
          <div className={styles.logsCol}>
            <h2 className={styles.sectionTitle}>Журнал партий</h2>
            <div className={styles.logsContainer}>
              <div className={styles.timeline}>
                {logs.map(log => (
                  <div key={log.id} className={styles.logNode}>
                    <div className={styles.logTime}>
                      <Clock size={14} className={styles.timeIcon} />
                      {log.time}
                    </div>
                    <div className={`${styles.logDot} ${log.type === 'Готово' ? styles.dotSuccess : styles.dotDanger}`}></div>
                    <div className={styles.logContent}>
                      <div className={styles.logProduct}>{log.productName}</div>
                      <div className={styles.logDetails}>
                        <span className={styles.logQuantity}>{log.quantity} шт</span>
                        <span className={`${styles.logTypeBadge} ${log.type === 'Готово' ? styles.badgeSuccess : styles.badgeDanger}`}>
                          {log.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Журнал пуст</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Modal: Enter Production */}
      {isModalOpen && selectedTask && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Фиксация партии</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFixBatch} className={styles.modalForm}>
              <div className={styles.modalProductName}>
                {selectedTask.name}
              </div>
              <div className={styles.modalProductMeta}>
                План: {selectedTask.planned} шт • Осталось испечь: {Math.max(0, selectedTask.planned - selectedTask.completed)} шт
              </div>

              {/* Huge Input */}
              <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>Количество (шт)</label>
                <div className={styles.hugeInputContainer}>
                  <button 
                    type="button" 
                    className={styles.hugeInputBtn}
                    onClick={() => setInputValue(prev => String(Math.max(0, (parseInt(prev || '0') - 10))))}
                  >
                    <Minus size={32} />
                  </button>
                  <input 
                    type="number" 
                    className={styles.hugeInput} 
                    placeholder="0"
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className={styles.hugeInputBtn}
                    onClick={() => setInputValue(prev => String((parseInt(prev || '0') + 10)))}
                  >
                    <Plus size={32} />
                  </button>
                </div>
              </div>

              {/* Toggle Good/Defect */}
              <div className={styles.typeToggle}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${batchType === 'Готово' ? styles.toggleBtnSuccess : ''}`}
                  onClick={() => setBatchType('Готово')}
                >
                  <CheckCircle2 size={20} />
                  Готовая продукция
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${batchType === 'Брак' ? styles.toggleBtnDanger : ''}`}
                  onClick={() => setBatchType('Брак')}
                >
                  <AlertTriangle size={20} />
                  Брак / Сгорело
                </button>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={!inputValue || parseInt(inputValue) <= 0}>
                Зафиксировать партию
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionModule;
