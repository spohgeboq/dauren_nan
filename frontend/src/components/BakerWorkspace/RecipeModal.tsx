import React from 'react';
import { X } from 'lucide-react';
import styles from './RecipeModal.module.css';

interface RecipeModalProps {
  recipeId: number;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipeId, onClose }) => {
  // В реальности здесь будет загрузка рецепта по recipeId с бэкенда
  const dummyRecipe = {
    name: 'Таба нан',
    ingredients: [
      { name: 'Мука пшеничная', amount: '10 кг' },
      { name: 'Вода', amount: '5 л' },
      { name: 'Дрожжи', amount: '150 г' },
      { name: 'Соль', amount: '150 г' },
      { name: 'Сахар', amount: '100 г' },
    ],
    steps: [
      'Замес теста: смешать все ингредиенты (кроме масла для слоения) до однородности.',
      'Отдых теста в холодильнике: 2-4 часа при температуре +4°C.',
      'Подготовка масла для слоения: раскатать в пласт 20x20 см.',
      'Слоение: 3 двойных или 4 простых складывания.',
      'Отдых после слоения: 30-40 минут в холодильнике.',
      'Раскатка и формовка: раскатать толщиной 4 мм, нарезать треугольники, свернуть.',
      'Расстойка: 2-2.5 часа при температуре 26-28°C.',
      'Выпечка: 15-18 минут при температуре 190°C с паром в начале.'
    ]
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Технологическая карта</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={28} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            ID Рецепта: {recipeId}
          </div>
          <h3 className={styles.recipeName}>{dummyRecipe.name}</h3>
          
          <div className={styles.section}>
            <h4>Ингредиенты:</h4>
            <ul className={styles.ingredientsList}>
              {dummyRecipe.ingredients.map((ing, idx) => (
                <li key={idx}>
                  <span className={styles.ingName}>{ing.name}</span>
                  <span className={styles.ingAmount}>{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4>Технология приготовления:</h4>
            <ol className={styles.stepsList}>
              {dummyRecipe.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
