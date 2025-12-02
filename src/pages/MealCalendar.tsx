import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Food {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  primary_taste: string;
  dosha_effects: unknown;
}

interface MealSlot {
  id: string;
  food: Food;
  quantity: number;
}

interface DayMeals {
  breakfast: MealSlot[];
  lunch: MealSlot[];
  dinner: MealSlot[];
  snacks: MealSlot[];
}

type MealType = keyof DayMeals;

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

const MealCalendar = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<Food[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDosha, setSelectedDosha] = useState<string>("all");
  const [weekMeals, setWeekMeals] = useState<Record<string, DayMeals>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Food[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [draggedFood, setDraggedFood] = useState<Food | null>(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      toast.error("Failed to fetch foods");
      return;
    }
    setFoods(data || []);
  };

  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
    
    return DAYS_OF_WEEK.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const fetchAiSuggestions = async () => {
    if (selectedDosha === "all") {
      toast.error("Please select a dosha to get personalized suggestions");
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ayurvedic-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: "dosha_recommendation",
            dosha: selectedDosha,
            availableFoods: foods.slice(0, 30),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }

      // Filter foods that balance the selected dosha
      const balancingFoods = foods.filter((food) => {
        const effects = food.dosha_effects as Record<string, string> | null;
        if (!effects || typeof effects !== "object") return false;
        return effects[selectedDosha.toLowerCase()] === "decrease";
      });

      setAiSuggestions(balancingFoods.length > 0 ? balancingFoods : foods.slice(0, 10));
      toast.success(`Found ${balancingFoods.length} foods that balance ${selectedDosha}`);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Fallback to showing foods based on dosha effects
      const balancingFoods = foods.filter((food) => {
        const effects = food.dosha_effects as Record<string, string> | null;
        if (!effects || typeof effects !== "object") return false;
        return effects[selectedDosha.toLowerCase()] === "decrease";
      });
      setAiSuggestions(balancingFoods.length > 0 ? balancingFoods : foods.slice(0, 10));
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleDragStart = (food: Food) => {
    setDraggedFood(food);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dateKey: string, mealType: MealType) => {
    if (!draggedFood) return;

    setWeekMeals((prev) => {
      const dayMeals = prev[dateKey] || {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };

      const newMealSlot: MealSlot = {
        id: `${draggedFood.id}-${Date.now()}`,
        food: draggedFood,
        quantity: 100,
      };

      return {
        ...prev,
        [dateKey]: {
          ...dayMeals,
          [mealType]: [...dayMeals[mealType], newMealSlot],
        },
      };
    });

    setDraggedFood(null);
    toast.success(`Added ${draggedFood.name} to ${mealType}`);
  };

  const removeMealItem = (dateKey: string, mealType: MealType, slotId: string) => {
    setWeekMeals((prev) => {
      const dayMeals = prev[dateKey];
      if (!dayMeals) return prev;

      return {
        ...prev,
        [dateKey]: {
          ...dayMeals,
          [mealType]: dayMeals[mealType].filter((slot) => slot.id !== slotId),
        },
      };
    });
  };

  const calculateDayCalories = (dateKey: string) => {
    const dayMeals = weekMeals[dateKey];
    if (!dayMeals) return 0;

    return MEAL_TYPES.reduce((total, mealType) => {
      return total + dayMeals[mealType].reduce((mealTotal, slot) => {
        return mealTotal + (slot.food.calories_per_100g * slot.quantity) / 100;
      }, 0);
    }, 0);
  };

  const getDoshaColor = (dosha: string) => {
    switch (dosha) {
      case "vata": return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "pitta": return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "kapha": return "bg-green-500/10 text-green-700 border-green-200";
      default: return "bg-muted";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Weekly Meal Calendar</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setWeekOffset((prev) => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          <Button variant="outline" onClick={() => setWeekOffset((prev) => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Sidebar - AI Suggestions */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Food Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDosha} onValueChange={setSelectedDosha}>
              <SelectTrigger>
                <SelectValue placeholder="Select dosha to balance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doshas</SelectItem>
                <SelectItem value="vata">Balance Vata</SelectItem>
                <SelectItem value="pitta">Balance Pitta</SelectItem>
                <SelectItem value="kapha">Balance Kapha</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchAiSuggestions}
              disabled={isLoadingSuggestions || selectedDosha === "all"}
              className="w-full"
            >
              {isLoadingSuggestions ? "Loading..." : "Get Suggestions"}
            </Button>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {(aiSuggestions.length > 0 ? aiSuggestions : foods.slice(0, 15)).map((food) => (
                  <div
                    key={food.id}
                    draggable
                    onDragStart={() => handleDragStart(food)}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{food.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {food.calories_per_100g} kcal
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {food.primary_taste}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-2 font-semibold text-sm text-muted-foreground">Meal</div>
              {weekDates.map((date, index) => (
                <div key={index} className="p-2 text-center">
                  <p className="font-semibold text-sm">{DAYS_OF_WEEK[index]}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                </div>
              ))}
            </div>

            {/* Meal Rows */}
            {MEAL_TYPES.map((mealType) => (
              <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
                <div className="p-3 bg-muted/50 rounded-lg flex items-center">
                  <span className="font-medium text-sm capitalize">{mealType}</span>
                </div>
                {weekDates.map((date) => {
                  const dateKey = getDateKey(date);
                  const meals = weekMeals[dateKey]?.[mealType] || [];

                  return (
                    <div
                      key={dateKey}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(dateKey, mealType)}
                      className="min-h-[100px] p-2 border-2 border-dashed border-muted rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        {meals.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-2 bg-primary/10 rounded text-xs group relative"
                          >
                            <p className="font-medium truncate pr-5">{slot.food.name}</p>
                            <p className="text-muted-foreground">
                              {slot.food.calories_per_100g} kcal
                            </p>
                            <button
                              onClick={() => removeMealItem(dateKey, mealType, slot.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          </div>
                        ))}
                        {meals.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            Drop food here
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Calorie Summary Row */}
            <div className="grid grid-cols-8 gap-2 mt-4">
              <div className="p-3 bg-primary/10 rounded-lg flex items-center">
                <span className="font-semibold text-sm">Total Calories</span>
              </div>
              {weekDates.map((date) => {
                const dateKey = getDateKey(date);
                const calories = calculateDayCalories(dateKey);

                return (
                  <div
                    key={dateKey}
                    className="p-3 bg-primary/10 rounded-lg text-center"
                  >
                    <span className="font-bold text-primary">
                      {Math.round(calories)} kcal
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCalendar;
