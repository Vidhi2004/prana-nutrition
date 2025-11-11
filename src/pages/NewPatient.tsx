import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NewPatient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to add patients");
      navigate("/auth");
      return;
    }

    const patientData = {
      practitioner_id: user.id,
      full_name: formData.get("fullName") as string,
      age: parseInt(formData.get("age") as string),
      gender: formData.get("gender") as "male" | "female" | "other",
      contact_number: formData.get("contactNumber") as string,
      email: formData.get("email") as string,
      dietary_habit: formData.get("dietaryHabit") as "vegetarian" | "non_vegetarian" | "vegan" | "eggetarian",
      meal_frequency: parseInt(formData.get("mealFrequency") as string) || 3,
      water_intake_liters: parseFloat(formData.get("waterIntake") as string) || 2.0,
      bowel_movements_per_day: parseInt(formData.get("bowelMovements") as string) || 1,
      medical_history: formData.get("medicalHistory") as string,
      allergies: formData.get("allergies") as string,
      current_medications: formData.get("medications") as string,
      height_cm: parseFloat(formData.get("height") as string),
      weight_kg: parseFloat(formData.get("weight") as string),
    };

    const { error } = await supabase.from("patients").insert([patientData]);

    setIsLoading(false);

    if (error) {
      toast.error("Failed to add patient: " + error.message);
    } else {
      toast.success("Patient added successfully!");
      navigate("/patients");
    }
  };

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Patient</CardTitle>
            <CardDescription>Enter patient details and health parameters</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" name="age" type="number" min="1" max="120" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietaryHabit">Dietary Habit *</Label>
                  <Select name="dietaryHabit" defaultValue="vegetarian" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="eggetarian">Eggetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" name="contactNumber" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" name="height" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mealFrequency">Meals per Day</Label>
                  <Input id="mealFrequency" name="mealFrequency" type="number" min="1" max="10" defaultValue="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterIntake">Water Intake (L)</Label>
                  <Input id="waterIntake" name="waterIntake" type="number" step="0.1" defaultValue="2.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bowelMovements">Bowel Movements/Day</Label>
                  <Input id="bowelMovements" name="bowelMovements" type="number" min="0" max="10" defaultValue="1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea id="medicalHistory" name="medicalHistory" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" name="allergies" rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea id="medications" name="medications" rows={2} />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Adding Patient..." : "Add Patient"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/patients")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default NewPatient;
