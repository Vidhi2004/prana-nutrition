import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, Users, BookOpen, FileText, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">AyurDiet</span>
        </div>
        <Button onClick={() => navigate("/auth")}>Get Started</Button>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Ayurvedic Diet Management
            <span className="block text-primary mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive cloud-based practice management software for Ayurvedic dietitians.
            Combine modern nutrition science with traditional Ayurvedic principles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Patient Management</h3>
            <p className="text-muted-foreground">
              Comprehensive patient profiles with age, gender, dietary habits, and complete health parameters
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Food Database</h3>
            <p className="text-muted-foreground">
              8,000+ foods with Ayurvedic properties: Hot/Cold, digestibility, six tastes (Rasa), and complete nutrients
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Diet Charts</h3>
            <p className="text-muted-foreground">
              Generate balanced, Ayurveda-compliant diet plans with automated nutrient analysis and recipes
            </p>
          </div>
        </div>

        <div className="bg-card p-8 rounded-lg border max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Scientifically calculated nutrients for all age groups",
              "Ayurvedic food properties (temperature, digestibility, tastes)",
              "Recipe-based meal planning with automated analysis",
              "Secure patient data with healthcare compliance",
              "Printable diet charts and reports",
              "Mobile and tablet compatibility",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 AyurDiet. Comprehensive Ayurvedic Diet Management Software.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
