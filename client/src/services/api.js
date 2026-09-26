import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api/v1`
  : "/api/v1";

export const api = axios.create({ baseURL: apiBase });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("learningOsToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response.data, error => {
  if (error.response?.status === 401 && !error.config?.url?.includes("auth/login")) {
    localStorage.removeItem("learningOsToken");
    window.dispatchEvent(new Event("learning-os-auth-expired"));
  }
  return Promise.reject(error.response?.data || error);
});

export const getList = async (path, params) => (await api.get(`/${path}`, { params })).data;
export const getItem = async (path, id) => (await api.get(`/${path}/${id}`)).data;
export const createItem = async (path, values) => (await api.post(`/${path}`, values)).data;
export const updateItem = async (path, id, values) => (await api.put(`/${path}/${id}`, values)).data;
export const deleteItem = async (path, id) => api.delete(`/${path}/${id}`);
