import axios from "axios";

const API_BASE_URL = "http://localhost:7860/api/v1/helper";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vault_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PerformanceMetrics {
  embedding_ms: number;
  search_ms: number;
  rerank_ms?: number;
  generation_ms?: number;
  total_ms: number;
}

export interface Source {
  title: string;
  score: number;
  id: string;
  content: string;
}

export interface ChatResponse {
  response: string;
  confidence: string;
  sources: Source[];
  retrievedDocs: number;
  performance?: PerformanceMetrics;
}

export interface ChatSession {
  chatId: string;
  topic: string;
  created_at: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  confidence?: string;
  sources?: Source[];
}

export const createSession = async (
  topic: string = "New Chat",
): Promise<ChatSession> => {
  const response = await api.post("/addnewchatsession", { topic });
  return response.data;
};

export const sendMessage = async (
  message: string,
  chatId: string,
): Promise<ChatResponse> => {
  const response = await api.post("/sendmessage", {
    message,
    chatId,
  });
  return response.data;
};

export const getHistory = async (chatId: string) => {
  const response = await api.get(`/getchat/${chatId}`);
  return response.data;
};
