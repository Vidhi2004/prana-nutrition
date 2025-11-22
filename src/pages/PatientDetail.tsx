import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [dietCharts, setDietCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);

      // Load patient details
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (patientError) throw patientError;

      if (!patientData) {
        toast.error("Patient not found");
        navigate("/patients");
        return;
      }

      setPatient(patientData);

      // Load diet charts for this patient
      const { data: chartsData } = await supabase
        .from("diet_charts")
        .select("*")
        .eq("patient_id", id)
        .order("chart_date", { ascending: false });

      setDietCharts(chartsData || []);
    } catch (error: any) {
      toast.error("Failed to load patient data: " + error.message);
      navigate("/patients");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const bmi = patient.height_cm && patient.weight_kg
    ? (patient.weight_kg / Math.pow(patient.height_cm / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{patient.full_name}</CardTitle>
                    <CardDescription>
                      {patient.age} years • {patient.gender}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {patient.email && (
                      <div>
                        <span className="font-medium">Email:</span> {patient.email}
                      </div>
                    )}
                    {patient.contact_number && (
                      <div>
                        <span className="font-medium">Phone:</span> {patient.contact_number}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Dietary Information</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">{patient.dietary_habit}</Badge>
                    <div className="text-sm space-y-1">
                      <p>Meals per day: {patient.meal_frequency || "N/A"}</p>
                      <p>Water intake: {patient.water_intake_liters || "N/A"}L</p>
                      <p>Bowel movements: {patient.bowel_movements_per_day || "N/A"}/day</p>
                    </div>
                  </div>
                </div>

                {(patient.height_cm || patient.weight_kg) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Physical Stats</h3>
                      <div className="space-y-1 text-sm">
                        {patient.height_cm && <p>Height: {patient.height_cm} cm</p>}
                        {patient.weight_kg && <p>Weight: {patient.weight_kg} kg</p>}
                        {bmi && <p>BMI: {bmi}</p>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical Info & Diet Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.medical_history && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Medical History</h3>
                    <p className="text-sm text-muted-foreground">{patient.medical_history}</p>
                  </div>
                )}
                {patient.allergies && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Allergies</h3>
                    <p className="text-sm text-muted-foreground">{patient.allergies}</p>
                  </div>
                )}
                {patient.current_medications && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Current Medications</h3>
                    <p className="text-sm text-muted-foreground">{patient.current_medications}</p>
                  </div>
                )}
                {!patient.medical_history && !patient.allergies && !patient.current_medications && (
                  <p className="text-sm text-muted-foreground">No medical information available.</p>
                )}
              </CardContent>
            </Card>

            {/* Diet Charts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Diet Charts
                  </CardTitle>
                  <Button onClick={() => navigate("/diet-charts/new", { state: { patientId: id } })}>
                    Create Diet Chart
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dietCharts.length > 0 ? (
                  <div className="space-y-3">
                    {dietCharts.map((chart) => (
                      <div
                        key={chart.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/diet-charts/${chart.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{chart.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(chart.chart_date).toLocaleDateString()}
                            </p>
                            {chart.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{chart.notes}</p>
                            )}
                          </div>
                          {chart.total_calories && (
                            <Badge variant="outline">{chart.total_calories} cal</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No diet charts created yet. Click "Create Diet Chart" to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetail;
