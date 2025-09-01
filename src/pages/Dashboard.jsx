import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useDrugSlangAPI } from "../hooks/useDrugSlangAPI";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock metrics for DashboardPreview (can be replaced with API data)
const metrics = [
  { title: "Active Cases", value: "12", color: "rose" },
  { title: "Alerts Today", value: "57", color: "emerald" },
  { title: "High Risk %", value: "38%", color: "blue" },
  { title: "Total Reports", value: "1245", color: "emerald" },
];

// Mock line chart data
const alertsData = [
  { day: "Mon", alerts: 12 },
  { day: "Tue", alerts: 18 },
  { day: "Wed", alerts: 9 },
  { day: "Thu", alerts: 24 },
  { day: "Fri", alerts: 15 },
  { day: "Sat", alerts: 20 },
  { day: "Sun", alerts: 11 },
];

// Mock pie chart data
const statusData = [
  { name: "Open", value: 5 },
  { name: "Closed", value: 3 },
  { name: "Under Review", value: 4 },
];
const COLORS = ["#f43f5e", "#22c55e", "#eab308"];

// Mock cases preview
const recentCases = [
  { id: "C-010", keyword: "Xanax deal", status: "Open", risk: 87 },
  { id: "C-009", keyword: "Telegram group", status: "Under Review", risk: 72 },
  { id: "C-008", keyword: "Crypto transaction", status: "Closed", risk: 45 },
];

// Reusable DashboardPreview component
export function DashboardPreview({ isInteractive = true }) {
  return (
    <Card className="w-full max-w-5xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
          <h3 className="font-semibold text-lg">Detection Dashboard</h3>
          {isInteractive && (
            <div className="flex gap-3">
              <Search className="w-5 h-5 text-zinc-400" />
              <Filter className="w-5 h-5 text-zinc-400" />
              <Bell className="w-5 h-5 text-zinc-400" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <h4 className="font-semibold mb-2">Active Cases</h4>
            <p className="text-indigo-400 text-2xl font-bold">
              {metrics[0].value}
            </p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <h4 className="font-semibold mb-2">Alerts Today</h4>
            <p className="text-indigo-400 text-2xl font-bold">
              {metrics[1].value}
            </p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-4">
            <h4 className="font-semibold mb-2">High Risk</h4>
            <p className="text-indigo-400 text-2xl font-bold">
              {metrics[2].value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const {
    apiHealth,
    analyzeSingleText,
    loading,
    results,
    error,
    clearResults,
    isAPIHealthy,
  } = useDrugSlangAPI();

  const [inputText, setInputText] = useState("");
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Add results to history when new results come in
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
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

      {/* Live Detection Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Live Drug Slang Detection
        </h3>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex gap-3 mb-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter text to analyze for drug slang... (Press Enter to analyze)"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 resize-none"
                rows="3"
                disabled={!isAPIHealthy}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !inputText.trim() || !isAPIHealthy}
                  className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
                {(results || error) && (
                  <Button
                    onClick={clearResults}
                    className="bg-zinc-700 hover:bg-zinc-600 p-3 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
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
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  {results.predictions.contains_drug_slang ? (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  <span
                    className={`font-semibold ${
                      results.predictions.contains_drug_slang
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {results.predictions.prediction_label}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Original:</strong>{" "}
                    {results.predictions.original_text}
                  </div>
                  <div>
                    <strong>Normalized:</strong>{" "}
                    {results.predictions.normalized_text}
                  </div>
                  <div>
                    <strong>Confidence:</strong>{" "}
                    {(results.predictions.confidence * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Processing:</strong>{" "}
                    {results.processing_time.toFixed(3)}s
                  </div>
                </div>
                {results.predictions.detected_terms.length > 0 && (
                  <div className="mt-3">
                    <strong>Detected Slang:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {results.predictions.detected_terms.map((term, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-xs"
                        >
                          {term.slang} → {term.meaning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="lg:w-80">
            <h4 className="font-semibold mb-3">Recent Analysis</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analysisHistory.length > 0 ? (
                analysisHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-800/30 rounded-lg p-3 text-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {item.predictions.contains_drug_slang ? (
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      )}
                      <span className="text-zinc-400">{item.timestamp}</span>
                    </div>
                    <div className="truncate">
                      {item.predictions.original_text}
                    </div>
                    <div className="text-zinc-500 text-xs">
                      {(item.predictions.confidence * 100).toFixed(0)}%
                      confidence
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-center py-4">
                  No analyses yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {metrics.map((m) => (
          <Card key={m.title} title={m.title} value={m.value} color={m.color} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Alerts Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={alertsData}>
              <XAxis dataKey="day" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                }}
              />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="#6366f1"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Case Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Cases Preview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Cases</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-sm text-zinc-400">
              <th className="px-4 py-2">Case ID</th>
              <th className="px-4 py-2">Keyword</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {recentCases.map((c) => (
              <tr
                key={c.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/30"
              >
                <td className="px-4 py-2 font-mono">{c.id}</td>
                <td className="px-4 py-2">{c.keyword}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      c.status === "Open"
                        ? "bg-red-500/20 text-red-400"
                        : c.status === "Closed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-indigo-400 font-semibold">
                  {c.risk}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
