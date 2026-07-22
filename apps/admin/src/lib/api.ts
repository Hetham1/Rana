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

export interface AnalyticsData {
  summary: {
    totalOrders: number;
    submittedOrders: number;
    gatheredOrders: number;
    securityCheckedOrders: number;
    exitedOrders: number;
    ordersThisMonth: number;
  };
  monthlyOrders: Array<{ month: string; total: number; submitted: number; gathered: number; exited: number }>;
  productDemand: Array<{ productId: string; name: string; quantity: number }>;
  inventory: Array<{ key: string; label: string; total: number; available: number; qcPending: number }>;
  requestStatus: Array<{ status: string; count: number; averageResolutionHours: string | null }>;
  productionTrend: Array<{ month: string; amount: number; plans: number }>;
  recentRequests: Array<{
    requestId: string;
    type: string;
    status: string;
    requestedAt: string;
    sender: string;
    receiver: string;
  }>;
}

export async function fetchAnalytics(months = 12): Promise<AnalyticsData> {
  const response = await apiClient.get<{ success: true; data: AnalyticsData }>(
    `${apiBaseUrl}/adminreport/analytics`,
    { params: { months } },
  );
  return response.data.data;
}

export default apiClient;
