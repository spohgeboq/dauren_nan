import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Calculator, Save, FileText } from 'lucide-react';
import styles from './RecipesModule.module.css';

type Unit = 'г' | 'мл' | 'шт';

interface RawMaterial {
  id: string;
  name: string;
  unit: Unit;
  costPerUnit: number;
}

const RAW_MATERIALS: RawMaterial[] = [
  { id: 'rm1', name: 'Мука пшеничная 1 сорт', unit: 'г', costPerUnit: 0.18 }, // ~180 ₸/кг
  { id: 'rm2', name: 'Вода очищенная', unit: 'мл', costPerUnit: 0.01 }, // ~10 ₸/л
  { id: 'rm3', name: 'Соль пищевая', unit: 'г', costPerUnit: 0.05 }, // ~50 ₸/кг
  { id: 'rm4', name: 'Дрожжи прессованные', unit: 'г', costPerUnit: 0.6 }, // ~600 ₸/кг
  { id: 'rm5', name: 'Кунжут белый', unit: 'г', costPerUnit: 1.5 }, // ~1500 ₸/кг
  { id: 'rm6', name: 'Масло подсолнечное', unit: 'мл', costPerUnit: 0.45 }, // ~450 ₸/л
  { id: 'rm7', name: 'Пакет брендированный', unit: 'шт', costPerUnit: 15 },
  { id: 'rm8', name: 'Сахар', unit: 'г', costPerUnit: 0.35 }, // ~350 ₸/кг
];

interface RecipeIngredient {
  id: string;
  rawMaterialId: string;
  amount: number | '';
}

interface ProductRecipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

const MOCK_RECIPES: ProductRecipe[] = [
  {
    id: 'p1',
    name: 'Лепешка с кунжутом',
    ingredients: [
      { id: 'ri1', rawMaterialId: 'rm1', amount: 300 },
      { id: 'ri2', rawMaterialId: 'rm2', amount: 150 },
      { id: 'ri3', rawMaterialId: 'rm3', amount: 5 },
      { id: 'ri4', rawMaterialId: 'rm5', amount: 10 },
    ]
  },
  {
    id: 'p2',
    name: 'Таба нан',
    ingredients: [
      { id: 'ri5', rawMaterialId: 'rm1', amount: 350 },
      { id: 'ri6', rawMaterialId: 'rm2', amount: 180 },
      { id: 'ri7', rawMaterialId: 'rm3', amount: 6 },
      { id: 'ri8', rawMaterialId: 'rm4', amount: 4 },
      { id: 'ri14', rawMaterialId: 'rm6', amount: 15 },
    ]
  },
  {
    id: 'p3',
    name: 'Батон нарезной',
    ingredients: [
      { id: 'ri9', rawMaterialId: 'rm1', amount: 400 },
      { id: 'ri10', rawMaterialId: 'rm2', amount: 200 },
      { id: 'ri11', rawMaterialId: 'rm3', amount: 7 },
      { id: 'ri12', rawMaterialId: 'rm4', amount: 5 },
      { id: 'ri15', rawMaterialId: 'rm8', amount: 15 },
      { id: 'ri13', rawMaterialId: 'rm7', amount: 1 },
    ]
  },
  {
    id: 'p4',
    name: 'Уй наны',
    ingredients: [
      { id: 'ri16', rawMaterialId: 'rm1', amount: 380 },
      { id: 'ri17', rawMaterialId: 'rm2', amount: 190 },
      { id: 'ri18', rawMaterialId: 'rm3', amount: 6 },
      { id: 'ri19', rawMaterialId: 'rm4', amount: 3 },
    ]
  }
];

interface RecipesModuleProps {
  onBack: () => void;
}

const RecipesModule: React.FC<RecipesModuleProps> = ({ onBack }) => {
  const [recipes, setRecipes] = useState<ProductRecipe[]>(MOCK_RECIPES);
  const [activeRecipeId, setActiveRecipeId] = useState<string>('p1');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const activeRecipe = recipes.find(r => r.id === activeRecipeId);

  const filteredRecipesList = useMemo(() => {
    return recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [recipes, searchQuery]);

  const handleAmountChange = (ingredientId: string, newAmountStr: string) => {
    if (!activeRecipe) return;
    
    // Allow empty string to easily clear the input, otherwise parse float
    const newAmount = newAmountStr === '' ? '' : parseFloat(newAmountStr);
    
    // Basic validation to prevent NaN if the user types weird chars, fallback to empty
    const finalAmount = (typeof newAmount === 'number' && isNaN(newAmount)) ? '' : newAmount;

    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.map(ing => 
            ing.id === ingredientId ? { ...ing, amount: finalAmount } : ing
          )
        };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const handleMaterialChange = (ingredientId: string, newMaterialId: string) => {
    if (!activeRecipe) return;
    
    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.map(ing => 
            ing.id === ingredientId ? { ...ing, rawMaterialId: newMaterialId } : ing
          )
        };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const handleAddIngredient = () => {
    if (!activeRecipe) return;
    
    const newIng: RecipeIngredient = {
      id: `new_${Date.now()}`,
      rawMaterialId: RAW_MATERIALS[0].id,
      amount: ''
    };

    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return {
          ...recipe,
          ingredients: [...recipe.ingredients, newIng]
        };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    if (!activeRecipe) return;
    
    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.filter(ing => ing.id !== ingredientId)
        };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const calculateIngredientCost = (ing: RecipeIngredient) => {
    if (ing.amount === '') return 0;
    const material = RAW_MATERIALS.find(m => m.id === ing.rawMaterialId);
    if (!material) return 0;
    return material.costPerUnit * (ing.amount as number);
  };

  const activeRecipeTotalCost = useMemo(() => {
    if (!activeRecipe) return 0;
    const sum = activeRecipe.ingredients.reduce((acc, ing) => acc + calculateIngredientCost(ing), 0);
    return sum;
  }, [activeRecipe]);

  const handleSave = () => {
    setHasChanges(false);
    // Real implementation would API call
  };

  const formatPrice = (num: number) => num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₸';

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Технологические карты (Рецепты)</h1>
        </div>
        <div className={styles.headerRight}>
          {hasChanges && (
            <button className={styles.saveBtn} onClick={handleSave}>
              <Save size={18} />
              Сохранить изменения
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.workspace}>
          
          {/* Left Panel: Recipe List */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Поиск товара..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className={styles.listArea}>
              {filteredRecipesList.map(recipe => (
                <button
                  key={recipe.id}
                  className={`${styles.listItem} ${activeRecipeId === recipe.id ? styles.listItemSelected : ''}`}
                  onClick={() => setActiveRecipeId(recipe.id)}
                >
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{recipe.name}</span>
                    <span className={styles.itemCount}>{recipe.ingredients.length} ингредиентов</span>
                  </div>
                </button>
              ))}
              {filteredRecipesList.length === 0 && (
                <div className={styles.emptyList}>Ничего не найдено</div>
              )}
            </div>
          </aside>

          {/* Right Panel: Recipe Editor */}
          <section className={styles.detailsArea}>
            {activeRecipe ? (
              <div className={styles.recipeContent}>
                
                {/* Recipe Header */}
                <div className={styles.recipeHeader}>
                  <div className={styles.recipeTitleBox}>
                    <FileText size={24} className={styles.titleIcon} />
                    <h2 className={styles.recipeName}>{activeRecipe.name}</h2>
                  </div>
                  
                  <div className={styles.totalCostCard}>
                    <Calculator size={20} className={styles.costIcon} />
                    <div className={styles.costInfo}>
                      <span className={styles.costLabel}>Итоговая себестоимость:</span>
                      <span className={styles.costValue}>{formatPrice(activeRecipeTotalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Ingredients Table */}
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Наименование сырья</th>
                        <th className={styles.colAmount}>Норма расхода</th>
                        <th className={styles.colUnit}>Ед. изм.</th>
                        <th className={styles.colSum}>Сумма</th>
                        <th className={styles.colAction}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRecipe.ingredients.map(ing => {
                        const material = RAW_MATERIALS.find(m => m.id === ing.rawMaterialId);
                        const cost = calculateIngredientCost(ing);

                        return (
                          <tr key={ing.id} className={styles.tableRow}>
                            <td>
                              <select 
                                className={styles.cleanSelect}
                                value={ing.rawMaterialId}
                                onChange={(e) => handleMaterialChange(ing.id, e.target.value)}
                              >
                                {RAW_MATERIALS.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className={styles.cleanInput}
                                value={ing.amount}
                                onChange={(e) => handleAmountChange(ing.id, e.target.value)}
                                placeholder="0"
                                min="0"
                                step="any"
                              />
                            </td>
                            <td>
                              <span className={styles.unitBadge}>
                                {material?.unit || '-'}
                              </span>
                            </td>
                            <td>
                              <span className={styles.rowSum}>
                                {formatPrice(cost)}
                              </span>
                            </td>
                            <td className={styles.textCenter}>
                              <button 
                                className={styles.deleteBtn} 
                                onClick={() => handleRemoveIngredient(ing.id)}
                                title="Удалить строку"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  <div className={styles.tableFooter}>
                    <button className={styles.addIngBtn} onClick={handleAddIngredient}>
                      <Plus size={16} />
                      Добавить ингредиент
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Выберите товар слева для просмотра техкарты.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default RecipesModule;
