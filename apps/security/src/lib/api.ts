import axiosPackage, { type AxiosError, type AxiosInstance } from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
export const apiBaseUrl = configuredBaseUrl || "http://localhost:5000/api/v1";

type ApiClient = AxiosInstance & {
  isAxiosError: typeof axiosPackage.isAxiosError;
};

const apiClient = Object.assign(
  axiosPackage.create({
    timeout: 15_000,
    headers: { Accept: "application/json" },
  }),
  { isAxiosError: axiosPackage.isAxiosError },
) as ApiClient;

apiClient.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  const suppliedAuthorization = request.headers.Authorization?.toString();

  if (suppliedAuthorization && !suppliedAuthorization.startsWith("Bearer ")) {
    request.headers.Authorization = `Bearer ${suppliedAuthorization}`;
  } else if (!suppliedAuthorization && token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const isLoginRequest = error.config?.url?.endsWith("/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.clear();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axiosPackage.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || fallback;
  }
  return fallback;
}

export default apiClient;
