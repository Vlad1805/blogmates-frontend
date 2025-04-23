import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ENDPOINTS } from "@/config";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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

export interface UserDataResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  followers_count: number;
  following_count: number;
  profile_picture: string;  // base64 encoded image data
  profile_picture_content_type: string;  // MIME type of the image
}

interface UpdateProfileRequest {
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: ArrayBuffer | Uint8Array;  // Binary data for the image
  profile_picture_content_type?: string;       // MIME type of the image
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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and if we haven't retried this request
    if (error.response?.status === 401 && originalRequest && !(originalRequest as CustomAxiosRequestConfig)._retry) {
      (originalRequest as CustomAxiosRequestConfig)._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {}, { withCredentials: true });
        
        // If refresh successful, retry the original request
        if (response.status === 200) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
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

// ✨ **Get User Data API**
export async function getUserData(): Promise<UserDataResponse> {
  try {
    const response = await apiClient.get<UserDataResponse>(ENDPOINTS.USER_DATA);
    return response.data;
  } catch (error) {
    console.error("Get user data failed:", error);
    throw new Error("Error getting user data");
  }
}

// ✨ **Get User Profile API**
export async function getUserProfile(username: string): Promise<UserDataResponse> {
  try {
    const response = await apiClient.post<UserDataResponse>(ENDPOINTS.USER_PROFILE, { username: username });
    return response.data;
  } catch (error) {
    console.error("Get user profile failed:", error);
    throw new Error("Error getting user profile");
  }
}

// ✨ **Update User Profile API**
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserDataResponse> {
  try {
    const response = await apiClient.patch<UserDataResponse>(ENDPOINTS.USER_PROFILE, data);
    return response.data;
  } catch (error) {
    console.error("Update user profile failed:", error);
    throw new Error("Error updating user profile");
  }
}

// ✨ **Refresh Token API**
export async function refreshToken(): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}
