import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Send,
  Trash2,
} from "lucide-react";

// The custom hook for API interaction. Defined within this single file to resolve import errors.
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

// Simple reusable card component.
const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl p-6 shadow ${className}`}>{children}</div>
);

// Reusable card content component.
const CardContent = ({ children, className = "" }) => (
  <div className={`p-0 ${className}`}>{children}</div>
);

// Initial mock cases
const initialMockCases = [
  {
    id: "C-001",
    keyword: "Xanax deal",
    originalText: "selling xanax cheap hmu",
    status: "Open",
    risk: 87,
    lastSeen: "2025-08-30",
    detected: true,
    detectedTerms: [{ slang: "xanax", meaning: "alprazolam" }],
  },
  {
    id: "C-002",
    keyword: "Crypto transaction",
    originalText: "bitcoin payment accepted",
    status: "Closed",
    risk: 45,
    lastSeen: "2025-08-28",
    detected: false,
    detectedTerms: [],
  },
  {
    id: "C-003",
    keyword: "Darknet pills",
    originalText: "got the good pills",
    status: "Under Review",
    risk: 72,
    lastSeen: "2025-08-27",
    detected: true,
    detectedTerms: [{ slang: "pills", meaning: "drugs" }],
  },
  {
    id: "C-004",
    keyword: "Telegram group",
    originalText: "join our telegram for deals",
    status: "Open",
    risk: 65,
    lastSeen: "2025-08-26",
    detected: false,
    detectedTerms: [],
  },
  {
    id: "C-005",
    keyword: "New supplier",
    originalText: "new connect in town",
    status: "Closed",
    risk: 30,
    lastSeen: "2025-08-25",
    detected: false,
    detectedTerms: [],
  },
];

export default function Cases() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cases, setCases] = useState(initialMockCases);
  const [newCaseText, setNewCaseText] = useState("");
  const [showAddCase, setShowAddCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const {
    analyzeSingleText,
    loading,
    results,
    error,
    clearResults,
    isAPIHealthy,
  } = useDrugSlangAPI();

  // This useEffect listens for new analysis results and adds a new case
  useEffect(() => {
    if (results) {
      const newCase = {
        id: `C-${String(cases.length + 1).padStart(3, "0")}`,
        keyword: results.predictions.contains_drug_slang
          ? results.predictions.detected_terms[0]?.slang || "Detected"
          : "N/A",
        originalText: results.predictions.original_text,
        status: results.predictions.contains_drug_slang ? "Open" : "Closed",
        risk: Math.round(results.predictions.confidence * 100),
        lastSeen: new Date().toISOString().split("T")[0],
        detected: results.predictions.contains_drug_slang,
        detectedTerms: results.predictions.detected_terms,
      };
      setCases((prev) => [newCase, ...prev]);
      setNewCaseText("");
      setShowAddCase(false);
    }
  }, [results]);

  // Handle new case creation with live analysis
  const handleCreateCase = () => {
    if (!newCaseText.trim()) return;
    analyzeSingleText(newCaseText);
  };

  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
    setShowAddCase(false);
    clearResults();
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.keyword.toLowerCase().includes(search.toLowerCase()) ||
      c.originalText.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-500/20 text-red-400";
      case "Closed":
        return "bg-green-500/20 text-green-400";
      case "Under Review":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Cases</h2>
        <Button
          onClick={() => setShowAddCase(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Case
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 w-full md:w-1/3">
          <Search className="w-5 h-5 text-zinc-400 mr-2" />
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-grow text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {["All", "Open", "Closed", "Under Review"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50 text-sm text-zinc-400">
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Last Seen</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-800 hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3 font-mono">{c.id}</td>
                    <td className="px-4 py-3">{c.keyword}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-indigo-400 font-semibold">
                      {c.risk}%
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{c.lastSeen}</td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => handleViewCase(c)}
                        className="bg-zinc-700 hover:bg-zinc-600 rounded-lg p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-zinc-500 italic"
                  >
                    No cases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add New Case Modal */}
      {showAddCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Add New Case</h3>
            <textarea
              value={newCaseText}
              onChange={(e) => setNewCaseText(e.target.value)}
              placeholder="Enter text to analyze and create a case..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-sm outline-none focus:border-indigo-500 resize-none mb-4"
              rows="5"
              disabled={loading || !isAPIHealthy}
            />
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-400 text-sm mb-4">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 mb-4 text-zinc-400">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing text...
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCloseModal}
                className="bg-zinc-700 hover:bg-zinc-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCase}
                disabled={loading || !newCaseText.trim() || !isAPIHealthy}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Analyze & Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              Case Details: {selectedCase.id}
            </h3>
            <div className="space-y-4">
              <p>
                <strong>Keyword:</strong> {selectedCase.keyword}
              </p>
              <p>
                <strong>Original Text:</strong>{" "}
                <span className="text-zinc-400 italic">
                  {selectedCase.originalText}
                </span>
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    selectedCase.status
                  )}`}
                >
                  {selectedCase.status}
                </span>
              </p>
              <p>
                <strong>Risk Score:</strong> {selectedCase.risk}%
              </p>
              <p>
                <strong>Detected:</strong>{" "}
                {selectedCase.detected ? (
                  <CheckCircle className="w-5 h-5 inline-block ml-1 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 inline-block ml-1 text-red-400" />
                )}
              </p>
              {selectedCase.detected && selectedCase.detectedTerms && (
                <div>
                  <strong>Detected Terms:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCase.detectedTerms.map((term, idx) => (
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
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleCloseModal}
                className="bg-zinc-700 hover:bg-zinc-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
