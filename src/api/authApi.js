import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL
? `${import.meta.env.VITE_API_URL}/api` 
: "http://localhost:5001/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const signupUser = (userData) => API.post("/auth/signup", userData);
export const loginUser = (credentials) => API.post("/auth/login", credentials);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  return API.post("/resumes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getResumes = () => API.get("/resumes");

export const reanalyzeResume = (resumeId) =>
  API.post(`/resumes/${resumeId}/reanalyze`);

export const getMonthlyResumeCount = () =>
  API.get("/resumes/monthly-count");

export const chatWithAI = (data) => {
  return API.post("/interviews/chat", data);
};

export const answerInterview = (data) => {
  return API.post("/interviews/answer", data);
};
export default API;

