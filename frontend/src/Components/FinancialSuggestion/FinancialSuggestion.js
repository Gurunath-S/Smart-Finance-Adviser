import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/globalContext";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const FinancialSuggestion = () => {
  const { fetchSuggestions, totalIncome, totalExpenses, saveSuggestions } = useGlobalContext();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCalculator, setSelectedCalculator] = useState("");
  const [calculatorDetails, setCalculatorDetails] = useState({});
  const [calculatorResult, setCalculatorResult] = useState("");
  const [chartData, setChartData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions]);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    setError("");

    try {
      const data = await fetchSuggestions(totalIncome() - totalExpenses(), totalIncome(), totalExpenses());

      if (data?.suggestions) {
        const suggestionsArray = Array.isArray(data.suggestions)
          ? data.suggestions
          : data.suggestions.split("\n").map(item => item.trim()).filter(Boolean);

        setSuggestions(suggestionsArray);

        await saveSuggestions(suggestionsArray);
      } else {
        throw new Error("No suggestions found.");
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Failed to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatorChange = (field, value) => {
    setCalculatorDetails({ ...calculatorDetails, [field]: value });
  };

  const handleCalculation = () => {
    const { principal, rate, time, withdrawals } = calculatorDetails;
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 100 / 12;
    const T = parseFloat(time);
    const N = T * 12;
    const W = parseFloat(withdrawals);

    if (isNaN(P) || isNaN(R) || isNaN(T) || (selectedCalculator === "SWP" && isNaN(W))) {
      setCalculatorResult("Please enter valid numbers for all fields.");
      return;
    }

    if (P <= 0 || R <= 0 || T <= 0) {
      setCalculatorResult("All input values must be greater than 0.");
      return;
    }

    let result = 0;
    let resultData = [];
    let pieChartData = [];

    switch (selectedCalculator) {
      case "SIP":
        result = (P * ((Math.pow(1 + R, N) - 1) / R)) * (1 + R);
        resultData = Array.from({ length: N }, (_, i) =>
          P * ((Math.pow(1 + R, i) - 1) / R)
        );
        pieChartData = [P * N, result - P * N];
        setCalculatorResult(`Matured Value: ₹${result.toFixed(2)}`);
        break;

      case "SWP":
        if (!W || W <= 0) {
          setCalculatorResult("Please enter a valid monthly withdrawal amount.");
          return;
        }
        let remainingAmount = P;
        resultData = [];
        for (let i = 0; i < N; i++) {
          remainingAmount = (remainingAmount - W) * (1 + R);
          resultData.push(Math.max(0, remainingAmount));
        }
        result = Math.max(0, remainingAmount);
        const totalWithdrawn = W * N;
        pieChartData = [result, totalWithdrawn];
        setCalculatorResult(`Remaining Value After Withdrawals: ₹${result.toFixed(2)}`);
        break;

      case "Fixed Deposit":
      case "Mutual Funds":
        result = P * Math.pow(1 + R, N);
        resultData = Array.from({ length: N }, (_, i) =>
          P * Math.pow(1 + R, i)
        );
        pieChartData = [P, result - P];
        setCalculatorResult(`Matured Value: ₹${result.toFixed(2)}`);
        break;

      case "PPF":
        result = P * ((Math.pow(1 + R * 12, T) - 1) / (R * 12));
        resultData = Array.from({ length: T }, (_, i) =>
          P * ((Math.pow(1 + R * 12, i) - 1) / (R * 12))
        );
        pieChartData = [P * T, result - P * T];
        setCalculatorResult(`Matured PPF Value: ₹${result.toFixed(2)}`);
        break;

      case "Gold":
        result = P * Math.pow(1 + parseFloat(rate) / 100, T);
        resultData = Array.from({ length: T }, (_, i) =>
          P * Math.pow(1 + parseFloat(rate) / 100, i)
        );
        pieChartData = [P, result - P];
        setCalculatorResult(`Gold Investment Value: ₹${result.toFixed(2)}`);
        break;

      default:
        setCalculatorResult("Select a calculator to begin.");
        return;
    }

    if (resultData.length > 0 && pieChartData.length === 2) {
      setChartData({
        labels: resultData.map((_, i) => `Year ${i + 1}`),
        datasets: [
          {
            label: `${selectedCalculator} Growth Over Time`,
            data: resultData,
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            tension: 0.4,
          },
        ],
      });

      setPieData({
        labels: ["Principal", "Returns"],
        datasets: [
          {
            data: pieChartData,
            backgroundColor: ["#36A2EB", "#FF6384"],
            hoverBackgroundColor: ["#36A2EB", "#FF6384"],
          },
        ],
      });
    } else {
      console.warn("Invalid chart data:", { resultData, pieChartData });
    }
  };

  return (
    <FinancialSuggestionStyled>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card"
      >
        <h2>Financial Suggestions</h2>
        <div className="summary">
          <div className="stat">
            <FiDollarSign className="icon income" />
            <p>Total Income</p>
            <h3>₹{totalIncome()}</h3>
          </div>
          <div className="stat">
            <FiTrendingDown className="icon expense" />
            <p>Total Expenses</p>
            <h3>₹{totalExpenses()}</h3>
          </div>
          <div className="stat">
            <FiTrendingUp className="icon balance" />
            <p>Balance</p>
            <h3>₹{totalIncome() - totalExpenses()}</h3>
          </div>
        </div>
        <button onClick={handleGetSuggestions} disabled={loading}>
          {loading ? "Loading..." : "Get Suggestions"}
        </button>
        {loading && <p>Fetching suggestions...</p>}
        {suggestions && suggestions.length > 0 && (
          <div className="suggestions">
            <h3>Suggestions:</h3>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        <div className="calculator-selection">
          <p>Select a calculator:</p>
          <div className="buttons">
            <button onClick={() => setSelectedCalculator("SIP")}>SIP</button>
            <button onClick={() => setSelectedCalculator("SWP")}>SWP</button>
            <button onClick={() => setSelectedCalculator("Fixed Deposit")}>Fixed Deposit</button>
            <button onClick={() => setSelectedCalculator("Mutual Funds")}>Mutual Funds</button>
            <button onClick={() => setSelectedCalculator("PPF")}>PPF</button>
            <button onClick={() => setSelectedCalculator("Gold")}>Gold</button>
          </div>
        </div>
        
        <div className="calculators-container">
          <AnimatePresence>
            {selectedCalculator && (
              <motion.div
                key="calculator"
                className="calculator-wrapper"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  x: 0,
                  width: (chartData && typeof window !== 'undefined' && window.innerWidth > 992) ? "45%" : "100%"
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="calculator">
                  <h3>{selectedCalculator} Calculator</h3>
                  <input
                    type="number"
                    placeholder="Investment Amount (₹)"
                    value={calculatorDetails.principal || ""}
                    onChange={(e) => handleCalculatorChange("principal", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Annual Interest Rate (%)"
                    value={calculatorDetails.rate || ""}
                    onChange={(e) => handleCalculatorChange("rate", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Investment Duration (Years)"
                    value={calculatorDetails.time || ""}
                    onChange={(e) => handleCalculatorChange("time", e.target.value)}
                  />
                  {selectedCalculator === "SWP" && (
                    <input
                      type="number"
                      placeholder="Monthly Withdrawals (₹)"
                      value={calculatorDetails.withdrawals || ""}
                      onChange={(e) => handleCalculatorChange("withdrawals", e.target.value)}
                    />
                  )}
                  <button onClick={handleCalculation} className="calculate-btn">
                    Calculate
                  </button>
                  {calculatorResult && (
                    <p className="result">{calculatorResult}</p>
                  )}
                </div>
              </motion.div>
            )}

            {chartData && (
              <motion.div
                key="charts"
                className="charts-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="charts">
                  <h4>Growth Over Time</h4>
                  <div className="line-chart">
                    <Line data={chartData} options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }} />
                  </div>
                  {pieData && (
                    <>
                      <h4>Investment Breakdown</h4>
                      <div className="pie-chart">
                        <Pie data={pieData} options={{
                          responsive: true,
                          maintainAspectRatio: false
                        }} />
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </FinancialSuggestionStyled>
  );
};

export default FinancialSuggestion;

const FinancialSuggestionStyled = styled.div`
  width: 100%;

  .card {
    background: rgba(250, 229, 250,0.1);
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;

    @media (max-width: 576px) {
      padding: 12px;
    }

    h2 {
      font-size: clamp(1.4rem, 2.8vw, 1.8rem);
      color: #333;
      margin-bottom: 15px;
    }
  }

  .summary {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }

    .stat {
      background: rgba(255, 255, 255, 0.85);
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      text-align: center;
      flex: 1;
      backdrop-filter: blur(3px);

      p {
        color: #666;
        font-size: 0.9rem;
      }

      h3 {
        font-size: clamp(1.2rem, 2.5vw, 1.6rem);
        margin-top: 5px;
      }

      .icon {
        font-size: 1.8rem;
        margin-bottom: 8px;
      }

      .income {
        color: #28a745;
      }

      .expense {
        color: #dc3545;
      }

      .balance {
        color: #007bff;
      }
    }
  }

  button {
    background:#F56692;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    @media (max-width: 576px) {
      width: 100%;
    }
  }

  button:hover {
    background: #007bff;
    transform: translateY(-2px);
  }

  button:disabled {
    background: rgba(204, 204, 204, 0.7);
    cursor: not-allowed;
  }

  .suggestions {
    margin-top: 20px;
    padding: 16px;
    background: rgba(250, 229, 250, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(3px);

    h3 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: #007bff;
    }

    ul {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
      list-style: none;
      padding: 0;

      @media (max-width: 576px) {
        grid-template-columns: 1fr;
      }
    }

    li {
      background: rgba(255, 255, 255, 0.85);
      padding: 12px 14px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
      font-size: 0.95rem;
      line-height: 1.5;
    }
  }

  .calculator-selection {
    margin: 20px 0;

    p {
      font-size: 1rem;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;

      button {
        background: rgba(248, 249, 250, 0.85);
        border: 1px solid rgba(221, 221, 221, 0.8);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 0.88rem;
        color: #333;
        cursor: pointer;
        width: 100%;
        text-align: center;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(0, 123, 255, 0.85);
          color: white;
          border-color: rgba(0, 123, 255, 0.85);
        }
      }
    }
  }

  .calculators-container {
    position: relative;
    min-height: auto;
    display: flex;
    gap: 1.5rem;
    margin-top: 25px;
    overflow: hidden;

    @media (max-width: 992px) {
      flex-direction: column;
    }
  }

  .calculator-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;

    @media (max-width: 992px) {
      width: 100% !important;
    }
  }

  .calculator {
    background: rgba(250, 229, 250, 0.2);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 450px;
    backdrop-filter: blur(5px);
    box-sizing: border-box;

    @media (max-width: 992px) {
      max-width: 100%;
    }

    h3 {
      font-size: 1.3rem;
      margin-bottom: 16px;
      color: #333;
      text-align: center;
    }

    input {
      border: 1px solid rgba(221, 221, 221, 0.8);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.95rem;
      width: 100%;
      margin-bottom: 12px;
      transition: border-color 0.3s ease;
      background: rgba(255, 255, 255, 0.9);
      box-sizing: border-box;

      &:focus {
        border-color: rgba(0, 123, 255, 0.8);
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    }

    .calculate-btn {
      width: 100%;
      margin-top: 8px;
      padding: 12px;
      font-size: 1rem;
    }

    .result {
      margin-top: 16px;
      padding: 10px;
      background: rgba(248, 249, 250, 0.8);
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      color: #28a745;
      font-size: 1.05rem;
    }
  }

  .charts-wrapper {
    flex: 1;
    width: 100%;

    @media (max-width: 992px) {
      width: 100% !important;
    }
  }

  .charts {
    background: rgba(250, 229, 250, 0.2);
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    height: 100%;
    backdrop-filter: blur(5px);

    h4 {
      font-size: 1.1rem;
      margin-bottom: 12px;
      color: #333;
      text-align: center;
    }

    .line-chart {
      height: 200px;
      margin-bottom: 20px;
    }

    .pie-chart {
      height: 200px;
    }
  }
`;