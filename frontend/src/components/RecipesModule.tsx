import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Calculator, Save, FileText } from 'lucide-react';
import styles from './RecipesModule.module.css';
import { api } from '../utils/api';

interface RecipeIngredient {
  id: string | number;
  rawMaterialId: string | number;
  amount: number | '';
}

interface ProductRecipe {
  id: string | number;
  name: string;
  ingredients: RecipeIngredient[];
}

interface RecipesModuleProps {
  onBack: () => void;
}

const RecipesModule: React.FC<RecipesModuleProps> = ({ onBack }) => {
  const [recipes, setRecipes] = useState<ProductRecipe[]>([]);
  const [originalRecipes, setOriginalRecipes] = useState<ProductRecipe[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipesAndMaterials = async () => {
    try {
      setIsLoading(true);
      const [recipesData, materialsData] = await Promise.all([
        api.get('/recipes'),
        api.get('/recipes/raw-materials')
      ]);

      setRawMaterials(materialsData || []);

      const mappedRecipes = (recipesData || []).map((r: any) => ({
        id: r.id,
        name: r.product ? r.product.name : 'Без имени',
        ingredients: (r.ingredients || []).map((ing: any) => ({
          id: ing.id,
          rawMaterialId: ing.rawMaterialId,
          amount: ing.amount
        }))
      }));

      setRecipes(mappedRecipes);
      setOriginalRecipes(JSON.parse(JSON.stringify(mappedRecipes)));
      
      // If we don't have an active recipe yet, set it to the first one
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
    return recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
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

  const handleAddIngredient = () => {
    if (!activeRecipe || rawMaterials.length === 0) return;
    
    const newIng: RecipeIngredient = {
      id: `new_${Date.now()}`,
      rawMaterialId: rawMaterials[0].id,
      amount: 1
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

  const calculateIngredientCost = (ing: RecipeIngredient) => {
    if (ing.amount === '') return 0;
    const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
    if (!material) return 0;
    return material.costPerUnit * (ing.amount as number);
  };

  const activeRecipeTotalCost = useMemo(() => {
    if (!activeRecipe) return 0;
    const sum = activeRecipe.ingredients.reduce((acc, ing) => acc + calculateIngredientCost(ing), 0);
    return sum;
  }, [activeRecipe, rawMaterials]);

  const handleSave = async () => {
    if (!activeRecipe || activeRecipeId === null) return;

    const originalActiveRecipe = originalRecipes.find(r => r.id === activeRecipeId);
    if (!originalActiveRecipe) return;

    try {
      // 1. Deleted ingredients
      const deletedIngs = originalActiveRecipe.ingredients.filter(
        orig => !activeRecipe.ingredients.some(curr => curr.id === orig.id)
      );

      // 2. Added ingredients (temporary IDs starting with "new_")
      const addedIngs = activeRecipe.ingredients.filter(
        curr => typeof curr.id === 'string' && curr.id.startsWith('new_')
      );

      // 3. Updated ingredients (ids exist in both but material or amount changed)
      const updatedIngs = activeRecipe.ingredients.filter(curr => {
        const orig = originalActiveRecipe.ingredients.find(o => o.id === curr.id);
        if (!orig) return false;
        return orig.rawMaterialId !== curr.rawMaterialId || orig.amount !== curr.amount;
      });

      // Perform DB updates
      for (const ing of deletedIngs) {
        await api.delete(`/recipes/ingredients/${ing.id}`);
      }

      for (const ing of updatedIngs) {
        await api.patch(`/recipes/ingredients/${ing.id}`, {
          rawMaterialId: Number(ing.rawMaterialId),
          amount: Number(ing.amount)
        });
      }

      for (const ing of addedIngs) {
        await api.post(`/recipes/${activeRecipe.id}/ingredients`, {
          rawMaterialId: Number(ing.rawMaterialId),
          amount: Number(ing.amount)
        });
      }

      setHasChanges(false);
      await fetchRecipesAndMaterials();
    } catch (e) {
      console.error('Failed to save recipe updates', e);
    }
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
                      if (hasChanges) {
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
                          const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
                          const cost = calculateIngredientCost(ing);

                          return (
                            <tr key={ing.id} className={styles.tableRow}>
                              <td>
                                <select 
                                  className={styles.cleanSelect}
                                  value={ing.rawMaterialId}
                                  onChange={(e) => handleMaterialChange(ing.id, e.target.value)}
                                >
                                  {rawMaterials.map(m => (
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
        )}
      </main>
    </div>
  );
};

export default RecipesModule;
