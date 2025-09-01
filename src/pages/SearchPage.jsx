import React, { useState, useEffect } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Send,
  Activity,
} from "lucide-react";

// The custom hook for API interaction.
const useDrugSlangAPI = () => {
  const [apiHealth, setApiHealth] = useState({
    healthy: false,
    message: "Checking API status...",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiHealth({ healthy: true, message: "API is healthy." });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const analyzeSingleText = async (text) => {
    setLoading(true);
    setError(null);
    setResults(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const containsSlang =
        text.toLowerCase().includes("xanax") ||
        text.toLowerCase().includes("weed");
      const normalizedText = text.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();

      const mockResponse = {
        predictions: {
          original_text: text,
          normalized_text: normalizedText,
          prediction_label: containsSlang ? "Suspicious" : "Safe",
          contains_drug_slang: containsSlang,
          confidence: containsSlang ? 0.95 : 0.88,
          detected_terms: containsSlang
            ? [{ slang: "weed", meaning: "Cannabis" }]
            : [],
        },
        processing_time: Math.random() * 0.5 + 0.1,
      };

      setResults(mockResponse);
    } catch (err) {
      setError("Failed to analyze text. Please try again.");
      console.error("Mock API call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    apiHealth,
    analyzeSingleText,
    loading,
    results,
    error,
    clearResults,
    isAPIHealthy: apiHealth.healthy,
  };
};

// Simple reusable button component.
const Button = ({ children, onClick, className = "", ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Main SearchPage component
export default function SearchPage() {
  const {
    analyzeSingleText,
    loading,
    results,
    error,
    clearResults,
    isAPIHealthy,
  } = useDrugSlangAPI();

  const [inputText, setInputText] = useState("");
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (results) {
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        ...results,
      };
      setAnalysisHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
    }
  }, [results]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    try {
      await analyzeSingleText(inputText);
      setInputText("");
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const filteredHistory =
    filter === "All"
      ? analysisHistory
      : analysisHistory.filter(
          (item) =>
            item.predictions.contains_drug_slang === (filter === "Suspicious")
        );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Post Search & Analysis</h2>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isAPIHealthy
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          <Activity className="w-4 h-4" />
          {isAPIHealthy ? "API Connected" : "API Disconnected"}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter text to analyze... (Press Enter to analyze)"
          className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg text-sm outline-none focus:border-indigo-500 resize-none"
          rows="3"
          disabled={!isAPIHealthy}
        />
        <div className="flex gap-2 lg:flex-col lg:ml-2">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !inputText.trim() || !isAPIHealthy}
            className="bg-rose-600 hover:bg-rose-500 px-6 py-2 rounded-lg transition disabled:bg-rose-900 disabled:text-zinc-500 flex items-center justify-center min-w-[100px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" /> Detect
              </div>
            )}
          </Button>
          {(results || error) && (
            <Button
              onClick={clearResults}
              className="bg-zinc-700 hover:bg-zinc-600 px-6 py-2 rounded-lg transition flex items-center justify-center min-w-[100px]"
            >
              <Trash2 className="w-5 h-5" /> Clear
            </Button>
          )}
        </div>
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400 mb-4">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {results && (
        <div className="mb-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900 shadow">
          <h3 className="text-lg font-semibold mb-3">Latest Analysis</h3>
          <p className="mb-2">
            <strong>Text:</strong> {results.predictions.original_text}
          </p>
          <p className="mb-2">
            <strong>Status:</strong>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs ${
                results.predictions.contains_drug_slang
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {results.predictions.prediction_label}
            </span>
          </p>
          <p className="mb-4">
            <strong>Risk:</strong>{" "}
            <span
              className={`font-semibold ${
                results.predictions.contains_drug_slang
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              {results.predictions.contains_drug_slang ? "High" : "Low"}
            </span>
          </p>
          <div>
            <p className="text-sm text-zinc-400 mb-1">Confidence</p>
            <div className="w-full bg-zinc-800 h-2 rounded">
              <div
                className={`h-2 rounded ${
                  results.predictions.contains_drug_slang
                    ? "bg-rose-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${(results.predictions.confidence * 100).toFixed(
                    0
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {analysisHistory.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search History</h3>
            <div className="flex gap-2">
              {["All", "Suspicious", "Safe"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filter === f
                      ? "bg-rose-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-sm text-zinc-400">
                <th className="px-4 py-2">Text</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Risk</th>
                <th className="px-4 py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h) => (
                <tr key={h.id} className="border-b border-zinc-800">
                  <td className="px-4 py-2">{h.predictions.original_text}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        h.predictions.contains_drug_slang
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {h.predictions.prediction_label}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      h.predictions.contains_drug_slang
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {h.predictions.contains_drug_slang ? "High" : "Low"}
                  </td>
                  <td className="px-4 py-2">
                    {Math.round(h.predictions.confidence * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
