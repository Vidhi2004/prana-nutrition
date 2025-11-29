import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const DietChartView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dietChart, setDietChart] = useState<any>(null);
  const [dietItems, setDietItems] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDietChartData();
  }, [id]);

  const loadDietChartData = async () => {
    try {
      setLoading(true);

      // Load diet chart
      const { data: chartData, error: chartError } = await supabase
        .from("diet_charts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (chartError) throw chartError;

      if (!chartData) {
        toast.error("Diet chart not found");
        navigate("/patients");
        return;
      }

      setDietChart(chartData);

      // Load patient
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("id", chartData.patient_id)
        .maybeSingle();

      setPatient(patientData);

      // Load diet chart items with food details
      const { data: itemsData } = await supabase
        .from("diet_chart_items")
        .select(`
          *,
          foods (*)
        `)
        .eq("diet_chart_id", id)
        .order("sort_order", { ascending: true });

      setDietItems(itemsData || []);
    } catch (error: any) {
      toast.error("Failed to load diet chart: " + error.message);
      navigate("/patients");
    } finally {
      setLoading(false);
    }
  };

  const groupByMealType = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    items.forEach((item) => {
      if (!grouped[item.meal_type]) {
        grouped[item.meal_type] = [];
      }
      grouped[item.meal_type].push(item);
    });
    return grouped;
  };

  const getTasteColor = (taste: string) => {
    const colors: Record<string, string> = {
      sweet: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      sour: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      salty: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      bitter: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pungent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      astringent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[taste] || "bg-gray-100 text-gray-800";
  };

  const getDoshaIcon = (effect: string) => {
    if (effect === "increase" || effect === "+") return "↑";
    if (effect === "decrease" || effect === "-") return "↓";
    return "=";
  };

  const getDoshaColor = (effect: string) => {
    if (effect === "increase" || effect === "+") return "text-red-600 dark:text-red-400";
    if (effect === "decrease" || effect === "-") return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading diet chart...</p>
      </div>
    );
  }

  if (!dietChart) {
    return null;
  }

  const groupedItems = groupByMealType(dietItems);
  
  // Get unique meal types from actual data and capitalize for display
  const uniqueMealTypes = [...new Set(dietItems.map(item => item.meal_type))];
  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');

  // Calculate analytics
  const mealCalories = uniqueMealTypes.map(mealType => {
    const items = groupedItems[mealType] || [];
    const totalCal = items.reduce((sum, item) => 
      sum + Math.round((item.foods.calories_per_100g * item.quantity_grams) / 100), 0
    );
    return { name: capitalizeFirst(mealType), calories: totalCal };
  });

  const tasteDistribution = dietItems.reduce((acc: any, item) => {
    const taste = item.foods.primary_taste;
    acc[taste] = (acc[taste] || 0) + 1;
    return acc;
  }, {});
  const tasteChartData = Object.entries(tasteDistribution).map(([name, value]) => ({ name, value }));

  const nutritionTotals = dietItems.reduce((acc, item) => {
    const multiplier = item.quantity_grams / 100;
    return {
      protein: acc.protein + (item.foods.protein_g || 0) * multiplier,
      carbs: acc.carbs + (item.foods.carbs_g || 0) * multiplier,
      fat: acc.fat + (item.foods.fat_g || 0) * multiplier,
      fiber: acc.fiber + (item.foods.fiber_g || 0) * multiplier,
    };
  }, { protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const nutritionData = [
    { name: 'Protein', value: nutritionTotals.protein.toFixed(1) },
    { name: 'Carbs', value: nutritionTotals.carbs.toFixed(1) },
    { name: 'Fat', value: nutritionTotals.fat.toFixed(1) },
    { name: 'Fiber', value: nutritionTotals.fiber.toFixed(1) },
  ];

  // Dosha effect aggregation
  const doshaAggregation = dietItems.reduce((acc: any, item) => {
    if (item.foods.dosha_effects) {
      ['vata', 'pitta', 'kapha'].forEach(dosha => {
        const effect = item.foods.dosha_effects[dosha];
        if (!acc[dosha]) acc[dosha] = { increase: 0, decrease: 0, neutral: 0 };
        if (effect === 'increase' || effect === '+') acc[dosha].increase++;
        else if (effect === 'decrease' || effect === '-') acc[dosha].decrease++;
        else acc[dosha].neutral++;
      });
    }
    return acc;
  }, {});

  const doshaRadarData = [
    { 
      dosha: 'Vata', 
      increase: doshaAggregation.vata?.increase || 0,
      decrease: doshaAggregation.vata?.decrease || 0
    },
    { 
      dosha: 'Pitta', 
      increase: doshaAggregation.pitta?.increase || 0,
      decrease: doshaAggregation.pitta?.decrease || 0
    },
    { 
      dosha: 'Kapha', 
      increase: doshaAggregation.kapha?.increase || 0,
      decrease: doshaAggregation.kapha?.decrease || 0
    },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/patients/${dietChart.patient_id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{dietChart.title}</h1>
          {patient && (
            <p className="text-muted-foreground">
              Patient: {patient.full_name} • {patient.age} years • {patient.gender}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(dietChart.chart_date).toLocaleDateString()}
            </div>
            {dietChart.total_calories && (
              <Badge variant="outline">{dietChart.total_calories} cal</Badge>
            )}
          </div>
        </div>

        {dietChart.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{dietChart.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Diet Chart Analytics */}
        {dietItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Diet Chart Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Meal-wise Calorie Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Calorie Distribution by Meal</CardTitle>
                  <CardDescription>Total calories per meal type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mealCalories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calories" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Taste Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Rasa (Taste) Balance</CardTitle>
                  <CardDescription>Distribution of primary tastes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tasteChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tasteChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Dosha Effects Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Dosha Impact Profile</CardTitle>
                  <CardDescription>Overall dosha balancing effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={doshaRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dosha" />
                      <PolarRadiusAxis />
                      <Radar name="Increase" dataKey="increase" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
                      <Radar name="Decrease" dataKey="decrease" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Nutritional Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Macronutrients (grams)</CardTitle>
                  <CardDescription>Daily nutritional breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Meal Plans */}
        <div className="space-y-6">
          {uniqueMealTypes.map((mealType) => {
            const items = groupedItems[mealType];
            if (!items || items.length === 0) return null;

            return (
              <Card key={mealType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    {capitalizeFirst(mealType)}
                  </CardTitle>
                  {items[0].meal_time && (
                    <CardDescription>
                      Suggested time: {items[0].meal_time}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{item.foods.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity_grams}g • {Math.round((item.foods.calories_per_100g * item.quantity_grams) / 100)} cal
                            </p>
                          </div>
                        </div>

                        {/* Ayurvedic Properties */}
                        <div className="space-y-3">
                          {/* Rasa (Taste) */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Rasa (Taste)</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getTasteColor(item.foods.primary_taste)}>
                                Primary: {item.foods.primary_taste}
                              </Badge>
                              {item.foods.secondary_tastes && item.foods.secondary_tastes.length > 0 && (
                                <>
                                  {item.foods.secondary_tastes.map((taste: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className={getTasteColor(taste)}>
                                      {taste}
                                    </Badge>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Virya (Potency) & Digestibility */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Virya (Potency) & Agni</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="secondary">
                                {item.foods.temperature === "hot" ? "🔥 Hot" : item.foods.temperature === "cold" ? "❄️ Cold" : "⚖️ Neutral"}
                              </Badge>
                              <Badge variant="secondary">
                                Digestibility: {item.foods.digestibility}
                              </Badge>
                              {item.foods.category && (
                                <Badge variant="outline">{item.foods.category}</Badge>
                              )}
                            </div>
                          </div>

                          {/* Vipaka (Post-digestive effect) */}
                          {item.foods.vipaka && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Vipaka (Post-digestive)</p>
                              <Badge variant="outline">{item.foods.vipaka}</Badge>
                            </div>
                          )}

                          {/* Guna (Qualities) */}
                          {item.foods.guna && item.foods.guna.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Guna (Qualities)</p>
                              <div className="flex flex-wrap gap-1">
                                {item.foods.guna.map((quality: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {quality}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dosha Effects */}
                          {item.foods.dosha_effects && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Dosha Effects</p>
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Vata:</span>
                                  <span className={getDoshaColor(item.foods.dosha_effects.vata)}>
                                    {getDoshaIcon(item.foods.dosha_effects.vata)} {item.foods.dosha_effects.vata}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Pitta:</span>
                                  <span className={getDoshaColor(item.foods.dosha_effects.pitta)}>
                                    {getDoshaIcon(item.foods.dosha_effects.pitta)} {item.foods.dosha_effects.pitta}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Kapha:</span>
                                  <span className={getDoshaColor(item.foods.dosha_effects.kapha)}>
                                    {getDoshaIcon(item.foods.dosha_effects.kapha)} {item.foods.dosha_effects.kapha}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Nutritional Info */}
                        <Separator className="my-3" />
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {item.foods.protein_g > 0 && (
                            <div>
                              <p className="text-muted-foreground">Protein</p>
                              <p className="font-medium">{((item.foods.protein_g * item.quantity_grams) / 100).toFixed(1)}g</p>
                            </div>
                          )}
                          {item.foods.carbs_g > 0 && (
                            <div>
                              <p className="text-muted-foreground">Carbs</p>
                              <p className="font-medium">{((item.foods.carbs_g * item.quantity_grams) / 100).toFixed(1)}g</p>
                            </div>
                          )}
                          {item.foods.fat_g > 0 && (
                            <div>
                              <p className="text-muted-foreground">Fat</p>
                              <p className="font-medium">{((item.foods.fat_g * item.quantity_grams) / 100).toFixed(1)}g</p>
                            </div>
                          )}
                          {item.foods.fiber_g > 0 && (
                            <div>
                              <p className="text-muted-foreground">Fiber</p>
                              <p className="font-medium">{((item.foods.fiber_g * item.quantity_grams) / 100).toFixed(1)}g</p>
                            </div>
                          )}
                        </div>

                        {item.special_instructions && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-sm italic text-muted-foreground">
                              Note: {item.special_instructions}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {dietItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No items in this diet chart yet.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DietChartView;
