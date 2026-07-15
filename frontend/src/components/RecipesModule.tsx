import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, FileText, Calculator, Save, Plus, Trash2, X, Search } from 'lucide-react';
import styles from './RecipesModule.module.css';
import { api } from '../utils/api';

interface RecipeIngredient {
  id: string | number;
  rawMaterialId: string | number;
  amount: number | '';
  unit?: string;
}

interface ProductRecipe {
  id: string | number;
  productId: string | number;
  name: string;
  yield: number;
  instructions: string;
  ingredients: RecipeIngredient[];
}

interface RawMaterial {
  id: number;
  name: string;
  unit: string;
  costPerUnit: number;
}

interface RecipesModuleProps {
  onBack: () => void;
  isReadOnly?: boolean;
}

const RecipesModule: React.FC<RecipesModuleProps> = ({ onBack, isReadOnly = false }) => {
  const [recipes, setRecipes] = useState<ProductRecipe[]>([]);
  const [originalRecipes, setOriginalRecipes] = useState<ProductRecipe[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipesAndMaterials = async () => {
    try {
      setIsLoading(true);
      const [recipesData, materialsData, productsData] = await Promise.all([
        api.get('/recipes'),
        api.get('/recipes/raw-materials'),
        api.get('/products')
      ]);

      setRawMaterials(materialsData || []);

      const activeProducts = (productsData || []).filter((p: any) => p.isActive !== false);

      const mappedRecipes: ProductRecipe[] = activeProducts.map((p: any) => {
        const recipe = (recipesData || []).find((r: any) => r.productId === p.id);
        if (recipe) {
          return {
            id: recipe.id,
            productId: p.id,
            name: p.name,
            yield: recipe.yield || 1,
            instructions: recipe.instructions || '',
            ingredients: (recipe.ingredients || []).map((ing: any) => ({
              id: ing.id,
              rawMaterialId: ing.rawMaterialId,
              amount: ing.amount,
              unit: ing.unit
            }))
          };
        } else {
          return {
            id: `new_recipe_${p.id}`,
            productId: p.id,
            name: p.name,
            yield: 1,
            instructions: '',
            ingredients: []
          };
        }
      });

      setRecipes(mappedRecipes);
      setOriginalRecipes(JSON.parse(JSON.stringify(mappedRecipes)));
      
      if (mappedRecipes.length > 0 && activeRecipeId === null) {
        setActiveRecipeId(mappedRecipes[0].id);
      }
    } catch (e) {
      console.error('Failed to load recipes data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesAndMaterials();
  }, []);

  const activeRecipe = recipes.find(r => r.id === activeRecipeId);

  const filteredRecipesList = useMemo(() => {
    return recipes.filter(r => (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [recipes, searchQuery]);

  const handleAmountChange = (ingredientId: string | number, newAmountStr: string) => {
    if (!activeRecipe) return;
    
    const newAmount = newAmountStr === '' ? '' : parseFloat(newAmountStr);
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

  const handleMaterialChange = (ingredientId: string | number, newMaterialId: string) => {
    if (!activeRecipe) return;
    
    // Prevent duplicate raw materials
    const exists = activeRecipe.ingredients.some(ing => ing.rawMaterialId === parseInt(newMaterialId, 10) && ing.id !== ingredientId);
    if (exists) {
      alert('Этот ингредиент уже добавлен в рецепт.');
      return;
    }

    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.map(ing => 
            ing.id === ingredientId ? { ...ing, rawMaterialId: parseInt(newMaterialId, 10) } : ing
          )
        };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const handleYieldChange = (newYieldStr: string) => {
    if (!activeRecipe) return;
    const newYield = parseInt(newYieldStr, 10) || 1;
    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return { ...recipe, yield: newYield > 0 ? newYield : 1 };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const handleInstructionsChange = (newInstructions: string) => {
    if (!activeRecipe) return;
    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return { ...recipe, instructions: newInstructions };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const handleAddIngredient = () => {
    if (!activeRecipe || rawMaterials.length === 0) return;
    
    const newIng: RecipeIngredient = {
      id: `new_${Date.now()}`,
      rawMaterialId: rawMaterials[0].id,
      amount: 1,
      unit: rawMaterials[0].unit
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

  const handleRemoveIngredient = (ingredientId: string | number) => {
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

  const handleUnitChange = (id: string | number, newUnit: string) => {
    if (!activeRecipe) return;
    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === activeRecipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.map(ing => ing.id === id ? { ...ing, unit: newUnit } : ing)
        };
      }
      return recipe;
    }));
    setHasChanges(true);
  };

  const calculateIngredientCost = (ing: RecipeIngredient) => {
    if (ing.amount === '') return 0;
    const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
    if (!material) return 0;
    
    let amount = ing.amount as number;
    const matUnit = (material.unit || '').toLowerCase();
    const ingUnit = (ing.unit || matUnit).toLowerCase();

    if (matUnit === 'кг' && ingUnit === 'г') amount /= 1000;
    if (matUnit === 'л' && ingUnit === 'мл') amount /= 1000;
    if (matUnit === 'г' && ingUnit === 'кг') amount *= 1000;
    if (matUnit === 'мл' && ingUnit === 'л') amount *= 1000;

    return material.costPerUnit * amount;
  };

  const activeRecipeTotalCost = useMemo(() => {
    if (!activeRecipe) return 0;
    return activeRecipe.ingredients.reduce((acc, ing) => acc + calculateIngredientCost(ing), 0);
  }, [activeRecipe, rawMaterials]);

  const activeRecipeUnitCost = useMemo(() => {
    if (!activeRecipe || activeRecipe.yield <= 0) return 0;
    return activeRecipeTotalCost / activeRecipe.yield;
  }, [activeRecipeTotalCost, activeRecipe?.yield]);

  const handleSave = async () => {
    if (!activeRecipe || activeRecipeId === null) return;

    try {
      const payload = {
        yield: Number(activeRecipe.yield),
        instructions: activeRecipe.instructions,
        ingredients: activeRecipe.ingredients.map(ing => ({
          rawMaterialId: Number(ing.rawMaterialId),
          amount: Number(ing.amount),
          unit: ing.unit || null
        }))
      };

      if (typeof activeRecipe.id === 'string' && activeRecipe.id.startsWith('new_recipe_')) {
        await api.post('/recipes', {
          productId: activeRecipe.productId,
          yield: payload.yield,
          instructions: payload.instructions,
          ingredients: payload.ingredients
        });
      } else {
        await api.put(`/recipes/${activeRecipe.id}`, payload);
      }

      setHasChanges(false);
      await fetchRecipesAndMaterials();
    } catch (e) {
      console.error('Failed to save recipe updates', e);
      alert('Ошибка при сохранении техкарты');
    }
  };

  const handlePrint = () => {
    window.print();
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
          <button className={styles.printBtn} onClick={handlePrint}>
            <FileText size={18} />
            Печать
          </button>
          {!isReadOnly && (
            <button 
              className={styles.saveBtn} 
              onClick={handleSave}
              disabled={!hasChanges}
              style={{ opacity: hasChanges ? 1 : 0.5, cursor: hasChanges ? 'pointer' : 'not-allowed' }}
            >
              <Save size={18} />
              Сохранить
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Загрузка рецептов...</div>
        ) : (
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
                    onClick={() => {
                      if (!isReadOnly && hasChanges) {
                        if (confirm('У вас есть несохраненные изменения. Продолжить без сохранения?')) {
                          setHasChanges(false);
                          setActiveRecipeId(recipe.id);
                        }
                      } else {
                        setActiveRecipeId(recipe.id);
                      }
                    }}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{recipe.name}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {recipe.ingredients.length > 0 ? (
                          <span className={styles.badgeSuccess}>С рецептом</span>
                        ) : (
                          <span className={styles.badgeDanger}>Без рецепта</span>
                        )}
                        <span className={styles.itemCount}>{recipe.ingredients.length} ингр.</span>
                      </div>
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
                    
                    <div className={styles.yieldBox}>
                      <label>Выход на замес (шт):</label>
                      <input 
                        type="number" 
                        className={`${styles.yieldInput} ${styles.noPrint}`}
                        value={activeRecipe.yield}
                        onChange={(e) => handleYieldChange(e.target.value)}
                        min="1"
                        disabled={isReadOnly}
                      />
                      <span className={`${styles.printOnly} ${styles.yieldPrintVal}`}>
                        {activeRecipe.yield}
                      </span>
                    </div>

                    <div className={styles.totalCostCard}>
                      <Calculator size={20} className={styles.costIcon} />
                      <div className={styles.costInfo}>
                        <span className={styles.costLabel}>Себестоимость 1 шт:</span>
                        <span className={styles.costValue}>{formatPrice(activeRecipeUnitCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Instructions */}
                  <div className={styles.instructionsWrapper}>
                    <label className={styles.instructionsLabel}>Инструкция по приготовлению (Тех. процесс):</label>
                    <textarea 
                      className={`${styles.instructionsInput} ${styles.noPrint}`}
                      value={activeRecipe.instructions}
                      onChange={(e) => handleInstructionsChange(e.target.value)}
                      placeholder="Например: 1. Замесить тесто (мука, вода, дрожжи) и оставить на 30 мин... 2. Разделить на порции по 300г... 3. Выпекать при 220°C 15 минут..."
                      rows={5}
                      readOnly={isReadOnly}
                    />
                    <div className={`${styles.printOnly} ${styles.instructionsPrintVal}`}>
                      {activeRecipe.instructions || 'Инструкция не добавлена.'}
                    </div>
                  </div>

                  {/* Ingredients Table */}
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Наименование сырья</th>
                          <th className={styles.colAmount}>Расход на замес</th>
                          <th className={styles.colAmount}>Расход на 1 шт</th>
                          <th className={styles.colUnit}>Ед. изм.</th>
                          <th className={styles.colSum}>Сумма на замес</th>
                          {!isReadOnly && <th className={`${styles.colAction} ${styles.noPrint}`}></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {activeRecipe.ingredients.map(ing => {
                          const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
                          const cost = calculateIngredientCost(ing);

                          return (
                            <tr key={ing.id} className={styles.tableRow}>
                              <td>
                                <select 
                                  className={`${styles.cleanSelect} ${styles.noPrint}`}
                                  value={ing.rawMaterialId}
                                  onChange={(e) => handleMaterialChange(ing.id, e.target.value)}
                                  disabled={isReadOnly}
                                >
                                  {rawMaterials.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                </select>
                                <span className={styles.printOnly}>
                                  {material?.name || '-'}
                                </span>
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className={`${styles.cleanInput} ${styles.noPrint}`}
                                  value={ing.amount}
                                  onChange={(e) => handleAmountChange(ing.id, e.target.value)}
                                  placeholder="0"
                                  min="0"
                                  step="any"
                                  disabled={isReadOnly}
                                />
                                <span className={styles.printOnly}>
                                  {ing.amount}
                                </span>
                              </td>
                              <td className={styles.textCenter} style={{ color: '#64748b', fontSize: '14px' }}>
                                {activeRecipe.yield > 0 && typeof ing.amount === 'number' 
                                  ? (ing.amount / activeRecipe.yield).toFixed(1) 
                                  : '0'}
                              </td>
                              <td>
                                <select 
                                  className={`${styles.cleanSelect} ${styles.noPrint}`} 
                                  value={ing.unit || material?.unit || ''}
                                  onChange={(e) => handleUnitChange(ing.id, e.target.value)}
                                  disabled={isReadOnly}
                                >
                                  <option value="кг">кг</option>
                                  <option value="г">г</option>
                                  <option value="л">л</option>
                                  <option value="мл">мл</option>
                                  <option value="шт">шт</option>
                                </select>
                                <span className={styles.printOnly}>
                                  {ing.unit || material?.unit || '-'}
                                </span>
                              </td>
                              <td>
                                <span className={styles.rowSum}>
                                  {formatPrice(cost)}
                                </span>
                              </td>
                              {!isReadOnly && (
                                <td className={`${styles.textCenter} ${styles.noPrint}`}>
                                  <button 
                                    className={styles.deleteBtn} 
                                    onClick={() => handleRemoveIngredient(ing.id)}
                                    title="Удалить ингредиент"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {!isReadOnly && (
                      <div className={`${styles.tableFooter} ${styles.noPrint}`}>
                        <button className={styles.addIngBtn} onClick={handleAddIngredient}>
                          <Plus size={16} />
                          Добавить ингредиент
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>Выберите товар слева для просмотра техкарты.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipesModule;
