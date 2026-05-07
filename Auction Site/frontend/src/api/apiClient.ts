import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5035/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// stoppar in JWT-token i varje request om den finns
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// rensa token (ogiltig/utgången)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
