// services/osint.service.js
import serperAdapter from "./osint/serper.adapter.js";
import whoisAdapter from "./osint/whois.adapter.js";
import githubAdapter from "./osint/github.adapter.js";
import newsAdapter from "./osint/news.adapter.js";
import Report from "../models/report.model.js";
import ApiError from "../utils/ApiError.js";
import stringSimilarity from "string-similarity";

export const runDiscovery = async (query) => {
  // 1. Define active vectors
  const adapters = [serperAdapter, whoisAdapter, githubAdapter, newsAdapter];

  // 2. Parallel Execution
  const rawResults = await Promise.all(
    adapters.map(async (adapter) => {
      try {
        return await adapter.fetch(query);
      } catch (err) {
        const isNotFound = err.message?.toLowerCase().includes("not found") || err.response?.status === 404;
        return {
          source: adapter.name,
          category: adapter.category,
          error: true,
          message: isNotFound ? "No records found" : "Vector resolution failed",
          data: { 
            status: isNotFound ? "Not Found" : "Offline", 
            error: err.message 
          },
          timestamp: new Date(),
        };
      }
    }),
  );

  // 3. Keep all results (including failures) for UI feedback
  const validResults = rawResults.filter((res) => res !== null);


  if (validResults.length === 0) {
    throw new ApiError(
      404,
      "No intelligence found across any available vectors.",
    );
  }

  // 4. Phase II: Entity Resolution (Safe version)
  const scoredResults = validResults.map((result) => {
    // DEFENSIVE CHECK: Ensure data and query are strings before calling toLowerCase
    const dataString = result?.data
      ? JSON.stringify(result.data).toLowerCase()
      : "";
    const safeQuery = (query || "").toString().toLowerCase();

    // If either is missing, we can't calculate similarity fairly
    if (!safeQuery || !dataString) {
      return { ...result, confidenceScore: "0%" };
    }

    const similarity = stringSimilarity.compareTwoStrings(
      safeQuery,
      dataString,
    );

    // Improved Scoring: If query is found as a substring, boost score significantly
    let score = similarity;
    if (dataString.includes(safeQuery)) {
      score = 0.85 + similarity * 0.15; // Base 85% + similarity bonus
    }

    return {
      ...result,
      confidenceScore: (score * 100).toFixed(2) + "%",
    };
  });


  return scoredResults;
};

export const saveReport = async (targetName, results) => {
  const contentString = JSON.stringify(results).toLowerCase();
  let riskLevel = "Low";

  // Risk Heuristics
  if (/(breach|leak|exposed|password|vulnerability)/i.test(contentString)) {
    riskLevel = "High";
  } else if (results.length > 5) {
    riskLevel = "Medium";
  }

  return await Report.create({
    targetName,
    results,
    riskLevel,
  });
};
