import React, { useState } from "react";
import { useGlobalContext } from "../../context/globalContext";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Calculator, PieChart, LineChart, Loader2, Info } from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "../../lib/utils";

const FinancialSuggestion = () => {
  const { fetchSuggestions, totalIncome, totalExpenses, saveSuggestions } = useGlobalContext();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCalculator, setSelectedCalculator] = useState("SIP");
  const [calculatorDetails, setCalculatorDetails] = useState({});
  const [calculatorResult, setCalculatorResult] = useState("");
  const [chartData, setChartData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const data = await fetchSuggestions(totalIncome() - totalExpenses(), totalIncome(), totalExpenses());
      if (data?.suggestions) {
        const suggestionsArray = Array.isArray(data.suggestions)
          ? data.suggestions
          : data.suggestions.split("\n").map(item => item.trim()).filter(Boolean);
        setSuggestions(suggestionsArray);
        await saveSuggestions(suggestionsArray);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatorChange = (field, value) => {
    setCalculatorDetails({ ...calculatorDetails, [field]: value });
  };

  const handleCalculation = () => {
    const { principal, rate, time } = calculatorDetails;
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 100 / 12;
    const T = parseFloat(time);
    const N = T * 12;

    if (isNaN(P) || isNaN(R) || isNaN(T)) return;

    let result = 0;
    let resultData = [];
    let pieChartData = [];

    switch (selectedCalculator) {
      case "SIP":
        result = (P * ((Math.pow(1 + R, N) - 1) / R)) * (1 + R);
        resultData = Array.from({ length: N }, (_, i) => P * ((Math.pow(1 + R, i + 1) - 1) / R) * (1 + R));
        pieChartData = [P * N, result - P * N];
        break;
      case "Mutual Funds":
      case "Fixed Deposit":
        result = P * Math.pow(1 + R, N);
        resultData = Array.from({ length: N }, (_, i) => P * Math.pow(1 + R, i + 1));
        pieChartData = [P, result - P];
        break;
      default: break;
    }

    setCalculatorResult(`Estimated Value: ₹${result.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    setChartData({
      labels: resultData.map((_, i) => i % 12 === 0 ? `Yr ${Math.floor(i/12) + 1}` : ''),
      datasets: [{
        label: 'Growth',
        data: resultData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
    setPieData({
      labels: ["Principal", "Estimated Returns"],
      datasets: [{
        data: pieChartData,
        backgroundColor: ["#3b82f6", "#10b981"],
        borderWidth: 0,
      }]
    });
  };

  const calculators = ["SIP", "Fixed Deposit", "Mutual Funds", "SWP", "Gold", "PPF"];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Suggestions</h1>
          <p className="text-slate-500 dark:text-slate-400">AI-powered advice and financial calculators.</p>
        </div>
        <Button onClick={handleGetSuggestions} disabled={loading} className="shadow-lg">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Get AI Advice
        </Button>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {suggestions.map((s, i) => (
              <Card key={i} className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden group hover:ring-2 hover:ring-primary-500 transition-all">
                <CardContent className="p-5 flex gap-4">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg shrink-0 h-fit">
                    <Info className="h-4 w-4 text-primary-600" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {s.replace(/^[0-9.-]+\s*/, '')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary-600" />
                Financial Calculators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {calculators.map(calc => (
                  <button
                    key={calc}
                    onClick={() => setSelectedCalculator(calc)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                      selectedCalculator === calc 
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {calc}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Principal Amount (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 10000"
                    onChange={(e) => handleCalculatorChange("principal", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Interest Rate (%)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 12"
                    onChange={(e) => handleCalculatorChange("rate", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Duration (Years)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 10"
                    onChange={(e) => handleCalculatorChange("time", e.target.value)} 
                  />
                </div>
                <Button onClick={handleCalculation} className="w-full">Calculate Returns</Button>
              </div>

              {calculatorResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Result</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{calculatorResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {chartData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid gap-6 sm:grid-cols-2"
              >
                <Card className="border-none shadow-md sm:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChart className="h-4 w-4" /> Investment Mix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md sm:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <LineChart className="h-4 w-4" /> Growth Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <Line data={chartData} options={{ maintainAspectRatio: false, scales: { x: { display: false } } }} />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <div>
                  <Calculator className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 max-w-xs mx-auto">Enter values and click calculate to see your wealth projection charts.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FinancialSuggestion;
