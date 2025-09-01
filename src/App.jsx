import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { Search, Bell, Filter, Activity, AlertTriangle } from "lucide-react";
import { DashboardPreview } from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Dashboard from "./pages/Dashboard";
import SearchPage from "./pages/SearchPage";
import { useDrugSlangAPI } from "./hooks/useDrugSlangAPI";

function Home() {
  const navigate = useNavigate();
  const { apiHealth, isAPIHealthy } = useDrugSlangAPI();
  const [demoText, setDemoText] = useState("");
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleStartDetection = () => {
    navigate("/searchpage");
  };

  const handleTryDemo = async () => {
    if (!demoText.trim()) {
      setDemoText("got sum weed");
      return;
    }

    setDemoLoading(true);
    try {
      const { predictText } = await import("./services/apiService");
      const result = await predictText(demoText);
      setDemoResult(result);
    } catch (error) {
      console.error("Demo failed:", error);
      setDemoResult({ error: error.message });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <>
      {/* API Status Indicator */}
      {apiHealth && (
        <div
          className={`w-full px-4 py-2 text-center text-sm ${
            isAPIHealthy
              ? "bg-green-800/40 text-green-400 border-b border-green-700"
              : "bg-red-800/40 text-red-400 border-b border-red-700"
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          API Status: {apiHealth.status} | Model:{" "}
          {apiHealth.model_loaded ? "Loaded" : "Not Loaded"}
        </div>
      )}

      {/* Hero */}
      <section
        id="home"
        className="flex flex-col items-center justify-center text-center py-24 px-6 bg-gray-900/80 backdrop-blur-sm"
      >
        <span className="px-4 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm mb-6">
          Trusted by cybersecurity teams worldwide
        </span>
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl">
          Empowering Investigators to{" "}
          <span className="text-indigo-400">Detect, Monitor</span> and{" "}
          <span className="text-indigo-400">Prevent</span>
        </h2>
        <p className="mt-6 text-zinc-400 max-w-2xl">
          A next-gen platform to analyze encrypted communications, identify
          suspicious patterns, and prevent illicit drug sales in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            onClick={handleStartDetection}
            disabled={!isAPIHealthy}
            className={`px-8 py-6 text-lg rounded-xl shadow-lg ${
              isAPIHealthy
                ? "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-400/50"
                : "bg-gray-600 cursor-not-allowed shadow-gray-500/50"
            }`}
          >
            {isAPIHealthy ? "Start Detection" : "API Unavailable"}
          </Button>

          <Button
            onClick={handleTryDemo}
            disabled={!isAPIHealthy}
            className="px-8 py-6 text-lg bg-transparent border border-indigo-500 text-indigo-300 hover:bg-indigo-500/20 rounded-xl"
          >
            Try Demo
          </Button>
        </div>

        {/* Quick Demo Section */}
        <div className="mt-12 w-full max-w-2xl">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Detection Test</h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Enter text to analyze (e.g., 'got sum weed')"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <Button
                onClick={handleTryDemo}
                disabled={demoLoading || !isAPIHealthy}
                className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg"
              >
                {demoLoading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>

            {demoResult && !demoResult.error && (
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  {demoResult.predictions.contains_drug_slang ? (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Activity className="w-5 h-5 text-green-400" />
                  )}
                  <span
                    className={`font-semibold ${
                      demoResult.predictions.contains_drug_slang
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {demoResult.predictions.prediction_label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Original:</strong>{" "}
                    {demoResult.predictions.original_text}
                  </div>
                  <div>
                    <strong>Normalized:</strong>{" "}
                    {demoResult.predictions.normalized_text}
                  </div>
                  <div>
                    <strong>Confidence:</strong>{" "}
                    {(demoResult.predictions.confidence * 100).toFixed(1)}%
                  </div>

                  {demoResult.predictions.detected_terms.length > 0 && (
                    <div>
                      <strong>Detected Slang:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {demoResult.predictions.detected_terms.map(
                          (term, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-xs"
                            >
                              {term.slang} → {term.meaning}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {demoResult?.error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Error: {demoResult.error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="flex justify-center items-center px-6 py-16 flex-col gap-6 bg-gray-900/50">
        <DashboardPreview isInteractive={false} />
        <Button
          onClick={handleViewDashboard}
          className="px-8 py-3 text-lg bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-400/50"
        >
          View Full Dashboard
        </Button>
      </section>

      {/* CTA */}
      <section className="text-center py-20 bg-indigo-950 backdrop-blur-md">
        <h3 className="text-3xl font-bold mb-4">
          Ready to fight illicit drug sales?
        </h3>
        <p className="text-zinc-400 mb-6">
          Join investigators and cybersecurity experts using our platform to
          secure the digital world.
        </p>
        <Button
          onClick={handleStartDetection}
          disabled={!isAPIHealthy}
          className={`px-8 py-6 text-lg rounded-xl shadow-lg ${
            isAPIHealthy
              ? "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-400/50"
              : "bg-gray-600 cursor-not-allowed shadow-gray-500/50"
          }`}
        >
          {isAPIHealthy ? "Try It Now" : "API Unavailable"}
        </Button>
      </section>
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-zinc-900 to-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-8 py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight">DarkNetDetect</h1>
        <nav className="hidden md:flex gap-6 text-zinc-300">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/cases" className="hover:text-white transition-colors">
            Cases
          </Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/searchpage" className="hover:text-white transition-colors">
            Search
          </Link>
        </nav>
        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg rounded-full shadow-indigo-400/50">
          Get Started
        </Button>
      </header>

      {/* Routes */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/searchpage" element={<SearchPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800 py-6 text-center text-zinc-500 text-sm">
        © 2025 DarkNetDetect
      </footer>
    </div>
  );
}
