import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, FileText, User, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [patientRecord, setPatientRecord] = useState<any>(null);
  const [dietCharts, setDietCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Load patient record (if exists)
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("email", profileData?.contact_number)
        .single();
      setPatientRecord(patientData);

      // Load diet charts
      if (patientData) {
        const { data: chartsData } = await supabase
          .from("diet_charts")
          .select(`
            *,
            diet_chart_items (
              *,
              foods (name, category)
            )
          `)
          .eq("patient_id", patientData.id)
          .order("created_at", { ascending: false });
        setDietCharts(chartsData || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AyurDiet</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || "Patient"}
              </p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h2>
          <p className="text-muted-foreground">View your diet plans and health information</p>
        </div>

        {!patientRecord ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome to AyurDiet</CardTitle>
              <CardDescription>
                Your practitioner will add your health information and create personalized diet plans for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact your dietitian to get started with your personalized Ayurvedic diet plan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Name: </span>
                    <span className="text-sm text-muted-foreground">{patientRecord.full_name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Age: </span>
                    <span className="text-sm text-muted-foreground">{patientRecord.age} years</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Gender: </span>
                    <span className="text-sm text-muted-foreground capitalize">{patientRecord.gender}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Dietary Habit: </span>
                    <span className="text-sm text-muted-foreground capitalize">{patientRecord.dietary_habit}</span>
                  </div>
                  {patientRecord.height_cm && patientRecord.weight_kg && (
                    <div>
                      <span className="text-sm font-medium">BMI: </span>
                      <span className="text-sm text-muted-foreground">
                        {(patientRecord.weight_kg / Math.pow(patientRecord.height_cm / 100, 2)).toFixed(1)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Diet Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{dietCharts.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {dietCharts.length === 0
                      ? "No diet plans yet. Your dietitian will create one for you."
                      : "Active diet plans created by your dietitian"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">My Diet Plans</h3>
              {dietCharts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No diet plans available yet. Your dietitian will create personalized plans for you.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {dietCharts.map((chart) => (
                    <Card key={chart.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{chart.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(chart.chart_date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Total Calories: </span>
                            <span className="text-sm text-muted-foreground">
                              {chart.total_calories || 0} kcal
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Meal Items: </span>
                            <span className="text-sm text-muted-foreground">
                              {chart.diet_chart_items?.length || 0} items
                            </span>
                          </div>
                          {chart.notes && (
                            <div>
                              <span className="text-sm font-medium">Notes: </span>
                              <p className="text-sm text-muted-foreground">{chart.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
