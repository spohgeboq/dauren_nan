import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Plus, Minus, Factory, Clock, PackageCheck, Scale, X } from 'lucide-react';
import styles from './ProductionModule.module.css';

interface ProductionTask {
  id: string;
  name: string;
  planned: number;
  completed: number;
}

interface BatchLog {
  id: string;
  time: string;
  productName: string;
  quantity: number;
  type: 'Готово' | 'Брак';
}

const MOCK_TASKS: ProductionTask[] = [
  { id: 't1', name: 'Таба нан', planned: 500, completed: 350 },
  { id: 't2', name: 'Батон нарезной', planned: 300, completed: 280 },
  { id: 't3', name: 'Хлеб Пшеничный', planned: 250, completed: 100 },
  { id: 't4', name: 'Круассан классический', planned: 150, completed: 0 },
  { id: 't5', name: 'Синнабон', planned: 80, completed: 80 },
];

const MOCK_LOGS: BatchLog[] = [
  { id: 'l1', time: '08:15', productName: 'Таба нан', quantity: 200, type: 'Готово' },
  { id: 'l2', time: '08:45', productName: 'Батон нарезной', quantity: 150, type: 'Готово' },
  { id: 'l3', time: '09:20', productName: 'Таба нан', quantity: 150, type: 'Готово' },
  { id: 'l4', time: '09:35', productName: 'Таба нан', quantity: 5, type: 'Брак' },
  { id: 'l5', time: '10:00', productName: 'Батон нарезной', quantity: 130, type: 'Готово' },
  { id: 'l6', time: '10:15', productName: 'Хлеб Пшеничный', quantity: 100, type: 'Готово' },
];

interface ProductionModuleProps {
  onBack: () => void;
}

const ProductionModule: React.FC<ProductionModuleProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<ProductionTask[]>(MOCK_TASKS);
  const [logs, setLogs] = useState<BatchLog[]>(MOCK_LOGS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [batchType, setBatchType] = useState<'Готово' | 'Брак'>('Готово');

  // Stats
  const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
  const progressPercent = Math.round((totalCompleted / totalPlanned) * 100) || 0;
  
  // Mocked raw material used (e.g. 1 unit roughly uses 0.4kg of flour/water)
  const rawMaterialsUsed = Math.round(totalCompleted * 0.45);

  const handleOpenModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setInputValue('');
    setBatchType('Готово');
    setIsModalOpen(true);
  };

  const handleFixBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !inputValue) return;
    
    const qty = parseInt(inputValue, 10);
    if (isNaN(qty) || qty <= 0) return;

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    // Update Logs
    const newLog: BatchLog = {
      id: `l${Date.now()}`,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      productName: task.name,
      quantity: qty,
      type: batchType
    };
    setLogs([newLog, ...logs]);

    // Update Tasks if it's 'Готово'
    if (batchType === 'Готово') {
      setTasks(prev => prev.map(t => 
        t.id === selectedTaskId ? { ...t, completed: t.completed + qty } : t
      ));
    }

    setIsModalOpen(false);
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
            <h2 className={styles.sectionTitle}>Задание на производство</h2>
            <div className={styles.tasksList}>
              {tasks.map(task => {
                const isDone = task.completed >= task.planned;
                const left = Math.max(0, task.planned - task.completed);
                const progress = Math.min(100, Math.round((task.completed / task.planned) * 100));

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
            </div>
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
