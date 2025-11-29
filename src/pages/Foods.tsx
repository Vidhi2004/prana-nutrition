import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Flame, Snowflake, Wind } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Foods = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const { data } = await supabase
      .from("foods")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setFoods(data || []);
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || food.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(foods.map((f) => f.category))];

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case "hot":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "cold":
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      default:
        return <Wind className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTasteColor = (taste: string) => {
    const colors: Record<string, string> = {
      sweet: "bg-pink-100 text-pink-800",
      sour: "bg-yellow-100 text-yellow-800",
      salty: "bg-blue-100 text-blue-800",
      bitter: "bg-green-100 text-green-800",
      pungent: "bg-red-100 text-red-800",
      astringent: "bg-purple-100 text-purple-800",
    };
    return colors[taste] || "bg-gray-100 text-gray-800";
  };

  // Calculate Ayurvedic distribution data
  const tasteDistribution = foods.reduce((acc: any, food) => {
    const taste = food.primary_taste;
    acc[taste] = (acc[taste] || 0) + 1;
    return acc;
  }, {});

  const tempDistribution = foods.reduce((acc: any, food) => {
    const temp = food.temperature;
    acc[temp] = (acc[temp] || 0) + 1;
    return acc;
  }, {});

  const digestibilityDistribution = foods.reduce((acc: any, food) => {
    const digest = food.digestibility;
    acc[digest] = (acc[digest] || 0) + 1;
    return acc;
  }, {});

  // Calculate dosha effects
  const doshaEffects = foods.reduce((acc: any, food) => {
    if (food.dosha_effects) {
      ['vata', 'pitta', 'kapha'].forEach(dosha => {
        const effect = food.dosha_effects[dosha];
        if (!acc[dosha]) acc[dosha] = { increase: 0, decrease: 0, neutral: 0 };
        if (effect === 'increase' || effect === '+') acc[dosha].increase++;
        else if (effect === 'decrease' || effect === '-') acc[dosha].decrease++;
        else acc[dosha].neutral++;
      });
    }
    return acc;
  }, {});

  const tasteChartData = Object.entries(tasteDistribution).map(([name, value]) => ({ name, value }));
  const tempChartData = Object.entries(tempDistribution).map(([name, value]) => ({ name, value }));
  const digestChartData = Object.entries(digestibilityDistribution).map(([name, value]) => ({ name, value }));
  
  const doshaChartData = Object.entries(doshaEffects).map(([name, effects]: any) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    increase: effects.increase,
    decrease: effects.decrease,
    neutral: effects.neutral
  }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Food Database</h1>
            <p className="text-muted-foreground mt-1">
              Browse {foods.length} Ayurvedic food items with detailed nutritional and property data
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Ayurvedic Analytics Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Ayurvedic Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Rasa (Taste) Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rasa (Taste) Distribution</CardTitle>
                <CardDescription>Primary taste classification across all foods</CardDescription>
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

            {/* Dosha Effects */}
            <Card>
              <CardHeader>
                <CardTitle>Dosha Effects Distribution</CardTitle>
                <CardDescription>Impact on Vata, Pitta, and Kapha doshas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doshaChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="increase" stackId="a" fill="hsl(var(--destructive))" name="Increase" />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(var(--muted))" name="Neutral" />
                    <Bar dataKey="decrease" stackId="a" fill="hsl(var(--primary))" name="Decrease" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Virya (Temperature) */}
            <Card>
              <CardHeader>
                <CardTitle>Virya (Potency) Distribution</CardTitle>
                <CardDescription>Hot, cold, and neutral properties</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tempChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Digestibility */}
            <Card>
              <CardHeader>
                <CardTitle>Agni (Digestibility)</CardTitle>
                <CardDescription>Easy, moderate, and difficult to digest foods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={digestChartData}>
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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => (
            <Card key={food.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{food.name}</CardTitle>
                    <CardDescription>{food.category}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTemperatureIcon(food.temperature)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className={getTasteColor(food.primary_taste)}>
                      {food.primary_taste}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {food.digestibility}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Calories</div>
                      <div className="font-medium">{food.calories_per_100g}/100g</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Protein</div>
                      <div className="font-medium">{food.protein_g}g</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Carbs</div>
                      <div className="font-medium">{food.carbs_g}g</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-xs text-muted-foreground">Fat</div>
                      <div className="font-medium">{food.fat_g}g</div>
                    </div>
                  </div>

                  {food.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{food.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No foods found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Foods;
