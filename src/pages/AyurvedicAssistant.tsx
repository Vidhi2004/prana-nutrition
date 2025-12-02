import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Leaf, Wind, Flame, Droplets, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AyurvedicAssistant = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedDosha, setSelectedDosha] = useState<string>("");
  const [mealType, setMealType] = useState<string>("full_day");
  const [preferences, setPreferences] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const { data } = await supabase
      .from("foods")
      .select("name, category, primary_taste, temperature, digestibility, dosha_effects")
      .eq("is_active", true)
      .limit(50);
    setFoods(data || []);
  };

  const streamResponse = async (type: "meal_planning" | "dosha_recommendation") => {
    if (type === "dosha_recommendation" && !selectedDosha) {
      toast.error("Please select a dosha first");
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ayurvedic-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type,
          dosha: selectedDosha,
          mealType,
          preferences,
          availableFoods: foods,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to get recommendations");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to get recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case "vata": return <Wind className="h-5 w-5" />;
      case "pitta": return <Flame className="h-5 w-5" />;
      case "kapha": return <Droplets className="h-5 w-5" />;
      default: return <Leaf className="h-5 w-5" />;
    }
  };

  const getDoshaColor = (dosha: string) => {
    switch (dosha) {
      case "vata": return "bg-sky-100 text-sky-800 border-sky-200";
      case "pitta": return "bg-orange-100 text-orange-800 border-orange-200";
      case "kapha": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ayurvedic Assistant</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered meal planning and dosha-based food recommendations
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="meal_planning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="meal_planning">Meal Planning</TabsTrigger>
            <TabsTrigger value="dosha_recommendation">Dosha Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="meal_planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Balanced Meal Planner
                </CardTitle>
                <CardDescription>
                  Get AI-powered meal suggestions based on Ayurvedic principles of the six tastes and dosha balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Dosha (Optional)</label>
                    <Select value={selectedDosha} onValueChange={setSelectedDosha}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your dosha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vata">Vata (Air/Space)</SelectItem>
                        <SelectItem value="pitta">Pitta (Fire/Water)</SelectItem>
                        <SelectItem value="kapha">Kapha (Earth/Water)</SelectItem>
                        <SelectItem value="vata-pitta">Vata-Pitta</SelectItem>
                        <SelectItem value="pitta-kapha">Pitta-Kapha</SelectItem>
                        <SelectItem value="vata-kapha">Vata-Kapha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meal Type</label>
                    <Select value={mealType} onValueChange={setMealType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_day">Full Day Plan</SelectItem>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dietary Preferences (Optional)</label>
                  <Textarea
                    placeholder="E.g., vegetarian, no dairy, gluten-free, low spice..."
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={() => streamResponse("meal_planning")} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Meal Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dosha_recommendation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getDoshaIcon(selectedDosha)}
                  Dosha-Balancing Foods
                </CardTitle>
                <CardDescription>
                  Get personalized food recommendations to balance your dosha constitution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your Dosha</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["vata", "pitta", "kapha"].map((dosha) => (
                      <button
                        key={dosha}
                        onClick={() => setSelectedDosha(dosha)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDosha === dosha
                            ? getDoshaColor(dosha) + " border-current"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {getDoshaIcon(dosha)}
                          <span className="font-medium capitalize">{dosha}</span>
                          <span className="text-xs text-muted-foreground">
                            {dosha === "vata" && "Air/Space"}
                            {dosha === "pitta" && "Fire/Water"}
                            {dosha === "kapha" && "Earth/Water"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDosha && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 capitalize">{selectedDosha} Characteristics</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDosha === "vata" && "Vata governs movement and creativity. When imbalanced, it can cause anxiety, dry skin, and digestive issues. Favor warm, moist, grounding foods."}
                      {selectedDosha === "pitta" && "Pitta governs metabolism and transformation. When imbalanced, it can cause inflammation, anger, and skin issues. Favor cooling, sweet, and bitter foods."}
                      {selectedDosha === "kapha" && "Kapha governs structure and stability. When imbalanced, it can cause weight gain, lethargy, and congestion. Favor light, warm, and spicy foods."}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => streamResponse("dosha_recommendation")} 
                  disabled={isLoading || !selectedDosha}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Recommendations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Food Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {response && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{response}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Dosha Food Reference */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Reference: Foods by Dosha Effect</CardTitle>
            <CardDescription>Foods from our database categorized by their dosha effects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["vata", "pitta", "kapha"].map((dosha) => {
                const balancingFoods = foods.filter(
                  (f) => f.dosha_effects?.[dosha] === "decrease" || f.dosha_effects?.[dosha] === "-"
                );
                return (
                  <div key={dosha} className={`p-4 rounded-lg ${getDoshaColor(dosha)}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {getDoshaIcon(dosha)}
                      <h4 className="font-medium capitalize">Balances {dosha}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {balancingFoods.slice(0, 8).map((food) => (
                        <Badge key={food.name} variant="secondary" className="text-xs">
                          {food.name}
                        </Badge>
                      ))}
                      {balancingFoods.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{balancingFoods.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AyurvedicAssistant;
