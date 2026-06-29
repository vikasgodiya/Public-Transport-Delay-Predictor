import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchOptions = () => api.get("/options").then((r) => r.data);
export const predict = (payload) =>
  api.post("/predict", payload).then((r) => r.data);
