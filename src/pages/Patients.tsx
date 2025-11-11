import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });
    setPatients(data || []);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
              <p className="text-muted-foreground mt-1">View and manage all patient records</p>
            </div>
            <Button onClick={() => navigate("/patients/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.full_name}</CardTitle>
                      <CardDescription>
                        {patient.age} years • {patient.gender}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Diet:</span>
                    <Badge variant="secondary">{patient.dietary_habit}</Badge>
                  </div>
                  {patient.contact_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span>{patient.contact_number}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No patients found matching your search." : "No patients yet. Add your first patient to get started."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Patients;
