import serperAdapter from "./osint/serper.adapter.js";
import whoisAdapter from "./osint/whois.adapter.js";
import githubAdapter from "./osint/github.adapter.js";
import newsAdapter from "./osint/news.adapter.js";
import Report from "../models/report.model.js";
import ApiError from "../utils/ApiError.js";
import stringSimilarity from "string-similarity";

const NOISE_DOMAINS = [
  "google.com",
  "w3.org",
  "schema.org",
  "cdnjs.cloudflare.com",
  "vercel.app",
  "netlify.app",
  "github.io",
  "herokuapp.com",
  "pages.dev",
];

const SOURCE_WEIGHTS = {
  "Google Search": 1.0,
  NewsAPI: 0.85,
  GitHub: 0.8,
  WhoisXML: 0.7,
};

const SOURCE_EXPECTED_FAILURE = {
  WhoisXML: (query) => !query.includes("."),
};

// ─── Identifier Extraction ───────────────────────────────────────────────────

const extractIdentifiers = (data) => {
  const text = JSON.stringify(data).toLowerCase();
  return {
    emails: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
    handles: text.match(/@([a-z0-9_]{3,})/g) || [],
    domains: (
      text.match(/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/g) || []
    ).filter((d) => !NOISE_DOMAINS.some((n) => d.includes(n))),
    orgs: text.match(/\b[A-Z][a-z]+ (Inc\.|Corp\.|Ltd\.|LLC)\b/g) || [],
  };
};

// ─── Meaningful Text Extraction ──────────────────────────────────────────────

function extractMeaningfulTexts(res) {
  const texts = [];
  if (!res.data?.data) return texts;
  const d = res.data.data;

  switch (res.source) {
    case "Google Search":
      if (Array.isArray(d)) {
        d.forEach((item) => {
          if (item.title) texts.push(item.title);
          if (item.snippet) texts.push(item.snippet);
          if (item.link) texts.push(item.link);
        });
      }
      break;

    case "GitHub":
      if (Array.isArray(d)) {
        d.forEach((repo) => {
          if (repo.full_name) texts.push(repo.full_name);
          if (repo.description) texts.push(repo.description);
          if (repo.owner?.login) texts.push(repo.owner.login);
        });
      }
      break;

    case "NewsAPI":
      if (Array.isArray(d)) {
        d.forEach((article) => {
          if (article.title) texts.push(article.title);
          if (article.description) texts.push(article.description);
          if (article.source?.name) texts.push(article.source.name);
        });
      }
      break;

    case "WhoisXML":
      if (d.registrant?.organization) texts.push(d.registrant.organization);
      if (d.registrant?.name) texts.push(d.registrant.name);
      if (d.domainName) texts.push(d.domainName);
      if (d.registrarName) texts.push(d.registrarName);
      if (d.technicalContact?.organization)
        texts.push(d.technicalContact.organization);
      break;
  }

  return texts.filter(Boolean);
}

// ─── Per-Source Relevance Scoring ────────────────────────────────────────────

function scoreSourceRelevance(query, res) {
  if (res.error || !res.data) return { score: 0, signals: [] };

  const safeQuery = query.toLowerCase().trim();
  const queryTokens = safeQuery.split(/\s+/);
  let points = 0;
  const signals = [];

  const texts = extractMeaningfulTexts(res);

  // A. Token match against structured fields
  queryTokens.forEach((token) => {
    const matchCount = texts.filter((t) =>
      t.toLowerCase().includes(token),
    ).length;
    if (matchCount > 0) {
      const tokenScore = Math.min(matchCount * 8, 25);
      points += tokenScore;
      signals.push(`token_match:${token}(${matchCount})`);
    }
  });

  // B. Full name match in any meaningful field
  const fullNameMatch = texts.some((t) => t.toLowerCase().includes(safeQuery));
  if (fullNameMatch) {
    points += 30;
    signals.push("full_name_match");
  }

  // C. Fuzzy match against short fields only
  const bestSimilarity = texts.reduce((best, t) => {
    if (t.length > 300) return best;
    const sim = stringSimilarity.compareTwoStrings(safeQuery, t.toLowerCase());
    return sim > best ? sim : best;
  }, 0);

  if (bestSimilarity > 0.5) {
    const fuzzyScore = Math.round(bestSimilarity * 20);
    points += fuzzyScore;
    signals.push(`fuzzy:${Math.round(bestSimilarity * 100)}%`);
  }

  return { score: Math.min(points, 60), signals };
}

// ─── Named Entity Pivots ──────────────────────────────────────────────────────

function extractNamedEntityPivots(res, query) {
  const pivots = [];
  const texts = extractMeaningfulTexts(res);
  const queryTokens = query.split(/\s+/);

  texts.forEach((text) => {
    const lower = text.toLowerCase();
    if (queryTokens.every((token) => lower.includes(token))) {
      pivots.push(`__entity__:${query}`);
    }
  });

  return pivots;
}

// ─── Corroboration Map ────────────────────────────────────────────────────────

function buildCorroborationMap(query, validResults) {
  const pivotMap = new Map();

  validResults.forEach((res) => {
    const ids = extractIdentifiers(res.data);
    const namedEntityPivots = extractNamedEntityPivots(
      res,
      query.toLowerCase().trim(),
    );

    const allIds = [
      ...new Set([
        ...ids.emails,
        ...ids.domains,
        ...ids.handles,
        ...namedEntityPivots,
      ]),
    ];

    allIds.forEach((id) => {
      if (!pivotMap.has(id)) pivotMap.set(id, new Set());
      pivotMap.get(id).add(res.source);
    });
  });

  return pivotMap;
}

// ─── Corroboration Scoring ────────────────────────────────────────────────────

function scoreCorroboration(res, pivotMap) {
  let bonus = 0;
  const corroboratedPivots = [];

  pivotMap.forEach((sources, id) => {
    if (!sources.has(res.source)) return;

    if (sources.size >= 3) {
      bonus += id.startsWith("__entity__") ? 35 : 25;
      corroboratedPivots.push(id);
    } else if (sources.size === 2) {
      bonus += id.startsWith("__entity__") ? 20 : 12;
      corroboratedPivots.push(id);
    }
  });

  return { bonus: Math.min(bonus, 40), corroboratedPivots };
}

// ─── Global Confidence ────────────────────────────────────────────────────────

function calculateGlobalConfidence(vectors, sharedPivots) {
  const applicableVectors = vectors.filter((v) => !v.expectedFailure);
  if (applicableVectors.length === 0) return 0;

  const avgScore =
    applicableVectors.reduce((sum, v) => sum + v.individualScore, 0) /
    applicableVectors.length;

  const hardPivotCount = sharedPivots.filter(
    (p) => !p.startsWith("__entity__"),
  ).length;
  const entityPivotShared = sharedPivots.some((p) =>
    p.startsWith("__entity__"),
  );

  let confidence = Math.round(avgScore);
  if (hardPivotCount >= 2) confidence = Math.min(confidence + 15, 99);
  else if (hardPivotCount === 1) confidence = Math.min(confidence + 8, 99);
  if (entityPivotShared) confidence = Math.min(confidence + 10, 99);

  return confidence;
}

// ─── Primary Cluster Detection ────────────────────────────────────────────────

function detectPrimaryCluster(results) {
  const clusterKeywords = {
    "Technology/Software": [
      "software",
      "api",
      "github",
      "developer",
      "code",
      "tech",
      "web",
      "server",
    ],
    "Corporate/Business": [
      "inc",
      "corp",
      "ceo",
      "founder",
      "industry",
      "stock",
      "executive",
      "headquarters",
    ],
    "News/Media": [
      "article",
      "press",
      "news",
      "report",
      "journal",
      "media",
      "published",
    ],
    "Social/Individual": [
      "bio",
      "profile",
      "social",
      "contact",
      "identity",
      "personal",
    ],
  };

  const fullText = JSON.stringify(results).toLowerCase();
  let primaryCluster = "General Entity";
  let maxHits = 0;

  Object.entries(clusterKeywords).forEach(([cluster, keywords]) => {
    const hits = keywords.filter((kw) => fullText.includes(kw)).length;
    if (hits > maxHits) {
      maxHits = hits;
      primaryCluster = cluster;
    }
  });

  return primaryCluster;
}

// ─── Main Discovery ───────────────────────────────────────────────────────────

export const runDiscovery = async (query) => {
  const adapters = [serperAdapter, whoisAdapter, githubAdapter, newsAdapter];

  const rawResults = await Promise.all(
    adapters.map(async (a) => {
      try {
        const data = await a.fetch(query);
        return { source: a.name, category: a.category, data, error: false };
      } catch (err) {
        const expectedFailure =
          SOURCE_EXPECTED_FAILURE[a.name]?.(query) ?? false;
        return {
          source: a.name,
          category: a.category,
          error: true,
          expectedFailure,
          message: err.message,
        };
      }
    }),
  );

  const validResults = rawResults.filter((r) => !r.error && r.data);
  const pivotMap = buildCorroborationMap(query, validResults);

  const sharedPivots = [...pivotMap.entries()]
    .filter(([, sources]) => sources.size >= 2)
    .map(([id]) => id);

  const vectorBreakdown = rawResults.map((res) => {
    if (res.error) {
      return {
        source: res.source,
        individualScore: 0,
        isCorroborated: false,
        expectedFailure: res.expectedFailure ?? false,
        reason: res.expectedFailure
          ? "Expected: not applicable for this query type"
          : "Fetch failed",
      };
    }

    const weight = SOURCE_WEIGHTS[res.source] ?? 1.0;
    const { score: relevanceScore, signals } = scoreSourceRelevance(query, res);
    const { bonus: corrobBonus, corroboratedPivots } = scoreCorroboration(
      res,
      pivotMap,
    );

    const rawScore = relevanceScore + corrobBonus;
    const weightedScore = Math.min(Math.round(rawScore * weight), 99);

    return {
      source: res.source,
      individualScore: weightedScore,
      isCorroborated: corroboratedPivots.length > 0,
      signals,
      reason:
        corroboratedPivots.length > 0
          ? `Corroborated: ${corroboratedPivots.slice(0, 2).join(", ")}`
          : weightedScore > 50
            ? "Strong relevance, not corroborated"
            : "Weak match",
    };
  });

  const overallConfidence = calculateGlobalConfidence(
    vectorBreakdown,
    sharedPivots,
  );

  return {
    results: rawResults,
    analysis: {
      overallConfidence,
      resolutionStatus:
        overallConfidence > 75
          ? "Confirmed"
          : overallConfidence > 45
            ? "Ambiguous"
            : "GIGO",
      primaryCluster: detectPrimaryCluster(validResults),
      sharedPivots,
      vectorBreakdown,
    },
  };
};

// ─── Save Report ──────────────────────────────────────────────────────────────

export const saveReport = async (targetName, discoveryData) => {
  const { results, analysis } = discoveryData;
  const {
    overallConfidence,
    resolutionStatus,
    primaryCluster,
    sharedPivots,
    vectorBreakdown,
  } = analysis;

  let riskPoints = 0;
  const contentString = JSON.stringify(results).toLowerCase();

  if (/(breach|leak|exposed|password|vulnerability)/i.test(contentString))
    riskPoints += 60;
  if (contentString.includes("@")) riskPoints += 20;

  let riskLevel = "Low";
  if (riskPoints >= 60) riskLevel = "High";
  else if (riskPoints >= 25) riskLevel = "Medium";

  return await Report.create({
    targetName,
    results: results
      .filter((r) => !r.error)
      .map((r) => ({
        ...r,
        confidenceScore:
          vectorBreakdown.find((v) => v.source === r.source)?.individualScore +
          "%",
      })),
    riskLevel,
    resolutionStatus,
    primaryCluster,
    sharedPivots,
    overallConfidence,
    vectorBreakdown,
  });
};
