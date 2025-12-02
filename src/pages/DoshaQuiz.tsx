import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Leaf } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: {
    text: string;
    dosha: "vata" | "pitta" | "kapha";
  }[];
}

const quizQuestions: Question[] = [
  {
    id: "body_frame",
    question: "What best describes your body frame?",
    options: [
      { text: "Thin, light, and lean with prominent joints", dosha: "vata" },
      { text: "Medium build with moderate muscle tone", dosha: "pitta" },
      { text: "Large, solid frame with tendency to gain weight", dosha: "kapha" },
    ],
  },
  {
    id: "skin_type",
    question: "How would you describe your skin?",
    options: [
      { text: "Dry, rough, thin, and prone to cracking", dosha: "vata" },
      { text: "Warm, oily, prone to rashes or acne", dosha: "pitta" },
      { text: "Thick, smooth, moist, and cool", dosha: "kapha" },
    ],
  },
  {
    id: "hair_type",
    question: "What is your hair like?",
    options: [
      { text: "Dry, brittle, frizzy, or thin", dosha: "vata" },
      { text: "Fine, straight, prone to premature graying", dosha: "pitta" },
      { text: "Thick, wavy, lustrous, and oily", dosha: "kapha" },
    ],
  },
  {
    id: "appetite",
    question: "How would you describe your appetite?",
    options: [
      { text: "Variable - sometimes hungry, sometimes not", dosha: "vata" },
      { text: "Strong - I get irritable if I miss meals", dosha: "pitta" },
      { text: "Steady - I can skip meals without discomfort", dosha: "kapha" },
    ],
  },
  {
    id: "digestion",
    question: "How is your digestion?",
    options: [
      { text: "Irregular with gas and bloating", dosha: "vata" },
      { text: "Quick with occasional heartburn", dosha: "pitta" },
      { text: "Slow but steady", dosha: "kapha" },
    ],
  },
  {
    id: "sleep_pattern",
    question: "What is your sleep pattern like?",
    options: [
      { text: "Light sleeper, wake up easily, interrupted", dosha: "vata" },
      { text: "Moderate, fall asleep easily but may wake hot", dosha: "pitta" },
      { text: "Deep and long, hard to wake up", dosha: "kapha" },
    ],
  },
  {
    id: "temperature",
    question: "How do you respond to temperature?",
    options: [
      { text: "Cold hands/feet, prefer warmth", dosha: "vata" },
      { text: "Usually warm, prefer cool environments", dosha: "pitta" },
      { text: "Tolerate most temperatures well", dosha: "kapha" },
    ],
  },
  {
    id: "mental_activity",
    question: "How would you describe your mental activity?",
    options: [
      { text: "Quick, restless, creative, many ideas", dosha: "vata" },
      { text: "Sharp, focused, analytical, determined", dosha: "pitta" },
      { text: "Calm, steady, methodical, good memory", dosha: "kapha" },
    ],
  },
  {
    id: "stress_response",
    question: "How do you typically respond to stress?",
    options: [
      { text: "Anxiety, worry, fear", dosha: "vata" },
      { text: "Irritability, anger, frustration", dosha: "pitta" },
      { text: "Withdrawal, comfort eating, lethargy", dosha: "kapha" },
    ],
  },
  {
    id: "energy_levels",
    question: "How are your energy levels throughout the day?",
    options: [
      { text: "Variable - bursts of energy then fatigue", dosha: "vata" },
      { text: "High and sustained until I crash", dosha: "pitta" },
      { text: "Steady and enduring throughout", dosha: "kapha" },
    ],
  },
];

const DoshaQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "vata" | "pitta" | "kapha">>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (dosha: "vata" | "pitta" | "kapha") => {
    setAnswers((prev) => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: dosha,
    }));
  };

  const goToNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateResults = () => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(answers).forEach((dosha) => {
      scores[dosha]++;
    });
    return scores;
  };

  const getDominantDosha = (scores: { vata: number; pitta: number; kapha: number }) => {
    const max = Math.max(scores.vata, scores.pitta, scores.kapha);
    const dominants = [];
    if (scores.vata === max) dominants.push("Vata");
    if (scores.pitta === max) dominants.push("Pitta");
    if (scores.kapha === max) dominants.push("Kapha");
    return dominants.join("-");
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < quizQuestions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setShowResults(true);
  };

  const scores = calculateResults();
  const dominantDosha = getDominantDosha(scores);

  const doshaInfo: Record<string, { color: string; description: string; foods: string[] }> = {
    Vata: {
      color: "from-purple-500 to-indigo-500",
      description: "Vata types are creative, energetic, and quick-thinking. They benefit from warm, grounding, nourishing foods.",
      foods: ["Warm soups", "Cooked grains", "Root vegetables", "Ghee", "Warm milk", "Sweet fruits"],
    },
    Pitta: {
      color: "from-orange-500 to-red-500",
      description: "Pitta types are focused, determined, and driven. They benefit from cooling, calming foods that reduce heat.",
      foods: ["Cooling vegetables", "Sweet fruits", "Coconut", "Mint", "Cucumber", "Dairy"],
    },
    Kapha: {
      color: "from-green-500 to-teal-500",
      description: "Kapha types are calm, steady, and nurturing. They benefit from light, warming, stimulating foods.",
      foods: ["Light grains", "Spicy foods", "Leafy greens", "Legumes", "Honey", "Ginger"],
    },
  };

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
              <Leaf className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Your Dosha Constitution</CardTitle>
            <CardDescription className="text-lg">
              Based on your answers, your dominant dosha is:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-center p-6 rounded-xl bg-gradient-to-r ${doshaInfo[dominantDosha.split("-")[0]]?.color || "from-primary to-primary/80"} text-white mb-8`}>
              <h2 className="text-4xl font-bold mb-2">{dominantDosha}</h2>
              <p className="opacity-90">{doshaInfo[dominantDosha.split("-")[0]]?.description}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {(["vata", "pitta", "kapha"] as const).map((dosha) => (
                <Card key={dosha} className="relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all"
                    style={{ height: `${(scores[dosha] / quizQuestions.length) * 100}%` }}
                  />
                  <CardContent className="p-4 relative z-10">
                    <h3 className="font-semibold capitalize text-lg">{dosha}</h3>
                    <p className="text-3xl font-bold text-primary">
                      {Math.round((scores[dosha] / quizQuestions.length) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scores[dosha]} of {quizQuestions.length} traits
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Recommended Foods for {dominantDosha}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {doshaInfo[dominantDosha.split("-")[0]]?.foods.map((food) => (
                    <span
                      key={food}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 mt-8 justify-center">
              <Button variant="outline" onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
              }}>
                Retake Quiz
              </Button>
              <Button onClick={() => navigate("/ayurvedic-assistant")}>
                Get Personalized Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl">Dosha Assessment Quiz</CardTitle>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-lg font-medium">
              {quizQuestions[currentQuestion].question}
            </h2>

            <RadioGroup
              value={answers[quizQuestions[currentQuestion].id] || ""}
              onValueChange={(value) => handleAnswer(value as "vata" | "pitta" | "kapha")}
              className="space-y-3"
            >
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.dosha} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentQuestion === quizQuestions.length - 1 ? (
                <Button onClick={handleSubmit}>
                  <Check className="mr-2 h-4 w-4" /> View Results
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={!answers[quizQuestions[currentQuestion].id]}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoshaQuiz;
