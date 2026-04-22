import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Perform OSINT Search
export const performOsintSearch = async (query) => {
  const response = await api.post("/osint/search", { query });
  return response.data;
};

// Get Single Report by ID
export const getReportById = async (id) => {
  const response = await api.get(`/osint/report/${id}`);
  return response.data;
};

// Export Report as Markdown
export const exportReportMarkdown = async (id) => {
  const response = await api.get(`/osint/export/${id}`, {
    responseType: "blob", // Crucial for file downloads
  });
  return response.data;
};

// Export Report as PDF
export const exportReportPDF = async (id) => {
  const response = await api.get(`/osint/export/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

// Export Report as DOCX
export const exportReportDocx = async (id) => {
  const response = await api.get(`/osint/export/${id}/docx`, {
    responseType: "blob",
  });
  return response.data;
};

// Get Search History
export const getSearchHistory = async () => {
  const response = await api.get("/osint/history");
  return response.data;
};
