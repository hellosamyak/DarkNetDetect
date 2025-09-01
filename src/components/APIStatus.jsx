import React from "react";
import { useDrugSlangAPI } from "../hooks/useDrugSlangAPI";

const APIStatus = () => {
  const { apiHealth, refreshHealth } = useDrugSlangAPI();

  if (!apiHealth) return null;

  return (
    <div className={`api-status ${apiHealth.status}`}>
      <div className="status-indicator">
        {apiHealth.status === "healthy" ? "🟢" : "🔴"}
        API: {apiHealth.status}
        {apiHealth.model_loaded ? " | Model: Loaded" : " | Model: Not Loaded"}
      </div>

      <button onClick={refreshHealth} className="refresh-btn">
        🔄 Refresh
      </button>
    </div>
  );
};

export default APIStatus;
