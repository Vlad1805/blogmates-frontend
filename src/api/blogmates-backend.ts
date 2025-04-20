import axios, { AxiosError } from "axios";
import { API_BASE_URL, ENDPOINTS } from "@/config";

// 🔹 Interfaces for API requests & responses
export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface SignUpResponse {
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

// 🔹 API Client with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
  withCredentials: true, // Important for sending cookies
});

// 🔄 Interceptor for Refreshing Tokens
apiClient.interceptors.response.use(
  (response) => response, // ✅ Return successful response as-is
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If 401 (Unauthorized) and request was not already retried, refresh the token
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {
        await axios.post(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {}, { withCredentials: true });
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // If not 401, return error as usual
  }
);

// ✨ **Sign Up API**
export async function signUpApi(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post<SignUpResponse>(ENDPOINTS.SIGN_UP, data);
  return response.data;
}

// ✨ **Login API**
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, data);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Invalid credentials or server error");
  }
}

// ✨ **Logout API**
export async function logoutUser(): Promise<LogoutResponse> {
  try {
    const response = await apiClient.post<LogoutResponse>(ENDPOINTS.LOGOUT);
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("Error logging out");
  }
}
