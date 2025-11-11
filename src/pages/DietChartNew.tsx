import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  full_name: string;
}

interface Food {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface DietItem {
  food_id: string;
  meal_type: string;
  quantity_grams: number;
  meal_time?: string;
  special_instructions?: string;
}

const DietChartNew = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [chartDate, setChartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dietItems, setDietItems] = useState<DietItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
    loadFoods();
  }, []);

  const loadPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("id, full_name")
      .order("full_name");
    setPatients(data || []);
  };

  const loadFoods = async () => {
    const { data } = await supabase
      .from("foods")
      .select("id, name, category, calories_per_100g, protein_g, carbs_g, fat_g")
      .eq("is_active", true)
      .order("name");
    setFoods(data || []);
  };

  const addDietItem = () => {
    setDietItems([
      ...dietItems,
      {
        food_id: "",
        meal_type: "breakfast",
        quantity_grams: 100,
        meal_time: "",
        special_instructions: "",
      },
    ]);
  };

  const removeDietItem = (index: number) => {
    setDietItems(dietItems.filter((_, i) => i !== index));
  };

  const updateDietItem = (index: number, field: keyof DietItem, value: any) => {
    const updated = [...dietItems];
    updated[index] = { ...updated[index], [field]: value };
    setDietItems(updated);
  };

  const calculateTotals = () => {
    return dietItems.reduce((acc, item) => {
      const food = foods.find(f => f.id === item.food_id);
      if (!food) return acc;
      const multiplier = item.quantity_grams / 100;
      return {
        calories: acc.calories + (food.calories_per_100g * multiplier),
        protein: acc.protein + (food.protein_g * multiplier),
        carbs: acc.carbs + (food.carbs_g * multiplier),
        fat: acc.fat + (food.fat_g * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    
    if (dietItems.length === 0) {
      toast.error("Please add at least one food item");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totals = calculateTotals();

      const { data: chart, error: chartError } = await supabase
        .from("diet_charts")
        .insert({
          patient_id: selectedPatient,
          practitioner_id: user.id,
          title,
          notes,
          chart_date: chartDate,
          total_calories: totals.calories,
        })
        .select()
        .single();

      if (chartError) throw chartError;

      const items = dietItems.map((item, index) => ({
        diet_chart_id: chart.id,
        food_id: item.food_id,
        meal_type: item.meal_type,
        quantity_grams: item.quantity_grams,
        meal_time: item.meal_time || null,
        special_instructions: item.special_instructions || null,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase
        .from("diet_chart_items")
        .insert(items);

      if (itemsError) throw itemsError;

      toast.success("Diet chart created successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating diet chart:", error);
      toast.error(error.message || "Failed to create diet chart");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Create Diet Chart</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diet Chart Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chartDate">Date *</Label>
                  <Input
                    id="chartDate"
                    type="date"
                    value={chartDate}
                    onChange={(e) => setChartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weight Loss Diet Plan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions or notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meal Items</CardTitle>
              <Button type="button" onClick={addDietItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dietItems.map((item, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Food Item *</Label>
                        <Select
                          value={item.food_id}
                          onValueChange={(value) => updateDietItem(index, "food_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select food" />
                          </SelectTrigger>
                          <SelectContent>
                            {foods.map((food) => (
                              <SelectItem key={food.id} value={food.id}>
                                {food.name} ({food.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Meal Type *</Label>
                        <Select
                          value={item.meal_type}
                          onValueChange={(value) => updateDietItem(index, "meal_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="mid_morning">Mid Morning</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity (g) *</Label>
                        <Input
                          type="number"
                          value={item.quantity_grams}
                          onChange={(e) => updateDietItem(index, "quantity_grams", parseFloat(e.target.value))}
                          min="1"
                          required
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeDietItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Meal Time</Label>
                        <Input
                          type="time"
                          value={item.meal_time || ""}
                          onChange={(e) => updateDietItem(index, "meal_time", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Special Instructions</Label>
                        <Input
                          value={item.special_instructions || ""}
                          onChange={(e) => updateDietItem(index, "special_instructions", e.target.value)}
                          placeholder="e.g., with warm water"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {dietItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No items added. Click "Add Item" to start building the diet chart.
                </p>
              )}
            </CardContent>
          </Card>

          {dietItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Calories</div>
                    <div className="text-2xl font-bold">{totals.calories.toFixed(0)} kcal</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Protein</div>
                    <div className="text-2xl font-bold">{totals.protein.toFixed(1)}g</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Carbs</div>
                    <div className="text-2xl font-bold">{totals.carbs.toFixed(1)}g</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Fat</div>
                    <div className="text-2xl font-bold">{totals.fat.toFixed(1)}g</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Diet Chart"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DietChartNew;
