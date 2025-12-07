import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Trash2, GripVertical, Loader2, Save, FolderOpen, Download, User, FileText } from "lucide-react";
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
  dbId?: string;
}

interface DayMeals {
  breakfast: MealSlot[];
  lunch: MealSlot[];
  dinner: MealSlot[];
  snacks: MealSlot[];
}

interface Patient {
  id: string;
  full_name: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  dosha_target: string | null;
}

type MealType = keyof DayMeals;

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

const MealCalendar = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("personal");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDosha, setSelectedDosha] = useState<string>("all");
  const [weekMeals, setWeekMeals] = useState<Record<string, DayMeals>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Food[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [draggedFood, setDraggedFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Template states
  const [templates, setTemplates] = useState<Template[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  useEffect(() => {
    checkAuth();
    fetchFoods();
  }, []);

  useEffect(() => {
    if (userId) {
      loadSavedMeals();
      fetchPatients();
      fetchTemplates();
    }
  }, [weekOffset, userId, selectedPatient]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else {
      setIsLoading(false);
    }
  };

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

  const fetchPatients = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name")
      .eq("practitioner_id", userId)
      .order("full_name");

    if (error) {
      console.error("Error fetching patients:", error);
      return;
    }
    setPatients(data || []);
  };

  const fetchTemplates = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("meal_plan_templates")
      .select("id, name, description, dosha_target")
      .eq("practitioner_id", userId)
      .order("name");

    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }
    setTemplates(data || []);
  };

  const loadSavedMeals = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const startDate = getDateKey(weekDates[0]);
    const endDate = getDateKey(weekDates[6]);

    let query = supabase
      .from("meal_calendar")
      .select(`
        id,
        meal_date,
        meal_type,
        food_id,
        quantity_grams,
        sort_order,
        patient_id,
        foods (
          id,
          name,
          category,
          calories_per_100g,
          primary_taste,
          dosha_effects
        )
      `)
      .eq("practitioner_id", userId)
      .gte("meal_date", startDate)
      .lte("meal_date", endDate)
      .order("sort_order");

    if (selectedPatient === "personal") {
      query = query.is("patient_id", null);
    } else {
      query = query.eq("patient_id", selectedPatient);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading meals:", error);
      setIsLoading(false);
      return;
    }

    const mealsMap: Record<string, DayMeals> = {};
    
    data?.forEach((item) => {
      const dateKey = item.meal_date;
      const mealType = item.meal_type as MealType;
      
      if (!mealsMap[dateKey]) {
        mealsMap[dateKey] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
      }

      if (item.foods && MEAL_TYPES.includes(mealType)) {
        mealsMap[dateKey][mealType].push({
          id: `${item.food_id}-${item.id}`,
          dbId: item.id,
          food: item.foods as unknown as Food,
          quantity: item.quantity_grams,
        });
      }
    });

    setWeekMeals(mealsMap);
    setIsLoading(false);
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

      const balancingFoods = foods.filter((food) => {
        const effects = food.dosha_effects as Record<string, string> | null;
        if (!effects || typeof effects !== "object") return false;
        return effects[selectedDosha.toLowerCase()] === "decrease";
      });

      setAiSuggestions(balancingFoods.length > 0 ? balancingFoods : foods.slice(0, 10));
      toast.success(`Found ${balancingFoods.length} foods that balance ${selectedDosha}`);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
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

  const handleDrop = async (dateKey: string, mealType: MealType) => {
    if (!draggedFood || !userId) {
      if (!userId) toast.error("Please log in to save meals");
      return;
    }

    const newMealSlot: MealSlot = {
      id: `${draggedFood.id}-${Date.now()}`,
      food: draggedFood,
      quantity: 100,
    };

    setWeekMeals((prev) => {
      const dayMeals = prev[dateKey] || {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };

      return {
        ...prev,
        [dateKey]: {
          ...dayMeals,
          [mealType]: [...dayMeals[mealType], newMealSlot],
        },
      };
    });

    const { data, error } = await supabase
      .from("meal_calendar")
      .insert({
        practitioner_id: userId,
        patient_id: selectedPatient === "personal" ? null : selectedPatient,
        meal_date: dateKey,
        meal_type: mealType,
        food_id: draggedFood.id,
        quantity_grams: 100,
        sort_order: weekMeals[dateKey]?.[mealType]?.length || 0,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save meal");
      loadSavedMeals();
    } else {
      setWeekMeals((prev) => {
        const dayMeals = prev[dateKey];
        if (!dayMeals) return prev;

        return {
          ...prev,
          [dateKey]: {
            ...dayMeals,
            [mealType]: dayMeals[mealType].map((slot) =>
              slot.id === newMealSlot.id ? { ...slot, dbId: data.id } : slot
            ),
          },
        };
      });
      toast.success(`Added ${draggedFood.name} to ${mealType}`);
    }

    setDraggedFood(null);
  };

  const removeMealItem = async (dateKey: string, mealType: MealType, slotId: string, dbId?: string) => {
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

    if (dbId) {
      const { error } = await supabase
        .from("meal_calendar")
        .delete()
        .eq("id", dbId);

      if (error) {
        toast.error("Failed to remove meal");
        loadSavedMeals();
      } else {
        toast.success("Meal removed");
      }
    }
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

  // Template functions
  const saveAsTemplate = async () => {
    if (!userId || !templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      // Create template
      const { data: template, error: templateError } = await supabase
        .from("meal_plan_templates")
        .insert({
          practitioner_id: userId,
          name: templateName.trim(),
          description: templateDescription.trim() || null,
          dosha_target: selectedDosha !== "all" ? selectedDosha : null,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Collect all meal items with day of week
      const templateItems: Array<{
        template_id: string;
        day_of_week: number;
        meal_type: string;
        food_id: string;
        quantity_grams: number;
        sort_order: number;
      }> = [];

      weekDates.forEach((date, dayIndex) => {
        const dateKey = getDateKey(date);
        const dayMeals = weekMeals[dateKey];
        
        if (dayMeals) {
          MEAL_TYPES.forEach((mealType) => {
            dayMeals[mealType].forEach((slot, sortIndex) => {
              templateItems.push({
                template_id: template.id,
                day_of_week: dayIndex,
                meal_type: mealType,
                food_id: slot.food.id,
                quantity_grams: slot.quantity,
                sort_order: sortIndex,
              });
            });
          });
        }
      });

      if (templateItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("meal_plan_template_items")
          .insert(templateItems);

        if (itemsError) throw itemsError;
      }

      toast.success("Template saved successfully!");
      setSaveDialogOpen(false);
      setTemplateName("");
      setTemplateDescription("");
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const loadTemplate = async (templateId: string) => {
    if (!userId) return;

    try {
      const { data: items, error } = await supabase
        .from("meal_plan_template_items")
        .select(`
          day_of_week,
          meal_type,
          food_id,
          quantity_grams,
          sort_order,
          foods (
            id,
            name,
            category,
            calories_per_100g,
            primary_taste,
            dosha_effects
          )
        `)
        .eq("template_id", templateId)
        .order("sort_order");

      if (error) throw error;

      // Clear existing meals for the week
      const startDate = getDateKey(weekDates[0]);
      const endDate = getDateKey(weekDates[6]);

      let deleteQuery = supabase
        .from("meal_calendar")
        .delete()
        .eq("practitioner_id", userId)
        .gte("meal_date", startDate)
        .lte("meal_date", endDate);

      if (selectedPatient === "personal") {
        deleteQuery = deleteQuery.is("patient_id", null);
      } else {
        deleteQuery = deleteQuery.eq("patient_id", selectedPatient);
      }

      await deleteQuery;

      // Insert new meals from template
      const newMeals = items?.map((item) => ({
        practitioner_id: userId,
        patient_id: selectedPatient === "personal" ? null : selectedPatient,
        meal_date: getDateKey(weekDates[item.day_of_week]),
        meal_type: item.meal_type,
        food_id: item.food_id,
        quantity_grams: item.quantity_grams,
        sort_order: item.sort_order,
      })) || [];

      if (newMeals.length > 0) {
        const { error: insertError } = await supabase
          .from("meal_calendar")
          .insert(newMeals);

        if (insertError) throw insertError;
      }

      toast.success("Template loaded successfully!");
      setLoadDialogOpen(false);
      loadSavedMeals();
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template");
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("meal_plan_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  // Export/Print function
  const handleExport = () => {
    const patientName = selectedPatient === "personal" 
      ? "Personal Meal Plan" 
      : patients.find(p => p.id === selectedPatient)?.full_name || "Patient";
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weekly Meal Plan - ${patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #666; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .meal-item { padding: 4px 0; border-bottom: 1px solid #eee; }
          .meal-item:last-child { border-bottom: none; }
          .calories { color: #666; font-size: 12px; }
          .total-row { background-color: #e8f5e9; font-weight: bold; }
          .header-info { text-align: center; margin-bottom: 20px; color: #666; }
          @media print { 
            body { padding: 0; }
            h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <h1>Weekly Meal Plan</h1>
        <h2>${patientName}</h2>
        <p class="header-info">${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}</p>
        <table>
          <thead>
            <tr>
              <th>Meal</th>
              ${weekDates.map((date, i) => `<th>${DAYS_OF_WEEK[i]}<br/><small>${formatDate(date)}</small></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${MEAL_TYPES.map(mealType => `
              <tr>
                <td style="text-transform: capitalize; font-weight: bold;">${mealType}</td>
                ${weekDates.map(date => {
                  const dateKey = getDateKey(date);
                  const meals = weekMeals[dateKey]?.[mealType] || [];
                  return `<td>
                    ${meals.length > 0 
                      ? meals.map(slot => `
                          <div class="meal-item">
                            ${slot.food.name}
                            <div class="calories">${slot.food.calories_per_100g} kcal</div>
                          </div>
                        `).join('')
                      : '<span style="color: #999;">-</span>'
                    }
                  </td>`;
                }).join('')}
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Calories</td>
              ${weekDates.map(date => {
                const dateKey = getDateKey(date);
                const calories = calculateDayCalories(dateKey);
                return `<td>${Math.round(calories)} kcal</td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>
        <p style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
          Generated on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Weekly Meal Calendar</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Patient Selection */}
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[180px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Plan</SelectItem>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Week Navigation */}
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((prev) => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((prev) => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Template Actions */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" /> Save Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Vata Balancing Week"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateDescription">Description (Optional)</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description of this meal plan..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveAsTemplate}>Save Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" /> Load Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Load Template</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2 py-4">
                  {templates.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No templates saved yet</p>
                  ) : (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            {template.description && (
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            )}
                            {template.dosha_target && (
                              <Badge variant="secondary" className="mt-1 capitalize">
                                {template.dosha_target}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => loadTemplate(template.id)}>
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Patient indicator */}
      {selectedPatient !== "personal" && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Creating meal plan for: <strong>{patients.find(p => p.id === selectedPatient)?.full_name}</strong>
          </span>
        </div>
      )}

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
        <div className="overflow-x-auto" ref={printRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                                onClick={() => removeMealItem(dateKey, mealType, slot.id, slot.dbId)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MealCalendar;